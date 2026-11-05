package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.CreateUserRequest;
import com.gglearn.backend.dto.UpdateUserRequest;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.repository.CourseRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.firestore.FieldValue;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.service.Fixtures.assertStatus;
import static com.gglearn.backend.service.Fixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class UserAdminServiceTest {

	private final UserRepository users = mock(UserRepository.class);
	private final AuthAccounts accounts = mock(AuthAccounts.class);
	private final EnrollmentRepository enrollments = mock(EnrollmentRepository.class);
	private final CourseRepository courses = mock(CourseRepository.class);
	private final UserAdminService service = new UserAdminService(users, accounts, enrollments, new UserService(users));

	private static final AuthUser ADMIN = new AuthUser("a-1", "a1@example.com");
	private static final AuthUser TEACHER = new AuthUser("t-1", "t1@example.com");

	private void signIn(AuthUser who, String role) {
		when(users.findById(who.uid())).thenReturn(Optional.of(user(who.uid(), role)));
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> storedProfile(String uid) {
		ArgumentCaptor<Map<String, Object>> fields = ArgumentCaptor.forClass(Map.class);
		verify(users).createProfile(eq(uid), fields.capture());
		return fields.getValue();
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> storedUpdate(String uid) {
		ArgumentCaptor<Map<String, Object>> fields = ArgumentCaptor.forClass(Map.class);
		verify(users).update(eq(uid), fields.capture());
		return fields.getValue();
	}

	private static CreateUserRequest create(String role, String grade, String section, String subject) {
		return new CreateUserRequest("  Sam Lee ", "Sam@Example.COM", "secret1", role, grade, section, subject);
	}

	@Test
	void createsAccountThenProfile() {
		signIn(ADMIN, "admin");
		when(accounts.createAccount("sam@example.com", "secret1", "Sam Lee")).thenReturn("u-9");
		when(users.findById("u-9")).thenReturn(Optional.of(user("u-9", "student")));

		User created = service.create(ADMIN, create("student", "3", "Bees", null));

		assertThat(created.getUid()).isEqualTo("u-9");
		Map<String, Object> profile = storedProfile("u-9");
		assertThat(profile).containsEntry("name", "Sam Lee")
				.containsEntry("email", "sam@example.com")
				.containsEntry("role", "student")
				.containsEntry("disabled", false);
	}

	@Test
	void profileFailureRollsBackAccount() {
		signIn(ADMIN, "admin");
		when(accounts.createAccount(anyString(), anyString(), anyString())).thenReturn("u-9");
		doThrow(new IllegalStateException("firestore down")).when(users).createProfile(eq("u-9"), anyMap());

		assertThatThrownBy(() -> service.create(ADMIN, create("student", null, null, null)))
				.isInstanceOf(IllegalStateException.class);

		verify(accounts).deleteAccount("u-9");
	}

	@Test
	void teacherCannotCreateUsers() {
		signIn(TEACHER, "teacher");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.create(TEACHER, create("student", null, null, null)));

		verifyNoInteractions(accounts);
		verify(users, never()).createProfile(anyString(), anyMap());
	}

	@Test
	void studentFieldsOnlyForStudents() {
		signIn(ADMIN, "admin");
		when(accounts.createAccount(anyString(), anyString(), anyString())).thenReturn("u-9");
		when(users.findById("u-9")).thenReturn(Optional.of(user("u-9", "student")));

		service.create(ADMIN, create("student", "3", "Bees", "Math"));

		Map<String, Object> profile = storedProfile("u-9");
		assertThat(profile).containsEntry("gradeLevel", "3").containsEntry("section", "Bees").doesNotContainKey("subject");
	}

	@Test
	void subjectOnlyForTeachers() {
		signIn(ADMIN, "admin");
		when(accounts.createAccount(anyString(), anyString(), anyString())).thenReturn("u-9");
		when(users.findById("u-9")).thenReturn(Optional.of(user("u-9", "teacher")));

		service.create(ADMIN, create("teacher", "3", "Bees", "Math"));

		Map<String, Object> profile = storedProfile("u-9");
		assertThat(profile).containsEntry("subject", "Math").doesNotContainKey("gradeLevel").doesNotContainKey("section");
	}

	@Test
	void updateAppliesRoleFieldsAndClearsEmptyOnes() {
		signIn(ADMIN, "admin");
		when(users.findById("s-2")).thenReturn(Optional.of(user("s-2", "student")));

		service.update(ADMIN, "s-2", new UpdateUserRequest(" New Name ", "", "Bees", "Math"));

		Map<String, Object> fields = storedUpdate("s-2");
		assertThat(fields).containsEntry("name", "New Name")
				.containsEntry("gradeLevel", FieldValue.delete())
				.containsEntry("section", "Bees")
				.doesNotContainKey("subject");
	}

	@Test
	void updateMissingUserIs404() {
		signIn(ADMIN, "admin");
		when(users.findById("nope")).thenReturn(Optional.empty());

		assertStatus(HttpStatus.NOT_FOUND, () -> service.update(ADMIN, "nope", new UpdateUserRequest("Name", null, null, null)));

		verify(users, never()).update(anyString(), anyMap());
	}

	@Test
	void cannotDisableSelf() {
		signIn(ADMIN, "admin");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.setDisabled(ADMIN, "a-1", true));

		verifyNoInteractions(accounts);
	}

	@Test
	void disableTurnsOffAccountAndProfile() {
		signIn(ADMIN, "admin");
		when(users.findById("s-2")).thenReturn(Optional.of(user("s-2", "student")));

		service.setDisabled(ADMIN, "s-2", true);

		verify(accounts).setDisabled("s-2", true);
		assertThat(storedUpdate("s-2")).containsEntry("disabled", true);
	}

	@Test
	void cannotDeleteSelf() {
		signIn(ADMIN, "admin");

		assertStatus(HttpStatus.FORBIDDEN, () -> service.delete(ADMIN, "a-1"));

		verifyNoInteractions(accounts);
		verify(users, never()).deleteById(anyString());
	}

	@Test
	void deleteRemovesEnrollmentsButNotCourses() {
		signIn(ADMIN, "admin");
		when(users.findById("s-2")).thenReturn(Optional.of(user("s-2", "student")));

		service.delete(ADMIN, "s-2");

		verify(accounts).deleteAccount("s-2");
		verify(enrollments).deleteWhere("studentUid", "s-2");
		verify(users).deleteById("s-2");
		verifyNoInteractions(courses);
	}
}
