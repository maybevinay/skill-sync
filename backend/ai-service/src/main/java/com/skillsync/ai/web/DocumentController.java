package com.skillsync.ai.web;

import com.skillsync.ai.dto.DocumentUploadResponse;
import com.skillsync.ai.security.AuthPrincipal;
import com.skillsync.ai.service.RagService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents")
public class DocumentController {
    private static final Logger log = LoggerFactory.getLogger(DocumentController.class);
    private final RagService ragService;

    public DocumentController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/upload")
    public DocumentUploadResponse upload(@AuthenticationPrincipal AuthPrincipal user, @RequestParam("file") MultipartFile file) {
        log.info("Document upload user={} file={}", user.userId(), file.getOriginalFilename());
        return RagController.toUpload(ragService.ingest(user.userId(), file));
    }
}
