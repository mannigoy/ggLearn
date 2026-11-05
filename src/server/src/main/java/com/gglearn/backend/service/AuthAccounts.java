package com.gglearn.backend.service;

import com.gglearn.backend.exception.ApiException;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Firebase Auth accounts. Every failure leaves here as an ApiException. */
@Component
public class AuthAccounts {

	private final FirebaseAuth auth;

	public AuthAccounts(FirebaseAuth auth) {
		this.auth = auth;
	}

	/** Returns the new account's uid. */
	public String createAccount(String email, String password, String name) {
		try {
			return auth.createUser(new UserRecord.CreateRequest()
					.setEmail(email)
					.setPassword(password)
					.setDisplayName(name)).getUid();
		} catch (FirebaseAuthException e) {
			if (e.getAuthErrorCode() == AuthErrorCode.EMAIL_ALREADY_EXISTS) {
				throw ApiException.conflict("That email already has an account.");
			}
			throw unreachable();
		}
	}

	public void setDisabled(String uid, boolean disabled) {
		try {
			auth.updateUser(new UserRecord.UpdateRequest(uid).setDisabled(disabled));
		} catch (FirebaseAuthException e) {
			throw unreachable();
		}
	}

	/** An account that is already gone counts as deleted. */
	public void deleteAccount(String uid) {
		try {
			auth.deleteUser(uid);
		} catch (FirebaseAuthException e) {
			if (e.getAuthErrorCode() == AuthErrorCode.USER_NOT_FOUND) return;
			throw unreachable();
		}
	}

	private static ApiException unreachable() {
		return new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Can’t reach the sign-in service. Try again in a moment.");
	}
}
