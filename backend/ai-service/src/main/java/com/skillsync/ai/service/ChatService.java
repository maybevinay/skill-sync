package com.skillsync.ai.service;

import com.skillsync.ai.domain.AiUsage;
import com.skillsync.ai.domain.ChatMessage;
import com.skillsync.ai.domain.ChatSession;
import com.skillsync.ai.repository.AiUsageRepository;
import com.skillsync.ai.repository.ChatMessageRepository;
import com.skillsync.ai.repository.ChatSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class ChatService {
    private static final String SYSTEM = """
            You are SkillSync, an AI mentor for engineers. Be concise, practical, and cite matching/learning strategy when relevant.
            Help with skills, career, and how to work with mentors.
            """;

    private final ChatSessionRepository sessions;
    private final ChatMessageRepository messages;
    private final AiUsageRepository usage;
    private final LlmGateway llm;

    public ChatService(ChatSessionRepository sessions, ChatMessageRepository messages,
                       AiUsageRepository usage, LlmGateway llm) {
        this.sessions = sessions;
        this.messages = messages;
        this.usage = usage;
        this.llm = llm;
    }

    public List<ChatSession> list(Long userId) {
        return sessions.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public ChatSession get(Long userId, Long sessionId) {
        return sessions.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> sessionView(Long userId, Long sessionId) {
        ChatSession s = get(userId, sessionId);
        List<Map<String, Object>> msgs = s.getMessages().stream()
                .map(m -> Map.<String, Object>of(
                        "id", m.getId(),
                        "role", m.getRole(),
                        "content", m.getContent(),
                        "createdAt", m.getCreatedAt()))
                .toList();
        return Map.of("id", s.getId(), "title", s.getTitle(), "messages", msgs);
    }

    @Transactional
    public Map<String, Object> chat(Long userId, Long sessionId, String userText, boolean regenerate) {
        if (!regenerate && (userText == null || userText.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }
        ChatSession session = resolveSession(userId, sessionId, userText);
        if (regenerate && !session.getMessages().isEmpty()) {
            ChatMessage last = session.getMessages().get(session.getMessages().size() - 1);
            if ("assistant".equals(last.getRole())) {
                session.getMessages().remove(last);
                messages.delete(last);
            }
            if (!session.getMessages().isEmpty()) {
                ChatMessage prevUser = session.getMessages().get(session.getMessages().size() - 1);
                userText = prevUser.getContent();
            }
        } else {
            add(session, "user", userText);
        }
        List<String[]> history = session.getMessages().stream()
                .map(m -> new String[]{m.getRole(), m.getContent()})
                .toList();
        String reply = llm.complete(SYSTEM, history.stream().limit(Math.max(0, history.size() - 1)).toList(), userText);
        add(session, "assistant", reply);
        track(userId, "chat", userText.length() + reply.length());
        return Map.of("sessionId", session.getId(), "content", reply, "role", "assistant");
    }

    public String completeOnly(Long userId, Long sessionId, String userText) {
        Map<String, Object> result = chat(userId, sessionId, userText, false);
        return String.valueOf(result.get("content"));
    }

    private ChatSession resolveSession(Long userId, Long sessionId, String userText) {
        if (sessionId != null) {
            return get(userId, sessionId);
        }
        ChatSession session = new ChatSession();
        session.setUserId(userId);
        session.setTitle(userText.length() > 48 ? userText.substring(0, 48) + "…" : userText);
        return sessions.save(session);
    }

    private void add(ChatSession session, String role, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setSession(session);
        msg.setRole(role);
        msg.setContent(content);
        session.getMessages().add(msg);
        messages.save(msg);
        sessions.save(session);
    }

    private void track(Long userId, String kind, int tokens) {
        AiUsage row = new AiUsage();
        row.setUserId(userId);
        row.setKind(kind);
        row.setTokens(Math.max(1, tokens / 4));
        usage.save(row);
    }
}
