package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CourseRequest;
import com.gglearn.backend.entity.Course;
import com.gglearn.backend.repository.BadgeRepository;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.ExperimentRepository;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class CourseServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final LessonRepository lessons = mock(LessonRepository.class);
	private final ExperimentRepository experiments = mock(ExperimentRepository.class);
	private final QuizRepository quizzes = mock(QuizRepository.class);
	private final QuestionRepository questions = mock(QuestionRepository.class);
	private final BadgeRepository badges = mock(BadgeRepository.class);
	private final CourseService service = new CourseService(courses, new CourseAccess(courses, enrollments),
			new UserService(users), users, lessons, experiments, quizzes, questions, enrollments);

	private static final AuthUser ADMIN = new AuthUser("admin-1", "admin@example.com");
	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
	}

	private static CourseRequest request(String title, String teacherUid) {
		return new CourseRequest(title, "3", "life", teacherUid);
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> createdFields() {
		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(courses).create(captor.capture());
		return captor.getValue();
	}

	private void creates(String id) {
		when(courses.create(anyMap())).thenReturn(id);
		when(courses.findById(id)).thenReturn(Optional.of(course(id, "t-1")));
	}

	@Test
	void teacherCreatesOwnCourse() {
		signIn(TEACHER, "teacher");
		creates("c-new");

		service.create(TEACHER, request("Seeds", null));

		assertThat(createdFields()).containsEntry("teacherUid", "t-1").containsEntry("teacherName", "Name t-1");
	}

	@Test
	void createTrimsTitle() {
		signIn(TEACHER, "teacher");
		creates("c-new");

		service.create(TEACHER, request("  Seeds  ", null));

		assertThat(createdFields()).containsEntry("title", "Seeds");
	}

	@Test
	void teacherCannotAssignSomeoneElse() {
		signIn(TEACHER, "teacher");
		creates("c-new");

		service.create(TEACHER, request("Seeds", "t-2"));

		assertThat(createdFields()).containsEntry("teacherUid", "t-1");
	}

	@Test
	void studentCannotCreate() {
		signIn(STUDENT, "student");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.create(STUDENT, request("Seeds", null)));
		verify(courses, never()).create(anyMap());
	}

	@Test
	void pendingTeacherCannotCreate() {
		signIn(TEACHER, "pending_teacher");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.create(TEACHER, request("Seeds", null)));
		verify(courses, never()).create(anyMap());
	}

	@Test
	void adminAssignsTeacher() {
		signIn(ADMIN, "admin");
		when(users.findById("t-2")).thenReturn(Optional.of(user("t-2", "teacher")));
		creates("c-new");

		service.create(ADMIN, request("Seeds", "t-2"));

		assertThat(createdFields()).containsEntry("teacherUid", "t-2").containsEntry("teacherName", "Name t-2");
	}

	@Test
	void adminOwnsCourseWhenNoTeacherGiven() {
		signIn(ADMIN, "admin");
		creates("c-new");

		service.create(ADMIN, request("Seeds", null));

		assertThat(createdFields()).containsEntry("teacherUid", "admin-1");
	}

	@Test
	void adminAssignsNonTeacherIs400() {
		signIn(ADMIN, "admin");
		when(users.findById("s-1")).thenReturn(Optional.of(user("s-1", "student")));

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.create(ADMIN, request("Seeds", "s-1")));
		verify(courses, never()).create(anyMap());
	}

	@Test
	void otherTeacherCannotUpdate() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-9")));

		assertStatus(HttpStatus.FORBIDDEN, () -> service.update(TEACHER, "c-1", request("New", null)));
		verify(courses, never()).update(anyString(), anyMap());
	}

	@Test
	void demotedOwnerCannotUpdate() {
		signIn(TEACHER, "student");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));

		assertStatus(HttpStatus.FORBIDDEN, () -> service.update(TEACHER, "c-1", request("New", null)));
		verify(courses, never()).update(anyString(), anyMap());
	}

	@Test
	void ownerCannotChangeTeacher() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));

		service.update(TEACHER, "c-1", request(" New ", "t-2"));

		@SuppressWarnings("unchecked")
		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(courses).update(org.mockito.ArgumentMatchers.eq("c-1"), captor.capture());
		assertThat(captor.getValue()).containsEntry("title", "New").doesNotContainKeys("teacherUid", "teacherName");
	}

	@Test
	void adminChangesTeacherAndName() {
		signIn(ADMIN, "admin");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(users.findById("t-2")).thenReturn(Optional.of(user("t-2", "teacher")));

		service.update(ADMIN, "c-1", request("New", "t-2"));

		@SuppressWarnings("unchecked")
		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(courses).update(org.mockito.ArgumentMatchers.eq("c-1"), captor.capture());
		assertThat(captor.getValue()).containsEntry("teacherUid", "t-2").containsEntry("teacherName", "Name t-2");
	}

	@Test
	void deleteCascades() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));

		service.delete(TEACHER, "c-1");

		verify(questions).deleteWhere("courseId", "c-1");
		verify(quizzes).deleteWhere("courseId", "c-1");
		verify(experiments).deleteWhere("courseId", "c-1");
		verify(lessons).deleteWhere("courseId", "c-1");
		verify(enrollments).deleteWhere("courseId", "c-1");
		verify(courses).deleteById("c-1");
		verifyNoInteractions(badges);
	}

	@Test
	void missingCourseIs404() {
		signIn(TEACHER, "teacher");
		when(courses.findById("nope")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.get(TEACHER, "nope"));
	}

	@Test
	void listMineFiltersAndSorts() {
		signIn(TEACHER, "teacher");
		Course older = course("c-old", "t-1");
		older.setCreatedAt(Timestamp.ofTimeSecondsAndNanos(100, 0));
		Course newer = course("c-new", "t-1");
		newer.setCreatedAt(Timestamp.ofTimeSecondsAndNanos(200, 0));
		Course undated = course("c-none", "t-1");
		when(courses.findWhere("teacherUid", "t-1")).thenReturn(List.of(undated, older, newer));

		List<Course> result = service.list(TEACHER, true);

		assertThat(result).extracting(Course::getId).containsExactly("c-new", "c-old", "c-none");
		verify(courses, never()).findAll();
	}

	@Test
	void listAllReturnsEveryCourse() {
		signIn(STUDENT, "student");
		when(courses.findAll()).thenReturn(List.of(course("c-1", "t-1")));

		assertThat(service.list(STUDENT, false)).hasSize(1);
		verify(courses, never()).findWhere(any(), any());
	}
}
