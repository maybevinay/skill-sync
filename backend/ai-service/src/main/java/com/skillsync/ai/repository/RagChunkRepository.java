package com.skillsync.ai.repository;

import com.skillsync.ai.domain.RagChunk;
import com.skillsync.ai.domain.RagDocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RagChunkRepository extends JpaRepository<RagChunk, Long> {
    @Query("select c from RagChunk c join fetch c.document d where d.userId = :userId and d.status = :status")
    List<RagChunk> findAllByUserIdAndStatus(@Param("userId") Long userId, @Param("status") RagDocumentStatus status);
}
