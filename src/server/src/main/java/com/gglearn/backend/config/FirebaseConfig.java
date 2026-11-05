package com.gglearn.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Connects to Firebase with a service account. The Admin SDK skips Firestore security
 * rules, so every permission check has to happen in the services.
 */
@Configuration
public class FirebaseConfig {

	@Bean
	public FirebaseApp firebaseApp(@Value("${firebase.credentials-path:}") String credentialsPath) throws IOException {
		if (!FirebaseApp.getApps().isEmpty()) return FirebaseApp.getInstance();

		GoogleCredentials credentials;
		if (credentialsPath.isBlank()) {
			credentials = GoogleCredentials.getApplicationDefault();
		} else {
			try (InputStream key = new FileInputStream(credentialsPath)) {
				credentials = GoogleCredentials.fromStream(key);
			}
		}
		return FirebaseApp.initializeApp(FirebaseOptions.builder().setCredentials(credentials).build());
	}

	@Bean
	public FirebaseAuth firebaseAuth(FirebaseApp app) {
		return FirebaseAuth.getInstance(app);
	}

	@Bean
	public Firestore firestore(FirebaseApp app) {
		return FirestoreClient.getFirestore(app);
	}
}
