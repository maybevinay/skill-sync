package com.skillsync.ai;

import com.skillsync.ai.config.GeminiProperties;
import com.skillsync.ai.exception.GeminiApiException;
import com.skillsync.ai.service.GeminiService;
import com.google.genai.Client;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;

import java.net.UnknownHostException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeminiServiceTest {
    @Mock ObjectProvider<Client> clients;
    @Mock GeminiProperties properties;

    @Test
    void unavailableWhenClientMissing() {
        when(clients.getIfAvailable()).thenReturn(null);
        GeminiService service = new GeminiService(clients, properties);
        assertFalse(service.isAvailable());
        GeminiApiException ex = assertThrows(GeminiApiException.class,
                () -> service.generate("sys", List.of(), "hello"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatus());
    }

    @Test
    void mapsInvalidKey() {
        GeminiApiException mapped = GeminiService.map(new RuntimeException("401 API key not valid"));
        assertEquals(HttpStatus.UNAUTHORIZED, mapped.getStatus());
        assertTrue(mapped.getMessage().toLowerCase().contains("api key"));
    }

    @Test
    void mapsRateLimit() {
        GeminiApiException mapped = GeminiService.map(new RuntimeException("429 RESOURCE_EXHAUSTED quota"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, mapped.getStatus());
    }

    @Test
    void mapsRetiredModel() {
        GeminiApiException mapped = GeminiService.map(new RuntimeException("404 NOT_FOUND. This model is no longer available"));
        assertEquals(HttpStatus.BAD_GATEWAY, mapped.getStatus());
    }

    @Test
    void mapsNetworkFailure() {
        GeminiApiException mapped = GeminiService.map(new RuntimeException("down", new UnknownHostException("generativelanguage.googleapis.com")));
        assertEquals(HttpStatus.GATEWAY_TIMEOUT, mapped.getStatus());
    }
}
