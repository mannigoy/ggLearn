package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SetRoleRequest(
		@NotBlank
		@Pattern(regexp = "student|pending_teacher|teacher|admin", message = "Unknown role.")
		String role) {
}
