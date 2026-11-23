package com.skillsync.matching.domain;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profiles")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;
    private String bio;
    private String learningGoals;
    @Column(name = "experience_years", nullable = false)
    private int experienceYears;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Availability availability = Availability.WEEKNIGHTS;
    private String country;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileSkill> skills = new ArrayList<>();

    @OneToOne(mappedBy = "profile", cascade = CascadeType.ALL)
    private MentorProfile mentorProfile;

    @PrePersist
    void create() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate
    void update() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLearningGoals() { return learningGoals; }
    public void setLearningGoals(String learningGoals) { this.learningGoals = learningGoals; }
    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }
    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public List<ProfileSkill> getSkills() { return skills; }
    public MentorProfile getMentorProfile() { return mentorProfile; }
    public void setMentorProfile(MentorProfile mentorProfile) { this.mentorProfile = mentorProfile; }
}
