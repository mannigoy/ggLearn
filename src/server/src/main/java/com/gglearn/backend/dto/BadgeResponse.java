package com.gglearn.backend.dto;

import com.gglearn.backend.entity.Badge;

import java.time.Instant;

public record BadgeResponse(
		String id,
		String courseId,
		String userUid,
		String userName,
		String title,
		Instant dateEarned,
		String awardedBy) {

	public static BadgeResponse from(Badge badge) {
		return new BadgeResponse(
				badge.getId(),
				badge.getCourseId(),
				badge.getUserUid(),
				badge.getUserName(),
				badge.getTitle(),
				UserResponse.toInstant(badge.getDateEarned()),
				badge.getAwardedBy());
	}
}
