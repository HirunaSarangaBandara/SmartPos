package com.smartpos.backend.product;

public record ProductResponse(
        String id, String name, String sku, String categoryId,
        long priceMinor, long stockQuantity, long reorderLevel, boolean active
) {}