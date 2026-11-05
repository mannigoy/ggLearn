package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore lessons/{id}. `by` and `byUid` keep the author's name and uid, as the local store did. */
public class Lesson {

	@DocumentId
	private String id;
	private String title;
	private String topic;
	private String content;
	private String by;
	private String byUid;
	private Timestamp createdAt;

	public Lesson() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }

	public String getBy() { return by; }
	public void setBy(String by) { this.by = by; }

	public String getByUid() { return byUid; }
	public void setByUid(String byUid) { this.byUid = byUid; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
