package com.skillsync.matching.repository;

import com.skillsync.matching.domain.MatchRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRequestRepository extends JpaRepository<MatchRequest, Long> {
    List<MatchRequest> findByLearnerUserId(Long userId);
    List<MatchRequest> findByMentorProfileUserId(Long userId);
    long countByStatus(com.skillsync.matching.domain.RequestStatus status);
    boolean existsByLearnerUserIdAndMentorIdAndStatusIn(
            Long learnerUserId, Long mentorId, java.util.Collection<com.skillsync.matching.domain.RequestStatus> statuses);
}
