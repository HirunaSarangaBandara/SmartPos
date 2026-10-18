package com.smartpos.backend.controller;

import com.smartpos.backend.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserController {
    @GetMapping("/users/me")
    public ResponseEntity<UserPrincipal> me(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(user);
    }

    @GetMapping("/admin/overview")
    public ResponseEntity<?> adminOverview() {
        return ResponseEntity.ok(java.util.Map.of("message", "Admin access granted"));
    }

    @GetMapping("/cashier/overview")
    public ResponseEntity<?> cashierOverview() {
        return ResponseEntity.ok(java.util.Map.of("message", "Cashier access granted"));
    }
}