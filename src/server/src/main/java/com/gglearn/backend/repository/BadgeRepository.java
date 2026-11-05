package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Badge;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** badges/{id}. */
@Repository
public class BadgeRepository extends FirestoreCollection<Badge> {

	public BadgeRepository(Firestore firestore) {
		super(firestore, "badges", Badge.class);
	}
}
