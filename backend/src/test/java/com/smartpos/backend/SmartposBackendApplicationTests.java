package com.smartpos.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = SmartposBackendApplication.class)
@ActiveProfiles("test")
class SmartposBackendApplicationTests {
    @Test
    void contextLoads() {}
}