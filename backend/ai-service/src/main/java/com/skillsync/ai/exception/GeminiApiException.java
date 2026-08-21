package com.skillsync.ai.exception;

import org.springframework.http.HttpStatus;

public class GeminiApiException extends RuntimeException {
    private final HttpStatus status;

    public GeminiApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public GeminiApiException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
