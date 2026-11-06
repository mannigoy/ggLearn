package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.LessonRequest;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.Quiz;
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
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LessonServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final LessonRepository lessons = mock(LessonRepository.class);
	private final ExperimentRepository experiments = mock(ExperimentRepository.class);
	private final QuizRepository quizzes = mock(QuizRepository.class);
	private final QuestionRepository questions = mock(QuestionRepository.class);
	private final LessonService service = new LessonService(lessons, experiments, quizzes, questions,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
	}

	private static Lesson lesson(String id, Long order, long createdSeconds) {
		Lesson lesson = new Lesson();
		lesson.setId(id);
		lesson.setCourseId("c-1");
		lesson.setOrder(order);
		lesson.setCreatedAt(Timestamp.ofTimeSecondsAndNanos(createdSeconds, 0));
		return lesson;
	}

	private static LessonRequest request(Long order) {
		return new LessonRequest("  Seeds  ", "life", "  Plants grow.  ", order);
	}

	@Test
	void enrolledStudentCanList() {
		signIn(STUDENT, "student");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);
		when(lessons.findWhere("courseId", "c-1")).thenReturn(List.of(
				lesson("late", 2L, 10), lesson("none", null, 5), lesson("second", 1L, 20), lesson("first", 1L, 10)));

		assertThat(service.list(STUDENT, "c-1")).extracting(Lesson::getId)
				.containsExactly("first", "second", "late", "none");
	}

	@Test
	void unenrolledStudentGets403() {
		signIn(STUDENT, "student");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);

		assertStatus(HttpStatus.FORBIDDEN, () -> service.list(STUDENT, "c-1"));
		verify(lessons, never()).findWhere(anyString(), org.mockito.ArgumentMatchers.any());
	}

	@Test
	@SuppressWarnings("unchecked")
	void teacherCreatesWithNextOrder() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(lessons.findWhere("courseId", "c-1")).thenReturn(List.of(lesson("a", 0L, 1), lesson("b", 1L, 2)));
		when(lessons.create(anyMap())).thenReturn("l-new");
		when(lessons.findById("l-new")).thenReturn(Optional.of(lesson("l-new", 2L, 3)));

		service.create(TEACHER, "c-1", request(null));

		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(lessons).create(captor.capture());
		assertThat(captor.getValue()).containsEntry("order", 2L).containsEntry("courseId", "c-1")
				.containsEntry("title", "Seeds").containsEntry("content", "Plants grow.");
	}

	@Test
	void otherTeacherCannotCreate() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-9")));

		assertStatus(HttpStatus.FORBIDDEN, () -> service.create(TEACHER, "c-1", request(null)));
		verify(lessons, never()).create(anyMap());
	}

	@Test
	@SuppressWarnings("unchecked")
	void updateKeepsOrderWhenNull() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(lessons.findById("l-1")).thenReturn(Optional.of(lesson("l-1", 4L, 1)));

		service.update(TEACHER, "l-1", request(null));

		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(lessons).update(org.mockito.ArgumentMatchers.eq("l-1"), captor.capture());
		assertThat(captor.getValue()).containsEntry("title", "Seeds").doesNotContainKey("order");
	}

	@Test
	void deleteCascadesToQuestionsQuizzesExperiments() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		when(lessons.findById("l-1")).thenReturn(Optional.of(lesson("l-1", 0L, 1)));
		Quiz first = new Quiz();
		first.setId("q-1");
		Quiz second = new Quiz();
		second.setId("q-2");
		when(quizzes.findWhere("lessonId", "l-1")).thenReturn(List.of(first, second));

		service.delete(TEACHER, "l-1");

		verify(questions).deleteWhere("quizId", "q-1");
		verify(questions).deleteWhere("quizId", "q-2");
		verify(quizzes).deleteWhere("lessonId", "l-1");
		verify(experiments).deleteWhere("lessonId", "l-1");
		verify(lessons).deleteById("l-1");
	}

	@Test
	void missingLessonIs404() {
		signIn(TEACHER, "teacher");
		when(lessons.findById("nope")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.get(TEACHER, "nope"));
	}

	@Test
	void createRejectsTitleTooShortAfterTrim() {
		signIn(TEACHER, "teacher");
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));

		assertStatus(HttpStatus.BAD_REQUEST,
				() -> service.create(TEACHER, "c-1", new LessonRequest(" a ", "life", "Plants grow.", null)));

		verify(lessons, never()).create(anyMap());
	}
}
