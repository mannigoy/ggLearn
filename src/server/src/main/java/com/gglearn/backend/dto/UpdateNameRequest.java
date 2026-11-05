package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateNameRequest(
		@NotBlank(message = "Tell us your name.")
		@Size(min = 2, max = 80, message = "Use 2 to 80 characters.")
		String name) {
}
