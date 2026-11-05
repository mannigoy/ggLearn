package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CreateUserRequest;
import com.gglearn.backend.dto.SetDisabledRequest;
import com.gglearn.backend.dto.SetRoleRequest;
import com.gglearn.backend.dto.UpdateUserRequest;
import com.gglearn.backend.dto.UserResponse;
import com.gglearn.backend.service.UserAdminService;
import com.gglearn.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Admin only: every profile, and creating, editing, turning off and deleting accounts. */
@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final UserAdminService userAdminService;

	public UserController(UserService userService, UserAdminService userAdminService) {
		this.userService = userService;
		this.userAdminService = userAdminService;
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

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public UserResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@Valid @RequestBody CreateUserRequest body) {
		return UserResponse.from(userAdminService.create(me, body));
	}

	@PutMapping("/{uid}")
	public UserResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String uid, @Valid @RequestBody UpdateUserRequest body) {
		return UserResponse.from(userAdminService.update(me, uid, body));
	}

	@PatchMapping("/{uid}/disabled")
	public UserResponse setDisabled(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String uid, @Valid @RequestBody SetDisabledRequest body) {
		return UserResponse.from(userAdminService.setDisabled(me, uid, body.disabled()));
	}

	@DeleteMapping("/{uid}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String uid) {
		userAdminService.delete(me, uid);
	}
}
