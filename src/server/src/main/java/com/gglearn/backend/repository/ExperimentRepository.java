package com.gglearn.backend.repository;

import com.gglearn.backend.entity.Experiment;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Repository;

/** experiments/{id}. */
@Repository
public class ExperimentRepository extends FirestoreCollection<Experiment> {

	public ExperimentRepository(Firestore firestore) {
		super(firestore, "experiments", Experiment.class);
	}
}
