
package com.smartpos.backend.controller;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.smartpos.backend.service.FirebaseSeedService;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@Profile("local")
@RequestMapping("/api/v1/dev")
public class FirebaseTestController {

    private final Firestore firestore;
    private final FirebaseSeedService seedService;

    public FirebaseTestController(
            Firestore firestore,
            FirebaseSeedService seedService) {

        this.firestore = firestore;
        this.seedService = seedService;
    }

    @GetMapping("/firebase-status")
    public Map<String, String> firebaseStatus()
            throws InterruptedException, ExecutionException {

        firestore.collection("products")
                .limit(1)
                .get()
                .get();

        return Map.of(
            "status", "CONNECTED",
            "database", "Cloud Firestore Emulator",
            "message", "Firebase connection successful"
        );
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seed()
            throws InterruptedException, ExecutionException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(seedService.seedDemoData());
    }

    @GetMapping("/products")
    public List<Map<String, Object>> demoProducts()
            throws InterruptedException, ExecutionException {

        List<QueryDocumentSnapshot> documents =
                firestore.collection("products")
                        .limit(20)
                        .get()
                        .get()
                        .getDocuments();

        List<Map<String, Object>> products =
                new ArrayList<>();

        for (DocumentSnapshot document : documents) {
            Map<String, Object> product =
                    new java.util.HashMap<>(document.getData());

            product.put("id", document.getId());
            products.add(product);
        }

        return products;
    }
}