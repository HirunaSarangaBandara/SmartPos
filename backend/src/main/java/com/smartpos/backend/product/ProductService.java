package com.smartpos.backend.product;

import com.google.cloud.firestore.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.regex.Pattern;

@Service
public class ProductService {
    private static final Pattern SKU = Pattern.compile("[A-Z0-9][A-Z0-9_-]{1,39}");
    private final Firestore db;

    public ProductService(Firestore db) { this.db = db; }

    private String normalizeSku(String input) {
        String sku = input.trim().toUpperCase(Locale.ROOT);
        if (!SKU.matcher(sku).matches())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "SKU must be 2-40 characters: letters, digits, _ or -");
        return sku;
    }

    private ProductResponse map(DocumentSnapshot doc) {
        return new ProductResponse(doc.getId(), doc.getString("name"), doc.getString("sku"),
                doc.getString("categoryId"), doc.getLong("priceMinor"),
                doc.getLong("stockQuantity"), doc.getLong("reorderLevel"),
                Boolean.TRUE.equals(doc.getBoolean("active")));
    }

    private Map<String, Object> fields(ProductRequest request, String normalizedSku) {
        Map<String, Object> fields = new HashMap<>();
        fields.put("name", request.name().trim());
        fields.put("sku", normalizedSku);
        fields.put("categoryId", request.categoryId().trim());
        fields.put("priceMinor", request.priceMinor());
        fields.put("reorderLevel", request.reorderLevel());
        fields.put("active", request.active());
        fields.put("updatedAt", FieldValue.serverTimestamp());
        return fields;
    }

    private static <T> T await(java.util.concurrent.Future<T> future) {
        try { return future.get(); }
        catch (InterruptedException e) { Thread.currentThread().interrupt(); throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firestore request interrupted", e); }
        catch (ExecutionException e) {
            Throwable cause = e.getCause();
            if (cause instanceof ResponseStatusException status) throw status;
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Firestore operation failed", cause);
        }
    }

    public ProductResponse create(ProductRequest input) {
        String sku = normalizeSku(input.sku());
        DocumentReference productRef = db.collection("products").document();
        DocumentReference skuRef = db.collection("skuReservations").document(sku);
        // Firestore transactions require reads before writes.
        return await(db.runTransaction(tx -> {
            if (tx.get(skuRef).get().exists())
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
            Map<String, Object> data = fields(input, sku);
            data.put("stockQuantity", 0L); // Day 7 inventory adjustment sets stock.
            data.put("createdAt", FieldValue.serverTimestamp());
            tx.create(productRef, data);
            tx.create(skuRef, Map.of("productId", productRef.getId()));
            return new ProductResponse(productRef.getId(), input.name().trim(), sku,
                    input.categoryId().trim(), input.priceMinor(), 0L,
                    input.reorderLevel(), input.active());
        }));
    }

    public ProductResponse update(String id, ProductRequest input) {
        String newSku = normalizeSku(input.sku());
        DocumentReference productRef = db.collection("products").document(id);
        DocumentReference newSkuRef = db.collection("skuReservations").document(newSku);
        return await(db.runTransaction(tx -> {
            DocumentSnapshot old = tx.get(productRef).get();
            if (!old.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
            String oldSku = old.getString("sku");
            // Always read reservation before any writes.
            DocumentSnapshot reservation = tx.get(newSkuRef).get();
            if (reservation.exists() && !id.equals(reservation.getString("productId")))
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
            tx.update(productRef, fields(input, newSku));
            if (!newSku.equals(oldSku)) {
                tx.create(newSkuRef, Map.of("productId", id));
                if (oldSku != null) tx.delete(db.collection("skuReservations").document(oldSku));
            }
            return new ProductResponse(id, input.name().trim(), newSku, input.categoryId().trim(),
                    input.priceMinor(), old.getLong("stockQuantity"), input.reorderLevel(), input.active());
        }));
    }

    public ProductResponse get(String id) {
        DocumentSnapshot doc = await(db.collection("products").document(id).get());
        if (!doc.exists()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        return map(doc);
    }

    // Day 5 MVP: first 100 documents; add cursor-based pagination in a later iteration.
    public List<ProductResponse> list() {
        QuerySnapshot snapshot = await(db.collection("products").orderBy("name").limit(100).get());
        return snapshot.getDocuments().stream().map(this::map).toList();
    }

    public void setActive(String id, boolean active) {
        DocumentReference ref = db.collection("products").document(id);
        await(db.runTransaction(tx -> {
            if (!tx.get(ref).get().exists())
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
            tx.update(ref, Map.of("active", active, "updatedAt", FieldValue.serverTimestamp()));
            return null;
        }));
    }
}