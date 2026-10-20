package com.smartpos.backend.config;

import com.smartpos.backend.security.FirebaseAuthenticationFilter;

import jakarta.servlet.DispatcherType;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            Environment environment,
            ObjectProvider<FirebaseAuthenticationFilter> filters
    ) throws Exception {

        http
            // Enable CORS for React frontend
            .cors(cors -> {})

            // Stateless Bearer-token REST API
            .csrf(csrf -> csrf.disable())

            // Do not create server-side sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // Disable default Spring Security login
            .httpBasic(basic -> basic.disable())
            .formLogin(login -> login.disable())

            // Return HTTP 401 for unauthenticated requests
            .exceptionHandling(errors ->
                errors.authenticationEntryPoint(
                    (request, response, exception) ->
                        response.sendError(
                            401,
                            "Authentication required"
                        )
                )
            )

            // Configure endpoint permissions
            .authorizeHttpRequests(auth -> {

                // -------------------------------------
                // 1. Allow internal error dispatches
                // -------------------------------------
                // This prevents an original controller
                // error from being hidden by HTTP 401.
                auth.dispatcherTypeMatchers(
                    DispatcherType.ERROR,
                    DispatcherType.FORWARD
                ).permitAll();

                // -------------------------------------
                // 2. Public health endpoint
                // -------------------------------------
                auth.requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/health"
                ).permitAll();

                // -------------------------------------
                // 3. Local development endpoints
                // -------------------------------------
                if (environment.matchesProfiles("local")) {
                    auth.requestMatchers(
                        "/api/v1/dev/**"
                    ).permitAll();
                }

                // -------------------------------------
                // 4. Admin-only API endpoints
                // -------------------------------------
                auth.requestMatchers(
                    "/api/v1/admin/**"
                ).hasRole("ADMIN");

                // -------------------------------------
                // 5. Cashier API endpoints
                // -------------------------------------
                auth.requestMatchers(
                    "/api/v1/cashier/**"
                ).hasAnyRole(
                    "ADMIN",
                    "CASHIER"
                );

                // -------------------------------------
                // 6. Product viewing
                // -------------------------------------
                // GET requests allowed for Admin/Cashier.
                auth.requestMatchers(
                    HttpMethod.GET,
                    "/api/v1/products",
                    "/api/v1/products/**"
                ).hasAnyRole(
                    "ADMIN",
                    "CASHIER"
                );

                // -------------------------------------
                // 7. Product modifications
                // -------------------------------------
                // POST, PUT, PATCH, DELETE:
                // Admin only.
                auth.requestMatchers(
                    "/api/v1/products",
                    "/api/v1/products/**"
                ).hasRole("ADMIN");

                // -------------------------------------
                // 8. Other endpoints
                // -------------------------------------
                // Always keep this rule LAST.
                auth.anyRequest().authenticated();
            });

        // -----------------------------------------
        // Firebase Authentication Filter
        // -----------------------------------------
        FirebaseAuthenticationFilter filter =
                filters.getIfAvailable();

        if (filter != null) {
            http.addFilterBefore(
                filter,
                UsernamePasswordAuthenticationFilter.class
            );
        }

        return http.build();
    }

    // -----------------------------------------
    // Prevent duplicate Firebase filter registration
    // -----------------------------------------
    @Bean
    public FilterRegistrationBean<FirebaseAuthenticationFilter>
            disableContainerRegistration(
                ObjectProvider<FirebaseAuthenticationFilter> filters
            ) {

        FilterRegistrationBean<FirebaseAuthenticationFilter>
                registration =
                    new FilterRegistrationBean<>();

        FirebaseAuthenticationFilter filter =
                filters.getIfAvailable();

        if (filter != null) {
            registration.setFilter(filter);
        }

        registration.setEnabled(false);

        return registration;
    }

    // -----------------------------------------
    // CORS Configuration
    // -----------------------------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();

        // React development addresses
        config.setAllowedOrigins(
            List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            )
        );

        // Allowed HTTP methods
        config.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        // Allowed request headers
        config.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Idempotency-Key"
            )
        );

        // Register CORS for backend API routes
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/api/**",
            config
        );

        return source;
    }
}