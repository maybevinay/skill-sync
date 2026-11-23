import express from "express";
import { ChatSession } from "../models/Chat.js";
import { chatComplete, askRag } from "../services/aiService.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// GET /api/chat/sessions
router.get("/sessions", async (req, res) => {
  const sessions = await ChatSession.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  return res.json(
    sessions.map((s) => ({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt,
    }))
  );
});

// GET /api/chat/sessions/:id
router.get("/sessions/:id", async (req, res) => {
  const sessionId = Number(req.params.id);
  const session = await ChatSession.findOne({ id: sessionId, userId: req.user.id });
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  return res.json({
    id: session.id,
    title: session.title,
    messages: (session.messages || []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

// POST /api/chat
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, message, regenerate } = req.body || {};
    const result = await chatComplete({
      userId: req.user.id,
      sessionId: sessionId ? Number(sessionId) : undefined,
      message,
      regenerate: !!regenerate,
    });
    return res.json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
});

// POST /api/chat/stream (SSE streaming)
router.post("/stream", async (req, res) => {
  const { sessionId, message, regenerate } = req.body || {};

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const result = await chatComplete({
      userId: req.user.id,
      sessionId: sessionId ? Number(sessionId) : undefined,
      message,
      regenerate: !!regenerate,
    });

    const tokens = result.content.split(/(?<=\s)/);
    for (const token of tokens) {
      res.write(`data: ${token}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 15));
    }
    res.end();
  } catch (err) {
    const msg = err.message || "The assistant is unavailable right now. Please try again.";
    res.write(`data: ${msg}\n\n`);
    res.end();
  }
});

// POST /api/chat/rag
router.post("/rag", async (req, res, next) => {
  try {
    const { sessionId, question } = req.body || {};
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
