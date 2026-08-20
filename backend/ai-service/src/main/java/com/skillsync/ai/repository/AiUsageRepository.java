package com.skillsync.ai.repository;

import com.skillsync.ai.domain.AiUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiUsageRepository extends JpaRepository<AiUsage, Long> {
    long countByKind(String kind);
}
