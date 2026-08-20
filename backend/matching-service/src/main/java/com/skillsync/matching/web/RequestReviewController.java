package com.skillsync.matching.web;

import com.skillsync.matching.domain.RequestStatus;
import com.skillsync.matching.dto.MatchingDtos.RequestCreate;
import com.skillsync.matching.dto.MatchingDtos.RequestView;
import com.skillsync.matching.dto.MatchingDtos.ReviewCreate;
import com.skillsync.matching.dto.MatchingDtos.ReviewView;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.RequestReviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Requests & Reviews")
public class RequestReviewController {
    private final RequestReviewService service;

    public RequestReviewController(RequestReviewService service) {
        this.service = service;
    }

    @PostMapping("/requests")
    public RequestView create(@AuthenticationPrincipal AuthPrincipal principal, @Valid @RequestBody RequestCreate body) {
        return service.create(principal, body);
    }

    @GetMapping("/requests")
    public List<RequestView> mine(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.mine(principal);
    }

    @PatchMapping("/requests/{id}")
    public RequestView status(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id,
                              @RequestParam RequestStatus status) {
        return service.updateStatus(principal, id, status);
    }

    @PostMapping("/reviews")
    public ReviewView review(@AuthenticationPrincipal AuthPrincipal principal, @Valid @RequestBody ReviewCreate body) {
        return service.addReview(principal, body);
    }

    @GetMapping("/mentors/{mentorId}/reviews")
    public List<ReviewView> mentorReviews(@PathVariable Long mentorId) {
        return service.forMentor(mentorId);
    }

    @GetMapping("/reviews")
    public List<ReviewView> mineReviews(@AuthenticationPrincipal AuthPrincipal principal) {
        return service.mineReviews(principal);
    }
}
