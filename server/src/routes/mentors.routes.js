import express from "express";
import { Profile, MentorProfile } from "../models/Profile.js";
import { Skill } from "../models/Skill.js";
import { User } from "../models/User.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware } from "../middleware/auth.js";
import { scoreMatch } from "../services/matchingEngine.js";

const router = express.Router();

router.use(authMiddleware);

async function getSkillMap() {
  const allSkills = await Skill.find();
  const map = {};
  for (const s of allSkills) {
    map[s.id] = s;
  }
  return map;
}

// GET /api/mentors
router.get("/", async (req, res) => {
  const { country, minRating, minExp, skill, availability } = req.query;

  const learnerProfile = (await Profile.findOne({ userId: req.user.id })) || {
    userId: req.user.id,
    experienceYears: 0,
    skills: [],
    availability: "WEEKNIGHTS",
  };

  const skillCatalogMap = await getSkillMap();
  const mentorProfiles = await MentorProfile.find({ accepting: true });

  const cards = [];
  for (const mp of mentorProfiles) {
    const p = await Profile.findOne({ id: mp.profileId });
    if (!p) continue;

    // Filter by country
    if (country && p.country && p.country.toLowerCase() !== country.toLowerCase()) {
      continue;
    }

    // Filter by minRating
    if (minRating !== undefined && mp.rating < parseFloat(minRating)) {
      continue;
    }

    // Filter by minExp
    if (minExp !== undefined && p.experienceYears < parseInt(minExp, 10)) {
      continue;
    }

    // Filter by availability
    if (
      availability &&
      p.availability !== availability &&
      p.availability !== "FLEXIBLE"
    ) {
      continue;
    }

    const mentorSkillNames = (p.skills || [])
      .map((ps) => skillCatalogMap[ps.skillId]?.name || "")
      .filter(Boolean);

    // Filter by skill
    if (skill && skill.trim()) {
      const targetSkill = skill.trim().toLowerCase();
      const hasSkill = mentorSkillNames.some((sn) => sn.toLowerCase().includes(targetSkill));
      if (!hasSkill) continue;
    }

    const match = scoreMatch(learnerProfile, mp, p, skillCatalogMap);

    cards.push({
      mentorId: mp.id,
      profileId: p.id,
      fullName: p.fullName,
      photoUrl: p.photoUrl || null,
      headline: mp.headline,
      country: p.country || null,
      experienceYears: p.experienceYears || 0,
      availability: p.availability || "FLEXIBLE",
      rating: mp.rating,
      reviewCount: mp.reviewCount,
      matchScore: match.matchScore,
      reasons: match.reasons,
      skills: mentorSkillNames,
    });
  }

  // Sort by matchScore descending
  cards.sort((a, b) => b.matchScore - a.matchScore);
  return res.json(cards);
});

// GET /api/mentors/recommendations
router.get("/recommendations", async (req, res) => {
  const learnerProfile = (await Profile.findOne({ userId: req.user.id })) || {
    userId: req.user.id,
    experienceYears: 0,
    skills: [],
    availability: "WEEKNIGHTS",
  };

  const skillCatalogMap = await getSkillMap();
  const mentorProfiles = await MentorProfile.find({ accepting: true });

  const recommendations = [];
  for (const mp of mentorProfiles) {
    const p = await Profile.findOne({ id: mp.profileId });
    if (!p) continue;
    const match = scoreMatch(learnerProfile, mp, p, skillCatalogMap);
    recommendations.push(match);
  }

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return res.json(recommendations.slice(0, 8));
});

// GET /api/mentors/:mentorId/match
router.get("/:mentorId/match", async (req, res) => {
  const mentorId = Number(req.params.mentorId);
  const mp = await MentorProfile.findOne({ id: mentorId });
  if (!mp) {
    return res.status(404).json({ message: "Mentor not found" });
  }

  const p = await Profile.findOne({ id: mp.profileId });
  if (!p) {
    return res.status(404).json({ message: "Mentor profile not found" });
  }

  const learnerProfile = (await Profile.findOne({ userId: req.user.id })) || {
    userId: req.user.id,
    experienceYears: 0,
    skills: [],
    availability: "WEEKNIGHTS",
  };

  const skillCatalogMap = await getSkillMap();
  const match = scoreMatch(learnerProfile, mp, p, skillCatalogMap);
  return res.json(match);
});

// POST /api/mentors/become
router.post("/become", async (req, res) => {
  const { headline } = req.body || {};
  let p = await Profile.findOne({ userId: req.user.id });
  if (!p) {
    const nextId = await getNextSequence("profile");
    p = await Profile.create({
      id: nextId,
      userId: req.user.id,
      fullName: req.user.fullName,
      skills: [],
    });
  }

  let mp = await MentorProfile.findOne({ profileId: p.id });
  if (!mp) {
    const nextMpId = await getNextSequence("mentor_profile");
    mp = await MentorProfile.create({
      id: nextMpId,
      profileId: p.id,
      userId: req.user.id,
      headline: headline || "Mentor on SkillSync",
      rating: 5.0,
      reviewCount: 0,
      accepting: true,
    });
  } else {
    if (headline) mp.headline = headline;
    mp.accepting = true;
    await mp.save();
  }

  const user = await User.findOne({ id: req.user.id });
  if (user && user.role === "USER") {
    user.role = "MENTOR";
    await user.save();
  }

  return res.json(mp);
});

export default router;
