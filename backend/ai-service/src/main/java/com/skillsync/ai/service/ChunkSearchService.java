package com.skillsync.ai.service;

import com.skillsync.ai.config.RagProperties;
import com.skillsync.ai.domain.RagChunk;
import com.skillsync.ai.domain.RagDocumentStatus;
import com.skillsync.ai.rag.RetrievedChunk;
import com.skillsync.ai.rag.VectorMath;
import com.skillsync.ai.repository.RagChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ChunkSearchService {
    private static final Logger log = LoggerFactory.getLogger(ChunkSearchService.class);

    private final RagChunkRepository chunks;
    private final JdbcTemplate jdbc;
    private final RagProperties properties;
    private final PgVectorInitializer pgVector;

    public ChunkSearchService(RagChunkRepository chunks, JdbcTemplate jdbc,
                              RagProperties properties, PgVectorInitializer pgVector) {
        this.chunks = chunks;
        this.jdbc = jdbc;
        this.properties = properties;
        this.pgVector = pgVector;
    }

    @Transactional(readOnly = true)
    public List<RetrievedChunk> search(Long userId, double[] query) {
        if (pgVector.isReady()) {
            try {
                return pgSearch(userId, query);
            } catch (Exception ex) {
                log.warn("pgvector search failed, using in-process cosine: {}", ex.getMessage());
            }
        }
        return javaSearch(userId, query);
    }

    private List<RetrievedChunk> pgSearch(Long userId, double[] query) {
        String literal = VectorMath.toPgLiteral(query);
        String sql = """
                SELECT c.id, d.id AS document_id, d.filename, c.chunk_index, c.content,
                       (1 - (c.embedding <=> CAST(? AS vector))) AS score
                FROM rag_chunks c
                JOIN rag_documents d ON d.id = c.document_id
                WHERE d.user_id = ?
                  AND d.status = 'PROCESSED'
                  AND (1 - (c.embedding <=> CAST(? AS vector))) >= ?
                ORDER BY c.embedding <=> CAST(? AS vector)
                LIMIT ?
                """;
        List<RetrievedChunk> hits = jdbc.query(sql,
                (rs, rowNum) -> new RetrievedChunk(
                        rs.getLong("id"),
                        rs.getLong("document_id"),
                        rs.getString("filename"),
                        rs.getInt("chunk_index"),
                        rs.getString("content"),
                        rs.getDouble("score")),
                literal, userId, literal, properties.getMinSimilarity(), literal, properties.getTopK());
        Integer corpus = jdbc.queryForObject(
                """
                SELECT COUNT(*) FROM rag_chunks c
                JOIN rag_documents d ON d.id = c.document_id
                WHERE d.user_id = ? AND d.status = 'PROCESSED'
                """,
                Integer.class, userId);
        log.info("RAG pgvector user={} corpusChunks={} hits={} topK={} minSimilarity={}",
                userId, corpus, hits.size(), properties.getTopK(), properties.getMinSimilarity());
        return hits;
    }

    private List<RetrievedChunk> javaSearch(Long userId, double[] query) {
        List<RetrievedChunk> ranked = new ArrayList<>();
        for (RagChunk c : chunks.findAllByUserIdAndStatus(userId, RagDocumentStatus.PROCESSED)) {
            double[] stored;
            try {
                stored = VectorMath.fromJson(c.getEmbedding());
            } catch (RuntimeException ex) {
                continue;
            }
            double score = VectorMath.cosine(query, stored);
            if (score >= properties.getMinSimilarity()) {
                ranked.add(new RetrievedChunk(
                        c.getId(),
                        c.getDocument().getId(),
                        c.getDocument().getFilename(),
                        c.getChunkIndex(),
                        c.getContent(),
                        score));
            }
        }
        ranked.sort(Comparator.comparingDouble(RetrievedChunk::score).reversed());
        if (ranked.size() > properties.getTopK()) {
            return List.copyOf(ranked.subList(0, properties.getTopK()));
        }
        return ranked;
    }
}
