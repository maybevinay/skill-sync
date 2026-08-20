package com.skillsync.ai.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_usage")
public class AiUsage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false)
    private String kind;
    @Column(nullable = false)
    private int tokens;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public void setUserId(Long userId) { this.userId = userId; }
    public void setKind(String kind) { this.kind = kind; }
    public void setTokens(int tokens) { this.tokens = tokens; }
}
