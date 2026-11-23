import express from "express";
import { Skill } from "../models/Skill.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// GET /api/skills
router.get("/", optionalAuth, async (req, res) => {
  const { q } = req.query;
  let filter = {};
  if (q && typeof q === "string" && q.trim()) {
    const reg = new RegExp(q.trim(), "i");
    filter = { $or: [{ name: reg }, { category: reg }, { description: reg }] };
  }

  const skills = await Skill.find(filter).sort({ id: 1 });
  return res.json(
    skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      description: s.description,
    }))
  );
});

// POST /api/skills (ADMIN only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only administrators can create catalog skills" });
  }

  const { name, category, description } = req.body || {};
  if (!name || !category || !description) {
    return res.status(400).json({ message: "Name, category, and description are required" });
  }

  const nextId = await getNextSequence("skill");
  const skill = await Skill.create({
    id: nextId,
    name: name.trim(),
    category: category.trim(),
    description: description.trim(),
  });

  return res.status(201).json({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    description: skill.description,
  });
});

export default router;
