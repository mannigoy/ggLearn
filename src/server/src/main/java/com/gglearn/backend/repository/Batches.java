package com.gglearn.backend.repository;

import java.util.ArrayList;
import java.util.List;

/** Splits work into groups small enough for one Firestore write batch (500 writes at most). */
final class Batches {

	private Batches() {
	}

	/** Consecutive chunks of at most `size` items. Empty input gives no chunks, and no chunk is ever empty. */
	static <T> List<List<T>> chunks(List<T> items, int size) {
		if (size < 1) throw new IllegalArgumentException("size must be at least 1");
		List<List<T>> chunks = new ArrayList<>();
		for (int from = 0; from < items.size(); from += size) {
			chunks.add(items.subList(from, Math.min(from + size, items.size())));
		}
		return chunks;
	}
}
