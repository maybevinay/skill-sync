import pdf from "pdf-parse/lib/pdf-parse.js";

const DEFAULT_DIMS = 128;
const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 100;
const MIN_SIMILARITY = 0.35;
const TOP_K = 4;

export function javaHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function floorMod(x, y) {
  return ((x % y) + y) % y;
}

export function fallbackEmbed(text, dims = DEFAULT_DIMS) {
  const v = new Array(dims).fill(0);
  if (!text || typeof text !== "string" || dims <= 0) return v;

  const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
  for (const token of tokens) {
    if (!token) continue;
    const h = javaHashCode(token);
    v[floorMod(h, dims)] += 1.0;
    v[floorMod(h * 31, dims)] += 0.5;
  }

  let norm = 0;
  for (const n of v) norm += n * n;
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dims; i++) v[i] /= norm;
  }
  return v;
}

export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function chunkText(text, size = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_CHUNK_OVERLAP) {
  if (!text) return [];
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (cleaned.length <= size) return [cleaned];

  const chunks = [];
  let start = 0;
  while (start < cleaned.length) {
    let end = Math.min(start + size, cleaned.length);
    // Try to break at newline or space if not at end of text
    if (end < cleaned.length) {
      const lastSpace = cleaned.lastIndexOf(" ", end);
      const lastNewline = cleaned.lastIndexOf("\n", end);
      const breakPoint = Math.max(lastSpace, lastNewline);
      if (breakPoint > start + Math.floor(size / 2)) {
        end = breakPoint;
      }
    }
    const chunk = cleaned.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end >= cleaned.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
}

export async function extractTextFromFile(file) {
  if (!file) throw new Error("No file provided");
  const filename = file.originalname || "document.txt";
  const buffer = file.buffer;

  if (filename.toLowerCase().endsWith(".pdf")) {
    try {
      const data = await pdf(buffer);
      return data.text || "";
    } catch (err) {
      throw new Error("Failed to parse PDF document. Ensure it contains readable text.");
    }
  }

  // Text, markdown, etc.
  return buffer.toString("utf-8");
}

export { DEFAULT_DIMS, MIN_SIMILARITY, TOP_K };
