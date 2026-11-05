package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Lesson;

import java.time.Instant;

public record LessonResponse(
		String id,
		String title,
		String topic,
		String content,
		String by,
		String byUid,
		Instant createdAt) {

	public static LessonResponse from(Lesson lesson) {
		return new LessonResponse(
				lesson.getId(),
				lesson.getTitle(),
				lesson.getTopic(),
				lesson.getContent(),
				lesson.getBy(),
				lesson.getByUid(),
				UserResponse.toInstant(lesson.getCreatedAt()));
	}
}
