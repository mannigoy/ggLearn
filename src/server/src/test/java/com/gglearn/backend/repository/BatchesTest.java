package com.gglearn.backend.repository;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

class BatchesTest {

	@Test
	void emptyInputGivesNoChunks() {
		assertThat(Batches.chunks(List.of(), 500)).isEmpty();
	}

	@Test
	void splitsIntoChunksOfAtMostSize() {
		List<Integer> items = IntStream.range(0, 1001).boxed().toList();

		List<List<Integer>> chunks = Batches.chunks(items, 500);

		assertThat(chunks).map(List::size).containsExactly(500, 500, 1);
	}

	@Test
	void exactlyOneFullChunkIsNotFollowedByAnEmptyOne() {
		List<Integer> items = IntStream.range(0, 500).boxed().toList();

		assertThat(Batches.chunks(items, 500)).hasSize(1);
	}
}
