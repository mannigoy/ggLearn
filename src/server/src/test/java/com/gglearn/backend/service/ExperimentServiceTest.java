package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.ExperimentRequest;
import com.gglearn.backend.entity.Experiment;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.ExperimentRepository;
import com.gglearn.backend.repository.LessonRepository;
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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ExperimentServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final LessonRepository lessons = mock(LessonRepository.class);
	private final ExperimentRepository experiments = mock(ExperimentRepository.class);
	private final ExperimentService service = new ExperimentService(experiments, lessons,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		Lesson lesson = new Lesson();
		lesson.setId("l-1");
		lesson.setCourseId("c-1");
		when(lessons.findById("l-1")).thenReturn(Optional.of(lesson));
	}

	private static ExperimentRequest request() {
		return new ExperimentRequest(" Bean cup ", List.of(" cup "), List.of(" Fill it. "), " Wash hands. ");
	}

	@Test
	@SuppressWarnings("unchecked")
	void createCopiesCourseIdAndTrimsItems() {
		signIn(TEACHER, "teacher");
		when(experiments.create(anyMap())).thenReturn("e-1");
		when(experiments.findById("e-1")).thenReturn(Optional.of(new Experiment()));

		service.create(TEACHER, "l-1", request());

		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(experiments).create(captor.capture());
		assertThat(captor.getValue()).containsEntry("courseId", "c-1").containsEntry("lessonId", "l-1")
				.containsEntry("title", "Bean cup").containsEntry("materials", List.of("cup"))
				.containsEntry("steps", List.of("Fill it.")).containsEntry("safetyNotes", "Wash hands.");
	}

	@Test
	void studentCannotCreate() {
		signIn(STUDENT, "student");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.create(STUDENT, "l-1", request()));
		verify(experiments, never()).create(anyMap());
	}

	@Test
	void memberCanList() {
		signIn(STUDENT, "student");
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);
		when(experiments.findWhere("lessonId", "l-1")).thenReturn(List.of(new Experiment()));

		assertThat(service.list(STUDENT, "l-1")).hasSize(1);
	}

	@Test
	void missingExperimentIs404() {
		signIn(TEACHER, "teacher");
		when(experiments.findById("nope")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.delete(TEACHER, "nope"));
	}
}
