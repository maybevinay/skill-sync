package com.skillsync.matching.service;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.dto.MatchingDtos.MatchScoreResponse;
import com.skillsync.matching.dto.MatchingDtos.MentorCard;
import com.skillsync.matching.engine.MatchingEngine;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class MentorService {
    private final MentorProfileRepository mentors;
    private final ProfileService profileService;

    public MentorService(MentorProfileRepository mentors, ProfileService profileService) {
        this.mentors = mentors;
        this.profileService = profileService;
    }

    @Transactional
    public MentorProfile becomeMentor(AuthPrincipal principal, String headline) {
        Profile profile = profileService.require(principal.userId());
        if (profile.getMentorProfile() != null) {
            MentorProfile existing = profile.getMentorProfile();
            existing.setHeadline(headline);
            existing.setAccepting(true);
            return existing;
        }
        MentorProfile mp = new MentorProfile();
        mp.setProfile(profile);
        mp.setHeadline(headline == null || headline.isBlank() ? "Mentor on SkillSync" : headline);
        mp.setRating(BigDecimal.ZERO);
        mp.setReviewCount(0);
        mp.setAccepting(true);
        profile.setMentorProfile(mp);
        return mentors.save(mp);
    }

    @Transactional(readOnly = true)
    public List<MentorCard> discover(AuthPrincipal principal, String country, Double minRating, Integer minExp,
                                     String skill, Availability availability) {
        Profile learner = profileService.require(principal.userId());
        BigDecimal rating = minRating == null ? null : BigDecimal.valueOf(minRating);
        return mentors.search(emptyToNull(country), rating, minExp).stream()
                .filter(m -> availability == null || m.getProfile().getAvailability() == availability
                        || m.getProfile().getAvailability() == Availability.FLEXIBLE)
                .filter(m -> skill == null || skill.isBlank() || m.getProfile().getSkills().stream()
                        .anyMatch(s -> s.getSkill().getName().equalsIgnoreCase(skill)
                                || s.getSkill().getCategory().equalsIgnoreCase(skill)))
                .map(m -> toCard(learner, m))
                .sorted(Comparator.comparingInt(MentorCard::matchScore).reversed())
                .toList();
    }

    public List<MatchScoreResponse> recommendations(AuthPrincipal principal) {
        return discover(principal, null, null, null, null, null).stream()
                .limit(8)
                .map(c -> new MatchScoreResponse(c.mentorId(), c.matchScore(), c.reasons()))
                .toList();
    }

    @Transactional(readOnly = true)
    public MatchScoreResponse explain(AuthPrincipal principal, Long mentorId) {
        Profile learner = profileService.require(principal.userId());
        MentorProfile mentor = mentors.findById(mentorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mentor not found"));
        var result = MatchingEngine.score(learner, mentor);
        return new MatchScoreResponse(result.mentorId(), result.matchScore(), result.reasons());
    }

    private MentorCard toCard(Profile learner, MentorProfile m) {
        var score = MatchingEngine.score(learner, m);
        List<String> skills = m.getProfile().getSkills().stream().map(s -> s.getSkill().getName()).toList();
        return new MentorCard(m.getId(), m.getProfile().getId(), m.getProfile().getFullName(),
                m.getProfile().getPhotoUrl(), m.getHeadline(), m.getProfile().getCountry(),
                m.getProfile().getExperienceYears(), m.getProfile().getAvailability(),
                m.getRating().doubleValue(), m.getReviewCount(), score.matchScore(), score.reasons(), skills);
    }

    private String emptyToNull(String v) {
        return v == null || v.isBlank() ? null : v;
    }
}
