package com.skillsync.matching.service;

import com.skillsync.matching.config.DemoProfiles;
import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.domain.SkillLevel;
import com.skillsync.matching.dto.MatchingDtos.ProfileRequest;
import com.skillsync.matching.dto.MatchingDtos.ProfileResponse;
import com.skillsync.matching.dto.MatchingDtos.ProfileSkillRequest;
import com.skillsync.matching.dto.MatchingDtos.ProfileSkillView;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.ProfileRepository;
import com.skillsync.matching.repository.ProfileSkillRepository;
import com.skillsync.matching.repository.SkillRepository;
import com.skillsync.matching.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProfileService {
    private final ProfileRepository profiles;
    private final SkillRepository skills;
    private final ProfileSkillRepository profileSkills;

    public ProfileService(ProfileRepository profiles, SkillRepository skills, ProfileSkillRepository profileSkills) {
        this.profiles = profiles;
        this.skills = skills;
        this.profileSkills = profileSkills;
    }

    @Transactional
    public ProfileResponse upsert(AuthPrincipal principal, ProfileRequest request) {
        Profile profile = profiles.findByUserId(principal.userId()).orElseGet(Profile::new);
        profile.setUserId(principal.userId());
        profile.setFullName(request.fullName());
        profile.setPhotoUrl(request.photoUrl());
        profile.setBio(request.bio());
        profile.setLearningGoals(request.learningGoals());
        profile.setExperienceYears(Math.max(0, Math.min(80, request.experienceYears())));
        if (request.availability() != null) {
            profile.setAvailability(request.availability());
        }
        profile.setCountry(request.country());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setPortfolioUrl(request.portfolioUrl());
        return toResponse(profiles.save(profile));
    }

    @Transactional
    public ProfileResponse me(AuthPrincipal principal) {
        Optional<Profile> existing = profiles.findByUserId(principal.userId());
        if (existing.isEmpty()) {
            return createBlank(principal);
        }
        Profile profile = existing.get();
        Long reserved = DemoProfiles.reservedUserId(profile.getFullName());
        if (reserved == null || reserved.equals(profile.getUserId())) {
            return toResponse(profile);
        }
        if (profiles.findByUserId(reserved).isEmpty()) {
            profile.setUserId(reserved);
            profiles.save(profile);
            return createBlank(principal);
        }
        applyBlank(profile, principal);
        return toResponse(profiles.save(profile));
    }

    private ProfileResponse createBlank(AuthPrincipal principal) {
        Profile profile = new Profile();
        applyBlank(profile, principal);
        return toResponse(profiles.save(profile));
    }

    private void applyBlank(Profile profile, AuthPrincipal principal) {
        profile.setUserId(principal.userId());
        String name = principal.name();
        profile.setFullName(name == null || name.isBlank() ? "New member" : name.trim());
        profile.setPhotoUrl(null);
        profile.setBio(null);
        profile.setLearningGoals(null);
        profile.setExperienceYears(0);
        profile.setAvailability(Availability.WEEKNIGHTS);
        profile.setCountry(null);
        profile.setLinkedinUrl(null);
        profile.setGithubUrl(null);
        profile.setPortfolioUrl(null);
        profile.getSkills().clear();
    }

    public Profile require(Long userId) {
        return profiles.findByUserId(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Profile not found"));
    }

    @Transactional
    public ProfileResponse addSkill(AuthPrincipal principal, ProfileSkillRequest request) {
        Profile profile = require(principal.userId());
        Skill skill = skills.findById(request.skillId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Skill not found"));
        ProfileSkill link = profileSkills.findByProfileIdAndSkillId(profile.getId(), skill.getId())
                .orElseGet(ProfileSkill::new);
        link.setProfile(profile);
        link.setSkill(skill);
        link.setLevel(request.level() == null ? SkillLevel.BEGINNER : request.level());
        link.setProgress(Math.max(0, Math.min(100, request.progress())));
        profileSkills.save(link);
        return toResponse(profiles.findById(profile.getId()).orElseThrow());
    }

    @Transactional
    public void removeSkill(AuthPrincipal principal, Long skillId) {
        Profile profile = require(principal.userId());
        profileSkills.deleteByProfileIdAndSkillId(profile.getId(), skillId);
    }

    public static int completionScore(Profile p) {
        int score = 20;
        if (p.getBio() != null && !p.getBio().isBlank()) score += 15;
        if (p.getLearningGoals() != null && !p.getLearningGoals().isBlank()) score += 15;
        if (p.getPhotoUrl() != null && !p.getPhotoUrl().isBlank()) score += 10;
        if (p.getCountry() != null && !p.getCountry().isBlank()) score += 5;
        if (p.getLinkedinUrl() != null) score += 5;
        if (p.getGithubUrl() != null) score += 5;
        if (p.getPortfolioUrl() != null) score += 5;
        if (!p.getSkills().isEmpty()) score += 20;
        return Math.min(100, score);
    }

    private ProfileResponse toResponse(Profile p) {
        List<ProfileSkillView> skillViews = p.getSkills().stream()
                .map(s -> new ProfileSkillView(s.getSkill().getId(), s.getSkill().getName(),
                        s.getSkill().getCategory(), s.getLevel(), s.getProgress()))
                .toList();
        return new ProfileResponse(p.getId(), p.getUserId(), p.getFullName(), p.getPhotoUrl(), p.getBio(),
                p.getLearningGoals(), p.getExperienceYears(), p.getAvailability(), p.getCountry(),
                p.getLinkedinUrl(), p.getGithubUrl(), p.getPortfolioUrl(), completionScore(p), skillViews,
                p.getMentorProfile() != null);
    }
}
