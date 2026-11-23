import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change-me-to-a-256-bit-secret-key-for-hs256-skillsync";
const JWT_ISSUER = process.env.JWT_ISSUER || "skillsync";

export function signAccessToken(user) {
  const payload = {
    sub: String(user.id),
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    name: user.fullName,
    jti: crypto.randomUUID(),
  };
  return jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: "15m",
  });
}

export function signRefreshToken(user) {
  const payload = {
    sub: String(user.id),
    userId: user.id,
    type: "refresh",
    jti: crypto.randomUUID(),
  };
  return jwt.sign(payload, JWT_SECRET, {
    issuer: JWT_ISSUER,
    expiresIn: "7d",
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: JWT_ISSUER });
  } catch (err) {
    return null;
  }
}
