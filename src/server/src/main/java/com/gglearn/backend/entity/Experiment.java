package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

import java.util.List;

/** Firestore experiments/{id}. */
public class Experiment {

	@DocumentId
	private String id;
	private String courseId;
	private String lessonId;
	private String title;
	private List<String> materials;
	private List<String> steps;
	private String safetyNotes;
	private Timestamp createdAt;
	private Timestamp updatedAt;

	public Experiment() {
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

	public List<String> getMaterials() { return materials; }
	public void setMaterials(List<String> materials) { this.materials = materials; }

	public List<String> getSteps() { return steps; }
	public void setSteps(List<String> steps) { this.steps = steps; }

	public String getSafetyNotes() { return safetyNotes; }
	public void setSafetyNotes(String safetyNotes) { this.safetyNotes = safetyNotes; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
