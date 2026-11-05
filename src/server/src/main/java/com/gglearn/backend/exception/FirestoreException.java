package com.gglearn.backend.exception;

/** A Firestore call failed or was interrupted. */
public class FirestoreException extends RuntimeException {

	public FirestoreException(String message, Throwable cause) {
		super(message, cause);
	}
}
