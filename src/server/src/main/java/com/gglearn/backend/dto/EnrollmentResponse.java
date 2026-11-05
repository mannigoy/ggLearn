package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Enrollment;

import java.time.Instant;

public record EnrollmentResponse(
		String courseId,
		String studentUid,
		String studentName,
		Long progressPct,
		Long points,
		Instant enrolledAt) {

	public static EnrollmentResponse from(Enrollment enrollment) {
		return new EnrollmentResponse(
				enrollment.getCourseId(),
				enrollment.getStudentUid(),
				enrollment.getStudentName(),
				enrollment.getProgressPct(),
				enrollment.getPoints(),
				UserResponse.toInstant(enrollment.getEnrolledAt()));
	}
}
