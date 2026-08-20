package com.skillsync.ai.service;

import com.skillsync.ai.domain.RagChunk;
import com.skillsync.ai.domain.RagDocument;
import com.skillsync.ai.rag.VectorMath;
import com.skillsync.ai.repository.RagChunkRepository;
import com.skillsync.ai.repository.RagDocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class RagService {
    private final RagDocumentRepository documents;
    private final RagChunkRepository chunks;
    private final LlmGateway llm;
    private final ChatService chatService;

    public RagService(RagDocumentRepository documents, RagChunkRepository chunks, LlmGateway llm, ChatService chatService) {
        this.documents = documents;
        this.chunks = chunks;
        this.llm = llm;
        this.chatService = chatService;
    }

    @Transactional
    public Map<String, Object> ingest(Long userId, MultipartFile file) throws IOException {
        String text = extract(file);
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No text extracted");
        }
        RagDocument doc = new RagDocument();
        doc.setUserId(userId);
        doc.setFilename(file.getOriginalFilename() == null ? "upload.txt" : file.getOriginalFilename());
        doc.setContentType(file.getContentType() == null ? "text/plain" : file.getContentType());
        documents.save(doc);
        List<String> parts = chunk(text, 800, 120);
        int i = 0;
        for (String part : parts) {
            RagChunk chunk = new RagChunk();
            chunk.setDocument(doc);
            chunk.setChunkIndex(i++);
            chunk.setContent(part);
            chunk.setEmbedding(VectorMath.toJson(llm.embed(part)));
            chunks.save(chunk);
        }
        return Map.of("documentId", doc.getId(), "filename", doc.getFilename(), "chunks", parts.size());
    }

    public List<RagDocument> list(Long userId) {
        return documents.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Map<String, Object> ask(Long userId, Long sessionId, String question) {
        double[] q = llm.embed(question);
        List<RagChunk> ranked = chunks.findAllByUserId(userId).stream()
                .map(c -> Map.entry(c, VectorMath.cosine(q, VectorMath.fromJson(c.getEmbedding()))))
                .sorted(Comparator.<Map.Entry<RagChunk, Double>>comparingDouble(Map.Entry::getValue).reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .toList();
        String context = ranked.isEmpty()
                ? "No documents uploaded yet."
                : ranked.stream().map(RagChunk::getContent).reduce("", (a, b) -> a + "\n---\n" + b);
        String prompt = "Use only the context to answer. If missing, say you don't know.\n\nContext:\n" + context + "\n\nQuestion: " + question;
        return chatService.chat(userId, sessionId, prompt, false);
    }

    private String extract(MultipartFile file) throws IOException {
        String name = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        if (name.endsWith(".pdf") || "application/pdf".equals(file.getContentType())) {
            try (PDDocument pdf = Loader.loadPDF(file.getBytes())) {
                return new PDFTextStripper().getText(pdf);
            }
        }
        return new String(file.getBytes(), StandardCharsets.UTF_8);
    }

    public static List<String> chunk(String text, int size, int overlap) {
        String cleaned = text.replaceAll("\\s+", " ").trim();
        List<String> out = new ArrayList<>();
        int i = 0;
        while (i < cleaned.length()) {
            int end = Math.min(cleaned.length(), i + size);
            out.add(cleaned.substring(i, end));
            i += Math.max(1, size - overlap);
        }
        return out;
    }
}
