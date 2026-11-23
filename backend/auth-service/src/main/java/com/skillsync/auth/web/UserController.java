package com.skillsync.auth.web;

import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.UpdateProfileRequest;
import com.skillsync.auth.dto.UserResponse;
import com.skillsync.auth.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users")
public class UserController {
    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/me")
    public UserResponse update(@Valid @RequestBody UpdateProfileRequest request, @AuthenticationPrincipal User user) {
        return authService.updateMe(user, request);
    }
}
