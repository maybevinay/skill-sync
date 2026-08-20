package com.skillsync.ai.config;

import org.springframework.ai.autoconfigure.openai.OpenAiAutoConfiguration;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

@Configuration
@Conditional(OpenAiOptionalConfig.OpenAiKeyPresentCondition.class)
@ImportAutoConfiguration(OpenAiAutoConfiguration.class)
public class OpenAiOptionalConfig {

    static class OpenAiKeyPresentCondition extends SpringBootCondition {
        @Override
        public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String key = context.getEnvironment().getProperty("spring.ai.openai.api-key", "");
            if (StringUtils.hasText(key)) {
                return ConditionOutcome.match("OpenAI API key is configured");
            }
            return ConditionOutcome.noMatch("OpenAI API key is blank; using local LLM fallback");
        }
    }
}
