package com.skillsync.matching.engine;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class MatchingEngine {
    private MatchingEngine() {}

    public record MatchResult(Long mentorId, int matchScore, List<String> reasons) {}

    public static MatchResult score(Profile learner, MentorProfile mentor) {
        Profile mentorPerson = mentor.getProfile();
        Set<String> learnerSkills = names(learner);
        Set<String> mentorSkills = names(mentorPerson);
        Set<String> overlap = new HashSet<>(learnerSkills);
        overlap.retainAll(mentorSkills);

        double skillScore = learnerSkills.isEmpty() ? 0.5 : (double) overlap.size() / learnerSkills.size();
        double goalScore = goalMatch(learner.getLearningGoals(), mentorSkills, mentorPerson.getBio(), mentor.getHeadline());
        double expScore = experienceMatch(learner.getExperienceYears(), mentorPerson.getExperienceYears());
        double availScore = availabilityMatch(learner.getAvailability(), mentorPerson.getAvailability());
        double ratingScore = mentor.getRating() == null ? 0 : mentor.getRating().doubleValue() / 5.0;

        double weighted = skillScore * 0.50 + goalScore * 0.20 + expScore * 0.15 + availScore * 0.10 + ratingScore * 0.05;
        int matchScore = (int) Math.round(Math.min(100, weighted * 100));

        List<String> reasons = new ArrayList<>();
        if (!overlap.isEmpty()) {
            reasons.add("Strong " + String.join(", ", overlap.stream().limit(3).toList()) + " skill overlap");
        } else {
            reasons.add("Limited direct skill overlap — complementary mentoring possible");
        }
        if (goalScore >= 0.5) {
            reasons.add("Matches learning goal");
        }
        if (availScore >= 0.7) {
            reasons.add("Availability compatible");
        }
        if (mentor.getRating() != null && mentor.getRating().compareTo(new BigDecimal("4.0")) >= 0) {
            reasons.add("High mentor rating (" + mentor.getRating() + ")");
        }
        if (mentorPerson.getExperienceYears() >= learner.getExperienceYears() + 2) {
            reasons.add("Senior experience gap suitable for mentoring");
        }
        return new MatchResult(mentor.getId(), matchScore, reasons);
    }

    private static Set<String> names(Profile profile) {
        return profile.getSkills().stream()
                .map(ProfileSkill::getSkill)
                .map(Skill::getName)
                .map(n -> n.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
    }

    static double goalMatch(String goals, Set<String> mentorSkills, String bio, String headline) {
        if (goals == null || goals.isBlank()) {
            return 0.4;
        }
        String hay = (goals + " " + (bio == null ? "" : bio) + " " + headline).toLowerCase(Locale.ROOT);
        long hits = mentorSkills.stream().filter(hay::contains).count();
        if (hits == 0) {
            String g = goals.toLowerCase(Locale.ROOT);
            hits = mentorSkills.stream().filter(g::contains).count();
        }
        return mentorSkills.isEmpty() ? 0.3 : Math.min(1.0, hits / (double) Math.max(1, Math.min(3, mentorSkills.size())));
    }

    static double experienceMatch(int learnerYears, int mentorYears) {
        int gap = mentorYears - learnerYears;
        if (gap >= 2 && gap <= 12) {
            return 1.0;
        }
        if (gap > 0) {
            return 0.7;
        }
        return 0.35;
    }

    static double availabilityMatch(Availability a, Availability b) {
        if (a == b || a == Availability.FLEXIBLE || b == Availability.FLEXIBLE) {
            return 1.0;
        }
        if ((a == Availability.WEEKNIGHTS && b == Availability.WEEKDAYS)
                || (a == Availability.WEEKDAYS && b == Availability.WEEKNIGHTS)) {
            return 0.6;
        }
        return 0.35;
    }
}
