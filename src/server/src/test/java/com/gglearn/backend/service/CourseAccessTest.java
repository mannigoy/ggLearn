package com.gglearn.backend.service;

import com.gglearn.backend.entity.Course;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static com.gglearn.backend.service.Fixtures.assertStatus;
import static com.gglearn.backend.service.Fixtures.course;
import static com.gglearn.backend.service.Fixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CourseAccessTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final CourseAccess access = new CourseAccess(courses, enrollments);

	private Course courseOwnedByT1() {
		Course course = course("c-1", "t-1");
		when(courses.findById("c-1")).thenReturn(Optional.of(course));
		return course;
	}

	@Test
	void enrolledStudentIsAMember() {
		Course course = courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);

		assertThat(access.requireMember(user("s-1", "student"), "c-1")).isSameAs(course);
	}

	@Test
	void unenrolledStudentIsForbidden() {
		courseOwnedByT1();
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);

		assertStatus(HttpStatus.FORBIDDEN, () -> access.requireMember(user("s-1", "student"), "c-1"));
	}

	@Test
	void ownerIsAMember() {
		Course course = courseOwnedByT1();

		assertThat(access.requireMember(user("t-1", "teacher"), "c-1")).isSameAs(course);
	}

	@Test
	void adminIsAMember() {
		Course course = courseOwnedByT1();

		assertThat(access.requireMember(user("a-1", "admin"), "c-1")).isSameAs(course);
	}

	@Test
	void otherTeacherIsForbidden() {
		courseOwnedByT1();

		assertStatus(HttpStatus.FORBIDDEN, () -> access.requireMember(user("t-2", "teacher"), "c-1"));
	}

	@Test
	void missingCourseIs404() {
		when(courses.findById("nope")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> access.requireMember(user("s-1", "student"), "nope"));
	}
}
