package com.skillsync.matching.web;

import com.skillsync.matching.domain.RequestStatus;
import com.skillsync.matching.repository.MatchRequestRepository;
import com.skillsync.matching.repository.MentorProfileRepository;
import com.skillsync.matching.repository.ProfileRepository;
import com.skillsync.matching.repository.SkillRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Matching Analytics")
public class AdminAnalyticsController {
    private final ProfileRepository profiles;
    private final MentorProfileRepository mentors;
    private final MatchRequestRepository requests;
    private final SkillRepository skills;

    public AdminAnalyticsController(ProfileRepository profiles, MentorProfileRepository mentors,
                                    MatchRequestRepository requests, SkillRepository skills) {
        this.profiles = profiles;
        this.mentors = mentors;
        this.requests = requests;
        this.skills = skills;
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return Map.of(
                "profiles", profiles.count(),
                "mentors", mentors.count(),
                "pendingRequests", requests.countByStatus(RequestStatus.PENDING),
                "acceptedRequests", requests.countByStatus(RequestStatus.ACCEPTED),
                "skills", skills.count(),
                "skillTrends", skills.findAll().stream().map(s -> Map.of("name", s.getName(), "category", s.getCategory())).toList(),
                "growth", List.of(
                        Map.of("month", "Jan", "users", 12, "mentors", 3),
                        Map.of("month", "Feb", "users", 28, "mentors", 7),
                        Map.of("month", "Mar", "users", 45, "mentors", 11),
                        Map.of("month", "Apr", "users", 62, "mentors", 14),
                        Map.of("month", "May", "users", 81, "mentors", 18),
                        Map.of("month", "Jun", "users", 104, "mentors", 22)
                )
        );
    }
}
