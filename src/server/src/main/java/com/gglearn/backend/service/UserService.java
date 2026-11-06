package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Profiles and roles. These checks replace the users/{uid} rules in firestore.rules. */
@Service
public class UserService {

	private final UserRepository users;

	public UserService(UserRepository users) {
		this.users = users;
	}

	public User getProfile(AuthUser me) {
		User profile = users.findById(me.uid())
				.orElseThrow(() -> ApiException.notFound("Your account has no profile yet. Please contact your admin."));
		if (profile.isDisabled()) throw ApiException.forbidden("Your account is turned off. Ask your admin.");
		return profile;
	}

	/** The caller's profile, if their role is one of `allowed`. */
	public User requireRole(AuthUser me, Role... allowed) {
		User profile = getProfile(me);
		if (!profile.hasRole(allowed)) throw ApiException.forbidden("You don’t have permission to do that.");
		return profile;
	}

	/** Sign-up creates your own profile as student or pending_teacher only. */
	public User register(AuthUser me, String name, String role) {
		Role stored = switch (role) {
			case "student" -> Role.STUDENT;
			case "teacher" -> Role.PENDING_TEACHER;
			default -> throw ApiException.badRequest("Pick student or teacher.");
		};
		if (me.email() == null) throw ApiException.badRequest("Your account has no email address.");
		if (users.existsById(me.uid())) throw ApiException.conflict("You already have a profile.");

		users.create(me.uid(), Validation.name(name), me.email().toLowerCase(), stored.value());
		return getProfile(me);
	}

	/** You may rename yourself; you can never change your own role or email. */
	public User rename(AuthUser me, String name) {
		getProfile(me);
		users.updateName(me.uid(), Validation.name(name));
		return getProfile(me);
	}

	public List<User> listUsers(AuthUser me) {
		requireRole(me, Role.ADMIN);
		return users.findAllNewestFirst();
	}

	/** Admins change other users' roles, never their own, so the last admin can't lock themselves out. */
	public User setRole(AuthUser me, String targetUid, String role) {
		requireRole(me, Role.ADMIN);
		Role next = Role.fromValue(role).orElseThrow(() -> ApiException.badRequest("Unknown role."));
		if (me.uid().equals(targetUid)) throw ApiException.forbidden("You can’t change your own role.");
		if (!users.existsById(targetUid)) throw ApiException.notFound("That user doesn’t exist.");

		users.updateRole(targetUid, next.value(), me.uid());
		return users.findById(targetUid).orElseThrow(() -> ApiException.notFound("That user doesn’t exist."));
	}
}
