package com.gglearn.backend.repository;

import com.gglearn.backend.exception.FirestoreException;
import com.google.api.core.ApiFuture;

import java.util.concurrent.ExecutionException;

/** Blocks on a Firestore call and turns its checked exceptions into FirestoreException. */
final class Firestores {

	private Firestores() {
	}

	static <T> T await(ApiFuture<T> future) {
		try {
			return future.get();
		} catch (InterruptedException error) {
			Thread.currentThread().interrupt();
			throw new FirestoreException("Interrupted waiting for Firestore", error);
		} catch (ExecutionException error) {
			throw new FirestoreException("Firestore call failed", error.getCause());
		}
	}
}
