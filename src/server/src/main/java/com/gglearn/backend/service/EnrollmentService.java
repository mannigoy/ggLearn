package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.Course;
import com.gglearn.backend.entity.Enrollment;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.exception.FirestoreException;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.api.gax.rpc.AlreadyExistsException;
import com.google.cloud.firestore.FieldValue;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Who is in which course: students enroll themselves, teachers add and remove students. */
@Service
public class EnrollmentService {

	private final EnrollmentRepository enrollments;
	private final UserRepository users;
	private final CourseAccess access;
	private final UserService userService;

	public EnrollmentService(EnrollmentRepository enrollments, UserRepository users, CourseAccess access,
			UserService userService) {
		this.enrollments = enrollments;
		this.users = users;
		this.access = access;
		this.userService = userService;
	}

	/** Sorted here because ordering a filtered query needs a composite index. */
	public List<Enrollment> roster(AuthUser me, String courseId) {
		User caller = userService.getProfile(me);
		access.requireStaff(caller, courseId);
		return enrollments.findWhere("courseId", courseId).stream()
				.sorted(Comparator.comparing(Enrollment::getStudentName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
				.toList();
	}

	/** A student enrolls themselves (`studentUid` null), or staff add a student account. */
	public Enrollment enroll(AuthUser me, String courseId, String studentUid) {
		User caller = userService.getProfile(me);
		User student;
		if (studentUid == null || studentUid.isBlank()) {
			access.requireCourse(courseId);
			if (!caller.hasRole(Role.STUDENT)) throw ApiException.forbidden("Only students can enroll.");
			student = caller;
		} else {
			access.requireStaff(caller, courseId);
			student = users.findById(studentUid).orElse(null);
			if (student == null || !student.hasRole(Role.STUDENT) || student.isDisabled()) {
				throw ApiException.badRequest("Pick a student account.");
			}
		}

		String uid = student.getUid();
		if (enrollments.exists(courseId, uid)) throw ApiException.conflict("Already enrolled in this course.");

		Map<String, Object> fields = new HashMap<>();
		fields.put("courseId", courseId);
		fields.put("studentUid", uid);
		fields.put("studentName", student.getName());
		fields.put("progressPct", 0L);
		fields.put("points", 0L);
		fields.put("enrolledAt", FieldValue.serverTimestamp());
		String id = EnrollmentRepository.idFor(courseId, uid);
		try {
			enrollments.createWithId(id, fields);
		} catch (FirestoreException error) {
			// Two requests passed the check above at once; the second create loses.
			if (isAlreadyExists(error)) throw ApiException.conflict("Already enrolled in this course.");
			throw error;
		}
		return enrollments.findById(id).orElseThrow(() -> ApiException.notFound("That student isn’t in this course."));
	}

	/** The student leaving, or staff removing them. */
	public void remove(AuthUser me, String courseId, String studentUid) {
		User caller = userService.getProfile(me);
		Course course = access.requireCourse(courseId);
		boolean self = caller.getUid() != null && caller.getUid().equals(studentUid);
		if (!self && !access.isStaff(caller, course)) {
			throw ApiException.forbidden("Only this course’s teacher or an admin can do that.");
		}
		if (!enrollments.exists(courseId, studentUid)) throw ApiException.notFound("That student isn’t in this course.");
		enrollments.deleteById(EnrollmentRepository.idFor(courseId, studentUid));
	}

	/** The caller's own enrollments, for any profile. */
	public List<Enrollment> mine(AuthUser me) {
		User caller = userService.getProfile(me);
		return enrollments.findWhere("studentUid", caller.getUid());
	}

	/** The pick list for adding students to a course. */
	public List<User> students(AuthUser me) {
		userService.requireRole(me, Role.TEACHER, Role.ADMIN);
		return users.findByRole(Role.STUDENT.value()).stream()
				.filter((user) -> !user.isDisabled())
				.sorted(Comparator.comparing(User::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
				.toList();
	}

	private static boolean isAlreadyExists(Throwable error) {
		for (Throwable cause = error; cause != null; cause = cause.getCause()) {
			if (cause instanceof AlreadyExistsException) return true;
		}
		return false;
	}
}
