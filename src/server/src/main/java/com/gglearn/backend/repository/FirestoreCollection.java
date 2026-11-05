package com.gglearn.backend.repository;

import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.WriteBatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.gglearn.backend.repository.Firestores.await;

/** Common reads and writes for one collection. Writes take maps so only the fields given are stored. */
public abstract class FirestoreCollection<T> {

	private static final int BATCH_LIMIT = 500;

	private final Firestore firestore;
	private final CollectionReference collection;
	private final Class<T> type;

	protected FirestoreCollection(Firestore firestore, String name, Class<T> type) {
		this.firestore = firestore;
		this.collection = firestore.collection(name);
		this.type = type;
	}

	public Optional<T> findById(String id) {
		DocumentSnapshot snap = await(collection.document(id).get());
		return snap.exists() ? Optional.ofNullable(snap.toObject(type)) : Optional.empty();
	}

	/** Unsorted: ordering needs a composite index, so callers sort in Java. */
	public List<T> findWhere(String field, Object value) {
		return await(collection.whereEqualTo(field, value).get()).toObjects(type);
	}

	public List<T> findAll() {
		return await(collection.get()).toObjects(type);
	}

	/** Returns the new document's id. */
	public String create(Map<String, Object> fields) {
		var ref = collection.document();
		Map<String, Object> data = new HashMap<>(fields);
		data.put("createdAt", FieldValue.serverTimestamp());
		data.put("updatedAt", FieldValue.serverTimestamp());
		await(ref.create(data));
		return ref.getId();
	}

	/** Fails if the document already exists. */
	public void createWithId(String id, Map<String, Object> fields) {
		Map<String, Object> data = new HashMap<>(fields);
		data.put("createdAt", FieldValue.serverTimestamp());
		await(collection.document(id).create(data));
	}

	public void update(String id, Map<String, Object> fields) {
		Map<String, Object> data = new HashMap<>(fields);
		data.put("updatedAt", FieldValue.serverTimestamp());
		await(collection.document(id).update(data));
	}

	public void deleteById(String id) {
		await(collection.document(id).delete());
	}

	/** Deletes every matching document in batches of 500. Returns how many were deleted. */
	public int deleteWhere(String field, Object value) {
		List<QueryDocumentSnapshot> matches = await(collection.whereEqualTo(field, value).get()).getDocuments();
		for (List<QueryDocumentSnapshot> chunk : Batches.chunks(matches, BATCH_LIMIT)) {
			WriteBatch batch = firestore.batch();
			for (QueryDocumentSnapshot doc : chunk) batch.delete(doc.getReference());
			await(batch.commit());
		}
		return matches.size();
	}
}
