package com.skillsync.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "skillsync.rag")
public class RagProperties {
    /**
     * amazon.titan-embed-text-v1 and OpenAI text-embedding-3-small are 1536-d.
     * Fallback hashing uses the same size so ingest and query stay comparable.
     */
    private int embeddingDimensions = 1536;
    /** ~200 tokens of notes; 5 chunks stay well inside a small context window. */
    private int chunkSize = 800;
    /** ~30 tokens of continuity across windows without duplicating whole paragraphs. */
    private int chunkOverlap = 120;
    private int topK = 5;
    /** Cosine floor; hashed fallback vectors still cluster related phrases above this. */
    private double minSimilarity = 0.28;
    private int maxChunksPerDocument = 200;
    private int maxQueryChars = 4000;
    private int maxHistoryMessages = 12;

    public int getEmbeddingDimensions() { return embeddingDimensions; }
    public void setEmbeddingDimensions(int embeddingDimensions) { this.embeddingDimensions = embeddingDimensions; }
    public int getChunkSize() { return chunkSize; }
    public void setChunkSize(int chunkSize) { this.chunkSize = chunkSize; }
    public int getChunkOverlap() { return chunkOverlap; }
    public void setChunkOverlap(int chunkOverlap) { this.chunkOverlap = chunkOverlap; }
    public int getTopK() { return topK; }
    public void setTopK(int topK) { this.topK = topK; }
    public double getMinSimilarity() { return minSimilarity; }
    public void setMinSimilarity(double minSimilarity) { this.minSimilarity = minSimilarity; }
    public int getMaxChunksPerDocument() { return maxChunksPerDocument; }
    public void setMaxChunksPerDocument(int maxChunksPerDocument) { this.maxChunksPerDocument = maxChunksPerDocument; }
    public int getMaxQueryChars() { return maxQueryChars; }
    public void setMaxQueryChars(int maxQueryChars) { this.maxQueryChars = maxQueryChars; }
    public int getMaxHistoryMessages() { return maxHistoryMessages; }
    public void setMaxHistoryMessages(int maxHistoryMessages) { this.maxHistoryMessages = maxHistoryMessages; }
}
