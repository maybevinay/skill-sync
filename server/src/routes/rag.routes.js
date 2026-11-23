import express from "express";
import multer from "multer";
import { RagDocument, RagChunk } from "../models/Rag.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware } from "../middleware/auth.js";
import { extractTextFromFile, chunkText, fallbackEmbed } from "../services/ragService.js";
import { askRag } from "../services/aiService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = express.Router();

router.use(authMiddleware);

// GET /api/rag/documents
router.get("/documents", async (req, res) => {
  const docs = await RagDocument.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.json(
    docs.map((d) => ({
      id: d.id,
      filename: d.filename,
      status: d.status,
      chunks: d.chunkCount,
      embeddings: d.status === "PROCESSED" ? d.chunkCount : 0,
      fileSizeBytes: d.fileSizeBytes,
      createdAt: d.createdAt,
      processedAt: d.processedAt,
      errorMessage: d.errorMessage || "",
    }))
  );
});

// POST /api/rag/documents
router.post("/documents", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No document file provided" });
  }

  const filename = req.file.originalname || "document.txt";
  let text = "";
  try {
    text = await extractTextFromFile(req.file);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Text extraction failed" });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      message: "Empty document. Choose a PDF, TXT, or Markdown file that contains text.",
    });
  }

  const parts = chunkText(text);
  if (parts.length === 0) {
    return res.status(400).json({
      message: "Empty document. Choose a PDF, TXT, or Markdown file that contains text.",
    });
  }

  const docId = await getNextSequence("rag_document");
  const doc = await RagDocument.create({
    id: docId,
    userId: req.user.id,
    filename,
    contentType: req.file.mimetype || "text/plain",
    status: "PROCESSED",
    chunkCount: parts.length,
    fileSizeBytes: req.file.size || Buffer.byteLength(text),
    processedAt: new Date(),
  });

  for (let i = 0; i < parts.length; i++) {
    const chunkId = await getNextSequence("rag_chunk");
    const embedding = fallbackEmbed(parts[i]);
    await RagChunk.create({
      id: chunkId,
      documentId: doc.id,
      userId: req.user.id,
      chunkIndex: i,
      content: parts[i],
      embedding,
    });
  }

  return res.json({
    documentId: doc.id,
    filename: doc.filename,
    chunks: parts.length,
    embeddings: parts.length,
    status: "PROCESSED",
  });
});

// DELETE /api/rag/documents/:id
router.delete("/documents/:id", async (req, res) => {
  const docId = Number(req.params.id);
  const doc = await RagDocument.findOne({ id: docId, userId: req.user.id });
  if (doc) {
    await RagChunk.deleteMany({ documentId: doc.id });
    await RagDocument.deleteOne({ id: doc.id });
  }
  return res.status(204).send();
});

// POST /api/rag/chat
router.post("/chat", async (req, res, next) => {
  try {
    const { question, sessionId } = req.body || {};
    const result = await askRag({
      userId: req.user.id,
      sessionId: sessionId ? Number(sessionId) : undefined,
      question,
    });
    return res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

export default router;
