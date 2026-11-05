package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.firestore.annotation.Exclude;

/** Firestore users/{uid}. The document id is the Firebase Auth uid. */
public class User {

	@DocumentId
	private String uid;
	private String name;
	private String email;
	private String role;
	private Timestamp createdAt;
	private Timestamp roleUpdatedAt;
	private String roleUpdatedBy;
	private Boolean disabled;
	private String gradeLevel;
	private String section;
	private String subject;

	public User() {
		// Firestore needs a no-arg constructor.
	}

	public boolean hasRole(Role... roles) {
		for (Role candidate : roles) {
			if (candidate.value().equals(role)) return true;
		}
		return false;
	}

	/** Missing means not disabled. Excluded because the mapper allows one getter per property. */
	@Exclude
	public boolean isDisabled() {
		return Boolean.TRUE.equals(disabled);
	}

	public String getUid() { return uid; }
	public void setUid(String uid) { this.uid = uid; }

	public String getName() { return name; }
	public void setName(String name) { this.name = name; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }

	public Timestamp getCreatedAt() { return createdAt; }
	public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

	public Timestamp getRoleUpdatedAt() { return roleUpdatedAt; }
	public void setRoleUpdatedAt(Timestamp roleUpdatedAt) { this.roleUpdatedAt = roleUpdatedAt; }

	public String getRoleUpdatedBy() { return roleUpdatedBy; }
	public void setRoleUpdatedBy(String roleUpdatedBy) { this.roleUpdatedBy = roleUpdatedBy; }

	public Boolean getDisabled() { return disabled; }
	public void setDisabled(Boolean disabled) { this.disabled = disabled; }

	public String getGradeLevel() { return gradeLevel; }
	public void setGradeLevel(String gradeLevel) { this.gradeLevel = gradeLevel; }

	public String getSection() { return section; }
	public void setSection(String section) { this.section = section; }

	public String getSubject() { return subject; }
	public void setSubject(String subject) { this.subject = subject; }
}
