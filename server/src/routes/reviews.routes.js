import express from "express";
import { Review } from "../models/Review.js";
import { MatchRequest } from "../models/MatchRequest.js";
import { Profile, MentorProfile } from "../models/Profile.js";
import { getNextSequence } from "../models/Counter.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

async function toReviewView(r) {
  const reviewer = await Profile.findOne({ id: r.reviewerId });
  return {
    id: r.id,
    requestId: r.requestId,
    mentorId: r.mentorId,
    reviewerName: reviewer?.fullName || "Learner",
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  };
}

// GET /api/reviews
router.get("/", authMiddleware, async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  const views = await Promise.all(reviews.map(toReviewView));
  return res.json(views);
});

// GET /api/mentors/:mentorId/reviews
router.get("/mentors/:mentorId/reviews", optionalAuth, async (req, res) => {
  const mentorId = Number(req.params.mentorId);
  const reviews = await Review.find({ mentorId }).sort({ createdAt: -1 });
  const views = await Promise.all(reviews.map(toReviewView));
  return res.json(views);
});

// POST /api/reviews
router.post("/", authMiddleware, async (req, res) => {
  const { requestId, rating, comment } = req.body || {};

  if (!requestId || Number(requestId) < 1) {
    return res.status(400).json({ message: "Select a mentorship request" });
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: "Rating must be 1-5" });
  }

  const matchReq = await MatchRequest.findOne({ id: Number(requestId) });
  if (!matchReq) {
    return res.status(404).json({ message: "Request not found" });
  }

  if (matchReq.learnerUserId !== req.user.id) {
    return res.status(403).json({ message: "Only the learner can review" });
  }

  if (matchReq.status !== "ACCEPTED" && matchReq.status !== "COMPLETED") {
    return res.status(400).json({ message: "Request must be accepted or completed" });
  }

  const existing = await Review.findOne({ requestId: matchReq.id });
  if (existing) {
    return res.status(409).json({ message: "Review already submitted for this request" });
  }

  const nextId = await getNextSequence("review");
  const review = await Review.create({
    id: nextId,
    requestId: matchReq.id,
    reviewerId: matchReq.learnerId,
    reviewerUserId: req.user.id,
    mentorId: matchReq.mentorId,
    rating: numRating,
    comment: comment || "",
  });

  // Recalculate mentor rating
  const allMentorReviews = await Review.find({ mentorId: matchReq.mentorId });
  const total = allMentorReviews.reduce((sum, r) => sum + r.rating, 0);
  const avg = allMentorReviews.length > 0 ? total / allMentorReviews.length : 5.0;

  await MentorProfile.updateOne(
    { id: matchReq.mentorId },
    {
      $set: {
        rating: Number(avg.toFixed(2)),
        reviewCount: allMentorReviews.length,
      },
    }
  );

  matchReq.status = "COMPLETED";
  await matchReq.save();

  const view = await toReviewView(review);
  return res.status(201).json(view);
});

export default router;
