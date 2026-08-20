package com.skillsync.matching.service;

import com.skillsync.matching.domain.Skill;
import com.skillsync.matching.dto.MatchingDtos.SkillRequest;
import com.skillsync.matching.dto.MatchingDtos.SkillResponse;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.SkillRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SkillService {
    private final SkillRepository skills;

    public SkillService(SkillRepository skills) {
        this.skills = skills;
    }

    public List<SkillResponse> search(String q) {
        List<Skill> found = (q == null || q.isBlank())
                ? skills.findAll()
                : skills.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(q, q);
        return found.stream().map(this::toDto).toList();
    }

    @Transactional
    public SkillResponse create(SkillRequest request) {
        if (skills.existsByNameIgnoreCase(request.name())) {
            throw new ApiException(HttpStatus.CONFLICT, "Skill already exists");
        }
        Skill skill = new Skill();
        skill.setName(request.name());
        skill.setCategory(request.category());
        skill.setDescription(request.description());
        return toDto(skills.save(skill));
    }

    @Transactional
    public SkillResponse update(Long id, SkillRequest request) {
        Skill skill = skills.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Skill not found"));
        skill.setName(request.name());
        skill.setCategory(request.category());
        skill.setDescription(request.description());
        return toDto(skill);
    }

    @Transactional
    public void delete(Long id) {
        if (!skills.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Skill not found");
        }
        skills.deleteById(id);
    }

    private SkillResponse toDto(Skill s) {
        return new SkillResponse(s.getId(), s.getName(), s.getCategory(), s.getDescription());
    }
}
