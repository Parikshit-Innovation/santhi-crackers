import type { Request, Response } from "express";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import test from "node:test";
import { loginAdmin, requireAdmin } from "../src/admin-auth.js";

const createResponse = () => {
  let statusCode = 200;
  let body: unknown;
  const headers = new Map<string, string>();
  const response = {
    setHeader(name: string, value: string) {
      headers.set(name, value);
      return this;
    },
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(value: unknown) {
      body = value;
      return this;
    },
  } as unknown as Response;
  return {
    response,
    get statusCode() {
      return statusCode;
    },
    get body() {
      return body;
    },
    headers,
  };
};

test("admin login issues a signed token accepted only by the configured admin", async () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const originalSessionSecret = process.env.ADMIN_SESSION_SECRET;
  const salt = randomBytes(16);
  const secret = randomBytes(32).toString("hex");
  process.env.ADMIN_USERNAME = "orders-admin";
  process.env.ADMIN_SESSION_SECRET = secret;
  process.env.ADMIN_PASSWORD_HASH = `scrypt$${salt.toString("hex")}$${scryptSync(
    "correct horse battery staple",
    salt,
    64,
    {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    },
  ).toString("hex")}`;

  try {
    const loginResult = createResponse();
    await loginAdmin(
      {
        body: { username: "orders-admin", password: "correct horse battery staple" },
        socket: { remoteAddress: "192.0.2.10" },
      } as Request,
      loginResult.response,
      () => undefined,
    );

    assert.equal(loginResult.statusCode, 200);
    assert.equal(loginResult.headers.get("Cache-Control"), "no-store");
    const loginBody = loginResult.body as {
      token: string;
      tokenType: string;
      expiresInSeconds: number;
    };
    assert.equal(loginBody.tokenType, "Bearer");
    assert.equal(loginBody.expiresInSeconds, 8 * 60 * 60);

    let authorized = false;
    requireAdmin(
      { get: () => `Bearer ${loginBody.token}` } as unknown as Request,
      createResponse().response,
      (() => {
        authorized = true;
      }) as never,
    );
    assert.equal(authorized, true);

    const rejected = createResponse();
    requireAdmin(
      { get: () => `Bearer ${loginBody.token}x` } as unknown as Request,
      rejected.response,
      (() => undefined) as never,
    );
    assert.equal(rejected.statusCode, 401);

    const originalNow = Date.now;
    Date.now = () => originalNow() + 9 * 60 * 60 * 1000;
    try {
      const expired = createResponse();
      requireAdmin(
        { get: () => `Bearer ${loginBody.token}` } as unknown as Request,
        expired.response,
        (() => undefined) as never,
      );
      assert.equal(expired.statusCode, 401);
    } finally {
      Date.now = originalNow;
    }
  } finally {
    if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = originalUsername;
    if (originalPasswordHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = originalPasswordHash;
    if (originalSessionSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = originalSessionSecret;
  }
});

test("admin login rejects bad credentials and throttles repeated failures by socket address", async () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const originalSessionSecret = process.env.ADMIN_SESSION_SECRET;
  const salt = randomBytes(16);
  process.env.ADMIN_USERNAME = "orders-admin";
  process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  process.env.ADMIN_PASSWORD_HASH = `scrypt$${salt.toString("hex")}$${scryptSync(
    "correct horse battery staple",
    salt,
    64,
    {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    },
  ).toString("hex")}`;

  try {
    let response = createResponse();
    await loginAdmin(
      {
        body: { username: "orders-admin", password: "incorrect password" },
        socket: { remoteAddress: "192.0.2.11" },
      } as Request,
      response.response,
      () => undefined,
    );
    assert.equal(response.statusCode, 401);

    for (let attempt = 1; attempt < 5; attempt += 1) {
      response = createResponse();
      await loginAdmin(
        {
          body: { username: "orders-admin", password: "incorrect password" },
          socket: { remoteAddress: "192.0.2.11" },
        } as Request,
        response.response,
        () => undefined,
      );
      assert.equal(response.statusCode, 401);
    }

    response = createResponse();
    await loginAdmin(
      {
        body: { username: "orders-admin", password: "correct horse battery staple" },
        socket: { remoteAddress: "192.0.2.11" },
      } as Request,
      response.response,
      () => undefined,
    );
    assert.equal(response.statusCode, 429);
    assert.ok(Number(response.headers.get("Retry-After")) > 0);
  } finally {
    if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = originalUsername;
    if (originalPasswordHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = originalPasswordHash;
    if (originalSessionSecret === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = originalSessionSecret;
  }
});
