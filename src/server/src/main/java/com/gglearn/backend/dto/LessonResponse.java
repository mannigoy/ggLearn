package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Lesson;

import java.time.Instant;

public record LessonResponse(
		String id,
		String courseId,
		String title,
		String topic,
		String content,
		Long order,
		Instant createdAt,
		Instant updatedAt) {

	public static LessonResponse from(Lesson lesson) {
		return new LessonResponse(
				lesson.getId(),
				lesson.getCourseId(),
				lesson.getTitle(),
				lesson.getTopic(),
				lesson.getContent(),
				lesson.getOrder(),
				UserResponse.toInstant(lesson.getCreatedAt()),
				UserResponse.toInstant(lesson.getUpdatedAt()));
	}
}
