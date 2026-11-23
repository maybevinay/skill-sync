package com.skillsync.ai.config;

import com.google.genai.Client;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(GeminiProperties.class)
@Conditional(GeminiConfig.GeminiKeyPresentCondition.class)
public class GeminiConfig {
    private static final Logger log = LoggerFactory.getLogger(GeminiConfig.class);

    @Bean
    public Client geminiClient(GeminiProperties properties) {
        log.info("Initializing Gemini client model={}", properties.getModel());
        return Client.builder().apiKey(properties.getApiKey().trim()).build();
    }

    static class GeminiKeyPresentCondition extends SpringBootCondition {
        @Override
        public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String key = context.getEnvironment().getProperty("skillsync.gemini.api-key", "");
            if (StringUtils.hasText(key)) {
                return ConditionOutcome.match("Gemini API key is configured");
            }
            return ConditionOutcome.noMatch("Gemini API key is blank");
        }
    }
}
