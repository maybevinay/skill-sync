package com.skillsync.matching.dto;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.SkillLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class MatchingDtos {
    public record SkillRequest(@NotBlank String name, @NotBlank String category, @NotBlank String description) {}
    public record SkillResponse(Long id, String name, String category, String description) {}
    public record ProfileSkillRequest(Long skillId, SkillLevel level, int progress) {}
    public record ProfileSkillView(Long skillId, String name, String category, SkillLevel level, int progress) {}
    public record ProfileRequest(
            @NotBlank @Size(max = 120) String fullName,
            String photoUrl,
            String bio,
            String learningGoals,
            int experienceYears,
            Availability availability,
            String country,
            String linkedinUrl,
            String githubUrl,
            String portfolioUrl
    ) {}
    public record ProfileResponse(
            Long id, Long userId, String fullName, String photoUrl, String bio, String learningGoals,
            int experienceYears, Availability availability, String country, String linkedinUrl, String githubUrl,
            String portfolioUrl, int completionScore, List<ProfileSkillView> skills, boolean mentor
    ) {}
    public record MentorCard(
            Long mentorId, Long profileId, String fullName, String photoUrl, String headline, String country,
            int experienceYears, Availability availability, double rating, int reviewCount,
            int matchScore, List<String> reasons, List<String> skills
    ) {}
    public record MatchScoreResponse(Long mentorId, int matchScore, List<String> reasons) {}
    public record RequestCreate(@NotBlank String message, Long mentorId) {}
    public record RequestView(Long id, Long learnerId, Long mentorId, String learnerName, String mentorName,
                              String message, String status, java.time.Instant createdAt) {}
    public record ReviewCreate(Long requestId, int rating, @NotBlank String comment) {}
    public record ReviewView(Long id, Long mentorId, String reviewerName, int rating, String comment, java.time.Instant createdAt) {}
}
