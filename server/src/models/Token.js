import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const emailVerificationTokenSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
export const EmailVerificationToken = mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);
