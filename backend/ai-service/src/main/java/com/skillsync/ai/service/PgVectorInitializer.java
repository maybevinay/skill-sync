package com.skillsync.ai.service;

import com.skillsync.ai.config.RagProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@Order(0)
public class PgVectorInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(PgVectorInitializer.class);
    private final JdbcTemplate jdbc;
    private final DataSource dataSource;
    private final RagProperties properties;
    private final AtomicBoolean ready = new AtomicBoolean(false);

    public PgVectorInitializer(JdbcTemplate jdbc, DataSource dataSource, RagProperties properties) {
        this.jdbc = jdbc;
        this.dataSource = dataSource;
        this.properties = properties;
    }

    public boolean isReady() {
        return ready.get();
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!isPostgres()) {
            log.info("Not PostgreSQL; RAG similarity uses in-process cosine (tests / H2).");
            return;
        }
        try {
            jdbc.execute("CREATE EXTENSION IF NOT EXISTS vector");
            Integer dims = properties.getEmbeddingDimensions();
            String udt = jdbc.query(
                    "SELECT udt_name FROM information_schema.columns WHERE table_name = 'rag_chunks' AND column_name = 'embedding'",
                    rs -> rs.next() ? rs.getString(1) : "");
            if (udt != null && !"vector".equalsIgnoreCase(udt)) {
                try {
                    jdbc.execute("ALTER TABLE rag_chunks ALTER COLUMN embedding TYPE vector(" + dims
                            + ") USING embedding::vector");
                } catch (Exception convertEx) {
                    log.warn("Could not convert rag_chunks.embedding to vector({}). Re-upload documents after fixing dimensions. {}",
                            dims, convertEx.getMessage());
                    return;
                }
            }
            try {
                jdbc.execute("""
                        CREATE INDEX IF NOT EXISTS rag_chunks_embedding_hnsw
                        ON rag_chunks USING hnsw (embedding vector_cosine_ops)
                        """);
            } catch (Exception indexEx) {
                log.warn("HNSW index not created (optional for small corpora): {}", indexEx.getMessage());
            }
            ready.set(true);
            log.info("pgvector enabled for rag_chunks.embedding vector({}).", dims);
        } catch (Exception ex) {
            log.warn("pgvector unavailable (install the PostgreSQL vector extension). Falling back to in-process cosine. {}",
                    ex.getMessage());
        }
    }

    private boolean isPostgres() {
        try (Connection c = dataSource.getConnection()) {
            String url = c.getMetaData().getURL();
            return url != null && url.toLowerCase().contains("postgresql");
        } catch (Exception ex) {
            return false;
        }
    }
}
