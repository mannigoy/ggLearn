package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.EnrollRequest;
import com.gglearn.backend.dto.EnrollmentResponse;
import com.gglearn.backend.service.EnrollmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/enrollments")
public class EnrollmentController {

	private final EnrollmentService enrollmentService;

	public EnrollmentController(EnrollmentService enrollmentService) {
		this.enrollmentService = enrollmentService;
	}

	@GetMapping
	public List<EnrollmentResponse> roster(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String courseId) {
		return enrollmentService.roster(me, courseId).stream().map(EnrollmentResponse::from).toList();
	}

	/** No body: the caller enrolls themselves. With `studentUid`: staff add that student. */
	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public EnrollmentResponse enroll(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me,
			@PathVariable String courseId, @RequestBody(required = false) EnrollRequest body) {
		return EnrollmentResponse.from(enrollmentService.enroll(me, courseId, body == null ? null : body.studentUid()));
	}

	@DeleteMapping("/{studentUid}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void remove(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me, @PathVariable String courseId,
			@PathVariable String studentUid) {
		enrollmentService.remove(me, courseId, studentUid);
	}
}
