package com.smartpos.backend.security;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;

@Component
@Profile("!test")
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "CASHIER");
    private final FirebaseAuth auth;
    private final Firestore firestore;

    public FirebaseAuthenticationFilter(FirebaseAuth auth, Firestore firestore) {
        this.auth = auth;
        this.firestore = firestore;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        try {
            String idToken = header.substring(7).trim();
            if (idToken.isEmpty()) {
                response.sendError(401, "Missing ID token");
                return;
            }
            FirebaseToken verified = auth.verifyIdToken(idToken);
            DocumentSnapshot user = firestore.collection("users")
                    .document(verified.getUid()).get().get();
            if (!user.exists() || !Boolean.TRUE.equals(user.getBoolean("active"))) {
                response.sendError(403, "Employee profile missing or disabled");
                return;
            }
            String role = user.getString("role");
            if (role == null || !ALLOWED_ROLES.contains(role)) {
                response.sendError(403, "Invalid employee role");
                return;
            }
            UserPrincipal principal = new UserPrincipal(verified.getUid(), verified.getEmail(),
                    user.getString("name"), role);
            var authentication = new UsernamePasswordAuthenticationToken(principal, null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            chain.doFilter(request, response);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            response.sendError(503, "Employee lookup interrupted");
        } catch (ExecutionException e) {
            response.sendError(503, "Employee profile database unavailable");
        } catch (com.google.firebase.auth.FirebaseAuthException | IllegalArgumentException e) {
            response.sendError(401, "Invalid or expired Firebase ID token");
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}