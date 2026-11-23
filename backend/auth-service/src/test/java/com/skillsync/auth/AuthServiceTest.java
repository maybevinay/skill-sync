package com.skillsync.auth;

import com.skillsync.auth.domain.Role;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.LoginRequest;
import com.skillsync.auth.dto.RegisterRequest;
import com.skillsync.auth.dto.UpdateProfileRequest;
import com.skillsync.auth.exception.ApiException;
import com.skillsync.auth.mapper.UserMapper;
import com.skillsync.auth.repository.EmailVerificationTokenRepository;
import com.skillsync.auth.repository.PasswordResetTokenRepository;
import com.skillsync.auth.repository.RefreshTokenRepository;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.security.JwtService;
import com.skillsync.auth.service.AuditService;
import com.skillsync.auth.service.AuthService;
import com.skillsync.auth.service.MailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository users;
    @Mock RefreshTokenRepository refreshTokens;
    @Mock PasswordResetTokenRepository resetTokens;
    @Mock EmailVerificationTokenRepository verifyTokens;
    @Mock JwtService jwtService;
    @Mock MailService mailService;
    @Mock AuditService auditService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(users, refreshTokens, resetTokens, verifyTokens,
                encoder, jwtService, new UserMapper(), mailService, auditService);
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(users.existsByEmailIgnoreCase("dup@skillsync.dev")).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class, () -> authService.register(
                new RegisterRequest("Dup", "dup@skillsync.dev", "Password1!", Role.USER), "127.0.0.1"));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void registerCoercesAdminRoleToUser() {
        when(users.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(9L);
            return u;
        });
        when(verifyTokens.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(refreshTokens.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(any())).thenReturn("access");
        when(jwtService.getRefreshExpirationMs()).thenReturn(1_000L);
        when(jwtService.getAccessExpirationMs()).thenReturn(900L);

        var response = authService.register(
                new RegisterRequest("Ad", "ad@skillsync.dev", "Password1!", Role.ADMIN), "127.0.0.1");
        assertEquals(Role.USER, response.user().role());
    }

    @Test
    void loginRejectsUnknownEmail() {
        when(users.findByEmailIgnoreCase("missing@skillsync.dev")).thenReturn(Optional.empty());
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("missing@skillsync.dev", "x"), "127.0.0.1"));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void loginRejectsDisabledAccount() {
        User user = user(1L, "Uma", "user@skillsync.dev", Role.USER, "User@12345");
        user.setEnabled(false);
        when(users.findByEmailIgnoreCase("user@skillsync.dev")).thenReturn(Optional.of(user));
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(new LoginRequest("user@skillsync.dev", "User@12345"), "127.0.0.1"));
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    void loginSucceedsForEnabledUser() {
        User user = user(1L, "Uma", "user@skillsync.dev", Role.USER, "User@12345");
        when(users.findByEmailIgnoreCase("user@skillsync.dev")).thenReturn(Optional.of(user));
        when(refreshTokens.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateAccessToken(user)).thenReturn("access");
        when(jwtService.getRefreshExpirationMs()).thenReturn(1_000L);
        when(jwtService.getAccessExpirationMs()).thenReturn(900L);

        var response = authService.login(new LoginRequest("user@skillsync.dev", "User@12345"), "127.0.0.1");
        assertEquals("access", response.accessToken());
        assertEquals("user@skillsync.dev", response.user().email());
        verify(auditService).record(1L, "LOGIN", "Successful login", "127.0.0.1");
    }

    @Test
    void updateMeReloadsManagedUser() {
        User detached = user(1L, "Old Name", "user@skillsync.dev", Role.USER, "User@12345");
        User managed = user(1L, "Old Name", "user@skillsync.dev", Role.USER, "User@12345");
        when(users.findById(1L)).thenReturn(Optional.of(managed));

        var response = authService.updateMe(detached, new UpdateProfileRequest("New Name"));
        assertEquals("New Name", response.fullName());
        assertEquals("New Name", managed.getFullName());
        verify(users).findById(1L);
    }

    @Test
    void sha256IsDeterministic() {
        assertThrows(IllegalStateException.class, () -> AuthService.sha256(null));
        assertEquals(AuthService.sha256("abc"), AuthService.sha256("abc"));
    }

    private User user(Long id, String name, String email, Role role, String rawPassword) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(email);
        user.setRole(role);
        user.setEnabled(true);
        user.setPasswordHash(encoder.encode(rawPassword));
        return user;
    }
}
