package com.skillsync.ai.service;

import com.skillsync.ai.config.RagProperties;
import com.skillsync.ai.domain.RagChunk;
import com.skillsync.ai.domain.RagDocument;
import com.skillsync.ai.domain.RagDocumentStatus;
import com.skillsync.ai.exception.GeminiApiException;
import com.skillsync.ai.rag.AiPrompts;
import com.skillsync.ai.rag.DocumentExtractor;
import com.skillsync.ai.rag.GroundedPromptBuilder;
import com.skillsync.ai.rag.RetrievedChunk;
import com.skillsync.ai.rag.TextChunker;
import com.skillsync.ai.rag.VectorMath;
import com.skillsync.ai.repository.RagChunkRepository;
import com.skillsync.ai.repository.RagDocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RagService {
    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final RagDocumentRepository documents;
    private final RagChunkRepository chunks;
    private final LlmGateway llm;
    private final ChatService chatService;
    private final ChunkSearchService search;
    private final RagProperties properties;
    private final JdbcTemplate jdbc;
    private final PgVectorInitializer pgVector;
    private final TransactionTemplate tx;

    public RagService(RagDocumentRepository documents, RagChunkRepository chunks, LlmGateway llm,
                      ChatService chatService, ChunkSearchService search, RagProperties properties,
                      JdbcTemplate jdbc, PgVectorInitializer pgVector, PlatformTransactionManager txManager) {
        this.documents = documents;
        this.chunks = chunks;
        this.llm = llm;
        this.chatService = chatService;
        this.search = search;
        this.properties = properties;
        this.jdbc = jdbc;
        this.pgVector = pgVector;
        this.tx = new TransactionTemplate(txManager);
    }

    public Map<String, Object> ingest(Long userId, MultipartFile file) {
        String filename = DocumentExtractor.safeFilename(file);
        String text;
        try {
            text = DocumentExtractor.extract(file);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (IOException ex) {
            log.warn("RAG extract failed file={}: {}", filename, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Text extraction failed. Use a readable PDF, TXT, or Markdown file.");
        }
        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Empty document. Choose a PDF, TXT, or Markdown file that contains text.");
        }
        List<String> parts = chunk(text, properties.getChunkSize(), properties.getChunkOverlap());
        if (parts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Empty document. Choose a PDF, TXT, or Markdown file that contains text.");
        }
        if (parts.size() > properties.getMaxChunksPerDocument()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Document is too large (max " + properties.getMaxChunksPerDocument() + " chunks). Split the file.");
        }
        log.info("RAG extract user={} file={} chars={} chunks={}", userId, filename, text.length(), parts.size());

        RagDocument doc = createProcessing(userId, file, filename);
        if (doc == null || doc.getId() == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Document processing failed.");
        }
        try {
            List<double[]> vectors = embedParts(parts);
            persistProcessed(doc.getId(), parts, vectors);
            log.info("RAG stored user={} doc={} chunks={} embeddings={} dim={} pgvector={}",
                    userId, doc.getId(), parts.size(), vectors.size(), properties.getEmbeddingDimensions(), pgVector.isReady());
            return Map.of(
                    "documentId", doc.getId(),
                    "filename", filename,
                    "chunks", parts.size(),
                    "embeddings", vectors.size(),
                    "status", RagDocumentStatus.PROCESSED.name());
        } catch (RuntimeException ex) {
            markFailed(doc.getId(), userMessage(ex));
            throw asStatus(ex);
        }
    }

    public List<RagDocument> list(Long userId) {
        return documents.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void delete(Long userId, Long documentId) {
        RagDocument doc = documents.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
        tx.executeWithoutResult(status -> documents.delete(doc));
        log.info("RAG delete user={} doc={}", userId, documentId);
    }

    public Map<String, Object> ask(Long userId, Long sessionId, String question) {
        if (question == null || question.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question is required");
        }
        if (question.length() > properties.getMaxQueryChars()) {
            question = question.substring(0, properties.getMaxQueryChars());
        }
        long processed = documents.countByUserIdAndStatus(userId, RagDocumentStatus.PROCESSED);
        if (processed == 0) {
            Map<String, Object> chat = chatService.appendTurn(userId, sessionId, question, AiPrompts.noDocuments());
            Map<String, Object> body = new HashMap<>(chat);
            body.put("grounded", false);
            body.put("retrievedCount", 0);
            body.put("sources", List.of());
            body.put("retrievalReason", "NO_DOCUMENTS");
            return body;
        }
        double[] q = llm.embedQuery(question);
        log.info("RAG query user={} dim={} pgvector={}", userId, q.length, pgVector.isReady());
        if (q.length != properties.getEmbeddingDimensions()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Query embedding dimension " + q.length + " does not match stored vectors ("
                            + properties.getEmbeddingDimensions() + ").");
        }
        List<RetrievedChunk> ranked = search.search(userId, q);
        boolean grounded = !ranked.isEmpty();
        log.info("RAG retrieve user={} hits={} topScore={}", userId, ranked.size(),
                grounded ? ranked.getFirst().score() : 0);
        Map<String, Object> chat;
        if (!grounded) {
            chat = chatService.appendTurn(userId, sessionId, question, AiPrompts.insufficientContext());
        } else {
            String llmUser = GroundedPromptBuilder.buildUserMessage(question, ranked);
            chat = chatService.complete(userId, sessionId, question, llmUser, AiPrompts.RAG_SYSTEM, false);
        }
        Map<String, Object> body = new HashMap<>(chat);
        body.put("grounded", grounded);
        body.put("retrievedCount", ranked.size());
        body.put("sources", GroundedPromptBuilder.toSources(ranked));
        body.put("retrievalReason", grounded ? "OK" : "NO_MATCH");
        return body;
    }

    public static List<String> chunk(String text, int size, int overlap) {
        return TextChunker.chunk(text, size, overlap);
    }

    private List<double[]> embedParts(List<String> parts) {
        int dims = properties.getEmbeddingDimensions();
        List<double[]> vectors = new ArrayList<>(parts.size());
        for (int i = 0; i < parts.size(); i++) {
            double[] vector = llm.embed(parts.get(i));
            if (vector == null || vector.length != dims) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Embedding dimension " + (vector == null ? 0 : vector.length)
                                + " does not match configured " + dims + ".");
            }
            vectors.add(vector);
        }
        return vectors;
    }

    private RagDocument createProcessing(Long userId, MultipartFile file, String filename) {
        return tx.execute(status -> {
            RagDocument doc = new RagDocument();
            doc.setUserId(userId);
            doc.setFilename(filename);
            doc.setContentType(file.getContentType() == null ? "text/plain" : file.getContentType());
            doc.setStatus(RagDocumentStatus.PROCESSING);
            doc.setChunkCount(0);
            doc.setFileSizeBytes(Math.max(0L, file.getSize()));
            RagDocument created = documents.saveAndFlush(doc);
            if (created.getId() == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Document processing failed.");
            }
            return created;
        });
    }

    private void persistProcessed(Long documentId, List<String> parts, List<double[]> vectors) {
        tx.executeWithoutResult(status -> {
            for (int i = 0; i < parts.size(); i++) {
                insertChunk(documentId, i, parts.get(i), vectors.get(i));
            }
            RagDocument attached = documents.findById(documentId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found"));
            attached.setStatus(RagDocumentStatus.PROCESSED);
            attached.setChunkCount(parts.size());
            attached.setErrorMessage(null);
            attached.setProcessedAt(Instant.now());
            documents.save(attached);
        });
    }

    private void insertChunk(Long documentId, int index, String content, double[] embedding) {
        String literal = VectorMath.toPgLiteral(embedding);
        if (pgVector.isReady()) {
            jdbc.update("""
                    INSERT INTO rag_chunks (document_id, chunk_index, content, embedding)
                    VALUES (?, ?, ?, CAST(? AS vector))
                    """, documentId, index, content, literal);
            return;
        }
        RagDocument doc = documents.getReferenceById(documentId);
        RagChunk chunk = new RagChunk();
        chunk.setDocument(doc);
        chunk.setChunkIndex(index);
        chunk.setContent(content);
        chunk.setEmbedding(literal);
        chunks.save(chunk);
    }

    private void markFailed(Long documentId, String message) {
        tx.executeWithoutResult(status -> documents.findById(documentId).ifPresent(doc -> {
            doc.setStatus(RagDocumentStatus.FAILED);
            doc.setErrorMessage(message.length() > 400 ? message.substring(0, 400) : message);
            documents.save(doc);
        }));
    }

    private static ResponseStatusException asStatus(RuntimeException ex) {
        if (ex instanceof ResponseStatusException status) {
            return status;
        }
        if (ex instanceof GeminiApiException gemini) {
            return new ResponseStatusException(gemini.getStatus(), gemini.getMessage());
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, userMessage(ex));
    }

    private static String userMessage(Throwable ex) {
        String raw = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
        if (ex instanceof ResponseStatusException status && status.getReason() != null) {
            return status.getReason();
        }
        if (ex instanceof GeminiApiException gemini) {
            return gemini.getMessage();
        }
        if (raw.contains("vector") && raw.contains("character varying")) {
            return "Could not store embeddings in pgvector. Restart ai-service after the embedding column is vector type.";
        }
        if (raw.contains("vector") || raw.contains("pgvector") || raw.contains("type modifier")) {
            return "pgvector/database failure while storing embeddings. Confirm the vector extension is installed.";
        }
        if (raw.contains("embed")) {
            return "Embedding API failure. Confirm GEMINI_API_KEY and the embedding model.";
        }
        return "Document processing failed.";
    }
}
