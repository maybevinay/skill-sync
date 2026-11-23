package com.skillsync.ai.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "skillsync.gemini")
public class GeminiProperties {
    /** Google AI Studio / Gemini API key. Bind from GEMINI_API_KEY — never commit the value. */
    private String apiKey = "";
    private String model = "gemini-3.6-flash";
    private String embeddingModel = "gemini-embedding-001";

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getEmbeddingModel() { return embeddingModel; }
    public void setEmbeddingModel(String embeddingModel) { this.embeddingModel = embeddingModel; }

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.isBlank();
    }
}
