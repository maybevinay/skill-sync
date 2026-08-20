package com.skillsync.matching.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "mentor_profiles")
public class MentorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(optional = false)
    @JoinColumn(name = "profile_id")
    private Profile profile;
    @Column(nullable = false)
    private String headline;
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;
    @Column(nullable = false)
    private int reviewCount;
    @Column(nullable = false)
    private boolean accepting = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public boolean isAccepting() { return accepting; }
    public void setAccepting(boolean accepting) { this.accepting = accepting; }
}
