package com.skillsync.gateway;

import com.skillsync.gateway.filter.JwtForwardingFilter;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtForwardingFilterTest {
    private final JwtForwardingFilter filter = new JwtForwardingFilter(
            "change-me-to-a-256-bit-secret-key-for-hs256-skillsync", "skillsync");

    @Test
    void rootIsPublic() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/").build());
        AtomicBoolean forwarded = new AtomicBoolean(false);
        filter.filter(exchange, ex -> {
            forwarded.set(true);
            return Mono.empty();
        }).block();
        assertTrue(forwarded.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void loginIsPublic() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.post("/api/auth/login").build());
        AtomicBoolean forwarded = new AtomicBoolean(false);
        filter.filter(exchange, ex -> {
            forwarded.set(true);
            return Mono.empty();
        }).block();
        assertTrue(forwarded.get());
        assertNull(exchange.getResponse().getStatusCode());
    }

    @Test
    void protectedPathWithoutJwtIsUnauthorized() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/auth/me").build());
        filter.filter(exchange, ex -> Mono.empty()).block();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void optionsIsForwardedWithoutJwt() {
        var exchange = MockServerWebExchange.from(MockServerHttpRequest.options("/api/profile/me").build());
        AtomicBoolean forwarded = new AtomicBoolean(false);
        filter.filter(exchange, ex -> {
            forwarded.set(true);
            return Mono.empty();
        }).block();
        assertTrue(forwarded.get());
    }
}
