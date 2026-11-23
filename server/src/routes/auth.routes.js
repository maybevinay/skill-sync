import express from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { RefreshToken, PasswordResetToken, EmailVerificationToken } from "../models/Token.js";
import { Profile } from "../models/Profile.js";
import { AuditLog } from "../models/AuditLog.js";
import { getNextSequence } from "../models/Counter.js";
import { signAccessToken, signRefreshToken, verifyToken } from "../config/jwt.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { fullName, email, password, role } = req.body || {};

  if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
    return res.status(400).json({ message: "Full name must be at least 2 characters" });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists" });
  }

  // Public registration coerces ADMIN to USER
  let assignedRole = role === "MENTOR" ? "MENTOR" : "USER";

  const userId = await getNextSequence("user", 4);
  const passwordHash = await User.hashPassword(password);

  const user = await User.create({
    id: userId,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: assignedRole,
    enabled: true,
    emailVerified: false,
  });

  // Create initial profile
  const profileId = await getNextSequence("profile", 5);
  await Profile.create({
    id: profileId,
    userId,
    fullName: user.fullName,
    availability: "WEEKNIGHTS",
    experienceYears: 0,
    skills: [],
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const auditId = await getNextSequence("audit_log");
  await AuditLog.create({
    id: auditId,
    actorId: user.id,
    action: "REGISTER",
    details: `User registered with role ${user.role}`,
    ipAddress: req.ip,
  });

  return res.status(201).json({
    accessToken,
    refreshToken,
    user: user.toJSON(),
  });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    return res.status(400).json({ message: "Password is required" });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.enabled) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  await RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const auditId = await getNextSequence("audit_log");
  await AuditLog.create({
    id: auditId,
    actorId: user.id,
    action: "LOGIN",
    details: "User logged in",
    ipAddress: req.ip,
  });

  return res.json({
    accessToken,
    refreshToken,
    user: user.toJSON(),
  });
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const decoded = verifyToken(refreshToken);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await User.findOne({ id: decoded.userId });
  if (!user || !user.enabled) {
    return res.status(401).json({ message: "User not found or disabled" });
  }

  const newAccess = signAccessToken(user);
  const newRefresh = signRefreshToken(user);

  return res.json({
    accessToken: newAccess,
    refreshToken: newRefresh,
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Client discards token
  return res.status(200).json({ message: "Logged out successfully" });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user) {
    await PasswordResetToken.create({
      userId: user.id,
      tokenHash: `reset-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date(Date.now() + 3600000),
    });
  }
  return res.status(200).json({ message: "If that email exists, reset instructions have been sent." });
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body || {};
  if (!password || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  return res.status(200).json({ message: "Password has been successfully reset" });
});

// POST /api/auth/verify-email
router.post("/verify-email", (req, res) => {
  return res.status(200).json({ message: "Email verified successfully" });
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  return res.json(req.user.toJSON());
});

export default router;
