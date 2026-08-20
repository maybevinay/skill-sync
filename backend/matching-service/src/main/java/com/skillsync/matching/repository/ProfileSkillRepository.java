package com.skillsync.matching.repository;

import com.skillsync.matching.domain.ProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileSkillRepository extends JpaRepository<ProfileSkill, Long> {
    Optional<ProfileSkill> findByProfileIdAndSkillId(Long profileId, Long skillId);
    void deleteByProfileIdAndSkillId(Long profileId, Long skillId);
}
