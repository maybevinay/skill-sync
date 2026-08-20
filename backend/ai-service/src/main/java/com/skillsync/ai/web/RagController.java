package com.skillsync.ai.web;

import com.skillsync.ai.security.AuthPrincipal;
import com.skillsync.ai.service.RagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@Tag(name = "RAG")
public class RagController {
    public record RagAsk(Long sessionId, String question) {}

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/documents")
    public Map<String, Object> upload(@AuthenticationPrincipal AuthPrincipal user, @RequestParam("file") MultipartFile file)
            throws IOException {
        return ragService.ingest(user.userId(), file);
    }

    @GetMapping("/documents")
    public List<Map<String, Object>> docs(@AuthenticationPrincipal AuthPrincipal user) {
        return ragService.list(user.userId()).stream()
                .map(d -> Map.<String, Object>of("id", d.getId(), "filename", d.getFilename(), "createdAt", d.getCreatedAt()))
                .toList();
    }

    @PostMapping("/chat")
    public Map<String, Object> ask(@AuthenticationPrincipal AuthPrincipal user, @RequestBody RagAsk body) {
        return ragService.ask(user.userId(), body.sessionId(), body.question());
    }
}
