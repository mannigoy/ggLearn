package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

import java.util.List;

/** Firestore questions/{id}. */
public class Question {

	@DocumentId
	private String id;
	private String courseId;
	private String quizId;
	private String questionText;
	private List<String> choices;
	private String correctAnswer;
	private Long order;
	private Timestamp createdAt;
	private Timestamp updatedAt;

	public Question() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getCourseId() { return courseId; }
	public void setCourseId(String courseId) { this.courseId = courseId; }

	public String getQuizId() { return quizId; }
	public void setQuizId(String quizId) { this.quizId = quizId; }

	public String getQuestionText() { return questionText; }
	public void setQuestionText(String questionText) { this.questionText = questionText; }

	public List<String> getChoices() { return choices; }
	public void setChoices(List<String> choices) { this.choices = choices; }

	public String getCorrectAnswer() { return correctAnswer; }
	public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

	public Long getOrder() { return order; }
	public void setOrder(Long order) { this.order = order; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
