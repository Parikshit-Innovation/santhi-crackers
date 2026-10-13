import type { RequestHandler } from "express";
import { createHmac, scrypt, timingSafeEqual } from "node:crypto";

const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_HASH_PATTERN = /^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/i;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;
const MAX_TRACKED_LOGIN_CLIENTS = 10_000;

type LoginAttempt = {
  windowStartedAt: number;
  failures: number;
};

const loginAttempts = new Map<string, LoginAttempt>();

type AdminConfig = {
  username: string;
  passwordSalt: Buffer;
  passwordKey: Buffer;
  sessionSecret: string;
};

const getAdminConfig = (): AdminConfig | null => {
  const username = process.env.ADMIN_USERNAME?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const hashMatch = passwordHash?.match(PASSWORD_HASH_PATTERN);

  if (
    !username ||
    username.length > 128 ||
    !sessionSecret ||
    Buffer.byteLength(sessionSecret, "utf8") < 32 ||
    !hashMatch
  ) {
    return null;
  }

  const saltHex = hashMatch[1];
  const keyHex = hashMatch[2];
  if (!saltHex || !keyHex) return null;

  return {
    username,
    passwordSalt: Buffer.from(saltHex, "hex"),
    passwordKey: Buffer.from(keyHex, "hex"),
    sessionSecret,
  };
};

const derivePasswordKey = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });

const safeStringEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};

const sign = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const getLoginAttempt = (clientAddress: string, now: number): LoginAttempt => {
  let attempt = loginAttempts.get(clientAddress);
  if (!attempt || now - attempt.windowStartedAt >= LOGIN_WINDOW_MS) {
    if (loginAttempts.size >= MAX_TRACKED_LOGIN_CLIENTS) {
      for (const [address, trackedAttempt] of loginAttempts) {
        if (now - trackedAttempt.windowStartedAt >= LOGIN_WINDOW_MS) {
          loginAttempts.delete(address);
        }
      }
      if (loginAttempts.size >= MAX_TRACKED_LOGIN_CLIENTS) {
        const oldestAddress = loginAttempts.keys().next().value;
        if (oldestAddress !== undefined) loginAttempts.delete(oldestAddress);
      }
    }
    attempt = { windowStartedAt: now, failures: 0 };
    loginAttempts.set(clientAddress, attempt);
  }
  return attempt;
};

const createToken = (username: string, secret: string): string => {
  const payload = Buffer.from(
    JSON.stringify({ sub: username, exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
};

const isValidToken = (token: string, config: AdminConfig): boolean => {
  const parts = token.split(".");
  const payloadPart = parts[0];
  const signaturePart = parts[1];
  if (parts.length !== 2 || !payloadPart || !signaturePart) return false;

  const expectedSignature = Buffer.from(sign(payloadPart, config.sessionSecret), "base64url");
  const suppliedSignature = Buffer.from(signaturePart, "base64url");
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return false;
  }

  try {
    const payload: unknown = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
    if (typeof payload !== "object" || payload === null) return false;
    const tokenPayload = payload as { sub?: unknown; exp?: unknown };
    return (
      tokenPayload.sub === config.username &&
      typeof tokenPayload.exp === "number" &&
      Number.isSafeInteger(tokenPayload.exp) &&
      tokenPayload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
};

export const loginAdmin: RequestHandler = async (request, response): Promise<void> => {
  const body: unknown = request.body;
  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as { username?: unknown }).username !== "string" ||
    typeof (body as { password?: unknown }).password !== "string"
  ) {
    response.status(400).json({ error: "Username and password are required." });
    return;
  }

  const { username, password } = body as { username: string; password: string };
  if (!username.trim() || username.length > 128 || !password || password.length > 256) {
    response.status(400).json({ error: "Username and password are required." });
    return;
  }

  const config = getAdminConfig();
  if (!config) {
    response.status(503).json({ error: "Admin authentication is not configured." });
    return;
  }

  const now = Date.now();
  const clientAddress = request.socket.remoteAddress ?? "unknown";
  const attempt = getLoginAttempt(clientAddress, now);
  if (attempt.failures >= MAX_LOGIN_FAILURES) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((attempt.windowStartedAt + LOGIN_WINDOW_MS - now) / 1000),
    );
    response.setHeader("Retry-After", String(retryAfterSeconds));
    response.status(429).json({ error: "Too many login attempts. Try again later." });
    return;
  }

  try {
    const submittedKey = await derivePasswordKey(password, config.passwordSalt);
    const passwordMatches = timingSafeEqual(submittedKey, config.passwordKey);
    const usernameMatches = safeStringEqual(username.trim(), config.username);

    if (!usernameMatches || !passwordMatches) {
      attempt.failures += 1;
      response.status(401).json({ error: "Invalid username or password." });
      return;
    }

    loginAttempts.delete(clientAddress);
    response.setHeader("Cache-Control", "no-store");
    response.json({
      token: createToken(config.username, config.sessionSecret),
      tokenType: "Bearer",
      expiresInSeconds: TOKEN_LIFETIME_SECONDS,
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    response.status(500).json({ error: "Unable to authenticate administrator." });
  }
};

export const requireAdmin: RequestHandler = (request, response, next): void => {
  const config = getAdminConfig();
  if (!config) {
    response.status(503).json({ error: "Admin authentication is not configured." });
    return;
  }

  const authorization = request.get("authorization");
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_.-]{1,2048})$/);
  const token = match?.[1];
  if (!token || !isValidToken(token, config)) {
    response.status(401).json({ error: "Administrator authentication is required." });
    return;
  }

  next();
};
