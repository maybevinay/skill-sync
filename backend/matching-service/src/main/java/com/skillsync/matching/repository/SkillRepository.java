package com.skillsync.matching.repository;

import com.skillsync.matching.domain.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {
    List<Skill> findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(String name, String category);
    boolean existsByNameIgnoreCase(String name);
}
