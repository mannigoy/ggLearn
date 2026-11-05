package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore quizzes/{id}. */
public class Quiz {

	@DocumentId
	private String id;
	private String courseId;
	private String lessonId;
	private String title;
	private Long passingScore;
	private Timestamp createdAt;
	private Timestamp updatedAt;

	public Quiz() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getCourseId() { return courseId; }
	public void setCourseId(String courseId) { this.courseId = courseId; }

	public String getLessonId() { return lessonId; }
	public void setLessonId(String lessonId) { this.lessonId = lessonId; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public Long getPassingScore() { return passingScore; }
	public void setPassingScore(Long passingScore) { this.passingScore = passingScore; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
