package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Course;

import java.time.Instant;

public record CourseResponse(
		String id,
		String title,
		String gradeLevel,
		String topic,
		String teacherUid,
		String teacherName,
		Instant createdAt,
		Instant updatedAt) {

	public static CourseResponse from(Course course) {
		return new CourseResponse(
				course.getId(),
				course.getTitle(),
				course.getGradeLevel(),
				course.getTopic(),
				course.getTeacherUid(),
				course.getTeacherName(),
				UserResponse.toInstant(course.getCreatedAt()),
				UserResponse.toInstant(course.getUpdatedAt()));
	}
}
