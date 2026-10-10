package com.smartpos.backend.service;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FieldValue;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
@Profile("local")
public class FirebaseSeedService {

    private final Firestore firestore;

    public FirebaseSeedService(Firestore firestore) {
        this.firestore = firestore;
    }

    public Map<String, String> seedDemoData()
            throws InterruptedException, ExecutionException {

        // Demo category
        Map<String, Object> category = new HashMap<>();
        category.put("name", "Stationery");
        category.put("description", "School and office stationery");
        category.put("active", true);

        firestore.collection("categories")
                .document("stationery")
                .set(category)
                .get();

        // Demo product
        Map<String, Object> product = new HashMap<>();
        product.put("name", "Notebook A5");
        product.put("sku", "NB-A5-001");
        product.put("categoryId", "stationery");
        product.put("priceMinor", 45000L);
        product.put("stockQuantity", 100L);
        product.put("reorderLevel", 10L);
        product.put("active", true);
        product.put("createdAt", FieldValue.serverTimestamp());
        product.put("updatedAt", FieldValue.serverTimestamp());

        firestore.collection("products")
                .document("product-001")
                .set(product)
                .get();

        // Business settings
        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("businessName", "SmartPOS Demo Store");
        settings.put("currency", "LKR");
        settings.put("address", "Demo Store Address");
        settings.put("receiptFooter", "Thank you for shopping!");

        firestore.collection("settings")
                .document("business")
                .set(settings)
                .get();

        return Map.of(
            "status", "SUCCESS",
            "message", "Local demo data created",
            "productId", "product-001",
            "categoryId", "stationery"
        );
    }
}