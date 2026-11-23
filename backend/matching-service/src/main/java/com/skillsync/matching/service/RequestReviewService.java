package com.skillsync.matching.service;

import com.skillsync.matching.domain.MatchRequest;
import com.skillsync.matching.domain.MentorProfile;
import com.skillsync.matching.domain.Profile;
import com.skillsync.matching.domain.RequestStatus;
import com.skillsync.matching.domain.Review;
import com.skillsync.matching.dto.MatchingDtos.RequestCreate;
import com.skillsync.matching.dto.MatchingDtos.RequestView;
import com.skillsync.matching.dto.MatchingDtos.ReviewCreate;
import com.skillsync.matching.dto.MatchingDtos.ReviewView;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.MatchRequestRepository;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.repository.ReviewRepository;
import com.skillsync.matching.security.AuthPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class RequestReviewService {
    private final MatchRequestRepository requests;
    private final MentorProfileRepository mentors;
    private final ReviewRepository reviews;
    private final ProfileService profileService;

    public RequestReviewService(MatchRequestRepository requests, MentorProfileRepository mentors,
                                ReviewRepository reviews, ProfileService profileService) {
        this.requests = requests;
        this.mentors = mentors;
        this.reviews = reviews;
        this.profileService = profileService;
    }

    @Transactional
    public RequestView create(AuthPrincipal principal, RequestCreate body) {
        Profile learner = profileService.require(principal.userId());
        MentorProfile mentor = mentors.findById(body.mentorId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Mentor not found"));
        if (mentor.getProfile().getUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot request mentorship from yourself");
        }
        if (requests.existsByLearnerUserIdAndMentorIdAndStatusIn(
                principal.userId(),
                mentor.getId(),
                List.of(RequestStatus.PENDING, RequestStatus.ACCEPTED))) {
            throw new ApiException(HttpStatus.CONFLICT, "You already have an open request with this mentor");
        }
        MatchRequest req = new MatchRequest();
        req.setLearner(learner);
        req.setMentor(mentor);
        req.setMessage(body.message());
        req.setStatus(RequestStatus.PENDING);
        return toView(requests.save(req));
    }

    public List<RequestView> mine(AuthPrincipal principal) {
        List<RequestView> asLearner = requests.findByLearnerUserId(principal.userId()).stream().map(this::toView).toList();
        List<RequestView> asMentor = requests.findByMentorProfileUserId(principal.userId()).stream().map(this::toView).toList();
        return java.util.stream.Stream.concat(asLearner.stream(), asMentor.stream()).distinct().toList();
    }

    @Transactional
    public RequestView updateStatus(AuthPrincipal principal, Long id, RequestStatus status) {
        MatchRequest req = requests.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        boolean mentorOwner = req.getMentor().getProfile().getUserId().equals(principal.userId());
        boolean learnerOwner = req.getLearner().getUserId().equals(principal.userId());
        if (!mentorOwner && !learnerOwner && !principal.isAdmin()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your request");
        }
        if (status == RequestStatus.ACCEPTED || status == RequestStatus.DECLINED) {
            if (!mentorOwner && !principal.isAdmin()) {
                throw new ApiException(HttpStatus.FORBIDDEN, "Only the mentor can accept or decline a request");
            }
            if (req.getStatus() != RequestStatus.PENDING) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Only pending requests can be accepted or declined");
            }
        } else if (status == RequestStatus.COMPLETED) {
            if (req.getStatus() != RequestStatus.ACCEPTED && req.getStatus() != RequestStatus.COMPLETED) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Request must be accepted before it can be completed");
            }
        } else if (status == RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot revert a request to pending");
        }
        req.setStatus(status);
        return toView(req);
    }

    @Transactional
    public ReviewView addReview(AuthPrincipal principal, ReviewCreate body) {
        if (body.requestId() == null || body.requestId() < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Select a mentorship request");
        }
        if (body.rating() < 1 || body.rating() > 5) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Rating must be 1-5");
        }
        MatchRequest req = requests.findById(body.requestId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));
        if (!req.getLearner().getUserId().equals(principal.userId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the learner can review");
        }
        if (req.getStatus() != RequestStatus.COMPLETED && req.getStatus() != RequestStatus.ACCEPTED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Request must be accepted or completed");
        }
        if (reviews.existsByRequestId(body.requestId())) {
            throw new ApiException(HttpStatus.CONFLICT, "Review already submitted for this request");
        }
        Review review = new Review();
        review.setRequest(req);
        review.setReviewer(req.getLearner());
        review.setMentor(req.getMentor());
        review.setRating(body.rating());
        review.setComment(body.comment());
        reviews.save(review);
        recalculateRating(req.getMentor());
        req.setStatus(RequestStatus.COMPLETED);
        return toView(review);
    }

    public List<ReviewView> forMentor(Long mentorId) {
        return reviews.findByMentorId(mentorId).stream().map(this::toView).toList();
    }

    public List<ReviewView> mineReviews(AuthPrincipal principal) {
        return reviews.findByReviewerUserId(principal.userId()).stream().map(this::toView).toList();
    }

    private void recalculateRating(MentorProfile mentor) {
        List<Review> all = reviews.findByMentorId(mentor.getId());
        double avg = all.stream().mapToInt(Review::getRating).average().orElse(0);
        mentor.setReviewCount(all.size());
        mentor.setRating(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
    }

    private RequestView toView(MatchRequest r) {
        return new RequestView(r.getId(), r.getLearner().getId(), r.getMentor().getId(),
                r.getLearner().getUserId(), r.getLearner().getFullName(), r.getMentor().getProfile().getFullName(),
                r.getMessage(), r.getStatus().name(), r.getCreatedAt());
    }

    private ReviewView toView(Review r) {
        return new ReviewView(r.getId(), r.getRequest().getId(), r.getMentor().getId(), r.getReviewer().getFullName(),
                r.getRating(), r.getComment(), r.getCreatedAt());
    }
}
