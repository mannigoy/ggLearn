package com.gglearn.backend.controller;

import com.gglearn.backend.config.FirebaseAuthFilter;
import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.StudentResponse;
import com.gglearn.backend.service.EnrollmentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class StudentController {

	private final EnrollmentService enrollmentService;

	public StudentController(EnrollmentService enrollmentService) {
		this.enrollmentService = enrollmentService;
	}

	@GetMapping("/api/students")
	public List<StudentResponse> list(@RequestAttribute(FirebaseAuthFilter.ATTRIBUTE) AuthUser me) {
		return enrollmentService.students(me).stream().map(StudentResponse::from).toList();
	}
}
