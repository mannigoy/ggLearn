package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuizRequest;
import com.gglearn.backend.dto.QuizResponse;
import com.gglearn.backend.service.QuizService;
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
public class QuizController {

	private final QuizService quizService;

	public QuizController(QuizService quizService) {
		this.quizService = quizService;
	}

	@GetMapping("/api/lessons/{lessonId}/quizzes")
	public List<QuizResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String lessonId) {
		return quizService.list(me, lessonId);
	}

	@PostMapping("/api/lessons/{lessonId}/quizzes")
	@ResponseStatus(HttpStatus.CREATED)
	public QuizResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String lessonId, @Valid @RequestBody QuizRequest body) {
		return quizService.create(me, lessonId, body);
	}

	@GetMapping("/api/quizzes/{id}")
	public QuizResponse get(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		return quizService.get(me, id);
	}

	@PutMapping("/api/quizzes/{id}")
	public QuizResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String id, @Valid @RequestBody QuizRequest body) {
		return quizService.update(me, id, body);
	}

	@DeleteMapping("/api/quizzes/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		quizService.delete(me, id);
	}
}
