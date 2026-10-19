import cookieParser from "cookie-parser";
import express from "express";
import apiRoute from "./routes.js";
import { corsMiddleware } from "./utils.js";

const app = express();

// Trust reverse proxy (Render / Cloudflare) for secure cookies and client IP resolution
app.set("trust proxy", 1);

app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

// Lightweight health-check endpoint for Render / monitoring
app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api", apiRoute);

// Global error handling middleware - prevent leaking stack traces or credentials in production
app.use(
  (
    err: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    const errorObj = err as { status?: number; statusCode?: number; message?: string };
    const statusCode = errorObj.status || errorObj.statusCode || 500;
    console.error("API error encountered:", errorObj.message || err);

    response.status(statusCode).json({
      error:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred. Please try again."
          : errorObj.message || "Internal server error",
    });
  },
);

export default app;
