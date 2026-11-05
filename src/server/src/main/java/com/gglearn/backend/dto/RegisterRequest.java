package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Sign-up choice. "teacher" is stored as pending_teacher until an admin approves. */
public record RegisterRequest(
		@NotBlank(message = "Tell us your name.")
		@Size(min = 2, max = 80, message = "Use 2 to 80 characters.")
		String name,

		@NotBlank
		@Pattern(regexp = "student|teacher", message = "Pick student or teacher.")
		String role) {
}
