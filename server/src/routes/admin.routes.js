import express from "express";
import { User } from "../models/User.js";
import { Profile, MentorProfile } from "../models/Profile.js";
import { MatchRequest } from "../models/MatchRequest.js";
import { Skill } from "../models/Skill.js";
import { AuditLog } from "../models/AuditLog.js";
import { ChatSession } from "../models/Chat.js";
import { RagDocument } from "../models/Rag.js";
import { AiUsage } from "../models/AiUsage.js";
import { authMiddleware, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All admin endpoints require authenticated ADMIN role
router.use(authMiddleware, requireRole("ADMIN"));

// GET /api/admin/users
router.get("/users", async (req, res) => {
  const users = await User.find().sort({ id: 1 });
  return res.json(users.map((u) => u.toJSON()));
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", async (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body || {};
  if (!role || !["USER", "MENTOR", "ADMIN"].includes(role)) {
    return res.status(400).json({ message: "Invalid role specified" });
  }

  const user = await User.findOne({ id: userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.role = role;
  await user.save();

  // If promoted to mentor, ensure mentor profile exists
  if (role === "MENTOR") {
    let mp = await MentorProfile.findOne({ userId });
    if (!mp) {
      let p = await Profile.findOne({ userId });
      if (p) {
        mp = await MentorProfile.create({
          id: userId,
          profileId: p.id,
          userId,
          headline: p.bio || "SkillSync Mentor",
          rating: 5.0,
          reviewCount: 0,
          accepting: true,
        });
      }
    }
  }

  return res.json(user.toJSON());
});

// PATCH /api/admin/users/:id/enabled
router.patch("/users/:id/enabled", async (req, res) => {
  const userId = Number(req.params.id);
  let enabledVal = req.query.enabled;
  if (enabledVal === undefined && req.body && req.body.enabled !== undefined) {
    enabledVal = req.body.enabled;
  }
  const isEnabled = enabledVal === true || enabledVal === "true";

  const user = await User.findOne({ id: userId });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.enabled = isEnabled;
  await user.save();
  return res.json(user.toJSON());
});

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const totalUsers = await User.countDocuments();
  const mentors = await User.countDocuments({ role: "MENTOR" });
  const admins = await User.countDocuments({ role: "ADMIN" });
  const learners = await User.countDocuments({ role: "USER" });

  return res.json({
    totalUsers,
    mentors,
    admins,
    learners,
  });
});

// GET /api/admin/audit-logs
router.get("/audit-logs", async (req, res) => {
  const page = parseInt(req.query.page, 10) || 0;
  const size = parseInt(req.query.size, 10) || 20;

  const totalElements = await AuditLog.countDocuments();
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .skip(page * size)
    .limit(size);

  return res.json({
    content: logs,
    totalElements,
    totalPages: Math.ceil(totalElements / size) || 1,
    number: page,
    size,
  });
});

// GET /api/admin/analytics
router.get("/analytics", async (req, res) => {
  const profilesCount = await Profile.countDocuments();
  const mentorsCount = await MentorProfile.countDocuments();
  const pendingRequests = await MatchRequest.countDocuments({ status: "PENDING" });
  const acceptedRequests = await MatchRequest.countDocuments({ status: "ACCEPTED" });
  const skillsCount = await Skill.countDocuments();
  const skills = await Skill.find();

  return res.json({
    profiles: profilesCount,
    mentors: mentorsCount,
    pendingRequests,
    acceptedRequests,
    skills: skillsCount,
    skillTrends: skills.map((s) => ({ name: s.name, category: s.category })),
    growth: [
      { month: "Jan", users: 12, mentors: 3 },
      { month: "Feb", users: 28, mentors: 7 },
      { month: "Mar", users: 45, mentors: 11 },
      { month: "Apr", users: 62, mentors: 14 },
      { month: "May", users: 81, mentors: 18 },
      { month: "Jun", users: 104, mentors: 22 },
    ],
  });
});

// GET /api/admin/ai-stats
router.get("/ai-stats", async (req, res) => {
  const chatCalls = await AiUsage.countDocuments({ kind: "chat" });
  const sessions = await ChatSession.countDocuments();
  const documents = await RagDocument.countDocuments();

  return res.json({
    chatCalls,
    sessions,
    documents,
  });
});

export default router;
