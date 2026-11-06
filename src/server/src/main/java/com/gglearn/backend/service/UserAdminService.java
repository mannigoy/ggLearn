package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CreateUserRequest;
import com.gglearn.backend.dto.UpdateUserRequest;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.firestore.FieldValue;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/** Admin-only account management: the Auth account and the users/{uid} profile are kept in step. */
@Service
public class UserAdminService {

	private final UserRepository users;
	private final AuthAccounts accounts;
	private final EnrollmentRepository enrollments;
	private final UserService userService;

	public UserAdminService(UserRepository users, AuthAccounts accounts, EnrollmentRepository enrollments,
			UserService userService) {
		this.users = users;
		this.accounts = accounts;
		this.enrollments = enrollments;
		this.userService = userService;
	}

	public User create(AuthUser me, CreateUserRequest body) {
		userService.requireRole(me, Role.ADMIN);
		String name = Validation.name(body.name());
		String email = body.email().trim().toLowerCase();

		String uid = accounts.createAccount(email, body.password(), name);
		Map<String, Object> profile = new HashMap<>();
		profile.put("name", name);
		profile.put("email", email);
		profile.put("role", body.role());
		profile.put("disabled", false);
		if (isStudent(body.role())) {
			putIfPresent(profile, "gradeLevel", body.gradeLevel());
			putIfPresent(profile, "section", body.section());
		} else if (isTeacher(body.role())) {
			putIfPresent(profile, "subject", body.subject());
		}
		try {
			users.createProfile(uid, profile);
		} catch (RuntimeException e) {
			accounts.deleteAccount(uid);
			throw e;
		}
		return find(uid);
	}

	public User update(AuthUser me, String uid, UpdateUserRequest body) {
		userService.requireRole(me, Role.ADMIN);
		if (me.uid().equals(uid)) throw ApiException.forbidden("You can’t change your own account here.");
		User target = find(uid);

		Map<String, Object> fields = new HashMap<>();
		fields.put("name", Validation.name(body.name()));
		if (isStudent(target.getRole())) {
			putOrClear(fields, "gradeLevel", body.gradeLevel());
			putOrClear(fields, "section", body.section());
		} else if (isTeacher(target.getRole())) {
			putOrClear(fields, "subject", body.subject());
		}
		users.update(uid, fields);
		return find(uid);
	}

	public User setDisabled(AuthUser me, String uid, boolean disabled) {
		userService.requireRole(me, Role.ADMIN);
		if (me.uid().equals(uid)) throw ApiException.forbidden("You can’t turn off your own account.");
		find(uid);

		accounts.setDisabled(uid, disabled);
		users.update(uid, Map.of("disabled", disabled));
		return find(uid);
	}

	/** Removes the account, its profile and its enrollments. Courses the user owns are kept. */
	public void delete(AuthUser me, String uid) {
		userService.requireRole(me, Role.ADMIN);
		if (me.uid().equals(uid)) throw ApiException.forbidden("You can’t delete your own account.");

		accounts.deleteAccount(uid);
		enrollments.deleteWhere("studentUid", uid);
		users.deleteById(uid);
	}

	private User find(String uid) {
		return users.findById(uid).orElseThrow(() -> ApiException.notFound("That user doesn’t exist."));
	}

	private static boolean isStudent(String role) {
		return Role.STUDENT.value().equals(role);
	}

	private static boolean isTeacher(String role) {
		return Role.TEACHER.value().equals(role);
	}

	private static void putIfPresent(Map<String, Object> fields, String key, String value) {
		if (value != null && !value.isBlank()) fields.put(key, value.trim());
	}

	/** Null leaves the field alone; an empty string removes it. */
	private static void putOrClear(Map<String, Object> fields, String key, String value) {
		if (value == null) return;
		fields.put(key, value.isBlank() ? FieldValue.delete() : value.trim());
	}
}
