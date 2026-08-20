package com.skillsync.ai;

import com.skillsync.ai.repository.AiUsageRepository;
import com.skillsync.ai.repository.ChatMessageRepository;
import com.skillsync.ai.repository.ChatSessionRepository;
import com.skillsync.ai.service.ChatService;
import com.skillsync.ai.service.LlmGateway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {
    @Mock ChatSessionRepository sessions;
    @Mock ChatMessageRepository messages;
    @Mock AiUsageRepository usage;
    @Mock LlmGateway llm;
    @InjectMocks ChatService chatService;

    @Test
    void getRejectsSessionOwnedBySomeoneElse() {
        when(sessions.findByIdAndUserId(9L, 1L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> chatService.get(1L, 9L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void blankMessageIsRejected() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chatService.chat(1L, null, "   ", false));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void nullMessageIsRejected() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chatService.chat(1L, null, null, false));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }
}
