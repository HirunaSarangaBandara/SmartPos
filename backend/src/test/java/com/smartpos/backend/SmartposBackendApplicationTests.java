package com.smartpos.backend;

import com.google.cloud.firestore.Firestore;

import org.junit.jupiter.api.Test;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class SmartposBackendApplicationTests {

    // Provide a mock Firestore bean for testing.
    // No Firebase emulator connection is required.
    @MockitoBean
    private Firestore firestore;

    @Test
    void contextLoads() {
        // Verify that the Spring Boot application
        // context starts successfully.
    }
}