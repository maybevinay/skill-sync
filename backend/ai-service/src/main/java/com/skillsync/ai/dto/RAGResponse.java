package com.skillsync.ai.dto;

import com.skillsync.ai.rag.GroundedPromptBuilder.Source;

import java.util.List;

public record RAGResponse(
        Long sessionId,
        String content,
        String role,
        boolean grounded,
        int retrievedCount,
        List<Source> sources,
        String retrievalReason
) {}
