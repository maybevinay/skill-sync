package com.skillsync.ai;

import com.skillsync.ai.rag.VectorMath;
import com.skillsync.ai.service.RagService;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class VectorMathTest {
    @Test
    void identicalVectorsHaveCosineOne() {
        double[] v = {0.1, 0.2, 0.3};
        assertEquals(1.0, VectorMath.cosine(v, v), 1e-9);
    }

    @Test
    void jsonRoundTrip() {
        double[] v = VectorMath.fallbackEmbed("spring boot mentor matching", 64);
        double[] copy = VectorMath.fromJson(VectorMath.toJson(v));
        assertEquals(v.length, copy.length);
        assertTrue(VectorMath.cosine(v, copy) > 0.999);
    }

    @Test
    void chunkingProducesOverlapWindows() {
        String text = "a".repeat(2000);
        List<String> chunks = RagService.chunk(text, 800, 120);
        assertTrue(chunks.size() >= 3);
        assertEquals(800, chunks.get(0).length());
    }

    @Test
    void emptyTextDoesNotThrow() {
        double[] v = VectorMath.fallbackEmbed("", 64);
        assertEquals(64, v.length);
    }
}
