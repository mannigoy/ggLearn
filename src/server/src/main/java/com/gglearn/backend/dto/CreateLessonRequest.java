package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Topic keys match TOPICS in the front end. */
public record CreateLessonRequest(
		@NotBlank(message = "Give the lesson a title.")
		@Size(max = 120, message = "Keep the title under 120 characters.")
		String title,

		@NotBlank
		@Pattern(regexp = "life|earth|physical", message = "Pick life, earth, or physical.")
		String topic,

		@NotBlank(message = "Add the lesson content.")
		@Size(max = 20000, message = "Keep the content under 20,000 characters.")
		String content) {
}
