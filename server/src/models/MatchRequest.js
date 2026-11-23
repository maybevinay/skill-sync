import mongoose from "mongoose";

const matchRequestSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    learnerId: { type: Number, required: true, index: true }, // Profile ID
    learnerUserId: { type: Number, required: true, index: true },
    mentorId: { type: Number, required: true, index: true }, // MentorProfile ID
    message: { type: String, required: true, trim: true, maxlength: 600 },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

export const MatchRequest = mongoose.model("MatchRequest", matchRequestSchema);
