package com.skillsync.matching.security;

public record AuthPrincipal(Long userId, String email, String role, String name) {
    public boolean isAdmin() { return "ADMIN".equals(role); }
    public boolean isMentor() { return "MENTOR".equals(role) || isAdmin(); }
}
