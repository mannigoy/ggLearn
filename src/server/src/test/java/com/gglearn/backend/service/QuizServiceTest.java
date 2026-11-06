package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuizRequest;
import com.gglearn.backend.dto.QuizResponse;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.Question;
import com.gglearn.backend.entity.Quiz;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.Timestamp;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static com.gglearn.backend.service.Fixtures.assertStatus;
import static com.gglearn.backend.service.Fixtures.course;
import static com.gglearn.backend.service.Fixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class QuizServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final QuizRepository quizzes = mock(QuizRepository.class);
	private final QuestionRepository questions = mock(QuestionRepository.class);
	private final LessonRepository lessons = mock(LessonRepository.class);
	private final QuizService service = new QuizService(quizzes, questions, lessons,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
	}

	private static Quiz quiz(String id, long createdSeconds) {
		Quiz quiz = new Quiz();
		quiz.setId(id);
		quiz.setCourseId("c-1");
		quiz.setLessonId("l-1");
		quiz.setTitle("Quiz " + id);
		quiz.setPassingScore(2L);
		quiz.setCreatedAt(Timestamp.ofTimeSecondsAndNanos(createdSeconds, 0));
		return quiz;
	}

	private static List<Question> questionsFor(String quizId, int count) {
		return java.util.stream.IntStream.range(0, count).mapToObj((i) -> {
			Question question = new Question();
			question.setId("question-" + i);
			question.setQuizId(quizId);
			return question;
		}).toList();
	}

	@Test
	void totalPointsIsQuestionCount() {
		signIn(TEACHER, "teacher");
		when(quizzes.findById("z-1")).thenReturn(Optional.of(quiz("z-1", 1)));
		when(questions.findWhere("quizId", "z-1")).thenReturn(questionsFor("z-1", 3));

		QuizResponse response = service.get(TEACHER, "z-1");

		assertThat(response.totalPoints()).isEqualTo(3);
		assertThat(response.passingScore()).isEqualTo(2L);
	}

	@Test
	void listIsSortedByCreatedAt() {
		signIn(TEACHER, "teacher");
		when(lessons.findById("l-1")).thenReturn(Optional.of(lessonIn("c-1")));
		when(quizzes.findWhere("lessonId", "l-1")).thenReturn(List.of(quiz("late", 20), quiz("early", 10)));
		when(questions.findWhere(anyString(), org.mockito.ArgumentMatchers.any())).thenReturn(List.of());

		assertThat(service.list(TEACHER, "l-1")).extracting(QuizResponse::id).containsExactly("early", "late");
	}

	@Test
	void passingScoreAboveTotalIs400() {
		signIn(TEACHER, "teacher");
		when(quizzes.findById("z-1")).thenReturn(Optional.of(quiz("z-1", 1)));
		when(questions.findWhere("quizId", "z-1")).thenReturn(questionsFor("z-1", 3));

		assertThatThrownBy(() -> service.update(TEACHER, "z-1", new QuizRequest("Plants", 4L)))
				.isInstanceOfSatisfying(com.gglearn.backend.exception.ApiException.class, (e) -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(e.getMessage()).isEqualTo("The passing score can’t be more than the number of questions (3).");
				});
		verify(quizzes, never()).update(anyString(), anyMap());
	}

	@Test
	void passingScoreAllowedWhenNoQuestions() {
		signIn(TEACHER, "teacher");
		when(lessons.findById("l-1")).thenReturn(Optional.of(lessonIn("c-1")));
		when(quizzes.create(anyMap())).thenReturn("z-new");
		Quiz created = quiz("z-new", 1);
		created.setPassingScore(5L);
		when(quizzes.findById("z-new")).thenReturn(Optional.of(created));
		when(questions.findWhere("quizId", "z-new")).thenReturn(List.of());

		QuizResponse response = service.create(TEACHER, "l-1", new QuizRequest("  Plants  ", 5L));

		assertThat(response.passingScore()).isEqualTo(5L);
		assertThat(response.totalPoints()).isZero();
	}

	@Test
	void deleteCascadesQuestions() {
		signIn(TEACHER, "teacher");
		when(quizzes.findById("z-1")).thenReturn(Optional.of(quiz("z-1", 1)));

		service.delete(TEACHER, "z-1");

		verify(questions).deleteWhere("quizId", "z-1");
		verify(quizzes).deleteById("z-1");
	}

	@Test
	void unenrolledStudentGets403() {
		signIn(STUDENT, "student");
		when(quizzes.findById("z-1")).thenReturn(Optional.of(quiz("z-1", 1)));
		when(enrollments.exists("c-1", "s-1")).thenReturn(false);

		assertStatus(HttpStatus.FORBIDDEN, () -> service.get(STUDENT, "z-1"));
	}

	private static Lesson lessonIn(String courseId) {
		Lesson lesson = new Lesson();
		lesson.setId("l-1");
		lesson.setCourseId(courseId);
		return lesson;
	}

	@Test
	void createRejectsTitleTooShortAfterTrim() {
		signIn(TEACHER, "teacher");
		Lesson lesson = new Lesson();
		lesson.setId("l-1");
		lesson.setCourseId("c-1");
		when(lessons.findById("l-1")).thenReturn(Optional.of(lesson));

		assertStatus(HttpStatus.BAD_REQUEST, () -> service.create(TEACHER, "l-1", new QuizRequest(" a ", 1L)));

		verify(quizzes, never()).create(anyMap());
	}
}
