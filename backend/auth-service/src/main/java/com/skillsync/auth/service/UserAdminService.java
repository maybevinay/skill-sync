package com.skillsync.auth.service;

import com.skillsync.auth.domain.Role;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.UpdateRoleRequest;
import com.skillsync.auth.dto.UserResponse;
import com.skillsync.auth.exception.ApiException;
import com.skillsync.auth.mapper.UserMapper;
import com.skillsync.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class UserAdminService {
    private final UserRepository users;
    private final UserMapper mapper;
    private final AuditService auditService;

    public UserAdminService(UserRepository users, UserMapper mapper, AuditService auditService) {
        this.users = users;
        this.mapper = mapper;
        this.auditService = auditService;
    }

    public List<UserResponse> listUsers() {
        return users.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public UserResponse updateRole(Long id, UpdateRoleRequest request, Long actorId) {
        User user = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setRole(request.role());
        auditService.record(actorId, "UPDATE_ROLE", "User " + id + " -> " + request.role(), null);
        return mapper.toResponse(user);
    }

    @Transactional
    public UserResponse setEnabled(Long id, boolean enabled, Long actorId) {
        User user = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        user.setEnabled(enabled);
        auditService.record(actorId, enabled ? "ENABLE_USER" : "DISABLE_USER", "User " + id, null);
        return mapper.toResponse(user);
    }

    public Map<String, Long> stats() {
        return Map.of(
                "total", users.count(),
                "users", users.countByRole(Role.USER),
                "mentors", users.countByRole(Role.MENTOR),
                "admins", users.countByRole(Role.ADMIN)
        );
    }
}
