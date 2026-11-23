package com.skillsync.matching.config;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.domain.MatchRequest;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.RequestStatus;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.domain.SkillLevel;
import com.skillsync.matching.repository.MatchRequestRepository;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.repository.ProfileRepository;
import com.skillsync.matching.repository.SkillRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class MatchingSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(MatchingSeeder.class);

    private static final long MAYA_USER_ID = DemoProfiles.MAYA_USER_ID;
    private static final long UMA_USER_ID = DemoProfiles.UMA_USER_ID;
    private static final long LEO_USER_ID = DemoProfiles.LEO_USER_ID;
    private static final long PRIYA_USER_ID = DemoProfiles.PRIYA_USER_ID;

    private final ProfileRepository profiles;
    private final SkillRepository skills;
    private final MentorProfileRepository mentors;
    private final MatchRequestRepository requests;

    public MatchingSeeder(ProfileRepository profiles, SkillRepository skills, MentorProfileRepository mentors,
                          MatchRequestRepository requests) {
        this.profiles = profiles;
        this.skills = skills;
        this.mentors = mentors;
        this.requests = requests;
    }

    @Override
    public void run(String... args) {
        relocateCollidingDemo(DemoProfiles.LEO, 4L, LEO_USER_ID);
        relocateCollidingDemo(DemoProfiles.PRIYA, 5L, PRIYA_USER_ID);

        List<Skill> catalog = skills.findAll();
        if (catalog.isEmpty()) {
            return;
        }
        seedUser(MAYA_USER_ID, DemoProfiles.MAYA, "Staff engineer mentoring Spring and React.",
                "Help others ship production systems", 8, "India", true, List.of(0, 1, 2, 3));
        seedUser(UMA_USER_ID, DemoProfiles.UMA, "Frontend engineer learning backend.",
                "Spring Boot, System Design", 2, "India", false, List.of(1, 2));
        seedUser(LEO_USER_ID, DemoProfiles.LEO, "Distributed systems mentor.",
                "Career growth in backend", 11, "Germany", true, List.of(0, 3, 4, 7));
        seedUser(PRIYA_USER_ID, DemoProfiles.PRIYA, "DevOps and Kubernetes coach.",
                "Cloud native mentoring", 9, "USA", true, List.of(7, 8, 3));
        seedDemoAcceptedRequest();
    }

    private void relocateCollidingDemo(String fullName, long fromUserId, long toUserId) {
        profiles.findByUserId(fromUserId).ifPresent(profile -> {
            if (!fullName.equals(profile.getFullName())) {
                return;
            }
            if (profiles.findByUserId(toUserId).isPresent()) {
                return;
            }
            profile.setUserId(toUserId);
            profiles.save(profile);
            log.info("Moved demo profile '{}' from user_id {} to {} so real registrations are not overwritten",
                    fullName, fromUserId, toUserId);
        });
    }

    private void seedUser(Long userId, String name, String bio, String goals, int years, String country,
                          boolean mentor, List<Integer> skillIndexes) {
        if (profiles.findByUserId(userId).isPresent()) {
            return;
        }
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

    private void seedDemoAcceptedRequest() {
        boolean alreadyReviewable = requests.findByLearnerUserId(UMA_USER_ID).stream()
                .anyMatch(r -> r.getStatus() == RequestStatus.ACCEPTED || r.getStatus() == RequestStatus.COMPLETED);
        if (alreadyReviewable) {
            return;
        }
        Profile uma = profiles.findByUserId(UMA_USER_ID).orElse(null);
        MentorProfile maya = mentors.findByProfileUserId(MAYA_USER_ID).orElse(null);
        if (uma == null || maya == null) {
            return;
        }
        MatchRequest req = new MatchRequest();
        req.setLearner(uma);
        req.setMentor(maya);
        req.setMessage("I'd like help with Spring Boot and system design.");
        req.setStatus(RequestStatus.ACCEPTED);
        requests.save(req);
        log.info("Seeded accepted demo request Uma -> Maya so reviews can be submitted");
    }
}
