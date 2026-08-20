package com.skillsync.matching;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.engine.MatchingEngine;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class MatchingEngineTest {

    @Test
    void overlappingSpringSkillsProducesHighScoreAndReasons() {
        Skill spring = skill("Spring Boot");
        Skill react = skill("React");

        Profile learner = new Profile();
        learner.setExperienceYears(2);
        learner.setAvailability(Availability.WEEKNIGHTS);
        learner.setLearningGoals("Spring Boot system design");
        learner.getSkills().add(link(learner, spring));

        Profile mentorPerson = new Profile();
        mentorPerson.setExperienceYears(8);
        mentorPerson.setAvailability(Availability.FLEXIBLE);
        mentorPerson.setBio("Spring Boot specialist");
        mentorPerson.getSkills().add(link(mentorPerson, spring));
        mentorPerson.getSkills().add(link(mentorPerson, react));

        MentorProfile mentor = new MentorProfile();
        mentor.setId(1L);
        mentor.setProfile(mentorPerson);
        mentor.setHeadline("Spring Boot mentor");
        mentor.setRating(new BigDecimal("4.80"));

        var result = MatchingEngine.score(learner, mentor);
        assertTrue(result.matchScore() >= 70);
        assertTrue(result.reasons().stream().anyMatch(r -> r.toLowerCase().contains("spring")));
        assertTrue(result.reasons().stream().anyMatch(r -> r.toLowerCase().contains("availability")));
    }

    @Test
    void formulaWeightsFavorSkillOverlap() {
        Skill spring = skill("Spring Boot");
        Profile learner = new Profile();
        learner.setExperienceYears(1);
        learner.setAvailability(Availability.WEEKENDS);
        learner.setLearningGoals("unrelated");
        learner.getSkills().add(link(learner, spring));

        Profile mentorPerson = new Profile();
        mentorPerson.setExperienceYears(2);
        mentorPerson.setAvailability(Availability.WEEKDAYS);
        mentorPerson.getSkills().add(link(mentorPerson, spring));

        MentorProfile mentor = new MentorProfile();
        mentor.setId(2L);
        mentor.setProfile(mentorPerson);
        mentor.setHeadline("Generalist");
        mentor.setRating(new BigDecimal("3.00"));

        assertTrue(MatchingEngine.score(learner, mentor).matchScore() >= 50);
    }

    private static Skill skill(String name) {
        Skill s = new Skill();
        s.setName(name);
        s.setCategory("Backend");
        s.setDescription(name);
        return s;
    }

    private static ProfileSkill link(Profile p, Skill s) {
        ProfileSkill ps = new ProfileSkill();
        ps.setProfile(p);
        ps.setSkill(s);
        return ps;
    }
}
