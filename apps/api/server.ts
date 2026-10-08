import { config } from "dotenv";
import express from "express";
import apiRoute from "./src/routes.js";

config({ path: "../../.env" });

const app = express();
const port = Number(process.env.PORT ?? 3007);

app.use(express.json());

app.use("/api", apiRoute);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
