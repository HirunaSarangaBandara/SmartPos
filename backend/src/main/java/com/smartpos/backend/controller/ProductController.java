package com.smartpos.backend.controller;

import com.smartpos.backend.product.ProductRequest;
import com.smartpos.backend.product.ProductResponse;
import com.smartpos.backend.product.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService products;

    public ProductController(ProductService products) {
        this.products = products;
    }

    // GET /api/v1/products
    // Admin and Cashier can view products
    @GetMapping
    public List<ProductResponse> list() {
        return products.list();
    }

    // GET /api/v1/products/{id}
    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable String id) {
        return products.get(id);
    }

    // POST /api/v1/products
    // Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody ProductRequest body) {

        ProductResponse created = products.create(body);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    // PUT /api/v1/products/{id}
    // Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(
            @PathVariable String id,
            @Valid @RequestBody ProductRequest body) {

        return products.update(id, body);
    }

    // PATCH /api/v1/products/{id}/status
    // Admin only
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> changeStatus(
            @PathVariable String id,
            @RequestBody StatusRequest body) {

        products.setActive(id, body.active());

        return ResponseEntity.noContent().build();
    }

    public record StatusRequest(boolean active) {
    }
}