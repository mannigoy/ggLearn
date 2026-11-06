package com.gglearn.backend.service;

import com.gglearn.backend.exception.ApiException;

/** Length checks that run after trimming, so " a " can't slip past a minimum of 2. */
final class Validation {

	static final String TITLE_MESSAGE = "Use 2 to 120 characters.";
	static final String QUESTION_MESSAGE = "Use 2 to 500 characters.";
	static final String NAME_MESSAGE = "Use 2 to 80 characters.";

	private Validation() {
	}

	/** Returns `trimmed` when its length is within `min` to `max`, otherwise throws a 400 with `message`. */
	static String requireLength(String trimmed, int min, int max, String message) {
		if (trimmed == null || trimmed.length() < min || trimmed.length() > max) throw ApiException.badRequest(message);
		return trimmed;
	}

	/** A title: trimmed, 2 to 120 characters. */
	static String title(String raw) {
		return requireLength(raw == null ? null : raw.trim(), 2, 120, TITLE_MESSAGE);
	}

	/** A person's name: trimmed, 2 to 80 characters. */
	static String name(String raw) {
		return requireLength(raw == null ? null : raw.trim(), 2, 80, NAME_MESSAGE);
	}
}
