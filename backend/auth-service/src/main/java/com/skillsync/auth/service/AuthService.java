package com.skillsync.auth.service;

import com.skillsync.auth.domain.EmailVerificationToken;
import com.skillsync.auth.domain.PasswordResetToken;
import com.skillsync.auth.domain.RefreshToken;
import com.skillsync.auth.domain.Role;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.dto.ForgotPasswordRequest;
import com.skillsync.auth.dto.LoginRequest;
import com.skillsync.auth.dto.RegisterRequest;
import com.skillsync.auth.dto.ResetPasswordRequest;
import com.skillsync.auth.dto.UpdateProfileRequest;
import com.skillsync.auth.dto.UserResponse;
import com.skillsync.auth.dto.VerifyEmailRequest;
import com.skillsync.auth.exception.ApiException;
import com.skillsync.auth.mapper.UserMapper;
import com.skillsync.auth.repository.EmailVerificationTokenRepository;
import com.skillsync.auth.repository.PasswordResetTokenRepository;
import com.skillsync.auth.repository.RefreshTokenRepository;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
public class AuthService {
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final EmailVerificationTokenRepository verifyTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final MailService mailService;
    private final AuditService auditService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository users, RefreshTokenRepository refreshTokens,
                       PasswordResetTokenRepository resetTokens, EmailVerificationTokenRepository verifyTokens,
                       PasswordEncoder passwordEncoder, JwtService jwtService, UserMapper userMapper,
                       MailService mailService, AuditService auditService) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.resetTokens = resetTokens;
        this.verifyTokens = verifyTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.mailService = mailService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request, String ip) {
        if (users.existsByEmailIgnoreCase(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }
        Role role = request.role() == null || request.role() == Role.ADMIN ? Role.USER : request.role();
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setEnabled(true);
        user.setEmailVerified(false);
        users.save(user);

        String verifyRaw = randomToken();
        EmailVerificationToken verify = new EmailVerificationToken();
        verify.setUser(user);
        verify.setTokenHash(sha256(verifyRaw));
        verify.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
        verifyTokens.save(verify);
        mailService.sendVerification(user.getEmail(), verifyRaw);
        auditService.record(user.getId(), "REGISTER", "User registered as " + role, ip);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ip) {
        User user = users.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!user.isEnabled() || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        auditService.record(user.getId(), "LOGIN", "Successful login", ip);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        RefreshToken stored = refreshTokens.findByTokenHash(sha256(refreshToken))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        stored.setRevoked(true);
        return issueTokens(stored.getUser());
    }

    @Transactional
    public void logout(User user) {
        refreshTokens.revokeAllForUser(user.getId());
        auditService.record(user.getId(), "LOGOUT", "Tokens revoked", null);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        users.findByEmailIgnoreCase(request.email()).ifPresent(user -> {
            String raw = randomToken();
            PasswordResetToken token = new PasswordResetToken();
            token.setUser(user);
            token.setTokenHash(sha256(raw));
            token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
            resetTokens.save(token);
            mailService.sendPasswordReset(user.getEmail(), raw);
            auditService.record(user.getId(), "FORGOT_PASSWORD", "Reset token issued", null);
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = resetTokens.findByTokenHash(sha256(request.token()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid reset token"));
        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reset token expired");
        }
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        token.setUsed(true);
        refreshTokens.revokeAllForUser(user.getId());
        auditService.record(user.getId(), "RESET_PASSWORD", "Password updated", null);
    }

    @Transactional
    public UserResponse updateMe(User user, UpdateProfileRequest request) {
        User managed = users.findById(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        managed.setFullName(request.fullName().trim());
        auditService.record(managed.getId(), "UPDATE_PROFILE", "Display name updated", null);
        return userMapper.toResponse(managed);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        EmailVerificationToken token = verifyTokens.findByTokenHash(sha256(request.token()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid verification token"));
        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }
        token.getUser().setEmailVerified(true);
        token.setUsed(true);
    }

    private AuthResponse issueTokens(User user) {
        String access = jwtService.generateAccessToken(user);
        String refreshRaw = randomToken();
        RefreshToken refresh = new RefreshToken();
        refresh.setUser(user);
        refresh.setTokenHash(sha256(refreshRaw));
        refresh.setExpiresAt(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()));
        refreshTokens.save(refresh);
        return new AuthResponse(access, refreshRaw, "Bearer", jwtService.getAccessExpirationMs(), userMapper.toResponse(user));
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
