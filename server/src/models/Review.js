import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    requestId: { type: Number, required: true, unique: true, index: true },
    reviewerId: { type: Number, required: true, index: true }, // Profile ID
    reviewerUserId: { type: Number, required: true, index: true },
    mentorId: { type: Number, required: true, index: true }, // MentorProfile ID
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 600 },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
