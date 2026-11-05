package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Experiment;

import java.time.Instant;
import java.util.List;

public record ExperimentResponse(
		String id,
		String courseId,
		String lessonId,
		String title,
		List<String> materials,
		List<String> steps,
		String safetyNotes,
		Instant createdAt,
		Instant updatedAt) {

	public static ExperimentResponse from(Experiment experiment) {
		return new ExperimentResponse(
				experiment.getId(),
				experiment.getCourseId(),
				experiment.getLessonId(),
				experiment.getTitle(),
				experiment.getMaterials(),
				experiment.getSteps(),
				experiment.getSafetyNotes(),
				UserResponse.toInstant(experiment.getCreatedAt()),
				UserResponse.toInstant(experiment.getUpdatedAt()));
	}
}
