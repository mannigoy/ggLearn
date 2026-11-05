package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Quiz;

import java.time.Instant;

/** `totalPoints` is the number of questions in the quiz. */
public record QuizResponse(
		String id,
		String courseId,
		String lessonId,
		String title,
		Long passingScore,
		int totalPoints,
		Instant createdAt,
		Instant updatedAt) {

	public static QuizResponse from(Quiz quiz, int totalPoints) {
		return new QuizResponse(
				quiz.getId(),
				quiz.getCourseId(),
				quiz.getLessonId(),
				quiz.getTitle(),
				quiz.getPassingScore(),
				totalPoints,
				UserResponse.toInstant(quiz.getCreatedAt()),
				UserResponse.toInstant(quiz.getUpdatedAt()));
	}
}
