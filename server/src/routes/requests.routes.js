import express from "express";
import { MatchRequest } from "../models/MatchRequest.js";
import { Profile, MentorProfile } from "../models/Profile.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

async function toRequestView(reqDoc) {
  const learner = await Profile.findOne({ id: reqDoc.learnerId });
  const mentorProfile = await MentorProfile.findOne({ id: reqDoc.mentorId });
  const mentorPerson = mentorProfile ? await Profile.findOne({ id: mentorProfile.profileId }) : null;

  return {
    id: reqDoc.id,
    learnerId: reqDoc.learnerId,
    mentorId: reqDoc.mentorId,
    learnerUserId: reqDoc.learnerUserId,
    learnerName: learner?.fullName || "Learner",
    mentorName: mentorPerson?.fullName || "Mentor",
    message: reqDoc.message,
    status: reqDoc.status,
    createdAt: reqDoc.createdAt,
  };
}

// GET /api/requests
router.get("/", async (req, res) => {
  const learnerProfile = await Profile.findOne({ userId: req.user.id });
  const mentorProfile = await MentorProfile.findOne({ userId: req.user.id });

  const queryOr = [];
  if (learnerProfile) {
    queryOr.push({ learnerId: learnerProfile.id });
  }
  if (mentorProfile) {
    queryOr.push({ mentorId: mentorProfile.id });
  }

  if (queryOr.length === 0) {
    return res.json([]);
  }

  const requests = await MatchRequest.find({ $or: queryOr }).sort({ createdAt: -1 });
  const views = await Promise.all(requests.map(toRequestView));
  return res.json(views);
});

// POST /api/requests
router.post("/", async (req, res) => {
  const { mentorId, message } = req.body || {};

  if (!mentorId) {
    return res.status(400).json({ message: "Mentor ID is required" });
  }

  const mentor = await MentorProfile.findOne({ id: Number(mentorId) });
  if (!mentor) {
    return res.status(404).json({ message: "Mentor not found" });
  }

  if (mentor.userId === req.user.id) {
    return res.status(400).json({ message: "You cannot request mentorship from yourself" });
  }

  let learnerProfile = await Profile.findOne({ userId: req.user.id });
  if (!learnerProfile) {
    const nextPId = await getNextSequence("profile");
    learnerProfile = await Profile.create({
      id: nextPId,
      userId: req.user.id,
      fullName: req.user.fullName,
      skills: [],
    });
  }

  // Check duplicate open request
  const existingOpen = await MatchRequest.findOne({
    learnerUserId: req.user.id,
    mentorId: mentor.id,
    status: { $in: ["PENDING", "ACCEPTED"] },
  });
  if (existingOpen) {
    return res.status(409).json({ message: "You already have an open request with this mentor" });
  }

  const nextId = await getNextSequence("match_request");
  const request = await MatchRequest.create({
    id: nextId,
    learnerId: learnerProfile.id,
    learnerUserId: req.user.id,
    mentorId: mentor.id,
    message: message || "I'd like to learn from you.",
    status: "PENDING",
  });

  const view = await toRequestView(request);
  return res.status(201).json(view);
});

// PATCH /api/requests/:id
router.patch("/:id", async (req, res) => {
  const requestId = Number(req.params.id);
  const status = (req.query.status || req.body?.status || "").toUpperCase();

  const VALID_STATUSES = ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const reqDoc = await MatchRequest.findOne({ id: requestId });
  if (!reqDoc) {
    return res.status(404).json({ message: "Request not found" });
  }

  const mentorProfile = await MentorProfile.findOne({ id: reqDoc.mentorId });
  const isMentorOwner = mentorProfile && mentorProfile.userId === req.user.id;
  const isLearnerOwner = reqDoc.learnerUserId === req.user.id;
  const isAdmin = req.user.role === "ADMIN";

  if (!isMentorOwner && !isLearnerOwner && !isAdmin) {
    return res.status(403).json({ message: "Not your request" });
  }

  if (status === "ACCEPTED" || status === "DECLINED") {
    if (!isMentorOwner && !isAdmin) {
      return res.status(403).json({ message: "Only the mentor can accept or decline a request" });
    }
    if (reqDoc.status !== "PENDING") {
      return res.status(400).json({ message: "Only pending requests can be accepted or declined" });
    }
  } else if (status === "COMPLETED") {
    if (reqDoc.status !== "ACCEPTED" && reqDoc.status !== "COMPLETED") {
      return res.status(400).json({ message: "Request must be accepted before it can be completed" });
    }
  } else if (status === "PENDING") {
    return res.status(400).json({ message: "Cannot revert a request to pending" });
  }

  reqDoc.status = status;
  await reqDoc.save();

  const view = await toRequestView(reqDoc);
  return res.json(view);
});

export default router;
