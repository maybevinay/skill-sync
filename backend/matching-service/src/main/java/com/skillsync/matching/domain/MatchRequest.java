package com.skillsync.matching.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "match_requests")
public class MatchRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false)
    @JoinColumn(name = "learner_id")
    private Profile learner;
    @ManyToOne(optional = false)
    @JoinColumn(name = "mentor_id")
    private MentorProfile mentor;
    @Column(nullable = false, length = 600)
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public Profile getLearner() { return learner; }
    public void setLearner(Profile learner) { this.learner = learner; }
    public MentorProfile getMentor() { return mentor; }
    public void setMentor(MentorProfile mentor) { this.mentor = mentor; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
