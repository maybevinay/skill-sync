package com.skillsync.ai;

import com.skillsync.ai.service.ChatService;
import com.skillsync.ai.service.RagService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class RagPipelineTest {
    private static final String NOTES = """
            SkillSync matching uses a 50 percent weight for skill overlap between learner and mentor.
            Availability only contributes 10 percent to the final score.
            """;

    @Autowired RagService ragService;
    @Autowired ChatService chatService;

    @Test
    void relevantQuestionRetrievesChunkAndSources() throws Exception {
        ragService.ingest(41L, notes("weights.txt"));
        Map<String, Object> hit = ragService.ask(41L, null, "What weight is used for skill overlap?");
        assertEquals(true, hit.get("grounded"));
        assertTrue(((Number) hit.get("retrievedCount")).intValue() >= 1);
        List<?> sources = (List<?>) hit.get("sources");
        assertFalse(sources.isEmpty());
        assertTrue(String.valueOf(sources.getFirst()).contains("weights.txt"));
    }

    @Test
    void unrelatedQuestionIsNotGrounded() throws Exception {
        ragService.ingest(42L, notes("weights.txt"));
        Map<String, Object> miss = ragService.ask(42L, null, "What is the capital of Mars and the secret admin password?");
        assertEquals(false, miss.get("grounded"));
        assertEquals(0, ((Number) miss.get("retrievedCount")).intValue());
        assertEquals("NO_MATCH", miss.get("retrievalReason"));
        assertTrue(String.valueOf(miss.get("content")).toLowerCase().contains("don't have that"));
    }

    @Test
    void documentsAreIsolatedPerUser() throws Exception {
        ragService.ingest(43L, notes("private.txt"));
        ragService.ingest(44L, new MockMultipartFile("file", "baking.txt", "text/plain",
                "Sourdough starter feeding schedule and oven spring.".getBytes(StandardCharsets.UTF_8)));
        Map<String, Object> other = ragService.ask(44L, null, "What weight is used for skill overlap?");
        assertEquals(false, other.get("grounded"));
        assertEquals("NO_MATCH", other.get("retrievalReason"));
    }

    @Test
    void persistedMemoryKeepsTheUserQuestionNotTheContextWrapper() throws Exception {
        ragService.ingest(45L, notes("weights.txt"));
        String question = "What weight is used for skill overlap?";
        Map<String, Object> hit = ragService.ask(45L, null, question);
        Long sessionId = ((Number) hit.get("sessionId")).longValue();
        Map<String, Object> view = chatService.sessionView(45L, sessionId);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> messages = (List<Map<String, Object>>) view.get("messages");
        assertEquals("user", messages.getFirst().get("role"));
        assertEquals(question, messages.getFirst().get("content"));
        assertFalse(String.valueOf(messages.getFirst().get("content")).contains("CONTEXT"));
        ragService.ask(45L, sessionId, "And how much is availability?");
        Map<String, Object> follow = chatService.sessionView(45L, sessionId);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> later = (List<Map<String, Object>>) follow.get("messages");
        assertTrue(later.size() >= 4);
    }

    @Test
    void ingestMarksDocumentProcessed() throws Exception {
        Map<String, Object> saved = ragService.ingest(50L, notes("weights.txt"));
        assertEquals("PROCESSED", saved.get("status"));
        assertEquals(saved.get("chunks"), saved.get("embeddings"));
        assertTrue(((Number) saved.get("chunks")).intValue() >= 1);
        assertEquals("PROCESSED", ragService.list(50L).getFirst().getStatus().name());
        assertTrue(ragService.list(50L).getFirst().getChunkCount() >= 1);
    }

    @Test
    void askWithoutDocumentsTellsUserToProcessFirst() {
        Map<String, Object> miss = ragService.ask(99L, null, "What is admin id?");
        assertEquals(false, miss.get("grounded"));
        assertEquals("NO_DOCUMENTS", miss.get("retrievalReason"));
        assertTrue(String.valueOf(miss.get("content")).toLowerCase().contains("process a document"));
    }

    @Test
    void rejectsEmptyUpload() {
        MockMultipartFile empty = new MockMultipartFile("file", "empty.txt", "text/plain", new byte[0]);
        assertThrows(Exception.class, () -> ragService.ingest(47L, empty));
        assertTrue(ragService.list(47L).isEmpty());
    }

    @Test
    void rejectsUnsupportedUploadTypes() {
        MockMultipartFile exe = new MockMultipartFile("file", "payload.exe", "application/octet-stream", new byte[]{1, 2, 3});
        assertThrows(Exception.class, () -> ragService.ingest(46L, exe));
    }

    @Test
    void deleteRemovesOwnedDocument() throws Exception {
        Map<String, Object> saved = ragService.ingest(51L, notes("weights.txt"));
        Long id = ((Number) saved.get("documentId")).longValue();
        ragService.delete(51L, id);
        assertTrue(ragService.list(51L).isEmpty());
    }

    private static MockMultipartFile notes(String name) {
        return new MockMultipartFile("file", name, "text/plain", NOTES.getBytes(StandardCharsets.UTF_8));
    }
}
