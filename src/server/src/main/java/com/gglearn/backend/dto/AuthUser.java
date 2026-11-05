package com.gglearn.backend.dto;

/** Who sent the request, taken from their verified Firebase ID token. */
public record AuthUser(String uid, String email) {
}
