package com.skillsync.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.util.Map;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;

@Configuration
public class GatewayIndexConfig {
    @Bean
    RouterFunction<ServerResponse> indexRoute() {
        Map<String, Object> body = Map.of(
                "service", "api-gateway",
                "message", "This is the SkillSync API gateway, not the website.",
                "ui", "http://localhost:5173",
                "health", "/actuator/health",
                "apis", "/api/auth, /api/profile, /api/chat, /api/rag"
        );
        return route(GET("/"), request -> ServerResponse.ok().contentType(MediaType.APPLICATION_JSON).bodyValue(body));
    }
}
