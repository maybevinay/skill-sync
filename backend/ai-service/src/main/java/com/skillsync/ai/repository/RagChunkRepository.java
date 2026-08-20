package com.skillsync.ai.repository;

import com.skillsync.ai.domain.RagChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RagChunkRepository extends JpaRepository<RagChunk, Long> {
    @Query("select c from RagChunk c where c.document.userId = :userId")
    List<RagChunk> findAllByUserId(Long userId);
}
