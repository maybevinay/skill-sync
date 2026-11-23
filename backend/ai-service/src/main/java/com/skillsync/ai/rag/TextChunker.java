package com.skillsync.ai.rag;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Paragraph-then-sentence packing. Defaults (800 / 120) are ~200 / ~30 tokens for technical notes,
 * which keeps five retrieved chunks small enough for a mentoring chatbot context window.
 */
public final class TextChunker {
    private TextChunker() {}

    public static List<String> chunk(String text, int size, int overlap) {
        String cleaned = normalize(text);
        if (cleaned.isEmpty()) {
            return List.of();
        }
        if (size <= 0) {
            return List.of(cleaned);
        }
        overlap = Math.max(0, Math.min(overlap, size - 1));
        if (cleaned.length() <= size) {
            return List.of(cleaned);
        }
        List<String> pieces = new ArrayList<>();
        for (String paragraph : cleaned.split("\\n\\n+")) {
            String p = paragraph.trim();
            if (p.isEmpty()) {
                continue;
            }
            if (p.length() <= size) {
                pieces.add(p);
            } else {
                pieces.addAll(splitLong(p, size));
            }
        }
        return pack(pieces, size, overlap);
    }

    static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.replace('\u0000', ' ')
                .replace("\r\n", "\n")
                .replace('\r', '\n')
                .replaceAll("[\\t\\x0B\\f]+", " ")
                .replaceAll(" *\\n *", "\n")
                .replaceAll("\\n{3,}", "\n\n")
                .replaceAll(" {2,}", " ")
                .trim();
    }

    private static List<String> splitLong(String paragraph, int size) {
        List<String> sentences = new ArrayList<>();
        String[] raw = paragraph.split("(?<=[.!?])\\s+");
        for (String s : raw) {
            s = s.trim();
            if (s.isEmpty()) {
                continue;
            }
            if (s.length() <= size) {
                sentences.add(s);
            } else {
                int i = 0;
                while (i < s.length()) {
                    int end = Math.min(s.length(), i + size);
                    if (end < s.length()) {
                        int space = s.lastIndexOf(' ', end);
                        if (space > i + size / 2) {
                            end = space;
                        }
                    }
                    sentences.add(s.substring(i, end).trim());
                    i = end;
                    while (i < s.length() && s.charAt(i) == ' ') {
                        i++;
                    }
                }
            }
        }
        return sentences;
    }

    private static List<String> pack(List<String> pieces, int size, int overlap) {
        List<String> out = new ArrayList<>();
        StringBuilder buf = new StringBuilder();
        for (String piece : pieces) {
            if (buf.isEmpty()) {
                buf.append(piece);
                continue;
            }
            if (buf.length() + 1 + piece.length() <= size) {
                buf.append('\n').append(piece);
            } else {
                out.add(buf.toString());
                String carry = tail(buf.toString(), overlap);
                buf.setLength(0);
                if (!carry.isEmpty()) {
                    buf.append(carry);
                    if (buf.length() + 1 + piece.length() <= size) {
                        buf.append('\n').append(piece);
                    } else {
                        out.add(buf.toString());
                        buf.setLength(0);
                        buf.append(piece);
                    }
                } else {
                    buf.append(piece);
                }
            }
        }
        if (!buf.isEmpty()) {
            out.add(buf.toString());
        }
        return out;
    }

    private static String tail(String text, int overlap) {
        if (overlap <= 0 || text.length() <= overlap) {
            return text;
        }
        String slice = text.substring(text.length() - overlap);
        int sp = slice.indexOf(' ');
        return sp >= 0 && sp < slice.length() - 1 ? slice.substring(sp + 1) : slice;
    }

    public static String stripHtml(String html) {
        if (html == null) {
            return "";
        }
        String noScript = html.replaceAll("(?is)<script[^>]*>.*?</script>", " ")
                .replaceAll("(?is)<style[^>]*>.*?</style>", " ");
        return normalize(noScript.replaceAll("(?i)<[^>]+>", " "));
    }

    public static boolean allowedFilename(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        String lower = name.toLowerCase(Locale.ROOT);
        return lower.endsWith(".pdf") || lower.endsWith(".txt") || lower.endsWith(".md")
                || lower.endsWith(".markdown") || lower.endsWith(".html") || lower.endsWith(".htm");
    }
}
