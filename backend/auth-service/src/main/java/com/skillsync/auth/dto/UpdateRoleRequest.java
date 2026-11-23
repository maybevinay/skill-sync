package com.skillsync.auth.dto;

import com.skillsync.auth.domain.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(@NotNull Role role) {}
