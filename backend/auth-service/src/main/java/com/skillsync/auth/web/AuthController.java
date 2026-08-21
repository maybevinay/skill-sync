package com.skillsync.auth.web;

import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.dto.ForgotPasswordRequest;
import com.skillsync.auth.dto.LoginRequest;
import com.skillsync.auth.dto.RefreshRequest;
import com.skillsync.auth.dto.RegisterRequest;
import com.skillsync.auth.dto.ResetPasswordRequest;
import com.skillsync.auth.dto.UserResponse;
import com.skillsync.auth.dto.VerifyEmailRequest;
import com.skillsync.auth.exception.ApiException;
import com.skillsync.auth.mapper.UserMapper;
import com.skillsync.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {
    private final AuthService authService;
    private final UserMapper userMapper;

    public AuthController(AuthService authService, UserMapper userMapper) {
        this.authService = authService;
        this.userMapper = userMapper;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user or mentor")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        return authService.register(request, http.getRemoteAddr());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        return authService.login(request, http.getRemoteAddr());
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @PostMapping("/logout")
    public void logout(@AuthenticationPrincipal User user) {
        if (user == null) {
            return;
        }
        authService.logout(user);
    }

    @PostMapping("/forgot-password")
    public void forgot(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public void reset(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @PostMapping("/verify-email")
    public void verify(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userMapper.toResponse(user);
    }
}
