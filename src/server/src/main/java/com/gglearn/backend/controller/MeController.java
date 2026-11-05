package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.BadgeResponse;
import com.gglearn.backend.dto.EnrollmentResponse;
import com.gglearn.backend.service.BadgeService;
import com.gglearn.backend.service.EnrollmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** The signed-in user's own records. The profile itself lives in ProfileController. */
@RestController
@RequestMapping("/api/me")
public class MeController {

	private final EnrollmentService enrollmentService;
	private final BadgeService badgeService;

	public MeController(EnrollmentService enrollmentService, BadgeService badgeService) {
		this.enrollmentService = enrollmentService;
		this.badgeService = badgeService;
	}

	@GetMapping("/enrollments")
	public List<EnrollmentResponse> enrollments(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me) {
		return enrollmentService.mine(me).stream().map(EnrollmentResponse::from).toList();
	}

	@GetMapping("/badges")
	public List<BadgeResponse> badges(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me) {
		return badgeService.mine(me).stream().map(BadgeResponse::from).toList();
	}
}
