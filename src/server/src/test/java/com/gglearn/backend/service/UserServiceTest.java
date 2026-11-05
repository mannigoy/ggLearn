package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserServiceTest {

	private final UserRepository users = mock(UserRepository.class);
	private final UserService service = new UserService(users);

	private static final AuthUser ADMIN = new AuthUser("admin-1", "admin@example.com");
	private static final AuthUser STUDENT = new AuthUser("student-1", "student@example.com");

	static User profile(String uid, String role) {
		User user = new User();
		user.setUid(uid);
		user.setName("Name " + uid);
		user.setRole(role);
		return user;
	}

	@Test
	void teacherSignUpIsStoredAsPending() {
		when(users.existsById("new-1")).thenReturn(false);
		when(users.findById("new-1")).thenReturn(Optional.of(profile("new-1", "pending_teacher")));

		service.register(new AuthUser("new-1", "New@Example.com"), "  Ms Frizzle ", "teacher");

		verify(users).create("new-1", "Ms Frizzle", "new@example.com", "pending_teacher");
	}

	@Test
	void cannotSelfRegisterAsAdmin() {
		assertThatThrownBy(() -> service.register(STUDENT, "Sneaky", "admin"))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
		verify(users, never()).create(anyString(), anyString(), anyString(), anyString());
	}

	@Test
	void cannotRegisterTwice() {
		when(users.existsById(STUDENT.uid())).thenReturn(true);

		assertThatThrownBy(() -> service.register(STUDENT, "Again", "student"))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.CONFLICT));
	}

	@Test
	void nonAdminCannotListOrChangeRoles() {
		when(users.findById(STUDENT.uid())).thenReturn(Optional.of(profile(STUDENT.uid(), "student")));

		assertThatThrownBy(() -> service.listUsers(STUDENT))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
		assertThatThrownBy(() -> service.setRole(STUDENT, STUDENT.uid(), "admin"))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
		verify(users, never()).updateRole(any(), any(), any());
	}

	@Test
	void adminCannotChangeOwnRole() {
		when(users.findById(ADMIN.uid())).thenReturn(Optional.of(profile(ADMIN.uid(), "admin")));

		assertThatThrownBy(() -> service.setRole(ADMIN, ADMIN.uid(), "student"))
				.isInstanceOfSatisfying(ApiException.class, (e) -> assertThat(e.getStatus()).isEqualTo(HttpStatus.FORBIDDEN));
		verify(users, never()).updateRole(any(), any(), any());
	}

	@Test
	void adminApprovesTeacher() {
		when(users.findById(ADMIN.uid())).thenReturn(Optional.of(profile(ADMIN.uid(), "admin")));
		when(users.existsById("t-1")).thenReturn(true);
		when(users.findById("t-1")).thenReturn(Optional.of(profile("t-1", "teacher")));

		User updated = service.setRole(ADMIN, "t-1", "teacher");

		verify(users).updateRole("t-1", "teacher", ADMIN.uid());
		assertThat(updated.getRole()).isEqualTo("teacher");
	}
}
