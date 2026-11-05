package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Enrollment;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** enrollments/{id}. */
@Repository
public class EnrollmentRepository extends FirestoreCollection<Enrollment> {

	public EnrollmentRepository(Firestore firestore) {
		super(firestore, "enrollments", Enrollment.class);
	}

	/** Fixed ids stop a student enrolling twice in the same course. */
	public static String idFor(String courseId, String studentUid) {
		return courseId + "_" + studentUid;
	}

	public boolean exists(String courseId, String studentUid) {
		return findById(idFor(courseId, studentUid)).isPresent();
	}
}
