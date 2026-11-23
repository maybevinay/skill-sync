package com.skillsync.auth.web;

import com.skillsync.auth.domain.AuditLog;
import com.skillsync.auth.domain.User;
import com.skillsync.auth.dto.UpdateRoleRequest;
import com.skillsync.auth.dto.UserResponse;
import com.skillsync.auth.repository.AuditLogRepository;
import com.skillsync.auth.service.UserAdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Users")
public class AdminController {
    private final UserAdminService userAdminService;
    private final AuditLogRepository auditLogs;

    public AdminController(UserAdminService userAdminService, AuditLogRepository auditLogs) {
        this.userAdminService = userAdminService;
        this.auditLogs = auditLogs;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userAdminService.listUsers();
    }

    @PatchMapping("/users/{id}/role")
    public UserResponse role(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request,
                             @AuthenticationPrincipal User actor) {
        return userAdminService.updateRole(id, request, actor.getId());
    }

    @PatchMapping("/users/{id}/enabled")
    public UserResponse enabled(@PathVariable Long id, @RequestParam boolean enabled,
                                @AuthenticationPrincipal User actor) {
        return userAdminService.setEnabled(id, enabled, actor.getId());
    }

    @GetMapping("/stats")
    public Map<String, Long> stats() {
        return userAdminService.stats();
    }

    @GetMapping("/audit-logs")
    public Page<AuditLog> audit(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "20") int size) {
        return auditLogs.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}
