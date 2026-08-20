package com.skillsync.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);
    private final JavaMailSender mailSender;
    private final String from;
    private final String frontendUrl;

    public MailService(JavaMailSender mailSender,
                       @Value("${skillsync.mail.from:noreply@skillsync.local}") String from,
                       @Value("${skillsync.mail.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.frontendUrl = frontendUrl;
    }

    public void sendPasswordReset(String to, String rawToken) {
        String link = frontendUrl + "/reset-password?token=" + rawToken;
        send(to, "Reset your SkillSync password", "Reset link (valid 30 minutes):\n" + link);
    }

    public void sendVerification(String to, String rawToken) {
        String link = frontendUrl + "/verify-email?token=" + rawToken;
        send(to, "Verify your SkillSync email", "Verify your account:\n" + link);
    }

    private void send(String to, String subject, String body) {
        log.info("Queued mail to {} with subject '{}'", to, subject);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Mail delivery skipped (configure SMTP): {}", ex.getMessage());
        }
    }
}
