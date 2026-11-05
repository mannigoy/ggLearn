package com.gglearn.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/** Every error leaves as a ProblemDetail: { status, detail } plus field errors for bad input. */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(ApiException.class)
	public ProblemDetail handleApi(ApiException error) {
		return ProblemDetail.forStatusAndDetail(error.getStatus(), error.getMessage());
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ProblemDetail handleInvalid(MethodArgumentNotValidException error) {
		ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Some fields need fixing.");
		problem.setProperty("fields", error.getBindingResult().getFieldErrors().stream()
				.collect(Collectors.toMap(
						(field) -> field.getField(),
						(field) -> String.valueOf(field.getDefaultMessage()),
						(first, second) -> first)));
		return problem;
	}

	@ExceptionHandler(FirestoreException.class)
	public ProblemDetail handleFirestore(FirestoreException error) {
		log.error("Firestore call failed", error);
		return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "Can’t reach the database. Try again in a moment.");
	}
}
