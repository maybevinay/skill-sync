package com.skillsync.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "skillsync.jwt")
public class JwtProperties {
    private String secret;
    private String issuer;
    private long accessExpirationMs;
    private long refreshExpirationMs;

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public long getAccessExpirationMs() { return accessExpirationMs; }
    public void setAccessExpirationMs(long accessExpirationMs) { this.accessExpirationMs = accessExpirationMs; }
    public long getRefreshExpirationMs() { return refreshExpirationMs; }
    public void setRefreshExpirationMs(long refreshExpirationMs) { this.refreshExpirationMs = refreshExpirationMs; }
}
