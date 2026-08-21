package com.skillsync.ai.rag;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Locale;

public final class VectorMath {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private VectorMath() {}

    public static double cosine(double[] a, double[] b) {
        if (a.length != b.length || a.length == 0) {
            return 0;
        }
        double dot = 0;
        double na = 0;
        double nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        if (na == 0 || nb == 0) {
            return 0;
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    public static String toJson(double[] vector) {
        return toPgLiteral(vector);
    }

    /** pgvector text input: [0.1,0.2,...] */
    public static String toPgLiteral(double[] vector) {
        if (vector == null) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder(vector.length * 12);
        sb.append('[');
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            double n = Double.isFinite(vector[i]) ? vector[i] : 0.0;
            sb.append(String.format(Locale.US, "%.8f", n));
        }
        return sb.append(']').toString();
    }

    public static double[] fromJson(String json) {
        try {
            List<Double> list = MAPPER.readValue(json, new TypeReference<>() {});
            double[] arr = new double[list.size()];
            for (int i = 0; i < list.size(); i++) {
                arr[i] = list.get(i);
            }
            return arr;
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    public static double[] fallbackEmbed(String text, int dims) {
        double[] v = new double[dims];
        if (text == null || text.isEmpty() || dims <= 0) {
            return v;
        }
        String[] tokens = text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        for (String token : tokens) {
            if (token.isEmpty()) {
                continue;
            }
            int h = token.hashCode();
            v[Math.floorMod(h, dims)] += 1.0;
            v[Math.floorMod(h * 31, dims)] += 0.5;
        }
        double norm = 0;
        for (double n : v) {
            norm += n * n;
        }
        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < dims; i++) {
                v[i] /= norm;
            }
        }
        return v;
    }
}
