package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Rename a badge. */
public record BadgeUpdateRequest(
		@NotBlank(message = "Give the badge a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title) {
}
