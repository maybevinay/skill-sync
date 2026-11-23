package com.skillsync.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record RAGRequest(Long sessionId, @NotBlank String question) {}
