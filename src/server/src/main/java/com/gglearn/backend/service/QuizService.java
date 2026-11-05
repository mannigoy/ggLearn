package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuizRequest;
import com.gglearn.backend.dto.QuizResponse;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.Quiz;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Quizzes CRUD. Access follows the course they belong to. */
@Service
public class QuizService {

	private final QuizRepository quizzes;
	private final QuestionRepository questions;
	private final LessonRepository lessons;
	private final CourseAccess access;
	private final UserService userService;

	public QuizService(QuizRepository quizzes, QuestionRepository questions, LessonRepository lessons,
			CourseAccess access, UserService userService) {
		this.quizzes = quizzes;
		this.questions = questions;
		this.lessons = lessons;
		this.access = access;
		this.userService = userService;
	}

	/** By `createdAt`. Sorted here because ordering a filtered query needs a composite index. */
	public List<QuizResponse> list(AuthUser me, String lessonId) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(lessonId);
		access.requireMember(caller, lesson.getCourseId());
		return quizzes.findWhere("lessonId", lessonId).stream()
				.sorted(Comparator.comparing(Quiz::getCreatedAt, Comparator.nullsLast(Comparator.<Timestamp>naturalOrder())))
				.map(this::toResponse)
				.toList();
	}

	public QuizResponse get(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Quiz quiz = requireQuiz(id);
		access.requireMember(caller, quiz.getCourseId());
		return toResponse(quiz);
	}

	public QuizResponse create(AuthUser me, String lessonId, QuizRequest body) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(lessonId);
		access.requireStaff(caller, lesson.getCourseId());

		Map<String, Object> fields = new HashMap<>();
		fields.put("courseId", lesson.getCourseId());
		fields.put("lessonId", lessonId);
		fields.put("title", body.title().trim());
		fields.put("passingScore", body.passingScore());
		return toResponse(requireQuiz(quizzes.create(fields)));
	}

	public QuizResponse update(AuthUser me, String id, QuizRequest body) {
		User caller = userService.getProfile(me);
		Quiz quiz = requireQuiz(id);
		access.requireStaff(caller, quiz.getCourseId());

		int totalPoints = countQuestions(id);
		if (totalPoints > 0 && body.passingScore() > totalPoints) {
			throw ApiException.badRequest("The passing score can’t be more than the number of questions (" + totalPoints + ").");
		}
		Map<String, Object> fields = new HashMap<>();
		fields.put("title", body.title().trim());
		fields.put("passingScore", body.passingScore());
		quizzes.update(id, fields);
		return toResponse(requireQuiz(id));
	}

	/** Removes the quiz's questions with it. */
	public void delete(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Quiz quiz = requireQuiz(id);
		access.requireStaff(caller, quiz.getCourseId());

		questions.deleteWhere("quizId", id);
		quizzes.deleteById(id);
	}

	private QuizResponse toResponse(Quiz quiz) {
		return QuizResponse.from(quiz, countQuestions(quiz.getId()));
	}

	private int countQuestions(String quizId) {
		return questions.findWhere("quizId", quizId).size();
	}

	private Quiz requireQuiz(String id) {
		return quizzes.findById(id).orElseThrow(() -> ApiException.notFound("That quiz doesn’t exist."));
	}

	private Lesson requireLesson(String id) {
		return lessons.findById(id).orElseThrow(() -> ApiException.notFound("That lesson doesn’t exist."));
	}
}
