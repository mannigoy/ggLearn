package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Quiz;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** quizzes/{id}. */
@Repository
public class QuizRepository extends FirestoreCollection<Quiz> {

	public QuizRepository(Firestore firestore) {
		super(firestore, "quizzes", Quiz.class);
	}
}
