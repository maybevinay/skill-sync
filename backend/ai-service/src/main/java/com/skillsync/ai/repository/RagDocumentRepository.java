package com.skillsync.ai.repository;

import com.skillsync.ai.domain.RagDocument;
import com.skillsync.ai.domain.RagDocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {
    List<RagDocument> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<RagDocument> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndStatus(Long userId, RagDocumentStatus status);
}
