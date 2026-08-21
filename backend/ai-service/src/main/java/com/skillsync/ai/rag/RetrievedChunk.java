package com.skillsync.ai.rag;

public record RetrievedChunk(
        Long chunkId,
        Long documentId,
        String filename,
        int chunkIndex,
        String content,
        double score
) {}
