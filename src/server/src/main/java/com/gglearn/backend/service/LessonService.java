package com.gglearn.backend.service;

import com.gglearn.backend.dto.AuthUser;
import com.gglearn.backend.entity.Lesson;
import com.gglearn.backend.entity.Role;
import com.gglearn.backend.entity.User;
import com.gglearn.backend.exception.ApiException;
import com.gglearn.backend.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Anyone with a profile can read lessons. Teachers and admins write; only the author or an admin deletes. */
@Service
public class LessonService {

	private final LessonRepository lessons;
	private final UserService userService;

	public LessonService(LessonRepository lessons, UserService userService) {
		this.lessons = lessons;
		this.userService = userService;
	}

	public List<Lesson> list(AuthUser me) {
		userService.getProfile(me);
		return lessons.findAllNewestFirst();
	}

	public Lesson create(AuthUser me, String title, String topic, String content) {
		User author = userService.requireRole(me, Role.TEACHER, Role.ADMIN);
		String id = lessons.create(title.trim(), topic, content.trim(), author.getName(), author.getUid());
		return lessons.findById(id).orElseThrow(() -> ApiException.notFound("That lesson doesn’t exist."));
	}

	public void delete(AuthUser me, String id) {
		User caller = userService.requireRole(me, Role.TEACHER, Role.ADMIN);
		Lesson lesson = lessons.findById(id).orElseThrow(() -> ApiException.notFound("That lesson doesn’t exist."));
		if (!caller.hasRole(Role.ADMIN) && !caller.getUid().equals(lesson.getByUid())) {
			throw ApiException.forbidden("You can only delete your own lessons.");
		}
		lessons.deleteById(id);
	}
}
