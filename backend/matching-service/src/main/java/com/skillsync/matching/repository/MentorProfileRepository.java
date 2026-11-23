package com.skillsync.matching.repository;

import com.skillsync.matching.domain.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByProfileUserId(Long userId);
    List<MentorProfile> findByAcceptingTrue();

    @Query("""
            select m from MentorProfile m join m.profile p
            where m.accepting = true
              and (:country is null or p.country = :country)
              and (:minRating is null or m.rating >= :minRating)
              and (:minExp is null or p.experienceYears >= :minExp)
            """)
    List<MentorProfile> search(String country, java.math.BigDecimal minRating, Integer minExp);
}
