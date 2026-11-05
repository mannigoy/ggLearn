package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CourseRequest;
import com.gglearn.backend.entity.Course;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.ExperimentRepository;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.QuestionRepository;
import com.gglearn.backend.repository.QuizRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.Timestamp;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Courses CRUD. These checks replace the courses rules in firestore.rules. */
@Service
public class CourseService {

	private final CourseRepository courses;
	private final CourseAccess access;
	private final UserService userService;
	private final UserRepository users;
	private final LessonRepository lessons;
	private final ExperimentRepository experiments;
	private final QuizRepository quizzes;
	private final QuestionRepository questions;
	private final EnrollmentRepository enrollments;

	public CourseService(CourseRepository courses, CourseAccess access, UserService userService, UserRepository users,
			LessonRepository lessons, ExperimentRepository experiments, QuizRepository quizzes,
			QuestionRepository questions, EnrollmentRepository enrollments) {
		this.courses = courses;
		this.access = access;
		this.userService = userService;
		this.users = users;
		this.lessons = lessons;
		this.experiments = experiments;
		this.quizzes = quizzes;
		this.questions = questions;
		this.enrollments = enrollments;
	}

	/** Newest first. Sorted here because ordering a filtered query needs a composite index. */
	public List<Course> list(AuthUser me, boolean mine) {
		userService.getProfile(me);
		List<Course> found = mine ? courses.findWhere("teacherUid", me.uid()) : courses.findAll();
		return found.stream()
				.sorted(Comparator.comparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.<Timestamp>reverseOrder())))
				.toList();
	}

	public Course get(AuthUser me, String id) {
		userService.getProfile(me);
		return access.requireCourse(id);
	}

	public Course create(AuthUser me, CourseRequest body) {
		User caller = userService.requireRole(me, Role.TEACHER, Role.ADMIN);
		User owner = caller;
		if (caller.hasRole(Role.ADMIN) && hasText(body.teacherUid())) owner = requireTeacher(body.teacherUid());

		Map<String, Object> fields = new HashMap<>();
		fields.put("title", body.title().trim());
		fields.put("gradeLevel", body.gradeLevel());
		fields.put("topic", body.topic());
		fields.put("teacherUid", owner.getUid());
		fields.put("teacherName", owner.getName());
		String id = courses.create(fields);
		return access.requireCourse(id);
	}

	public Course update(AuthUser me, String id, CourseRequest body) {
		User caller = userService.getProfile(me);
		Course course = access.requireStaff(caller, id);

		Map<String, Object> fields = new HashMap<>();
		fields.put("title", body.title().trim());
		fields.put("gradeLevel", body.gradeLevel());
		fields.put("topic", body.topic());
		if (caller.hasRole(Role.ADMIN) && hasText(body.teacherUid()) && !body.teacherUid().equals(course.getTeacherUid())) {
			User owner = requireTeacher(body.teacherUid());
			fields.put("teacherUid", owner.getUid());
			fields.put("teacherName", owner.getName());
		}
		courses.update(id, fields);
		return access.requireCourse(id);
	}

	/** Removes everything under the course. Badges are kept. */
	public void delete(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		access.requireStaff(caller, id);

		questions.deleteWhere("courseId", id);
		quizzes.deleteWhere("courseId", id);
		experiments.deleteWhere("courseId", id);
		lessons.deleteWhere("courseId", id);
		enrollments.deleteWhere("courseId", id);
		courses.deleteById(id);
	}

	private User requireTeacher(String uid) {
		return users.findById(uid)
				.filter((user) -> user.hasRole(Role.TEACHER))
				.orElseThrow(() -> ApiException.badRequest("Pick a teacher for this course."));
	}

	private static boolean hasText(String value) {
		return value != null && !value.isBlank();
	}
}
