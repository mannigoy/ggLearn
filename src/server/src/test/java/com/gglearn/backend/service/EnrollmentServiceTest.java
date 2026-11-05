package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.Enrollment;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EnrollmentServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final EnrollmentService service = new EnrollmentService(enrollments, users,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser OTHER_TEACHER = new AuthUser("t-2", "t2@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");
	private static final AuthUser OTHER_STUDENT = new AuthUser("s-2", "s2@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
	}

	private void courseOwnedByT1() {
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
	}

	private static Enrollment enrollment(String courseId, String studentUid, String studentName) {
		Enrollment enrollment = new Enrollment();
		enrollment.setCourseId(courseId);
		enrollment.setStudentUid(studentUid);
		enrollment.setStudentName(studentName);
		return enrollment;
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> storedFields() {
		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(enrollments).createWithId(anyString(), captor.capture());
		return captor.getValue();
	}

	@Test
	void studentSelfEnrolls() {
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);
		when(enrollments.findById("c-1_s-1")).thenReturn(Optional.of(enrollment("c-1", "s-1", "Name s-1")));

		Enrollment result = service.enroll(STUDENT, "c-1", null);

		assertThat(result.getStudentUid()).isEqualTo("s-1");
		verify(enrollments).createWithId(org.mockito.ArgumentMatchers.eq("c-1_s-1"), anyMap());
		Map<String, Object> fields = storedFields();
		assertThat(fields).containsEntry("courseId", "c-1").containsEntry("studentUid", "s-1")
				.containsEntry("studentName", "Name s-1").containsEntry("progressPct", 0L).containsEntry("points", 0L)
				.containsKey("enrolledAt");
	}

	@Test
	void duplicateEnrollIs409() {
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		assertStatus(HttpStatus.CONFLICT, () -> service.enroll(STUDENT, "c-1", null));
		verify(enrollments, never()).createWithId(anyString(), anyMap());
	}

	@Test
	void teacherCannotSelfEnroll() {
		signIn(TEACHER, "teacher");
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.enroll(TEACHER, "c-1", null));
		verify(enrollments, never()).createWithId(anyString(), anyMap());
	}

	@Test
	void teacherAddsStudent() {
		signIn(TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);
		when(enrollments.findById("c-1_s-1")).thenReturn(Optional.of(enrollment("c-1", "s-1", "Name s-1")));

		Enrollment result = service.enroll(TEACHER, "c-1", "s-1");

		assertThat(result.getStudentUid()).isEqualTo("s-1");
		assertThat(storedFields()).containsEntry("studentUid", "s-1").containsEntry("studentName", "Name s-1");
	}

	@Test
	void teacherAddingATeacherIs400() {
		signIn(TEACHER, "teacher");
		signIn(OTHER_TEACHER, "teacher");
		courseOwnedByT1();

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.enroll(TEACHER, "c-1", "t-2"));
		verify(enrollments, never()).createWithId(anyString(), anyMap());
	}

	@Test
	void teacherAddingDisabledStudentIs400() {
		signIn(TEACHER, "teacher");
		User disabled = user("s-1", "student");
		disabled.setDisabled(true);
		when(users.findById("s-1")).thenReturn(Optional.of(disabled));
		courseOwnedByT1();

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.enroll(TEACHER, "c-1", "s-1"));
		verify(enrollments, never()).createWithId(anyString(), anyMap());
	}

	@Test
	void otherTeacherCannotAdd() {
		signIn(OTHER_TEACHER, "teacher");
		signIn(STUDENT, "student");
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> service.enroll(OTHER_TEACHER, "c-1", "s-1"));
		verify(enrollments, never()).createWithId(anyString(), anyMap());
	}

	@Test
	void studentLeavesOwnEnrollment() {
		signIn(STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		service.remove(STUDENT, "c-1", "s-1");

		verify(enrollments).deleteById("c-1_s-1");
	}

	@Test
	void studentCannotRemoveSomeoneElse() {
		signIn(OTHER_STUDENT, "student");
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		assertStatus(HttpStatus.FORBIDDEN, () -> service.remove(OTHER_STUDENT, "c-1", "s-1"));
		verify(enrollments, never()).deleteById(anyString());
	}

	@Test
	void studentsListExcludesDisabledAndSortsByName() {
		signIn(TEACHER, "teacher");
		User zed = user("s-1", "student");
		zed.setName("Zed");
		User amy = user("s-2", "student");
		amy.setName("Amy");
		User off = user("s-3", "student");
		off.setName("Bob");
		off.setDisabled(true);
		when(users.findByRole("student")).thenReturn(List.of(zed, off, amy));

		assertThat(service.students(TEACHER)).extracting(User::getName).containsExactly("Amy", "Zed");
	}

	@Test
	void studentCannotListStudents() {
		signIn(STUDENT, "student");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.students(STUDENT));
		verify(users, never()).findByRole(anyString());
	}
}
