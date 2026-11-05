package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.LessonRepository;
import com.gglearn.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static com.gglearn.backend.service.UserServiceTest.profile;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LessonServiceTest {

	private final UserRepository users = mock(UserRepository.class);
	private final LessonRepository lessons = mock(LessonRepository.class);
	private final LessonService service = new LessonService(lessons, new UserService(users));

	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");
	private static final AuthUser OTHER_TEACHER = new AuthUser("t-2", "t2@example.com");
	private static final AuthUser ADMIN = new AuthUser("admin-1", "admin@example.com");
	private static final AuthUser PENDING = new AuthUser("p-1", "p1@example.com");

	private Lesson lessonBy(String uid) {
		Lesson lesson = new Lesson();
		lesson.setId("lesson-1");
		lesson.setByUid(uid);
		when(lessons.findById("lesson-1")).thenReturn(Optional.of(lesson));
		return lesson;
	}

	@Test
	void pendingTeacherCannotCreate() {
		when(users.findById(PENDING.uid())).thenReturn(Optional.of(profile(PENDING.uid(), "pending_teacher")));

		assertThatThrownBy(() -> service.create(PENDING, "Seeds", "life", "Plant a bean."))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
		verify(lessons, never()).create(any(), any(), any(), any(), any());
	}

	@Test
	void teacherCreatesUnderOwnName() {
		when(users.findById(TEACHER.uid())).thenReturn(Optional.of(profile(TEACHER.uid(), "teacher")));
		when(lessons.create("Seeds", "life", "Plant a bean.", "Name t-1", "t-1")).thenReturn("lesson-1");
		lessonBy("t-1");

		service.create(TEACHER, " Seeds ", "life", "Plant a bean. ");

		verify(lessons).create("Seeds", "life", "Plant a bean.", "Name t-1", "t-1");
	}

	@Test
	void teacherCannotDeleteAnotherTeachersLesson() {
		when(users.findById(OTHER_TEACHER.uid())).thenReturn(Optional.of(profile(OTHER_TEACHER.uid(), "teacher")));
		lessonBy(TEACHER.uid());

		assertThatThrownBy(() -> service.delete(OTHER_TEACHER, "lesson-1"))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
		verify(lessons, never()).deleteById(any());
	}

	@Test
	void adminCanDeleteAnyLesson() {
		when(users.findById(ADMIN.uid())).thenReturn(Optional.of(profile(ADMIN.uid(), "admin")));
		lessonBy(TEACHER.uid());

		service.delete(ADMIN, "lesson-1");

		verify(lessons).deleteById("lesson-1");
	}
}
