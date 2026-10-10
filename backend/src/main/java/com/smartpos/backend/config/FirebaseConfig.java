
package com.smartpos.backend.config;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Date;

@Configuration
@Profile("local")
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp(
            @Value("${firebase.project-id}") String projectId) {

        String firestoreHost =
            System.getenv("FIRESTORE_EMULATOR_HOST");

        String authHost =
            System.getenv("FIREBASE_AUTH_EMULATOR_HOST");

        if (projectId == null || projectId.isBlank()
                || firestoreHost == null || firestoreHost.isBlank()
                || authHost == null || authHost.isBlank()) {

            throw new IllegalStateException(
                "Local Firebase project ID and emulator " +
                "environment variables must be configured."
            );
        }

        if (!"127.0.0.1:8085".equals(firestoreHost)
                || !"127.0.0.1:9099".equals(authHost)) {

            throw new IllegalStateException(
                "Unexpected Firebase emulator addresses."
            );
        }

        GoogleCredentials emulatorCredentials =
            GoogleCredentials.create(
                new AccessToken(
                    "firebase-emulator-only",
                    new Date(
                        System.currentTimeMillis() + 3600000
                    )
                )
            );

        FirebaseOptions options =
            FirebaseOptions.builder()
                .setCredentials(emulatorCredentials)
                .setProjectId(projectId)
                .build();

        return FirebaseApp.initializeApp(options);
    }

    @Bean
    public Firestore firestore(FirebaseApp firebaseApp) {
        return FirestoreClient.getFirestore(firebaseApp);
    }
}