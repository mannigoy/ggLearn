package com.gglearn.backend.dto;

import com.gglearn.backend.entity.User;

public record StudentResponse(String uid, String name, String gradeLevel, String section) {

	public static StudentResponse from(User user) {
		return new StudentResponse(user.getUid(), user.getName(), user.getGradeLevel(), user.getSection());
	}
}
