package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Create or update an experiment. */
public record ExperimentRequest(
		@NotBlank(message = "Give the experiment a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title,

		@NotNull(message = "List what you need.")
		@Size(min = 1, max = 30, message = "List 1 to 30 materials.")
		List<@NotBlank(message = "Fill in or remove empty materials.") @Size(max = 300, message = "Use up to 300 characters.") String> materials,

		@NotNull(message = "Add the steps.")
		@Size(min = 1, max = 30, message = "List 1 to 30 steps.")
		List<@NotBlank(message = "Fill in or remove empty steps.") @Size(max = 300, message = "Use up to 300 characters.") String> steps,

		@Size(max = 1000, message = "Use up to 1,000 characters.")
		String safetyNotes) {
}
