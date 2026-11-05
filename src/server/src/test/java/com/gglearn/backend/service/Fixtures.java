package com.gglearn.backend.service;

import com.gglearn.backend.entity.Course;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Shared test data and assertions for the service tests. */
final class Fixtures {

	private Fixtures() {
	}

	static User user(String uid, String role) {
		User user = new User();
		user.setUid(uid);
		user.setName("Name " + uid);
		user.setRole(role);
		return user;
	}

	static Course course(String id, String teacherUid) {
		Course course = new Course();
		course.setId(id);
		course.setTitle("Title " + id);
		course.setGradeLevel("3");
		course.setTopic("life");
		course.setTeacherUid(teacherUid);
		course.setTeacherName("Name " + teacherUid);
		return course;
	}

	/** Runs `call` and asserts it throws an ApiException with `status`. */
	static void assertStatus(HttpStatus status, org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
		assertThatThrownBy(call).isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(status));
	}
}
