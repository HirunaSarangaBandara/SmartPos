package com.smartpos.backend.product;

import jakarta.validation.constraints.*;

public record ProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 40) String sku,
        @NotBlank @Size(max = 60) String categoryId,
        @NotNull @PositiveOrZero Long priceMinor,
        @NotNull @PositiveOrZero Long reorderLevel,
        @NotNull Boolean active
) {}