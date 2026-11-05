package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Create or update a question. `order` is optional: new questions go last, edits keep the current spot. */
public record QuestionRequest(
		@NotBlank(message = "Write the question.")
		@Size(min = 2, max = 500, message = "Use 2 to 500 characters.")
		String questionText,

		@NotNull(message = "Add the choices.")
		@Size(min = 2, max = 6, message = "Give 2 to 6 choices.")
		List<@NotBlank(message = "Choices can’t be empty.") @Size(max = 200, message = "Use up to 200 characters.") String> choices,

		@NotBlank(message = "Pick the correct answer.")
		String correctAnswer,

		Long order) {
}
