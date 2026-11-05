package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.BadgeRequest;
import com.gglearn.backend.dto.BadgeResponse;
import com.gglearn.backend.dto.BadgeUpdateRequest;
import com.gglearn.backend.service.BadgeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

	private final BadgeService badgeService;

	public BadgeController(BadgeService badgeService) {
		this.badgeService = badgeService;
	}

	@GetMapping
	public List<BadgeResponse> forCourse(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@RequestParam String courseId) {
		return badgeService.forCourse(me, courseId).stream().map(BadgeResponse::from).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public BadgeResponse award(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@Valid @RequestBody BadgeRequest body) {
		return BadgeResponse.from(badgeService.award(me, body));
	}

	@PutMapping("/{id}")
	public BadgeResponse rename(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id,
			@Valid @RequestBody BadgeUpdateRequest body) {
		return BadgeResponse.from(badgeService.rename(me, id, body));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void revoke(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		badgeService.revoke(me, id);
	}
}
