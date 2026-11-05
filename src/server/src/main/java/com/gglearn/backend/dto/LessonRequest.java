package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Create or update a lesson. `order` is optional: new lessons go last, edits keep the current spot. */
public record LessonRequest(
		@NotBlank(message = "Give the lesson a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title,

		@NotBlank(message = "Pick a topic.")
		@Pattern(regexp = "life|earth|physical", message = "Pick life, earth or physical science.")
		String topic,

		@NotBlank(message = "Write the lesson.")
		@Size(max = 20000, message = "Keep the lesson under 20,000 characters.")
		String content,

		Long order) {
}
