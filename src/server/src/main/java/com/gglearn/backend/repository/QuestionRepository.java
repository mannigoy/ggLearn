package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Question;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** questions/{id}. */
@Repository
public class QuestionRepository extends FirestoreCollection<Question> {

	public QuestionRepository(Firestore firestore) {
		super(firestore, "questions", Question.class);
	}
}
