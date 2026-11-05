package com.gglearn.backend.entity;

import java.util.Arrays;
import java.util.Optional;

/** Matches ROLES in the front end. Stored in Firestore as the lowercase value. */
public enum Role {
	STUDENT("student"),
	// Signed up as a teacher; acts like no role until an admin approves.
	PENDING_TEACHER("pending_teacher"),
	TEACHER("teacher"),
	ADMIN("admin");

	private final String value;

	Role(String value) {
		this.value = value;
	}

	public String value() {
		return value;
	}

	public static Optional<Role> fromValue(String value) {
		return Arrays.stream(values()).filter((role) -> role.value.equals(value)).findFirst();
	}
}
