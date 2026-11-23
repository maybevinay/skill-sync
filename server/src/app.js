import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import skillsRoutes from "./routes/skills.routes.js";
import mentorsRoutes from "./routes/mentors.routes.js";
import requestsRoutes from "./routes/requests.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import ragRoutes from "./routes/rag.routes.js";

export function createApp() {
  const app = express();

  // Enable CORS for frontend
  app.use(
    cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
  );

  // Parse JSON bodies with custom syntax error handling (returns 400 on malformed JSON)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Spring Boot / Actuator health check emulation
  const healthCheck = (req, res) => {
    res.json({
      status: "UP",
      stack: "MERN",
      timestamp: new Date().toISOString(),
    });
  };
  app.get("/actuator/health", healthCheck);
  app.get("/api/health", healthCheck);

  // Mount API routers
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/skills", skillsRoutes);
  app.use("/api/mentors", mentorsRoutes);
  app.use("/api/requests", requestsRoutes);
  app.use("/api/reviews", reviewsRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/rag", ragRoutes);

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({ message: `Not Found: ${req.method} ${req.originalUrl}` });
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    // Malformed JSON check
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).json({ message: "Malformed JSON payload" });
    }

    const status = err.status || 500;
    const message = err.message || "Internal server error";

    if (status === 500) {
      console.error("[ServerError]", err);
    }

    return res.status(status).json({ message });
  });

  return app;
}
