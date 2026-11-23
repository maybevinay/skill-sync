import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    userId: { type: Number, required: true, index: true },
    kind: { type: String, required: true, maxlength: 32 },
    tokens: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AiUsage = mongoose.model("AiUsage", aiUsageSchema);
