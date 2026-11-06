package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.dto.BadgeRequest;
import com.gglearn.backend.dto.BadgeUpdateRequest;
import com.gglearn.backend.entity.Badge;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.BadgeRepository;
import com.gglearn.backend.repository.EnrollmentRepository;
import com.gglearn.backend.repository.UserRepository;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.FieldValue;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Badges: staff award, rename and revoke them; students see their own. */
@Service
public class BadgeService {

	private final BadgeRepository badges;
	private final EnrollmentRepository enrollments;
	private final UserRepository users;
	private final CourseAccess access;
	private final UserService userService;

	public BadgeService(BadgeRepository badges, EnrollmentRepository enrollments, UserRepository users,
			CourseAccess access, UserService userService) {
		this.badges = badges;
		this.enrollments = enrollments;
		this.users = users;
		this.access = access;
		this.userService = userService;
	}

	/** Newest first. Sorted here because ordering a filtered query needs a composite index. */
	public List<Badge> forCourse(AuthUser me, String courseId) {
		User caller = userService.getProfile(me);
		access.requireStaff(caller, courseId);
		return newestFirst(badges.findWhere("courseId", courseId));
	}

	/** The caller's own badges, for any profile. */
	public List<Badge> mine(AuthUser me) {
		User caller = userService.getProfile(me);
		return newestFirst(badges.findWhere("userUid", caller.getUid()));
	}

	public Badge award(AuthUser me, BadgeRequest body) {
		User caller = userService.getProfile(me);
		access.requireStaff(caller, body.courseId());
		String message = "Award badges only to students in this course.";
		if (!enrollments.exists(body.courseId(), body.userUid())) throw ApiException.badRequest(message);
		User student = users.findById(body.userUid()).orElseThrow(() -> ApiException.badRequest(message));

		Map<String, Object> fields = new HashMap<>();
		fields.put("courseId", body.courseId());
		fields.put("userUid", student.getUid());
		fields.put("userName", student.getName());
		fields.put("title", Validation.title(body.title()));
		fields.put("dateEarned", FieldValue.serverTimestamp());
		fields.put("awardedBy", caller.getUid());
		return requireBadge(badges.create(fields));
	}

	public Badge rename(AuthUser me, String id, BadgeUpdateRequest body) {
		User caller = userService.getProfile(me);
		Badge badge = requireBadge(id);
		access.requireStaff(caller, badge.getCourseId());

		badges.update(id, Map.of("title", Validation.title(body.title())));
		return requireBadge(id);
	}

	public void revoke(AuthUser me, String id) {
		User caller = userService.getProfile(me);
		Badge badge = requireBadge(id);
		access.requireStaff(caller, badge.getCourseId());

		badges.deleteById(id);
	}

	private static List<Badge> newestFirst(List<Badge> found) {
		return found.stream()
				.sorted(Comparator.comparing(Badge::getDateEarned, Comparator.nullsLast(Comparator.<Timestamp>reverseOrder())))
				.toList();
	}

	private Badge requireBadge(String id) {
		return badges.findById(id).orElseThrow(() -> ApiException.notFound("That badge doesn’t exist."));
	}
}
