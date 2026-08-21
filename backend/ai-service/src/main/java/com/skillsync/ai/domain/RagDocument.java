package com.skillsync.ai.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rag_documents")
public class RagDocument {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String filename;
    @Column(name = "content_type", nullable = false)
    private String contentType;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RagDocumentStatus status = RagDocumentStatus.PROCESSING;
    @Column(name = "chunk_count", nullable = false)
    private int chunkCount;
    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();
    @Column(name = "processed_at")
    private Instant processedAt;
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RagChunk> chunks = new ArrayList<>();

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public RagDocumentStatus getStatus() { return status; }
    public void setStatus(RagDocumentStatus status) { this.status = status; }
    public int getChunkCount() { return chunkCount; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }
    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getProcessedAt() { return processedAt; }
    public void setProcessedAt(Instant processedAt) { this.processedAt = processedAt; }
    public List<RagChunk> getChunks() { return chunks; }
}
