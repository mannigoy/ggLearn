package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.RegisterRequest;
import com.gglearn.backend.dto.UpdateNameRequest;
import com.gglearn.backend.dto.UserResponse;
import com.gglearn.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in user's own profile. */
@RestController
@RequestMapping("/api/me")
public class ProfileController {

	private final UserService userService;

	public ProfileController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	public UserResponse get(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me) {
		return UserResponse.from(userService.getProfile(me));
	}

	/** Called right after Firebase sign-up to create the profile. */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public UserResponse register(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@Valid @RequestBody RegisterRequest body) {
		return UserResponse.from(userService.register(me, body.name(), body.role()));
	}

	@PatchMapping
	public UserResponse rename(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@Valid @RequestBody UpdateNameRequest body) {
		return UserResponse.from(userService.rename(me, body.name()));
	}
}
