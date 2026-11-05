package com.gglearn.backend.dto;

import com.gglearn.backend.entity.User;
import com.google.cloud.Timestamp;

import java.time.Instant;

public record UserResponse(
		String uid,
		String name,
		String email,
		String role,
		Instant createdAt,
		Instant roleUpdatedAt,
		String roleUpdatedBy) {

	public static UserResponse from(User user) {
		return new UserResponse(
				user.getUid(),
				user.getName(),
				user.getEmail(),
				user.getRole(),
				toInstant(user.getCreatedAt()),
				toInstant(user.getRoleUpdatedAt()),
				user.getRoleUpdatedBy());
	}

	static Instant toInstant(Timestamp timestamp) {
		return timestamp == null ? null : timestamp.toDate().toInstant();
	}
}
