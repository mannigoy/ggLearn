package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.SetRoleRequest;
import com.gglearn.backend.dto.UserResponse;
import com.gglearn.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin only: every profile, and role changes. */
@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public List<UserResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me) {
		return userService.listUsers(me).stream().map(UserResponse::from).toList();
	}

	@PatchMapping("/{uid}/role")
	public UserResponse setRole(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String uid, @Valid @RequestBody SetRoleRequest body) {
		return UserResponse.from(userService.setRole(me, uid, body.role()));
	}
}
