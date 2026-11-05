package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.ExperimentRequest;
import com.gglearn.backend.dto.ExperimentResponse;
import com.gglearn.backend.service.ExperimentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ExperimentController {

	private final ExperimentService experimentService;

	public ExperimentController(ExperimentService experimentService) {
		this.experimentService = experimentService;
	}

	@GetMapping("/api/lessons/{lessonId}/experiments")
	public List<ExperimentResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String lessonId) {
		return experimentService.list(me, lessonId).stream().map(ExperimentResponse::from).toList();
	}

	@PostMapping("/api/lessons/{lessonId}/experiments")
	@ResponseStatus(HttpStatus.CREATED)
	public ExperimentResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String lessonId, @Valid @RequestBody ExperimentRequest body) {
		return ExperimentResponse.from(experimentService.create(me, lessonId, body));
	}

	@PutMapping("/api/experiments/{id}")
	public ExperimentResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String id, @Valid @RequestBody ExperimentRequest body) {
		return ExperimentResponse.from(experimentService.update(me, id, body));
	}

	@DeleteMapping("/api/experiments/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		experimentService.delete(me, id);
	}
}
