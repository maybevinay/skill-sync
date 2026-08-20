package com.skillsync.auth.service;

import com.skillsync.auth.domain.AuditLog;
import com.skillsync.auth.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(Long actorId, String action, String details, String ip) {
        AuditLog log = new AuditLog();
        log.setActorId(actorId);
        log.setAction(action);
        log.setDetails(details);
        log.setIpAddress(ip);
        repository.save(log);
    }
}
