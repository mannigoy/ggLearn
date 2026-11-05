package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotNull;

public record SetDisabledRequest(
		@NotNull(message = "Say whether to turn the account off.")
		Boolean disabled) {
}
