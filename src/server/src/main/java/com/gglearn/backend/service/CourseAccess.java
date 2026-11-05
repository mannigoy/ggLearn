package com.gglearn.backend.service;

import com.gglearn.backend.entity.Course;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import org.springframework.stereotype.Service;

/** Who may touch a course. Every child service (lessons, quizzes and so on) uses these checks. */
@Service
public class CourseAccess {

	private final CourseRepository courses;
	private final EnrollmentRepository enrollments;

	public CourseAccess(CourseRepository courses, EnrollmentRepository enrollments) {
		this.courses = courses;
		this.enrollments = enrollments;
	}

	public Course requireCourse(String courseId) {
		return courses.findById(courseId).orElseThrow(() -> ApiException.notFound("That course doesn’t exist."));
	}

	/** An admin, or the teacher who owns the course. A demoted owner is not staff. */
	public boolean isStaff(User caller, Course course) {
		if (caller.hasRole(Role.ADMIN)) return true;
		return caller.hasRole(Role.TEACHER) && caller.getUid() != null && caller.getUid().equals(course.getTeacherUid());
	}

	public Course requireStaff(User caller, String courseId) {
		Course course = requireCourse(courseId);
		if (!isStaff(caller, course)) throw ApiException.forbidden("Only this course’s teacher or an admin can do that.");
		return course;
	}

	/** Staff, or a student enrolled in the course. */
	public Course requireMember(User caller, String courseId) {
		Course course = requireCourse(courseId);
		if (isStaff(caller, course)) return course;
		if (caller.hasRole(Role.STUDENT) && enrollments.exists(courseId, caller.getUid())) return course;
		throw ApiException.forbidden("Enroll in this course first.");
	}
}
