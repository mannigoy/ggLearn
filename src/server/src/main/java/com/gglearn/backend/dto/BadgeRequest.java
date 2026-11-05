package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Award a badge to a student in a course. */
public record BadgeRequest(
		@NotBlank(message = "Pick a course.")
		String courseId,

		@NotBlank(message = "Pick a student.")
		String userUid,

		@NotBlank(message = "Give the badge a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title) {
}
