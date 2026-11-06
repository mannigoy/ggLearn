package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.ExperimentRequest;
import com.gglearn.backend.entity.Experiment;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.ExperimentRepository;
import com.gglearn.backend.repository.LessonRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Experiments CRUD. Access follows the course they belong to. */
@Service
public class ExperimentService {

	private final ExperimentRepository experiments;
	private final LessonRepository lessons;
	private final CourseAccess access;
	private final UserService userService;

	public ExperimentService(ExperimentRepository experiments, LessonRepository lessons, CourseAccess access,
			UserService userService) {
		this.experiments = experiments;
		this.lessons = lessons;
		this.access = access;
		this.userService = userService;
	}

	/** Oldest first. Sorted here because ordering a filtered query needs a composite index. */
	public List<Experiment> list(AuthUser me, String lessonId) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(lessonId);
		access.requireMember(caller, lesson.getCourseId());
		return experiments.findWhere("lessonId", lessonId).stream()
				.sorted(Comparator.comparing(Experiment::getCreatedAt, Comparator.nullsLast(Comparator.<Timestamp>naturalOrder())))
				.toList();
	}

	public Experiment create(AuthUser me, String lessonId, ExperimentRequest body) {
		User caller = userService.getProfile(me);
		Lesson lesson = requireLesson(lessonId);
		access.requireStaff(caller, lesson.getCourseId());

		Map<String, Object> fields = fieldsOf(body);
		fields.put("courseId", lesson.getCourseId());
		fields.put("lessonId", lessonId);
		return requireExperiment(experiments.create(fields));
	}

	public Experiment update(AuthUser me, String id, ExperimentRequest body) {
		User caller = userService.getProfile(me);
		Experiment experiment = requireExperiment(id);
		access.requireStaff(caller, experiment.getCourseId());

		experiments.update(id, fieldsOf(body));
		return requireExperiment(id);
	}

	public void delete(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Experiment experiment = requireExperiment(id);
		access.requireStaff(caller, experiment.getCourseId());

		experiments.deleteById(id);
	}

	private static Map<String, Object> fieldsOf(ExperimentRequest body) {
		Map<String, Object> fields = new HashMap<>();
		fields.put("title", Validation.title(body.title()));
		fields.put("materials", body.materials().stream().map(String::trim).toList());
		fields.put("steps", body.steps().stream().map(String::trim).toList());
		fields.put("safetyNotes", body.safetyNotes() == null ? "" : body.safetyNotes().trim());
		return fields;
	}

	private Lesson requireLesson(String id) {
		return lessons.findById(id).orElseThrow(() -> ApiException.notFound("That lesson doesn’t exist."));
	}

	private Experiment requireExperiment(String id) {
		return experiments.findById(id).orElseThrow(() -> ApiException.notFound("That experiment doesn’t exist."));
	}
}
