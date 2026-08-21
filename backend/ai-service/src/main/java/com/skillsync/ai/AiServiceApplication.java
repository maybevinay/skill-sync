package com.skillsync.ai;

import org.springframework.ai.autoconfigure.openai.OpenAiAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.skillsync.ai.config.GeminiProperties;
import com.skillsync.ai.config.RagProperties;

@SpringBootApplication(exclude = OpenAiAutoConfiguration.class)
@EnableConfigurationProperties({RagProperties.class, GeminiProperties.class})
public class AiServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiServiceApplication.class, args);
    }
}
