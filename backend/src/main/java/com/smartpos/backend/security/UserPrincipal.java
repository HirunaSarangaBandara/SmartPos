package com.smartpos.backend.security;

public record UserPrincipal(String uid, String email, String name, String role) {
    
}