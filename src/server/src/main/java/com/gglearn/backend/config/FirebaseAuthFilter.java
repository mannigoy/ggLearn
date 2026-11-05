package com.gglearn.backend.config;

import com.gglearn.backend.dto.AuthUser;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Requires "Authorization: Bearer <Firebase ID token>" on /api requests and exposes the
 * caller as the {@link #ATTRIBUTE} request attribute. Registered in {@link WebConfig}.
 */
public class FirebaseAuthFilter extends OncePerRequestFilter {

	public static final String ATTRIBUTE = "authUser";
	private static final String PREFIX = "Bearer ";

	private final FirebaseAuth firebaseAuth;

	public FirebaseAuthFilter(FirebaseAuth firebaseAuth) {
		this.firebaseAuth = firebaseAuth;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		// CORS preflights carry no token.
		return HttpMethod.OPTIONS.matches(request.getMethod());
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header == null || !header.startsWith(PREFIX)) {
			reject(response, "Sign in first.");
			return;
		}

		FirebaseToken token;
		try {
			token = firebaseAuth.verifyIdToken(header.substring(PREFIX.length()));
		} catch (FirebaseAuthException | IllegalArgumentException error) {
			reject(response, "Your session has expired. Sign in again.");
			return;
		}

		request.setAttribute(ATTRIBUTE, new AuthUser(token.getUid(), token.getEmail()));
		chain.doFilter(request, response);
	}

	private static void reject(HttpServletResponse response, String detail) throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		response.getWriter().write("{\"status\":401,\"title\":\"Unauthorized\",\"detail\":\"" + detail + "\"}");
	}
}
