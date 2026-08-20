package com.skillsync.matching;

import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.ProfileSkill;
import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.service.ProfileService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
