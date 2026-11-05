package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.LessonRequest;
import com.gglearn.backend.dto.LessonResponse;
import com.gglearn.backend.service.LessonService;
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
public class LessonController {

	private final LessonService lessonService;

	public LessonController(LessonService lessonService) {
		this.lessonService = lessonService;
	}

	@GetMapping("/api/courses/{courseId}/lessons")
	public List<LessonResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String courseId) {
		return lessonService.list(me, courseId).stream().map(LessonResponse::from).toList();
	}

	@PostMapping("/api/courses/{courseId}/lessons")
	@ResponseStatus(HttpStatus.CREATED)
	public LessonResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String courseId, @Valid @RequestBody LessonRequest body) {
		return LessonResponse.from(lessonService.create(me, courseId, body));
	}

	@GetMapping("/api/lessons/{id}")
	public LessonResponse get(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		return LessonResponse.from(lessonService.get(me, id));
	}

	@PutMapping("/api/lessons/{id}")
	public LessonResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String id, @Valid @RequestBody LessonRequest body) {
		return LessonResponse.from(lessonService.update(me, id, body));
	}

	@DeleteMapping("/api/lessons/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		lessonService.delete(me, id);
	}
}
