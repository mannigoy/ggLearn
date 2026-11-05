package com.gglearn.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Create or update a course. `teacherUid` is optional and only an admin may use it. */
public record CourseRequest(
		@NotBlank(message = "Give the course a title.")
		@Size(min = 2, max = 120, message = "Use 2 to 120 characters.")
		String title,

		@NotBlank(message = "Pick a grade.")
		@Pattern(regexp = "K|[1-6]", message = "Pick a grade from K to 6.")
		String gradeLevel,

		@NotBlank(message = "Pick a topic.")
		@Pattern(regexp = "life|earth|physical", message = "Pick life, earth or physical science.")
		String topic,

		String teacherUid) {
}
