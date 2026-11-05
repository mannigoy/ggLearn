package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore lessons/{id}. */
public class Lesson {

	@DocumentId
	private String id;
	private String courseId;
	private String title;
	private String topic;
	private String content;
	private Long order;
	private Timestamp createdAt;
	private Timestamp updatedAt;

	public Lesson() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getCourseId() { return courseId; }
	public void setCourseId(String courseId) { this.courseId = courseId; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }

	public Long getOrder() { return order; }
	public void setOrder(Long order) { this.order = order; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
}
