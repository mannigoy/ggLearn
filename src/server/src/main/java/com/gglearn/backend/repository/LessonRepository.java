package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Lesson;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.repository.Firestores.await;

/** lessons/{id}, with auto-generated ids. */
@Repository
public class LessonRepository {

	private final CollectionReference lessons;

	public LessonRepository(Firestore firestore) {
		this.lessons = firestore.collection("lessons");
	}

	public List<Lesson> findAllNewestFirst() {
		return await(lessons.orderBy("createdAt", Query.Direction.DESCENDING).get())
				.toObjects(Lesson.class);
	}

	public Optional<Lesson> findById(String id) {
		var snap = await(lessons.document(id).get());
		return snap.exists() ? Optional.ofNullable(snap.toObject(Lesson.class)) : Optional.empty();
	}

	/** Returns the new lesson's id. */
	public String create(String title, String topic, String content, String by, String byUid) {
		var ref = lessons.document();
		await(ref.create(Map.of(
				"title", title,
				"topic", topic,
				"content", content,
				"by", by,
				"byUid", byUid,
				"createdAt", FieldValue.serverTimestamp())));
		return ref.getId();
	}

	public void deleteById(String id) {
		await(lessons.document(id).delete());
	}
}
