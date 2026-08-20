package com.skillsync.matching;

import com.skillsync.matching.dto.MatchingDtos.SkillRequest;
import com.skillsync.matching.exception.GlobalExceptionHandler.ApiException;
import com.skillsync.matching.repository.SkillRepository;
import com.skillsync.matching.service.SkillService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillServiceTest {
    @Mock SkillRepository skills;
    @InjectMocks SkillService skillService;

    @Test
    void createRejectsDuplicateName() {
        when(skills.existsByNameIgnoreCase("Java")).thenReturn(true);
        ApiException ex = assertThrows(ApiException.class,
                () -> skillService.create(new SkillRequest("Java", "Backend", "Language")));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
    }

    @Test
    void deleteMissingSkillIsNotFound() {
        when(skills.existsById(99L)).thenReturn(false);
        ApiException ex = assertThrows(ApiException.class, () -> skillService.delete(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
