package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** An empty string clears gradeLevel, section or subject. Fields that don't suit the user's role are ignored. */
public record UpdateUserRequest(
		@NotBlank(message = "Tell us their name.")
		@Size(min = 2, max = 80, message = "Use 2 to 80 characters.")
		String name,

		@Pattern(regexp = "K|[1-6]|", message = "Pick K or a grade from 1 to 6.")
		String gradeLevel,

		@Size(max = 60, message = "Use 60 characters or fewer.")
		String section,

		@Size(max = 60, message = "Use 60 characters or fewer.")
		String subject) {
}
