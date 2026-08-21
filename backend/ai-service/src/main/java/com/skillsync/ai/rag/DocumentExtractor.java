package com.skillsync.ai.rag;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.Locale;

public final class DocumentExtractor {
    private DocumentExtractor() {}

    public static String extract(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }
        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String filename = Path.of(original).getFileName().toString();
        if (!TextChunker.allowedFilename(filename)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Supported types: PDF, TXT, Markdown, HTML");
        }
        String lower = filename.toLowerCase(Locale.ROOT);
        String type = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf") || type.contains("pdf")) {
            try (PDDocument pdf = Loader.loadPDF(file.getBytes())) {
                return TextChunker.normalize(new PDFTextStripper().getText(pdf));
            }
        }
        String raw = new String(file.getBytes(), StandardCharsets.UTF_8);
        if (lower.endsWith(".html") || lower.endsWith(".htm") || type.contains("html")) {
            return TextChunker.stripHtml(raw);
        }
        return TextChunker.normalize(raw);
    }

    public static String safeFilename(MultipartFile file) {
        String original = file.getOriginalFilename() == null ? "upload.txt" : file.getOriginalFilename();
        String name = Path.of(original).getFileName().toString();
        return name.isBlank() ? "upload.txt" : name;
    }
}
