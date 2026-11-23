import http from "http";
import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { seedDatabase } from "./services/seeder.js";

dotenv.config();

const MAIN_PORT = parseInt(process.env.PORT, 10) || 8080;
const COMPAT_PORTS = [8081, 8082, 8083];

async function startServer() {
  console.log("==========================================");
  console.log("   SkillSync MERN Backend Starting...     ");
  console.log("==========================================");

  // 1. Connect to MongoDB (local or in-memory fallback)
  await connectDB();

  // 2. Seed initial data
  await seedDatabase();

  const app = createApp();

  // 3. Start Main Gateway Server (8080)
  const mainServer = http.createServer(app);
  mainServer.listen(MAIN_PORT, "0.0.0.0", () => {
    console.log(`[SkillSync Gateway] Listening on http://localhost:${MAIN_PORT}`);
  });

  // 4. Start Microservice Compatibility Listeners (8081, 8082, 8083)
  for (const port of COMPAT_PORTS) {
    if (port === MAIN_PORT) continue;
    try {
      const server = http.createServer(app);
      server.listen(port, "0.0.0.0", () => {
        console.log(`[Compatibility Port] Listening on http://localhost:${port}`);
      });
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`[Compatibility Port] Port ${port} already in use; skipping.`);
        } else {
          console.warn(`[Compatibility Port] Port ${port} error:`, err.message);
        }
      });
    } catch (err) {
      console.warn(`[Compatibility Port] Could not bind to ${port}:`, err.message);
    }
  }

  console.log("\nSkillSync MERN API is ready for requests!");
}

startServer().catch((err) => {
  console.error("Failed to start SkillSync server:", err);
  process.exit(1);
});
