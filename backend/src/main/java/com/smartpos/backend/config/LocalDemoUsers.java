package com.smartpos.backend.config;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FieldValue;
import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Profile("local")
public class LocalDemoUsers {
    @Bean
    CommandLineRunner seedLocalEmployees(FirebaseAuth firebaseAuth, Firestore firestore,
            @Value("${smartpos.demo.admin-email:}") String adminEmail,
            @Value("${smartpos.demo.admin-password:}") String adminPassword,
            @Value("${smartpos.demo.cashier-email:}") String cashierEmail,
            @Value("${smartpos.demo.cashier-password:}") String cashierPassword) {
        return args -> {
            if (!"127.0.0.1:9099".equals(System.getenv("FIREBASE_AUTH_EMULATOR_HOST"))
                    || !"127.0.0.1:8085".equals(System.getenv("FIRESTORE_EMULATOR_HOST"))) {
                throw new IllegalStateException("Local demo users require local Auth and Firestore emulators");
            }
            upsert(firebaseAuth, firestore, adminEmail, adminPassword, "Demo Admin", "ADMIN");
            upsert(firebaseAuth, firestore, cashierEmail, cashierPassword, "Demo Cashier", "CASHIER");
        };
    }

    private void upsert(FirebaseAuth auth, Firestore firestore, String email,
            String password, String name, String role) throws Exception {
        if (email.isBlank() || password.isBlank()) {
            System.out.println("Skipping " + role + " demo account: email/password not provided");
            return;
        }
        UserRecord user;
        try {
            user = auth.getUserByEmail(email);
        } catch (FirebaseAuthException e) {
            if (e.getAuthErrorCode() != AuthErrorCode.USER_NOT_FOUND) throw e;
            user = auth.createUser(new UserRecord.CreateRequest()
                    .setEmail(email).setPassword(password).setDisplayName(name));
        }
        Map<String, Object> profile = new HashMap<>();
        profile.put("name", name);
        profile.put("email", email);
        profile.put("role", role);
        profile.put("active", true);
        profile.put("createdAt", FieldValue.serverTimestamp());
        firestore.collection("users").document(user.getUid()).set(profile).get();
        System.out.println("Local demo " + role + " ready: " + email);
    }
}