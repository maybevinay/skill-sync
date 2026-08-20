package com.skillsync.ai.web;

import com.skillsync.ai.security.AuthPrincipal;
import com.skillsync.ai.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "AI Chat")
public class ChatController {
    public record ChatRequest(Long sessionId, String message, boolean regenerate) {}
    public record SessionView(Long id, String title, java.time.Instant updatedAt) {}

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public Map<String, Object> chat(@AuthenticationPrincipal AuthPrincipal user, @RequestBody ChatRequest request) {
        return chatService.chat(user.userId(), request.sessionId(), request.message(), request.regenerate());
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal AuthPrincipal user, @RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        Thread.startVirtualThread(() -> {
            try {
                String full = chatService.completeOnly(user.userId(), request.sessionId(), request.message());
                for (String token : full.split("(?<=\\s)")) {
                    emitter.send(SseEmitter.event().data(token));
                    Thread.sleep(12);
                }
                emitter.complete();
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        });
        return emitter;
    }

    @GetMapping("/chat/sessions")
    public List<SessionView> sessions(@AuthenticationPrincipal AuthPrincipal user) {
        return chatService.list(user.userId()).stream()
                .map(s -> new SessionView(s.getId(), s.getTitle(), s.getUpdatedAt()))
                .toList();
    }

    @GetMapping("/chat/sessions/{id}")
    public Map<String, Object> session(@AuthenticationPrincipal AuthPrincipal user, @PathVariable Long id) {
        return chatService.sessionView(user.userId(), id);
    }
}
