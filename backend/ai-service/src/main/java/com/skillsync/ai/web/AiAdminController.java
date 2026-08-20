package com.skillsync.ai.web;

import com.skillsync.ai.repository.AiUsageRepository;
import com.skillsync.ai.repository.ChatSessionRepository;
import com.skillsync.ai.repository.RagDocumentRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AiAdminController {
    private final AiUsageRepository usage;
    private final ChatSessionRepository sessions;
    private final RagDocumentRepository documents;

    public AiAdminController(AiUsageRepository usage, ChatSessionRepository sessions, RagDocumentRepository documents) {
        this.usage = usage;
        this.sessions = sessions;
        this.documents = documents;
    }

    @GetMapping("/ai-stats")
    public Map<String, Object> stats() {
        return Map.of(
                "chatCalls", usage.countByKind("chat"),
                "sessions", sessions.count(),
                "documents", documents.count()
        );
    }
}
