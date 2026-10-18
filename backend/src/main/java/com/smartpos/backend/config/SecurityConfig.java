package com.smartpos.backend.config;

import com.smartpos.backend.security.FirebaseAuthenticationFilter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, Environment environment,
            ObjectProvider<FirebaseAuthenticationFilter> filters) throws Exception {
        http.cors(cors -> {})
            .csrf(csrf -> csrf.disable()) // Stateless Authorization: Bearer tokens, not cookies
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(basic -> basic.disable())
            .formLogin(login -> login.disable())
            .exceptionHandling(errors -> errors.authenticationEntryPoint(
                    (request, response, exception) -> response.sendError(401, "Authentication required")))
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers(HttpMethod.GET, "/api/v1/health").permitAll();
                if (environment.matchesProfiles("local")) {
                    // Day-3 diagnostic endpoints; use ONLY on a loopback-bound local server.
                    auth.requestMatchers("/api/v1/dev/**").permitAll();
                }
                auth.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
                auth.requestMatchers("/api/v1/cashier/**").hasAnyRole("ADMIN", "CASHIER");
                auth.anyRequest().authenticated();
            });
        FirebaseAuthenticationFilter filter = filters.getIfAvailable();
        if (filter != null) {
            http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);
        }
        return http.build();
    }

    // Only Spring Security should invoke this filter (not the servlet container twice).
    @Bean
    FilterRegistrationBean<FirebaseAuthenticationFilter> disableContainerRegistration(
            ObjectProvider<FirebaseAuthenticationFilter> filters) {
        FilterRegistrationBean<FirebaseAuthenticationFilter> registration = new FilterRegistrationBean<>();
        FirebaseAuthenticationFilter filter = filters.getIfAvailable();
        if (filter != null) registration.setFilter(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Idempotency-Key"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}