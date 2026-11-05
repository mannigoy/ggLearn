package com.gglearn.backend.dto;

/** Teachers send the student to add; a student enrolling themselves sends no body. */
public record EnrollRequest(String studentUid) {
}
