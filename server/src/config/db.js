import mongoose from "mongoose";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let mongoProcess = null;
let memServer = null;

const LOCAL_BINARY = "D:\\.mongo-binaries\\mongod-x64-win32-6.0.14.exe";
const LOCAL_DATA = "D:\\.mongo-data";

async function waitPort(port, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const net = import("net").then(({ default: net }) => {
          const socket = net.createConnection({ port, host: "127.0.0.1" }, () => {
            socket.end();
            resolve();
          });
          socket.on("error", reject);
        });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return false;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/skillsync";

  // 1. First attempt: connect directly to running MongoDB
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected to MongoDB at ${uri.replace(/\/\/.*@/, "//***@")}`);
    return;
  } catch (err) {
    console.log(`[MongoDB] No running MongoDB detected on 27017 (${err.message}).`);
  }

  // 2. Second attempt: start local mongod binary if present
  if (fs.existsSync(LOCAL_BINARY)) {
    try {
      if (!fs.existsSync(LOCAL_DATA)) {
        fs.mkdirSync(LOCAL_DATA, { recursive: true });
      }
      console.log(`[MongoDB] Starting local MongoDB instance (${LOCAL_BINARY})...`);
      mongoProcess = spawn(LOCAL_BINARY, ["--dbpath", LOCAL_DATA, "--port", "27017"], {
        detached: false,
        stdio: "ignore",
      });

      const ready = await waitPort(27017, 8000);
      if (ready) {
        await mongoose.connect(uri);
        console.log(`[MongoDB] Successfully started & connected to local MongoDB at ${uri}`);
        return;
      }
    } catch (launchErr) {
      console.warn("[MongoDB] Could not launch local binary:", launchErr.message);
    }
  }

  // 3. Third attempt: In-memory MongoDB
  try {
    if (fs.existsSync(LOCAL_BINARY)) {
      process.env.MONGOMS_SYSTEM_BINARY = LOCAL_BINARY;
    }
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    await mongoose.connect(memUri);
    console.log(`[MongoDB] Connected to in-memory MongoDB at ${memUri}`);
  } catch (memErr) {
    console.error("[MongoDB] Failed to connect to any MongoDB instance:", memErr.message);
    throw memErr;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoProcess) {
    mongoProcess.kill();
  }
  if (memServer) {
    await memServer.stop();
  }
}
