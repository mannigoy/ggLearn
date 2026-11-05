package com.gglearn.backend.repository;

import com.gglearn.backend.entity.User;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.repository.Firestores.await;

/** users/{uid}. Writes use maps so documents keep the same fields the front end used to write. */
@Repository
public class UserRepository {

	private final CollectionReference users;

	public UserRepository(Firestore firestore) {
		this.users = firestore.collection("users");
	}

	public Optional<User> findById(String uid) {
		var snap = await(users.document(uid).get());
		return snap.exists() ? Optional.ofNullable(snap.toObject(User.class)) : Optional.empty();
	}

	public boolean existsById(String uid) {
		return await(users.document(uid).get()).exists();
	}

	public List<User> findAllNewestFirst() {
		return await(users.orderBy("createdAt", Query.Direction.DESCENDING).get())
				.toObjects(User.class);
	}

	/** Fails if the profile already exists. */
	public void create(String uid, String name, String email, String role) {
		await(users.document(uid).create(Map.of(
				"name", name,
				"email", email,
				"role", role,
				"createdAt", FieldValue.serverTimestamp())));
	}

	public void updateName(String uid, String name) {
		await(users.document(uid).update("name", name));
	}

	public void updateRole(String uid, String role, String adminUid) {
		await(users.document(uid).update(Map.of(
				"role", role,
				"roleUpdatedAt", FieldValue.serverTimestamp(),
				"roleUpdatedBy", adminUid)));
	}
}
