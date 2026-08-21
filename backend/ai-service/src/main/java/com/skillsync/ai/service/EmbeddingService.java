package com.skillsync.ai.service;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.EmbedContentResponse;
import com.skillsync.ai.config.GeminiProperties;
import com.skillsync.ai.config.RagProperties;
import com.skillsync.ai.exception.GeminiApiException;
import com.skillsync.ai.rag.VectorMath;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmbeddingService {
    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private final ObjectProvider<Client> clients;
    private final ObjectProvider<EmbeddingModel> openAiEmbeddings;
    private final GeminiProperties geminiProperties;
    private final RagProperties ragProperties;

    public EmbeddingService(ObjectProvider<Client> clients, ObjectProvider<EmbeddingModel> openAiEmbeddings,
                            GeminiProperties geminiProperties, RagProperties ragProperties) {
        this.clients = clients;
        this.openAiEmbeddings = openAiEmbeddings;
        this.geminiProperties = geminiProperties;
        this.ragProperties = ragProperties;
    }

    public double[] embed(String text) {
        return embed(text, false);
    }

    public double[] embed(String text, boolean query) {
        int dims = ragProperties.getEmbeddingDimensions();
        Client client = clients.getIfAvailable();
        if (client != null && geminiProperties.hasApiKey()) {
            try {
                double[] vector = embedWithGemini(client, text, query, dims);
                if (vector.length != dims) {
                    throw new GeminiApiException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                            "Gemini embedding size " + vector.length + " does not match configured " + dims);
                }
                return vector;
            } catch (GeminiApiException ex) {
                throw ex;
            } catch (Exception ex) {
                log.warn("Gemini embedding failed: {}", ex.getMessage());
                throw new GeminiApiException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                        "Embedding API failure. Confirm GEMINI_API_KEY and the embedding model.");
            }
        }
        EmbeddingModel openAi = openAiEmbeddings.getIfAvailable();
        if (openAi != null) {
            try {
                float[] raw = openAi.embed(text);
                if (raw.length != dims) {
                    log.warn("OpenAI embedding size {} != {}; using local vectors", raw.length, dims);
                    return VectorMath.fallbackEmbed(text, dims);
                }
                double[] out = new double[raw.length];
                for (int i = 0; i < raw.length; i++) {
                    out[i] = raw[i];
                }
                return out;
            } catch (Exception ex) {
                log.warn("OpenAI embedding failed, using local vectors: {}", ex.getMessage());
            }
        }
        return VectorMath.fallbackEmbed(text, dims);
    }

    private double[] embedWithGemini(Client client, String text, boolean query, int dims) {
        EmbedContentConfig config = EmbedContentConfig.builder()
                .outputDimensionality(dims)
                .taskType(query ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT")
                .build();
        EmbedContentResponse response = client.models.embedContent(
                geminiProperties.getEmbeddingModel(), text == null ? "" : text, config);
        List<ContentEmbedding> embeddings = response.embeddings().orElse(List.of());
        if (embeddings.isEmpty()) {
            throw new GeminiApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "Gemini returned no embeddings");
        }
        List<Float> values = embeddings.getFirst().values().orElse(List.of());
        if (values.isEmpty()) {
            throw new GeminiApiException(org.springframework.http.HttpStatus.BAD_GATEWAY, "Gemini returned an empty embedding");
        }
        double[] out = new double[values.size()];
        for (int i = 0; i < values.size(); i++) {
            out[i] = values.get(i);
        }
        if (out.length != dims) {
            log.warn("Gemini embedding size {} != configured {}", out.length, dims);
        }
        return out;
    }
}
