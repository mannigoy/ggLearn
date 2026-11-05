package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore courses/{id}. */
public class Course {

	@DocumentId
	private String id;
	private String title;
	private String gradeLevel;
	private String topic;
	private String teacherUid;
	private String teacherName;
	private Timestamp createdAt;
	private Timestamp updatedAt;

	public Course() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getGradeLevel() { return gradeLevel; }
	public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getTeacherUid() { return teacherUid; }
	public void setTeacherUid(String teacherUid) { this.teacherUid = teacherUid; }

	public String getTeacherName() { return teacherName; }
	public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
