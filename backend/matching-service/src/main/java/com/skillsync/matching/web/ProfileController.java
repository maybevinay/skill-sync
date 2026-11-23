package com.skillsync.matching.web;

import com.skillsync.matching.dto.MatchingDtos.ProfileRequest;
import com.skillsync.matching.dto.MatchingDtos.ProfileResponse;
import com.skillsync.matching.dto.MatchingDtos.ProfileSkillRequest;
import com.skillsync.matching.security.AuthPrincipal;
import com.skillsync.matching.service.ProfileService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/me")
    public ProfileResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        return profileService.me(principal);
    }

    @PutMapping("/me")
    public ProfileResponse upsert(@AuthenticationPrincipal AuthPrincipal principal,
                                  @Valid @RequestBody ProfileRequest request) {
        return profileService.upsert(principal, request);
    }

    @PostMapping("/me/skills")
    public ProfileResponse addSkill(@AuthenticationPrincipal AuthPrincipal principal,
                                    @Valid @RequestBody ProfileSkillRequest request) {
        return profileService.addSkill(principal, request);
    }

    @DeleteMapping("/me/skills/{skillId}")
    public void removeSkill(@AuthenticationPrincipal AuthPrincipal principal, @PathVariable Long skillId) {
        profileService.removeSkill(principal, skillId);
    }
}
