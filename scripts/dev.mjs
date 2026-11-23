import { spawn } from "child_process";
import process from "process";

console.log("\n=======================================================");
console.log("  Starting SkillSync MERN Stack (Server + Frontend)   ");
console.log("=======================================================\n");

const server = spawn("node", ["server/src/index.js"], {
  stdio: "inherit",
  shell: true,
});

const client = spawn("npm", ["--prefix", "frontend-react", "run", "dev"], {
  stdio: "inherit",
  shell: true,
});

function cleanup() {
  console.log("\nShutting down SkillSync...");
  try {
    server.kill();
  } catch {}
  try {
    client.kill();
  } catch {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

server.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Server process exited with code ${code}`);
  }
});

client.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`Client process exited with code ${code}`);
  }
});
