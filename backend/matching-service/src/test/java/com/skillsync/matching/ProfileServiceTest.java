package com.skillsync.matching;

import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.repository.ProfileRepository;
import com.skillsync.matching.repository.ProfileSkillRepository;
import com.skillsync.matching.repository.SkillRepository;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ProfileServiceTest {

    @Test
    void emptyProfileHasBaselineCompletion() {
        Profile p = new Profile();
        p.setFullName("Uma");
        assertEquals(20, ProfileService.completionScore(p));
    }

    @Test
    void filledProfileApproachesComplete() {
        Profile p = new Profile();
        p.setFullName("Uma");
        p.setBio("Learner");
        p.setLearningGoals("Spring Boot");
        p.setPhotoUrl("http://example/photo.png");
        p.setCountry("India");
        p.setLinkedinUrl("https://linkedin.com/in/uma");
        p.setGithubUrl("https://github.com/uma");
        p.setPortfolioUrl("https://uma.dev");
        Skill skill = new Skill();
        skill.setName("React");
        ProfileSkill link = new ProfileSkill();
        link.setSkill(skill);
        p.getSkills().add(link);

        assertEquals(100, ProfileService.completionScore(p));
    }

    @Test
    void skillsIncreaseCompletion() {
        Profile empty = new Profile();
        Profile withSkill = new Profile();
        Skill skill = new Skill();
        skill.setName("Java");
        ProfileSkill link = new ProfileSkill();
        link.setSkill(skill);
        withSkill.getSkills().add(link);
        assertTrue(ProfileService.completionScore(withSkill) > ProfileService.completionScore(empty));
    }
}

@ExtendWith(MockitoExtension.class)
class ProfileServiceMeTest {
    @Mock ProfileRepository profiles;
    @Mock SkillRepository skills;
    @Mock ProfileSkillRepository profileSkills;
    @InjectMocks ProfileService service;

    @Test
    void newRegistrationGetsBlankProfileWithRegisteredNameOnly() {
        when(profiles.findByUserId(5L)).thenReturn(Optional.empty());
        when(profiles.save(any(Profile.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.me(new AuthPrincipal(5L, "amit@skillsync.dev", "USER", "Amit"));

        assertEquals("Amit", response.fullName());
        assertEquals(5L, response.userId());
        assertNull(response.bio());
        assertNull(response.learningGoals());
        assertNull(response.country());
        assertNull(response.githubUrl());
        assertEquals(0, response.experienceYears());
        assertTrue(response.skills().isEmpty());
        assertEquals(20, response.completionScore());
    }

    @Test
    void demoMentorOnSequentialIdIsNotReturnedToNewUser() {
        Profile priya = new Profile();
        priya.setUserId(5L);
        priya.setFullName("Priya Cloud");
        priya.setBio("DevOps and Kubernetes coach.");
        priya.setGithubUrl("https://github.com/skillsync");
        priya.setCountry("USA");

        when(profiles.findByUserId(5L)).thenReturn(Optional.of(priya));
        when(profiles.findByUserId(9005L)).thenReturn(Optional.empty());
        when(profiles.save(any(Profile.class))).thenAnswer(inv -> inv.getArgument(0));

        var response = service.me(new AuthPrincipal(5L, "amit@skillsync.dev", "USER", "Amit"));

        assertEquals("Amit", response.fullName());
        assertNull(response.bio());
        assertNull(response.githubUrl());
        assertEquals(9005L, priya.getUserId());
    }

    @Test
    void demoAccountKeepsSeededProfile() {
        Profile maya = new Profile();
        maya.setUserId(2L);
        maya.setFullName("Maya Mentor");
        maya.setBio("Staff engineer mentoring Spring and React.");
        when(profiles.findByUserId(2L)).thenReturn(Optional.of(maya));

        var response = service.me(new AuthPrincipal(2L, "mentor@skillsync.dev", "MENTOR", "Maya Mentor"));

        assertEquals("Maya Mentor", response.fullName());
        assertEquals("Staff engineer mentoring Spring and React.", response.bio());
    }
}
