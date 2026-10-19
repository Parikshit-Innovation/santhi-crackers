import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(currentDir, "../../.env") });
config({ path: path.resolve(currentDir, "../../../.env") });
config();

import app from "./src/app.js";

const port = Number(process.env.PORT ?? 3007);
const host = "0.0.0.0";

const server = app.listen(port, host, () => {
  console.log(`API server listening on http://${host}:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  console.error(`API server failed to start on ${host}:${port} -`, error.message);
  process.exit(1);
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("API server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
