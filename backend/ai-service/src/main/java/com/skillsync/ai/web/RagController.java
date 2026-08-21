package com.skillsync.ai.web;

import com.skillsync.ai.dto.DocumentUploadResponse;
import com.skillsync.ai.dto.RAGRequest;
import com.skillsync.ai.dto.RAGResponse;
import com.skillsync.ai.domain.RagDocumentStatus;
import com.skillsync.ai.security.AuthPrincipal;
import com.skillsync.ai.service.RagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@Tag(name = "RAG")
public class RagController {
    private static final Logger log = LoggerFactory.getLogger(RagController.class);

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/documents")
    public DocumentUploadResponse upload(@AuthenticationPrincipal AuthPrincipal user, @RequestParam("file") MultipartFile file) {
        log.info("RAG upload user={} file={}", user.userId(), file.getOriginalFilename());
        return toUpload(ragService.ingest(user.userId(), file));
    }

    @GetMapping("/documents")
    public List<Map<String, Object>> docs(@AuthenticationPrincipal AuthPrincipal user) {
        return ragService.list(user.userId()).stream()
                .map(d -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", d.getId());
                    row.put("filename", d.getFilename());
                    row.put("status", d.getStatus() == null ? "PROCESSED" : d.getStatus().name());
                    boolean processed = d.getStatus() == RagDocumentStatus.PROCESSED;
                    row.put("chunks", d.getChunkCount());
                    row.put("embeddings", processed ? d.getChunkCount() : 0);
                    row.put("fileSizeBytes", d.getFileSizeBytes());
                    row.put("createdAt", d.getCreatedAt());
                    row.put("processedAt", d.getProcessedAt());
                    row.put("errorMessage", d.getErrorMessage() == null ? "" : d.getErrorMessage());
                    return row;
                })
                .toList();
    }

    @DeleteMapping("/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthPrincipal user, @PathVariable Long id) {
        log.info("RAG delete user={} doc={}", user.userId(), id);
        ragService.delete(user.userId(), id);
    }

    @PostMapping("/chat")
    public RAGResponse ask(@AuthenticationPrincipal AuthPrincipal user, @Valid @RequestBody RAGRequest body) {
        log.info("RAG ask user={} session={}", user.userId(), body.sessionId());
        return ChatController.toRag(ragService.ask(user.userId(), body.sessionId(), body.question()));
    }

    static DocumentUploadResponse toUpload(Map<String, Object> body) {
        return new DocumentUploadResponse(
                ((Number) body.get("documentId")).longValue(),
                String.valueOf(body.get("filename")),
                ((Number) body.get("chunks")).intValue(),
                ((Number) body.get("embeddings")).intValue(),
                String.valueOf(body.get("status")));
    }
}
