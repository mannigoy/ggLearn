package com.gglearn.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** An admin creating an account. Grade and section apply to students, subject to teachers. */
public record CreateUserRequest(
		@NotBlank(message = "Tell us their name.")
		@Size(min = 2, max = 80, message = "Use 2 to 80 characters.")
		String name,

		@NotBlank(message = "Enter an email address.")
		@Email(message = "That email doesn’t look right.")
		String email,

		@NotBlank(message = "Enter a password.")
		@Size(min = 6, message = "Use at least 6 characters.")
		String password,

		@NotBlank(message = "Pick a role.")
		@Pattern(regexp = "student|teacher|admin", message = "Pick student, teacher or admin.")
		String role,

		@Pattern(regexp = "K|[1-6]", message = "Pick K or a grade from 1 to 6.")
		String gradeLevel,

		@Size(max = 60, message = "Use 60 characters or fewer.")
		String section,

		@Size(max = 60, message = "Use 60 characters or fewer.")
		String subject) {
}
