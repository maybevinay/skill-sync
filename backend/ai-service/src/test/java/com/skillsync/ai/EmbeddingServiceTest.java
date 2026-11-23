package com.skillsync.ai;

import com.google.genai.Client;
import com.skillsync.ai.config.GeminiProperties;
import com.skillsync.ai.config.RagProperties;
import com.skillsync.ai.service.EmbeddingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmbeddingServiceTest {
    @Mock ObjectProvider<Client> clients;
    @Mock ObjectProvider<EmbeddingModel> openAi;
    @Mock GeminiProperties geminiProperties;
    @Mock RagProperties ragProperties;

    @Test
    void localFallbackWhenNoProviders() {
        when(clients.getIfAvailable()).thenReturn(null);
        when(openAi.getIfAvailable()).thenReturn(null);
        when(ragProperties.getEmbeddingDimensions()).thenReturn(1536);
        EmbeddingService service = new EmbeddingService(clients, openAi, geminiProperties, ragProperties);
        double[] vector = service.embed("SkillSync matching weights", false);
        assertEquals(1536, vector.length);
    }
}
