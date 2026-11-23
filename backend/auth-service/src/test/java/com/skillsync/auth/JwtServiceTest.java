package com.skillsync.auth;

import com.skillsync.auth.config.JwtProperties;
import com.skillsync.auth.domain.Role;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties();
        props.setSecret("change-me-to-a-256-bit-secret-key-for-hs256-skillsync");
        props.setIssuer("skillsync");
        props.setAccessExpirationMs(900_000);
        props.setRefreshExpirationMs(604_800_000);
        jwtService = new JwtService(props);
    }

    @Test
    void generatesParsableAccessToken() {
        User user = new User();
        user.setId(42L);
        user.setEmail("user@skillsync.dev");
        user.setFullName("Uma User");
        user.setRole(Role.USER);
        String token = jwtService.generateAccessToken(user);
        assertTrue(token.split("\\.").length == 3);
        assertEquals(42L, jwtService.extractUserId(token));
        assertEquals(Role.USER, jwtService.extractRole(token));
    }
}
