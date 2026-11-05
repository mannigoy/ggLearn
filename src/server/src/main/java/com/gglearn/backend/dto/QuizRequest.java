package com.gglearn.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Create or update a quiz. */
public record QuizRequest(
		@NotBlank(message = "Give the quiz a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title,

		@NotNull(message = "Set a passing score.")
		@Min(value = 0, message = "The passing score can’t be less than 0.")
		Long passingScore) {
}
