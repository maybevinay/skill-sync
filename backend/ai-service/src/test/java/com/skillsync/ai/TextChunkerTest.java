package com.skillsync.ai;

import com.skillsync.ai.rag.TextChunker;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TextChunkerTest {
    @Test
    void overlappingWindowsCoverLongText() {
        String text = "a".repeat(2000);
        List<String> chunks = TextChunker.chunk(text, 800, 120);
        assertTrue(chunks.size() >= 3);
        assertEquals(800, chunks.getFirst().length());
    }

    @Test
    void prefersParagraphBoundaries() {
        String text = "First paragraph stays together.\n\nSecond paragraph is also whole.";
        List<String> chunks = TextChunker.chunk(text, 800, 40);
        assertEquals(1, chunks.size());
        assertTrue(chunks.getFirst().contains("First paragraph"));
        assertTrue(chunks.getFirst().contains("Second paragraph"));
    }

    @Test
    void stripsHtmlAndScripts() {
        String html = "<html><script>alert(1)</script><p>Mentor matching</p></html>";
        String plain = TextChunker.stripHtml(html);
        assertTrue(plain.contains("Mentor matching"));
        assertFalse(plain.toLowerCase().contains("script"));
    }

    @Test
    void rejectsDisallowedFilenames() {
        assertFalse(TextChunker.allowedFilename("payload.exe"));
        assertTrue(TextChunker.allowedFilename("notes.PDF"));
    }
}
