import { verifyToken } from "../config/jwt.js";
import { User } from "../models/User.js";

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice(7).trim();
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findOne({ id: decoded.userId });
    if (!user || !user.enabled) {
      return res.status(401).json({ message: "Unauthorized or account disabled" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  const token = header.slice(7).trim();
  const decoded = verifyToken(token);
  if (decoded && decoded.userId) {
    try {
      const user = await User.findOne({ id: decoded.userId });
      if (user && user.enabled) {
        req.user = user;
      }
    } catch {
      // ignore
    }
  }
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
