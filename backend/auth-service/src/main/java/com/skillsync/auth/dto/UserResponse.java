package com.skillsync.auth.dto;

import com.skillsync.auth.domain.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean enabled,
        boolean emailVerified,
        Instant createdAt
) {}
