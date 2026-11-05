package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Lesson;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** lessons/{id}, with auto-generated ids. */
@Repository
public class LessonRepository extends FirestoreCollection<Lesson> {

	public LessonRepository(Firestore firestore) {
		super(firestore, "lessons", Lesson.class);
	}
}
