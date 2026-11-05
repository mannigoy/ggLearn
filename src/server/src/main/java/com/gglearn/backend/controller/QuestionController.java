package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.QuestionRequest;
import com.gglearn.backend.dto.QuestionResponse;
import com.gglearn.backend.service.QuestionService;
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
public class QuestionController {

	private final QuestionService questionService;

	public QuestionController(QuestionService questionService) {
		this.questionService = questionService;
	}

	@GetMapping("/api/quizzes/{quizId}/questions")
	public List<QuestionResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String quizId) {
		return questionService.list(me, quizId);
	}

	@PostMapping("/api/quizzes/{quizId}/questions")
	@ResponseStatus(HttpStatus.CREATED)
	public QuestionResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String quizId, @Valid @RequestBody QuestionRequest body) {
		return questionService.create(me, quizId, body);
	}

	@PutMapping("/api/questions/{id}")
	public QuestionResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String id, @Valid @RequestBody QuestionRequest body) {
		return questionService.update(me, id, body);
	}

	@DeleteMapping("/api/questions/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		questionService.delete(me, id);
	}
}
