package com.skillsync.ai.service;

import com.skillsync.ai.domain.AiUsage;
import com.skillsync.ai.domain.ChatMessage;
import com.skillsync.ai.domain.ChatSession;
import com.skillsync.ai.rag.AiPrompts;
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
    private static final int MAX_HISTORY = 12;
    private static final int MAX_MESSAGE = 8000;

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
        return complete(userId, sessionId, userText, userText, AiPrompts.CHAT_SYSTEM, regenerate);
    }

    @Transactional
    public Map<String, Object> complete(Long userId, Long sessionId, String persistUserText, String llmUserText,
                                        String system, boolean regenerate) {
        if (!regenerate && (persistUserText == null || persistUserText.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }
        persistUserText = clip(persistUserText);
        llmUserText = clip(llmUserText);
        ChatSession session = resolveSession(userId, sessionId, persistUserText);
        if (regenerate && !session.getMessages().isEmpty()) {
            ChatMessage last = session.getMessages().get(session.getMessages().size() - 1);
            if ("assistant".equals(last.getRole())) {
                session.getMessages().remove(last);
                messages.delete(last);
            }
            if (!session.getMessages().isEmpty()) {
                ChatMessage prevUser = session.getMessages().get(session.getMessages().size() - 1);
                persistUserText = prevUser.getContent();
                llmUserText = persistUserText;
            }
        } else {
            add(session, "user", persistUserText);
        }
        List<String[]> history = session.getMessages().stream()
                .map(m -> new String[]{m.getRole(), m.getContent()})
                .toList();
        int endExclusive = Math.max(0, history.size() - 1);
        int start = Math.max(0, endExclusive - MAX_HISTORY);
        List<String[]> window = history.subList(start, endExclusive);
        String reply = llm.complete(system, window, llmUserText);
        add(session, "assistant", reply);
        track(userId, "chat", persistUserText.length() + reply.length());
        return Map.of("sessionId", session.getId(), "content", reply, "role", "assistant");
    }

    @Transactional
    public Map<String, Object> appendTurn(Long userId, Long sessionId, String userText, String assistantText) {
        if (userText == null || userText.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }
        userText = clip(userText);
        ChatSession session = resolveSession(userId, sessionId, userText);
        add(session, "user", userText);
        add(session, "assistant", assistantText);
        track(userId, "chat", userText.length() + assistantText.length());
        return Map.of("sessionId", session.getId(), "content", assistantText, "role", "assistant");
    }

    @Transactional
    public String completeOnly(Long userId, Long sessionId, String userText) {
        Map<String, Object> result = chat(userId, sessionId, userText, false);
        return String.valueOf(result.get("content"));
    }

    private static String clip(String text) {
        if (text == null) {
            return null;
        }
        return text.length() <= MAX_MESSAGE ? text : text.substring(0, MAX_MESSAGE);
    }

    private ChatSession resolveSession(Long userId, Long sessionId, String userText) {
        if (sessionId != null) {
            return get(userId, sessionId);
        }
        ChatSession session = new ChatSession();
        session.setUserId(userId);
        String title = userText == null ? "Chat" : userText;
        session.setTitle(title.length() > 48 ? title.substring(0, 48) + "…" : title);
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
