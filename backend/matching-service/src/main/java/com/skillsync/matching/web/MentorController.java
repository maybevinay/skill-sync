package com.skillsync.matching.web;

import com.skillsync.matching.domain.Availability;
import com.skillsync.matching.dto.MatchingDtos.MatchScoreResponse;
import com.skillsync.matching.dto.MatchingDtos.MentorCard;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.MentorService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentors")
@Tag(name = "Mentors")
public class MentorController {
    private final MentorService mentorService;

    public MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    @PostMapping("/me")
    public Map<String, Long> become(@AuthenticationPrincipal AuthPrincipal principal,
                                    @RequestBody(required = false) Map<String, String> body) {
        String headline = body == null ? null : body.get("headline");
        return Map.of("mentorId", mentorService.becomeMentor(principal, headline).getId());
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<MentorCard> discover(@AuthenticationPrincipal AuthPrincipal principal,
                                     @RequestParam(required = false) String country,
                                     @RequestParam(required = false) Double minRating,
                                     @RequestParam(required = false) Integer minExp,
                                     @RequestParam(required = false) String skill,
                                     @RequestParam(required = false) Availability availability) {
        return mentorService.discover(principal, country, minRating, minExp, skill, availability);
    }

    @GetMapping("/recommendations")
    @Transactional(readOnly = true)
    public List<MatchScoreResponse> recs(@AuthenticationPrincipal AuthPrincipal principal) {
        return mentorService.recommendations(principal);
    }

    @GetMapping("/{id}/match")
    @Transactional(readOnly = true)
    public MatchScoreResponse explain(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long id) {
        return mentorService.explain(principal, id);
    }
}
