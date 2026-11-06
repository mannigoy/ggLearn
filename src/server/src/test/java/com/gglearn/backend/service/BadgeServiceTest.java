package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.BadgeRequest;
import com.gglearn.backend.dto.BadgeUpdateRequest;
import com.gglearn.backend.entity.Badge;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.BadgeRepository;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.Timestamp;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.service.Fixtures.assertStatus;
import static com.gglearn.backend.service.Fixtures.course;
import static com.gglearn.backend.service.Fixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BadgeServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final BadgeRepository badges = mock(BadgeRepository.class);
	private final BadgeService service = new BadgeService(badges, enrollments, users,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser OTHER_TEACHER = new AuthUser("t-2", "t2@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");
	private static final AuthUser ADMIN = new AuthUser("a-1", "a1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
	}

	private void courseOwnedByT1() {
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
	}

	private static Badge badge(String id, String courseId, String userUid, long seconds) {
		Badge badge = new Badge();
		badge.setId(id);
		badge.setCourseId(courseId);
		badge.setUserUid(userUid);
		badge.setTitle("Title " + id);
		badge.setDateEarned(Timestamp.ofTimeSecondsAndNanos(seconds, 0));
		return badge;
	}

	private void badgeExists() {
		when(badges.findById("b-1")).thenReturn(Optional.of(badge("b-1", "c-1", "s-1", 10)));
	}

	@Test
	@SuppressWarnings("unchecked")
	void teacherAwardsToEnrolledStudent() {
		signIn(TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);
		when(badges.create(anyMap())).thenReturn("b-1");
		badgeExists();

		Badge result = service.award(TEACHER, new BadgeRequest("c-1", "s-1", "  Star Scientist "));

		assertThat(result.getId()).isEqualTo("b-1");
		ArgumentCaptor<Map<String, Object>> fields = ArgumentCaptor.forClass(Map.class);
		verify(badges).create(fields.capture());
		assertThat(fields.getValue()).containsEntry("courseId", "c-1").containsEntry("userUid", "s-1")
				.containsEntry("userName", "Name s-1").containsEntry("title", "Star Scientist")
				.containsEntry("awardedBy", "t-1").containsKey("dateEarned");
	}

	@Test
	void awardToUnenrolledIs400() {
		signIn(TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);

		assertThatThrownBy(() -> service.award(TEACHER, new BadgeRequest("c-1", "s-1", "Star")))
				.isInstanceOfSatisfying(ApiException.class, (e) -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(e.getMessage()).isEqualTo("Award badges only to students in this course.");
				});
		verify(badges, never()).create(anyMap());
	}

	@Test
	void awardToUnknownUserIs400() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "ghost")).thenReturn(false);
		when(users.findById("ghost")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.award(TEACHER, new BadgeRequest("c-1", "ghost", "Star")));
		verify(badges, never()).create(anyMap());
	}

	@Test
	void otherTeacherCannotAward() {
		signIn(OTHER_TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		assertStatus(HttpStatus.FORBIDDEN, () -> service.award(OTHER_TEACHER, new BadgeRequest("c-1", "s-1", "Star")));
		verify(badges, never()).create(anyMap());
	}

	@Test
	void studentCannotAward() {
		signIn(STUDENT, "student");
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.award(STUDENT, new BadgeRequest("c-1", "s-1", "Star")));
		verify(badges, never()).create(anyMap());
	}

	@Test
	void awardInMissingCourseIs404() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-9")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.award(TEACHER, new BadgeRequest("c-9", "s-1", "Star")));
		verify(badges, never()).create(anyMap());
	}

	@Test
	void ownerListsCourseBadgesNewestFirst() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();
		when(badges.findWhere("courseId", "c-1")).thenReturn(List.of(
				badge("old", "c-1", "s-1", 10), badge("new", "c-1", "s-2", 30), badge("mid", "c-1", "s-1", 20)));

		assertThat(service.forCourse(TEACHER, "c-1")).extracting(Badge::getId).containsExactly("new", "mid", "old");
	}

	@Test
	void adminListsCourseBadges() {
		signIn(ADMIN, "admin");
		courseOwnedByT1();
		when(badges.findWhere("courseId", "c-1")).thenReturn(List.of(badge("b-1", "c-1", "s-1", 10)));

		assertThat(service.forCourse(ADMIN, "c-1")).hasSize(1);
	}

	@Test
	void studentCannotListCourseBadges() {
		signIn(STUDENT, "student");
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.forCourse(STUDENT, "c-1"));
		verify(badges, never()).findWhere(anyString(), any());
	}

	@Test
	void otherTeacherCannotListCourseBadges() {
		signIn(OTHER_TEACHER, "teacher");
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.forCourse(OTHER_TEACHER, "c-1"));
		verify(badges, never()).findWhere(anyString(), any());
	}

	@Test
	void mineReturnsOnlyOwnBadges() {
		signIn(STUDENT, "student");
		when(badges.findWhere("userUid", "s-1")).thenReturn(List.of(
				badge("old", "c-1", "s-1", 10), badge("new", "c-2", "s-1", 20)));

		assertThat(service.mine(STUDENT)).extracting(Badge::getId).containsExactly("new", "old");
		verify(badges).findWhere("userUid", "s-1");
		verify(badges, never()).findAll();
	}

	@Test
	void ownerRenamesBadge() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();
		badgeExists();

		service.rename(TEACHER, "b-1", new BadgeUpdateRequest("  Super Star "));

		verify(badges).update("b-1", Map.of("title", "Super Star"));
	}

	@Test
	void renameMissingBadgeIs404() {
		signIn(TEACHER, "teacher");
		when(badges.findById("b-9")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.rename(TEACHER, "b-9", new BadgeUpdateRequest("Star")))
				.isInstanceOfSatisfying(ApiException.class, (e) -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
					assertThat(e.getMessage()).isEqualTo("That badge doesn’t exist.");
				});
		verify(badges, never()).update(anyString(), anyMap());
	}

	@Test
	void otherTeacherCannotRename() {
		signIn(OTHER_TEACHER, "teacher");
		courseOwnedByT1();
		badgeExists();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.rename(OTHER_TEACHER, "b-1", new BadgeUpdateRequest("Star")));
		verify(badges, never()).update(anyString(), anyMap());
	}

	@Test
	void studentCannotRename() {
		signIn(STUDENT, "student");
		courseOwnedByT1();
		badgeExists();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.rename(STUDENT, "b-1", new BadgeUpdateRequest("Star")));
		verify(badges, never()).update(anyString(), anyMap());
	}

	@Test
	void revokeByAdmin() {
		signIn(ADMIN, "admin");
		courseOwnedByT1();
		badgeExists();

		service.revoke(ADMIN, "b-1");

		verify(badges).deleteById("b-1");
	}

	@Test
	void ownerRevokesBadge() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();
		badgeExists();

		service.revoke(TEACHER, "b-1");

		verify(badges).deleteById("b-1");
	}

	@Test
	void revokeMissingBadgeIs404() {
		signIn(TEACHER, "teacher");
		when(badges.findById("b-9")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.revoke(TEACHER, "b-9"));
		verify(badges, never()).deleteById(anyString());
	}

	@Test
	void otherTeacherCannotRevoke() {
		signIn(OTHER_TEACHER, "teacher");
		courseOwnedByT1();
		badgeExists();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.revoke(OTHER_TEACHER, "b-1"));
		verify(badges, never()).deleteById(anyString());
	}

	@Test
	void studentCannotRevokeOwnBadge() {
		signIn(STUDENT, "student");
		courseOwnedByT1();
		badgeExists();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.revoke(STUDENT, "b-1"));
		verify(badges, never()).deleteById(anyString());
	}

	@Test
	void awardRejectsTitleTooShortAfterTrim() {
		signIn(TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.award(TEACHER, new BadgeRequest("c-1", "s-1", " a ")));

		verify(badges, never()).create(anyMap());
	}

	@Test
	void renameRejectsTitleTooShortAfterTrim() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();
		badgeExists();

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.rename(TEACHER, "b-1", new BadgeUpdateRequest(" a ")));

		verify(badges, never()).update(anyString(), anyMap());
	}
}
