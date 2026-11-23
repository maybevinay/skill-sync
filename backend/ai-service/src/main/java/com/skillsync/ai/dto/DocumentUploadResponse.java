package com.skillsync.ai.dto;

public record DocumentUploadResponse(
        Long documentId,
        String filename,
        int chunks,
        int embeddings,
        String status
) {}
