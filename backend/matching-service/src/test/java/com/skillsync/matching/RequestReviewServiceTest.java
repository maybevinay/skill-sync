package com.skillsync.matching;

import com.skillsync.matching.domain.MatchRequest;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.RequestStatus;
import com.skillsync.matching.dto.MatchingDtos.RequestCreate;
import com.skillsync.matching.dto.MatchingDtos.ReviewCreate;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.MatchRequestRepository;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.repository.ReviewRepository;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.ProfileService;
import com.skillsync.matching.service.RequestReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestReviewServiceTest {
    @Mock MatchRequestRepository requests;
    @Mock MentorProfileRepository mentors;
    @Mock ReviewRepository reviews;
    @Mock ProfileService profileService;

    private RequestReviewService service;

    @BeforeEach
    void setUp() {
        service = new RequestReviewService(requests, mentors, reviews, profileService);
    }

    @Test
    void learnerCannotAcceptOwnRequest() {
        MatchRequest req = pendingRequest();
        when(requests.findById(10L)).thenReturn(Optional.of(req));
        AuthPrincipal learner = new AuthPrincipal(3L, "user@skillsync.dev", "USER", "Uma");

        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateStatus(learner, 10L, RequestStatus.ACCEPTED));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
        assertEquals(RequestStatus.PENDING, req.getStatus());
    }

    @Test
    void mentorCanAcceptPendingRequest() {
        MatchRequest req = pendingRequest();
        when(requests.findById(10L)).thenReturn(Optional.of(req));
        AuthPrincipal mentor = new AuthPrincipal(2L, "mentor@skillsync.dev", "MENTOR", "Maya");

        assertEquals("ACCEPTED", service.updateStatus(mentor, 10L, RequestStatus.ACCEPTED).status());
    }

    @Test
    void strangerCannotUpdateRequest() {
        when(requests.findById(10L)).thenReturn(Optional.of(pendingRequest()));
        AuthPrincipal stranger = new AuthPrincipal(99L, "x@skillsync.dev", "USER", "X");

        ApiException ex = assertThrows(ApiException.class,
                () -> service.updateStatus(stranger, 10L, RequestStatus.DECLINED));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatus());
    }

    @Test
    void cannotRequestSelfAsMentor() {
        Profile self = profile(2L, "Maya");
        MentorProfile mentor = mentor(1L, self);
        when(profileService.require(2L)).thenReturn(self);
        when(mentors.findById(1L)).thenReturn(Optional.of(mentor));

        ApiException ex = assertThrows(ApiException.class, () ->
                service.create(new AuthPrincipal(2L, "mentor@skillsync.dev", "MENTOR", "Maya"),
                        new RequestCreate("Please mentor me", 1L)));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void duplicateReviewIsRejected() {
        MatchRequest req = pendingRequest();
        req.setStatus(RequestStatus.ACCEPTED);
        when(requests.findById(10L)).thenReturn(Optional.of(req));
        when(reviews.existsByRequestId(10L)).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () ->
                service.addReview(new AuthPrincipal(3L, "user@skillsync.dev", "USER", "Uma"),
                        new ReviewCreate(10L, 5, "Great mentor")));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void ratingOutsideRangeIsRejected() {
        ApiException ex = assertThrows(ApiException.class, () ->
                service.addReview(new AuthPrincipal(3L, "user@skillsync.dev", "USER", "Uma"),
                        new ReviewCreate(10L, 9, "Impossible")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    private MatchRequest pendingRequest() {
        Profile learner = profile(3L, "Uma User");
        MentorProfile mentor = mentor(1L, profile(2L, "Maya Mentor"));
        MatchRequest req = new MatchRequest();
        req.setLearner(learner);
        req.setMentor(mentor);
        req.setMessage("Help with Spring");
        req.setStatus(RequestStatus.PENDING);
        ReflectionTestUtils.setField(req, "id", 10L);
        return req;
    }

    private static Profile profile(long userId, String name) {
        Profile p = new Profile();
        p.setUserId(userId);
        p.setFullName(name);
        ReflectionTestUtils.setField(p, "id", userId);
        return p;
    }

    private static MentorProfile mentor(long id, Profile profile) {
        MentorProfile mp = new MentorProfile();
        mp.setId(id);
        mp.setProfile(profile);
        mp.setHeadline("Mentor");
        return mp;
    }
}
