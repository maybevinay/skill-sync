package com.skillsync.ai.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "rag_chunks")
public class RagChunk {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private RagDocument document;
    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String embedding;

    public Long getId() { return id; }
    public RagDocument getDocument() { return document; }
    public void setDocument(RagDocument document) { this.document = document; }
    public int getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(int chunkIndex) { this.chunkIndex = chunkIndex; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }
}
