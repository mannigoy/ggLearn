package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuestionRequest;
import com.gglearn.backend.dto.QuestionResponse;
import com.gglearn.backend.entity.Question;
import com.gglearn.backend.entity.Quiz;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Questions CRUD. Students never receive the correct answer. */
@Service
public class QuestionService {

	private final QuestionRepository questions;
	private final QuizRepository quizzes;
	private final CourseAccess access;
	private final UserService userService;

	public QuestionService(QuestionRepository questions, QuizRepository quizzes, CourseAccess access,
			UserService userService) {
		this.questions = questions;
		this.quizzes = quizzes;
		this.access = access;
		this.userService = userService;
	}

	/** By `order`, then `createdAt`. Staff get the answers, everyone else does not. */
	public List<QuestionResponse> list(AuthUser me, String quizId) {
		User caller = userService.getProfile(me);
		Quiz quiz = requireQuiz(quizId);
		boolean staff = access.isStaff(caller, access.requireMember(caller, quiz.getCourseId()));
		return questions.findWhere("quizId", quizId).stream()
				.sorted(Comparator.comparing(Question::getOrder, Comparator.nullsLast(Comparator.<Long>naturalOrder()))
						.thenComparing(Question::getCreatedAt, Comparator.nullsLast(Comparator.<Timestamp>naturalOrder())))
				.map(QuestionResponse::from)
				.map((response) -> staff ? response : response.forStudent())
				.toList();
	}

	public QuestionResponse create(AuthUser me, String quizId, QuestionRequest body) {
		User caller = userService.getProfile(me);
		Quiz quiz = requireQuiz(quizId);
		access.requireStaff(caller, quiz.getCourseId());

		Map<String, Object> fields = clean(body);
		long order = body.order() != null ? body.order() : questions.findWhere("quizId", quizId).size();
		fields.put("courseId", quiz.getCourseId());
		fields.put("quizId", quizId);
		fields.put("order", order);
		return QuestionResponse.from(requireQuestion(questions.create(fields)));
	}

	public QuestionResponse update(AuthUser me, String id, QuestionRequest body) {
		User caller = userService.getProfile(me);
		Question question = requireQuestion(id);
		access.requireStaff(caller, question.getCourseId());

		Map<String, Object> fields = clean(body);
		if (body.order() != null) fields.put("order", body.order());
		questions.update(id, fields);
		return QuestionResponse.from(requireQuestion(id));
	}

	public void delete(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Question question = requireQuestion(id);
		access.requireStaff(caller, question.getCourseId());

		questions.deleteById(id);
	}

	/** Trims the text, choices and answer, then checks the choices make sense together. */
	private static Map<String, Object> clean(QuestionRequest body) {
		List<String> choices = new ArrayList<>();
		for (String choice : body.choices()) choices.add(choice == null ? "" : choice.trim());
		if (choices.stream().anyMatch(String::isEmpty)) throw ApiException.badRequest("Choices can’t be empty.");

		Set<String> seen = new HashSet<>();
		for (String choice : choices) {
			if (!seen.add(choice.toLowerCase(Locale.ROOT))) throw ApiException.badRequest("Choices must be different.");
		}
		String answer = body.correctAnswer().trim();
		if (!choices.contains(answer)) throw ApiException.badRequest("The correct answer must be one of the choices.");

		Map<String, Object> fields = new HashMap<>();
		fields.put("questionText", body.questionText().trim());
		fields.put("choices", choices);
		fields.put("correctAnswer", answer);
		return fields;
	}

	private Quiz requireQuiz(String id) {
		return quizzes.findById(id).orElseThrow(() -> ApiException.notFound("That quiz doesn’t exist."));
	}

	private Question requireQuestion(String id) {
		return questions.findById(id).orElseThrow(() -> ApiException.notFound("That question doesn’t exist."));
	}
}
