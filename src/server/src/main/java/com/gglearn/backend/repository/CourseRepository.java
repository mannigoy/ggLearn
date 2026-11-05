package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Course;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** courses/{id}. */
@Repository
public class CourseRepository extends FirestoreCollection<Course> {

	public CourseRepository(Firestore firestore) {
		super(firestore, "courses", Course.class);
	}
}
