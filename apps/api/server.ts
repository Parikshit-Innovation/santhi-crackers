import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(currentDir, "../../.env") });
config({ path: path.resolve(currentDir, "../../../.env") });
config();

import cookieParser from "cookie-parser";
import express from "express";
import apiRoute from "./src/routes.js";

const app = express();
const port = Number(process.env.PORT ?? 3007);

app.use(express.json());
app.use(cookieParser());

app.use("/api", apiRoute);


app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
