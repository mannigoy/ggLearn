package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore badges/{id}. */
public class Badge {

	@DocumentId
	private String id;
	private String courseId;
	private String userUid;
	private String userName;
	private String title;
	private Timestamp dateEarned;
	private String awardedBy;

	public Badge() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getCourseId() { return courseId; }
	public void setCourseId(String courseId) { this.courseId = courseId; }

	public String getUserUid() { return userUid; }
	public void setUserUid(String userUid) { this.userUid = userUid; }

	public String getUserName() { return userName; }
	public void setUserName(String userName) { this.userName = userName; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public Timestamp getDateEarned() { return dateEarned; }
	public void setDateEarned(Timestamp dateEarned) { this.dateEarned = dateEarned; }

	public String getAwardedBy() { return awardedBy; }
	public void setAwardedBy(String awardedBy) { this.awardedBy = awardedBy; }
}
