import type { IncomingMessage, ServerResponse } from "node:http";

let appPromise: Promise<any> | null = null;

function getApp() {
  if (!appPromise) {
    appPromise = import("../apps/api/src/app.js").then((m) => m.default || m);
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();

  const url = req.url || "/";
  const matchedPath = (req.headers["x-matched-path"] as string) || url;

  if (url === "/api" || url === "/api/") {
    if (matchedPath && matchedPath !== "/api" && matchedPath !== "/api/") {
      req.url = matchedPath;
    }
  }

  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/health")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  return app(req, res);
}
