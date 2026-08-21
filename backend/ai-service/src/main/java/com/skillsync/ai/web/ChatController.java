package com.skillsync.ai.web;

import com.skillsync.ai.dto.ChatRequest;
import com.skillsync.ai.dto.ChatResponse;
import com.skillsync.ai.dto.RAGRequest;
import com.skillsync.ai.dto.RAGResponse;
import com.skillsync.ai.rag.GroundedPromptBuilder.Source;
import com.skillsync.ai.security.AuthPrincipal;
import com.skillsync.ai.service.ChatService;
import com.skillsync.ai.service.RagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    public record SessionView(Long id, String title, java.time.Instant updatedAt) {}

    private final ChatService chatService;
    private final RagService ragService;

    public ChatController(ChatService chatService, RagService ragService) {
        this.chatService = chatService;
        this.ragService = ragService;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody ChatRequest request) {
        log.info("Chat user={} session={}", user.userId(), request.sessionId());
        return toChat(chatService.chat(user.userId(), request.sessionId(), request.message(), request.regenerate()));
    }

    @PostMapping("/chat/rag")
    public RAGResponse ragChat(@AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody RAGRequest request) {
        log.info("RAG chat user={} session={}", user.userId(), request.sessionId());
        return toRag(ragService.ask(user.userId(), request.sessionId(), request.question()));
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(120_000L);
        Thread.startVirtualThread(() -> {
            try {
                String full = String.valueOf(chatService.chat(
                        user.userId(), request.sessionId(), request.message(), false).get("content"));
                for (String token : full.split("(?<=\\s)")) {
                    emitter.send(SseEmitter.event().data(token));
                    Thread.sleep(12);
                }
                emitter.complete();
            } catch (Exception ex) {
                String msg = ex.getMessage() == null || ex.getMessage().isBlank()
                        ? "The assistant is unavailable right now. Please try again."
                        : ex.getMessage();
                try {
                    emitter.send(SseEmitter.event().data(msg));
                    emitter.complete();
                } catch (Exception ignored) {
                    emitter.completeWithError(ex);
                }
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

    static ChatResponse toChat(Map<String, Object> body) {
        return new ChatResponse(
                ((Number) body.get("sessionId")).longValue(),
                String.valueOf(body.get("content")),
                String.valueOf(body.get("role")));
    }

    @SuppressWarnings("unchecked")
    static RAGResponse toRag(Map<String, Object> body) {
        boolean grounded = Boolean.TRUE.equals(body.get("grounded"));
        Object reason = body.get("retrievalReason");
        return new RAGResponse(
                ((Number) body.get("sessionId")).longValue(),
                String.valueOf(body.get("content")),
                String.valueOf(body.get("role")),
                grounded,
                ((Number) body.get("retrievedCount")).intValue(),
                (List<Source>) body.get("sources"),
                reason == null ? (grounded ? "OK" : "NO_MATCH") : String.valueOf(reason));
    }
}
