package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CourseRequest;
import com.gglearn.backend.dto.CourseResponse;
import com.gglearn.backend.service.CourseService;
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
@RequestMapping("/api/courses")
public class CourseController {

	private final CourseService courseService;

	public CourseController(CourseService courseService) {
		this.courseService = courseService;
	}

	@GetMapping
	public List<CourseResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@RequestParam(defaultValue = "false") boolean mine) {
		return courseService.list(me, mine).stream().map(CourseResponse::from).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public CourseResponse create(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@Valid @RequestBody CourseRequest body) {
		return CourseResponse.from(courseService.create(me, body));
	}

	@GetMapping("/{id}")
	public CourseResponse get(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		return CourseResponse.from(courseService.get(me, id));
	}

	@PutMapping("/{id}")
	public CourseResponse update(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String id, @Valid @RequestBody CourseRequest body) {
		return CourseResponse.from(courseService.update(me, id, body));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String id) {
		courseService.delete(me, id);
	}
}
