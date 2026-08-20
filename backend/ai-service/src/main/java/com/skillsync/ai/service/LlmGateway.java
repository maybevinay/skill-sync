package com.skillsync.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LlmGateway {
    private static final Logger log = LoggerFactory.getLogger(LlmGateway.class);
    private final ChatModel chatModel;
    private final EmbeddingModel embeddingModel;

    public LlmGateway(ObjectProvider<ChatModel> chatModel, ObjectProvider<EmbeddingModel> embeddingModel) {
        this.chatModel = chatModel.getIfAvailable();
        this.embeddingModel = embeddingModel.getIfAvailable();
    }

    public String complete(String system, List<String[]> turns, String userMessage) {
        if (chatModel == null) {
            return fallback(userMessage);
        }
        try {
            List<Message> messages = new ArrayList<>();
            messages.add(new SystemMessage(system));
            for (String[] turn : turns) {
                if ("user".equals(turn[0])) {
                    messages.add(new UserMessage(turn[1]));
                } else {
                    messages.add(new AssistantMessage(turn[1]));
                }
            }
            messages.add(new UserMessage(userMessage));
            var output = chatModel.call(new Prompt(messages)).getResult().getOutput();
            String text = output.getContent();
            return text == null || text.isBlank() ? fallback(userMessage) : text;
        } catch (Exception ex) {
            log.warn("LLM call failed: {}", ex.getMessage());
            return fallback(userMessage);
        }
    }

    public double[] embed(String text) {
        if (embeddingModel != null) {
            try {
                float[] raw = embeddingModel.embed(text);
                double[] out = new double[raw.length];
                for (int i = 0; i < raw.length; i++) {
                    out[i] = raw[i];
                }
                return out;
            } catch (Exception ex) {
                log.warn("Embedding API failed, using local vectors: {}", ex.getMessage());
            }
        }
        return com.skillsync.ai.rag.VectorMath.fallbackEmbed(text, 64);
    }

    private String fallback(String userMessage) {
        return "I couldn't reach the configured OpenAI-compatible model. Set OPENAI_API_KEY, OPENAI_BASE_URL, and OPENAI_MODEL.\n\n"
                + "Meanwhile, SkillSync matching weights are: skills 50%, goals 20%, experience 15%, availability 10%, rating 5%.\n\n"
                + "Your last question: " + userMessage;
    }
}
