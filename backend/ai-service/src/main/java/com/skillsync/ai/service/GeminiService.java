package com.skillsync.ai.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.skillsync.ai.config.GeminiProperties;
import com.skillsync.ai.exception.GeminiApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeminiService {
    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final ObjectProvider<Client> clients;
    private final GeminiProperties properties;

    public GeminiService(ObjectProvider<Client> clients, GeminiProperties properties) {
        this.clients = clients;
        this.properties = properties;
    }

    public boolean isAvailable() {
        return clients.getIfAvailable() != null && properties.hasApiKey();
    }

    public String generate(String system, List<String[]> history, String userMessage) {
        Client client = clients.getIfAvailable();
        if (client == null) {
            throw new GeminiApiException(HttpStatus.SERVICE_UNAVAILABLE, "Gemini client is not configured");
        }
        try {
            List<Content> contents = new ArrayList<>();
            if (history != null) {
                for (String[] turn : history) {
                    if (turn == null || turn.length < 2 || turn[1] == null || turn[1].isBlank()) {
                        continue;
                    }
                    String role = "user".equalsIgnoreCase(turn[0]) ? "user" : "model";
                    contents.add(Content.builder().role(role).parts(Part.fromText(turn[1])).build());
                }
            }
            contents.add(Content.builder()
                    .role("user")
                    .parts(Part.fromText(userMessage == null ? "" : userMessage))
                    .build());

            GenerateContentConfig.Builder config = GenerateContentConfig.builder();
            if (system != null && !system.isBlank()) {
                config.systemInstruction(Content.fromParts(Part.fromText(system)));
            }

            log.info("Gemini generate model={} turns={}", properties.getModel(), contents.size());
            GenerateContentResponse response = client.models.generateContent(
                    properties.getModel(), contents, config.build());
            String text = response.text();
            if (text == null || text.isBlank()) {
                throw new GeminiApiException(HttpStatus.BAD_GATEWAY, "Gemini returned an empty response");
            }
            return text.trim();
        } catch (GeminiApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw map(ex);
        }
    }

    public static GeminiApiException map(Exception ex) {
        Throwable root = ex;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String msg = (String.valueOf(ex.getMessage()) + " " + String.valueOf(root.getMessage())).toLowerCase();
        if (root instanceof UnknownHostException || root instanceof ConnectException
                || root instanceof SocketTimeoutException || root instanceof IOException
                || msg.contains("timed out") || msg.contains("network") || msg.contains("connection")) {
            log.warn("Gemini network failure: {}", ex.getMessage());
            return new GeminiApiException(HttpStatus.GATEWAY_TIMEOUT, "Gemini network failure. Try again shortly.", ex);
        }
        if (msg.contains("401") || msg.contains("403") || msg.contains("unauth") || msg.contains("api key")
                || msg.contains("invalid") && msg.contains("key") || msg.contains("permission")) {
            log.warn("Gemini rejected the API key");
            return new GeminiApiException(HttpStatus.UNAUTHORIZED, "Invalid Gemini API key", ex);
        }
        if (msg.contains("429") || msg.contains("rate") || msg.contains("resource_exhausted") || msg.contains("quota")) {
            log.warn("Gemini rate limit: {}", ex.getMessage());
            return new GeminiApiException(HttpStatus.TOO_MANY_REQUESTS, "Gemini rate limit exceeded. Retry later.", ex);
        }
        if (msg.contains("404") || msg.contains("no longer available") || msg.contains("not found")) {
            log.warn("Gemini model unavailable: {}", ex.getMessage());
            return new GeminiApiException(HttpStatus.BAD_GATEWAY,
                    "Gemini model is unavailable. Set GEMINI_MODEL to a current model such as gemini-3.6-flash.", ex);
        }
        log.warn("Gemini call failed: {}", ex.getMessage());
        return new GeminiApiException(HttpStatus.BAD_GATEWAY, "Gemini request failed", ex);
    }
}
