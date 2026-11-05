package com.gglearn.backend.entity;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.annotation.DocumentId;

/** Firestore enrollments/{courseId}_{studentUid}. */
public class Enrollment {

	@DocumentId
	private String id;
	private String courseId;
	private String studentUid;
	private String studentName;
	private Long progressPct;
	private Long points;
	private Timestamp enrolledAt;

	public Enrollment() {
		// Firestore needs a no-arg constructor.
	}

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getCourseId() { return courseId; }
	public void setCourseId(String courseId) { this.courseId = courseId; }

	public String getStudentUid() { return studentUid; }
	public void setStudentUid(String studentUid) { this.studentUid = studentUid; }

	public String getStudentName() { return studentName; }
	public void setStudentName(String studentName) { this.studentName = studentName; }

	public Long getProgressPct() { return progressPct; }
	public void setProgressPct(Long progressPct) { this.progressPct = progressPct; }

	public Long getPoints() { return points; }
	public void setPoints(Long points) { this.points = points; }

	public Timestamp getEnrolledAt() { return enrolledAt; }
	public void setEnrolledAt(Timestamp enrolledAt) { this.enrolledAt = enrolledAt; }
}
