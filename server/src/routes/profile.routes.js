import express from "express";
import { Profile, MentorProfile } from "../models/Profile.js";
import { Skill } from "../models/Skill.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

export function calculateCompletionScore(p) {
  let score = 20;
  if (p.bio && p.bio.trim()) score += 15;
  if (p.learningGoals && p.learningGoals.trim()) score += 15;
  if (p.photoUrl && p.photoUrl.trim()) score += 10;
  if (p.country && p.country.trim()) score += 5;
  if (p.linkedinUrl && p.linkedinUrl.trim()) score += 5;
  if (p.githubUrl && p.githubUrl.trim()) score += 5;
  if (p.portfolioUrl && p.portfolioUrl.trim()) score += 5;
  if (p.skills && p.skills.length > 0) score += 20;
  return Math.min(100, score);
}

export async function formatProfileResponse(profile, userId) {
  const allSkills = await Skill.find();
  const skillMap = new Map(allSkills.map((s) => [s.id, s]));

  const skillsFormatted = (profile.skills || []).map((ps) => {
    const s = skillMap.get(ps.skillId);
    return {
      skillId: ps.skillId,
      id: ps.skillId,
      name: s?.name || "Skill",
      category: s?.category || "General",
      level: ps.level || "INTERMEDIATE",
      progress: ps.progress || 0,
    };
  });

  const mentorProfile = await MentorProfile.findOne({ userId });

  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    photoUrl: profile.photoUrl || null,
    bio: profile.bio || null,
    learningGoals: profile.learningGoals || null,
    experienceYears: profile.experienceYears || 0,
    availability: profile.availability || "WEEKNIGHTS",
    country: profile.country || null,
    linkedinUrl: profile.linkedinUrl || null,
    githubUrl: profile.githubUrl || null,
    portfolioUrl: profile.portfolioUrl || null,
    completionScore: calculateCompletionScore(profile),
    skills: skillsFormatted,
    isMentor: !!mentorProfile,
  };
}

// GET /api/profile/me
router.get("/me", async (req, res) => {
  let profile = await Profile.findOne({ userId: req.user.id });
  if (!profile) {
    const nextId = await getNextSequence("profile");
    profile = await Profile.create({
      id: nextId,
      userId: req.user.id,
      fullName: req.user.fullName || "New Member",
      availability: "WEEKNIGHTS",
      experienceYears: 0,
      skills: [],
    });
  }

  const response = await formatProfileResponse(profile, req.user.id);
  return res.json(response);
});

// PUT /api/profile/me
router.put("/me", async (req, res) => {
  const {
    fullName,
    photoUrl,
    bio,
    learningGoals,
    experienceYears,
    availability,
    country,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
  } = req.body || {};

  if (experienceYears !== undefined && experienceYears < 0) {
    return res.status(400).json({ message: "Experience years cannot be negative" });
  }

  const validAvail = ["WEEKDAYS", "WEEKNIGHTS", "WEEKENDS", "FLEXIBLE"];
  if (availability && !validAvail.includes(availability)) {
    return res.status(400).json({ message: "Invalid availability value" });
  }

  let profile = await Profile.findOne({ userId: req.user.id });
  if (!profile) {
    const nextId = await getNextSequence("profile");
    profile = new Profile({
      id: nextId,
      userId: req.user.id,
      skills: [],
    });
  }

  if (fullName) profile.fullName = fullName.trim();
  if (photoUrl !== undefined) profile.photoUrl = photoUrl;
  if (bio !== undefined) profile.bio = bio;
  if (learningGoals !== undefined) profile.learningGoals = learningGoals;
  if (experienceYears !== undefined) profile.experienceYears = Math.max(0, Math.min(80, experienceYears));
  if (availability) profile.availability = availability;
  if (country !== undefined) profile.country = country;
  if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) profile.githubUrl = githubUrl;
  if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;

  await profile.save();

  const response = await formatProfileResponse(profile, req.user.id);
  return res.json(response);
});

// POST /api/profile/me/skills
router.post("/me/skills", async (req, res) => {
  const { skillId, level, progress } = req.body || {};
  if (!skillId) {
    return res.status(400).json({ message: "Skill ID is required" });
  }

  const skill = await Skill.findOne({ id: Number(skillId) });
  if (!skill) {
    return res.status(404).json({ message: "Skill not found" });
  }

  let profile = await Profile.findOne({ userId: req.user.id });
  if (!profile) {
    const nextId = await getNextSequence("profile");
    profile = await Profile.create({
      id: nextId,
      userId: req.user.id,
      fullName: req.user.fullName,
      skills: [],
    });
  }

  const existingIdx = (profile.skills || []).findIndex((s) => s.skillId === skill.id);
  if (existingIdx >= 0) {
    profile.skills[existingIdx].level = level || profile.skills[existingIdx].level;
    profile.skills[existingIdx].progress = progress !== undefined ? progress : profile.skills[existingIdx].progress;
  } else {
    profile.skills.push({
      skillId: skill.id,
      level: level || "INTERMEDIATE",
      progress: progress !== undefined ? progress : 40,
    });
  }

  await profile.save();
  const response = await formatProfileResponse(profile, req.user.id);
  return res.json(response);
});

// DELETE /api/profile/me/skills/:skillId
router.delete("/me/skills/:skillId", async (req, res) => {
  const skillId = Number(req.params.skillId);
  const profile = await Profile.findOne({ userId: req.user.id });
  if (profile) {
    profile.skills = (profile.skills || []).filter((s) => s.skillId !== skillId);
    await profile.save();
  }
  return res.status(204).send();
});

export default router;
