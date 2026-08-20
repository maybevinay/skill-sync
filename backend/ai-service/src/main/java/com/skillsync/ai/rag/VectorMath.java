package com.skillsync.ai.rag;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

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
        try {
            return MAPPER.writeValueAsString(vector);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
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
        int h = text.toLowerCase().hashCode();
        for (int i = 0; i < dims; i++) {
            h = 31 * h + text.charAt(i % text.length());
            v[i] = ((h % 1000) / 1000.0) - 0.5;
        }
        double norm = 0;
        for (double n : v) norm += n * n;
        norm = Math.sqrt(norm);
        if (norm > 0) {
            for (int i = 0; i < dims; i++) v[i] /= norm;
        }
        return v;
    }
}
