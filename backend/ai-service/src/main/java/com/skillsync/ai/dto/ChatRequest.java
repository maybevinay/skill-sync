package com.skillsync.ai.dto;

import jakarta.validation.constraints.Size;

public record ChatRequest(Long sessionId, @Size(max = 8000) String message, boolean regenerate) {}