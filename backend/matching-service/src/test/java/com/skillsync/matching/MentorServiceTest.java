package com.skillsync.matching;

import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.MentorService;
import com.skillsync.matching.service.ProfileService;
import com.skillsync.matching.repository.MentorProfileRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MentorServiceTest {
    @Mock MentorProfileRepository mentors;
    @Mock ProfileService profileService;
    @InjectMocks MentorService mentorService;

    @Test
    void newMentorStartsWithZeroRating() {
        Profile profile = new Profile();
        profile.setUserId(3L);
        profile.setFullName("Uma User");
        when(profileService.require(3L)).thenReturn(profile);
        when(mentors.save(any(MentorProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        MentorProfile created = mentorService.becomeMentor(
                new AuthPrincipal(3L, "user@skillsync.dev", "USER", "Uma"), "Backend mentor");

        assertEquals(0, created.getRating().compareTo(BigDecimal.ZERO));
        assertEquals(0, created.getReviewCount());
        assertEquals("Backend mentor", created.getHeadline());
    }
}
