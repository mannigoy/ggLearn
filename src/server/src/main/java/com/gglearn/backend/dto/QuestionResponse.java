package com.gglearn.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.gglearn.backend.entity.Question;

import java.util.List;

/** `correctAnswer` is left out of the JSON when null, which is how students get questions. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record QuestionResponse(
		String id,
		String quizId,
		String questionText,
		List<String> choices,
		String correctAnswer,
		Long order) {

	public static QuestionResponse from(Question question) {
		return new QuestionResponse(
				question.getId(),
				question.getQuizId(),
				question.getQuestionText(),
				question.getChoices(),
				question.getCorrectAnswer(),
				question.getOrder());
	}

	/** A copy without the answer. */
	public QuestionResponse forStudent() {
		return new QuestionResponse(id, quizId, questionText, choices, null, order);
	}
}
