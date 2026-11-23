package com.skillsync.ai.security;

public record AuthPrincipal(Long userId, String email, String role, String name) {}
