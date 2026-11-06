package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuestionRequest;
import com.gglearn.backend.dto.QuestionResponse;
import com.gglearn.backend.entity.Question;
import com.gglearn.backend.entity.Quiz;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.gglearn.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.service.Fixtures.course;
import static com.gglearn.backend.service.Fixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class QuestionServiceTest {

	private final CourseRepository courses = mock(CourseRepository.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final UserRepository users = mock(UserRepository.class);
	private final QuestionRepository questions = mock(QuestionRepository.class);
	private final QuizRepository quizzes = mock(QuizRepository.class);
	private final QuestionService service = new QuestionService(questions, quizzes,
			new CourseAccess(courses, enrollments), new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser STUDENT = new AuthUser("s-1", "s1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
		when(courses.findById("c-1")).thenReturn(Optional.of(course("c-1", "t-1")));
		Quiz quiz = new Quiz();
		quiz.setId("z-1");
		quiz.setCourseId("c-1");
		when(quizzes.findById("z-1")).thenReturn(Optional.of(quiz));
	}

	private static Question question(String id, Long order) {
		Question question = new Question();
		question.setId(id);
		question.setCourseId("c-1");
		question.setQuizId("z-1");
		question.setQuestionText("What do plants need?");
		question.setChoices(List.of("Sun", "Rocks"));
		question.setCorrectAnswer("Sun");
		question.setOrder(order);
		return question;
	}

	private static QuestionRequest request(List<String> choices, String answer) {
		return new QuestionRequest("  What is 1+1?  ", choices, answer, null);
	}

	private void assertBadRequest(String message, QuestionRequest body) {
		assertThatThrownBy(() -> service.create(TEACHER, "z-1", body))
				.isInstanceOfSatisfying(ApiException.class, (e) -> {
					assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
					assertThat(e.getMessage()).isEqualTo(message);
				});
		verify(questions, never()).create(anyMap());
	}

	@Test
	void studentNeverSeesCorrectAnswer() {
		signIn(STUDENT, "student");
		when(enrollments.exists("c-1", "s-1")).thenReturn(true);
		when(questions.findWhere("quizId", "z-1")).thenReturn(List.of(question("b", 1L), question("a", 0L)));

		List<QuestionResponse> result = service.list(STUDENT, "z-1");

		assertThat(result).extracting(QuestionResponse::id).containsExactly("a", "b");
		assertThat(result).allSatisfy((item) -> assertThat(item.correctAnswer()).isNull());
		assertThat(result).allSatisfy((item) -> assertThat(item.choices()).containsExactly("Sun", "Rocks"));
	}

	@Test
	void teacherSeesCorrectAnswer() {
		signIn(TEACHER, "teacher");
		when(questions.findWhere("quizId", "z-1")).thenReturn(List.of(question("a", 0L)));

		assertThat(service.list(TEACHER, "z-1")).extracting(QuestionResponse::correctAnswer).containsExactly("Sun");
	}

	@Test
	void rejectsDuplicateChoices() {
		signIn(TEACHER, "teacher");
		assertBadRequest("Choices must be different.", request(List.of("Yes", "yes"), "Yes"));
	}

	@Test
	void rejectsBlankChoiceAfterTrim() {
		signIn(TEACHER, "teacher");
		assertBadRequest("Choices can’t be empty.", request(List.of("Yes", "   "), "Yes"));
	}

	@Test
	void rejectsAnswerNotInChoices() {
		signIn(TEACHER, "teacher");
		assertBadRequest("The correct answer must be one of the choices.", request(List.of("Yes", "No"), "Maybe"));
	}

	@Test
	@SuppressWarnings("unchecked")
	void createTrimsAndAppends() {
		signIn(TEACHER, "teacher");
		when(questions.findWhere("quizId", "z-1")).thenReturn(List.of(question("a", 0L), question("b", 1L)));
		when(questions.create(anyMap())).thenReturn("q-new");
		when(questions.findById("q-new")).thenReturn(Optional.of(question("q-new", 2L)));

		service.create(TEACHER, "z-1", request(List.of(" 2 ", "3 "), " 2"));

		ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
		verify(questions).create(captor.capture());
		assertThat(captor.getValue()).containsEntry("questionText", "What is 1+1?")
				.containsEntry("choices", List.of("2", "3")).containsEntry("correctAnswer", "2")
				.containsEntry("order", 2L).containsEntry("quizId", "z-1").containsEntry("courseId", "c-1");
	}

	@Test
	void createRejectsQuestionTextTooShortAfterTrim() {
		signIn(TEACHER, "teacher");

		assertThatThrownBy(() -> service.create(TEACHER, "z-1", new QuestionRequest(" a ", List.of("Yes", "No"), "Yes", null)))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
		verify(questions, never()).create(anyMap());
	}
}
