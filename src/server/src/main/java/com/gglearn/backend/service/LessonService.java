package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.LessonRequest;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.Quiz;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.ExperimentRepository;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Lessons CRUD. Access follows the course they belong to. */
@Service
public class LessonService {

	private final LessonRepository lessons;
	private final ExperimentRepository experiments;
	private final QuizRepository quizzes;
	private final QuestionRepository questions;
	private final CourseAccess access;
	private final UserService userService;

	public LessonService(LessonRepository lessons, ExperimentRepository experiments, QuizRepository quizzes,
			QuestionRepository questions, CourseAccess access, UserService userService) {
		this.lessons = lessons;
		this.experiments = experiments;
		this.quizzes = quizzes;
		this.questions = questions;
		this.access = access;
		this.userService = userService;
	}

	/** By `order`, then `createdAt`. Sorted here because ordering a filtered query needs a composite index. */
	public List<Lesson> list(AuthUser me, String courseId) {
		User caller = userService.getProfile(me);
		access.requireMember(caller, courseId);
		return lessons.findWhere("courseId", courseId).stream()
				.sorted(Comparator.comparing(Lesson::getOrder, Comparator.nullsLast(Comparator.<Long>naturalOrder()))
						.thenComparing(Lesson::getCreatedAt, Comparator.nullsLast(Comparator.<Timestamp>naturalOrder())))
				.toList();
	}

	public Lesson get(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(id);
		access.requireMember(caller, lesson.getCourseId());
		return lesson;
	}

	public Lesson create(AuthUser me, String courseId, LessonRequest body) {
		User caller = userService.getProfile(me);
		access.requireStaff(caller, courseId);

		long order = body.order() != null ? body.order() : lessons.findWhere("courseId", courseId).size();
		Map<String, Object> fields = new HashMap<>();
		fields.put("courseId", courseId);
		fields.put("title", Validation.title(body.title()));
		fields.put("topic", body.topic());
		fields.put("content", body.content().trim());
		fields.put("order", order);
		return requireLesson(lessons.create(fields));
	}

	public Lesson update(AuthUser me, String id, LessonRequest body) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(id);
		access.requireStaff(caller, lesson.getCourseId());

		Map<String, Object> fields = new HashMap<>();
		fields.put("title", Validation.title(body.title()));
		fields.put("topic", body.topic());
		fields.put("content", body.content().trim());
		if (body.order() != null) fields.put("order", body.order());
		lessons.update(id, fields);
		return requireLesson(id);
	}

	/** Removes the lesson's questions, quizzes and experiments with it. */
	public void delete(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(id);
		access.requireStaff(caller, lesson.getCourseId());

		for (Quiz quiz : quizzes.findWhere("lessonId", id)) questions.deleteWhere("quizId", quiz.getId());
		quizzes.deleteWhere("lessonId", id);
		experiments.deleteWhere("lessonId", id);
		lessons.deleteById(id);
	}

	private Lesson requireLesson(String id) {
		return lessons.findById(id).orElseThrow(() -> ApiException.notFound("That lesson doesn’t exist."));
	}
}
