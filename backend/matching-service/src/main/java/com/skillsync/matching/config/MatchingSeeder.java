package com.skillsync.matching.config;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.domain.SkillLevel;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.repository.ProfileRepository;
import com.skillsync.matching.repository.SkillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class MatchingSeeder implements CommandLineRunner {
    private final ProfileRepository profiles;
    private final SkillRepository skills;
    private final MentorProfileRepository mentors;

    public MatchingSeeder(ProfileRepository profiles, SkillRepository skills, MentorProfileRepository mentors) {
        this.profiles = profiles;
        this.skills = skills;
        this.mentors = mentors;
    }

    @Override
    public void run(String... args) {
        if (profiles.count() > 0) {
            return;
        }
        List<Skill> catalog = skills.findAll();
        if (catalog.isEmpty()) {
            return;
        }
        seedUser(2L, "Maya Mentor", "Staff engineer mentoring Spring and React.", "Help others ship production systems",
                8, "India", true, List.of(0, 1, 2, 3));
        seedUser(3L, "Uma User", "Frontend engineer learning backend.", "Spring Boot, System Design",
                2, "India", false, List.of(1, 2));
        seedUser(4L, "Leo Backend", "Distributed systems mentor.", "Career growth in backend",
                11, "Germany", true, List.of(0, 3, 4, 7));
        seedUser(5L, "Priya Cloud", "DevOps and Kubernetes coach.", "Cloud native mentoring",
                9, "USA", true, List.of(7, 8, 3));
    }

    private void seedUser(Long userId, String name, String bio, String goals, int years, String country,
                          boolean mentor, List<Integer> skillIndexes) {
        Profile p = new Profile();
        p.setUserId(userId);
        p.setFullName(name);
        p.setBio(bio);
        p.setLearningGoals(goals);
        p.setExperienceYears(years);
        p.setAvailability(Availability.FLEXIBLE);
        p.setCountry(country);
        p.setGithubUrl("https://github.com/skillsync");
        List<Skill> catalog = skills.findAll();
        for (int idx : skillIndexes) {
            if (idx >= catalog.size()) continue;
            ProfileSkill ps = new ProfileSkill();
            ps.setProfile(p);
            ps.setSkill(catalog.get(idx));
            ps.setLevel(mentor ? SkillLevel.EXPERT : SkillLevel.INTERMEDIATE);
            ps.setProgress(mentor ? 90 : 40);
            p.getSkills().add(ps);
        }
        profiles.save(p);
        if (mentor) {
            MentorProfile mp = new MentorProfile();
            mp.setProfile(p);
            mp.setHeadline(bio);
            mp.setRating(new BigDecimal("4.70"));
            mp.setReviewCount(12);
            mp.setAccepting(true);
            mentors.save(mp);
        }
    }
}
