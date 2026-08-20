package com.skillsync.gateway;

import com.skillsync.gateway.filter.RateLimitFilter;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.http.HttpStatus;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RateLimitFilterTest {
    @Test
    void blocksWhenOverLimit() {
        RateLimitFilter filter = new RateLimitFilter(1);
        var first = MockServerWebExchange.from(MockServerHttpRequest.get("/api/auth/me").build());
        filter.filter(first, exchange -> Mono.empty()).block();
        var second = MockServerWebExchange.from(MockServerHttpRequest.get("/api/auth/me").build());
        filter.filter(second, exchange -> Mono.empty()).block();
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, second.getResponse().getStatusCode());
    }
}
