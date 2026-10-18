package com.smartpos.backend.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Use these beans only if your Day-3 FirebaseConfig does NOT already declare them.
 * If FirebaseConfig already declares a Firestore bean, delete the firestore() method here.
 * If it already declares a FirebaseAuth bean, delete firebaseAuth() here.
 * Day-3 FirebaseConfig must already supply a FirebaseApp bean.
 */
@Configuration
@Profile("!test")
public class Day4FirebaseBeans {
    @Bean
    FirebaseAuth firebaseAuth(FirebaseApp app) {
        return FirebaseAuth.getInstance(app);
    }

    // Do not add this duplicate if your Day-3 FirebaseConfig already declares Firestore.
    // @Bean
    // Firestore firestore(FirebaseApp app) { return FirestoreClient.getFirestore(app); }
}