package com.skillsync.matching.domain;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false)
    @JoinColumn(name = "request_id")
    private MatchRequest request;
    @ManyToOne(optional = false)
    @JoinColumn(name = "reviewer_id")
    private Profile reviewer;
    @ManyToOne(optional = false)
    @JoinColumn(name = "mentor_id")
    private MentorProfile mentor;
    @Column(nullable = false)
    private int rating;
    @Column(nullable = false, length = 600)
    private String comment;
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public MatchRequest getRequest() { return request; }
    public void setRequest(MatchRequest request) { this.request = request; }
    public Profile getReviewer() { return reviewer; }
    public void setReviewer(Profile reviewer) { this.reviewer = reviewer; }
    public MentorProfile getMentor() { return mentor; }
    public void setMentor(MentorProfile mentor) { this.mentor = mentor; }
    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Instant getCreatedAt() { return createdAt; }
}
