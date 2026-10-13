import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import test from "node:test";
import { requireAdmin } from "../src/admin-auth.js";
import { getAdminInventory, stockStatus, updateProductStock } from "../src/inventory.js";

// ── Shared test helpers (mirrored from orders.test.ts conventions) ────────────

const createResponse = () => {
  let statusCode = 200;
  let body: unknown;
  const response = {
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
  };
};

/** Replaces db.product[methodName] for the duration of `run`, then restores it. */
const withMockProductMethod = async <T>(
  methodName: string,
  impl: (...args: unknown[]) => unknown,
  run: () => Promise<T>,
): Promise<T> => {
  const delegate = db.product as unknown as object;
  const original = Object.getOwnPropertyDescriptor(delegate, methodName);
  Object.defineProperty(delegate, methodName, { configurable: true, value: impl });
  try {
    return await run();
  } finally {
    if (original) Object.defineProperty(delegate, methodName, original);
    else Reflect.deleteProperty(delegate, methodName);
  }
};

// ── stockStatus helper ────────────────────────────────────────────────────────

test("stockStatus returns correct labels for all thresholds", () => {
  assert.equal(stockStatus(0), "OUT_OF_STOCK");
  assert.equal(stockStatus(1), "LOW_STOCK");
  assert.equal(stockStatus(10), "LOW_STOCK");
  assert.equal(stockStatus(11), "IN_STOCK");
  assert.equal(stockStatus(1000), "IN_STOCK");
});

// ── getAdminInventory ─────────────────────────────────────────────────────────

const makeProduct = (overrides: Partial<typeof baseProd> = {}) => ({ ...baseProd, ...overrides });
const baseProd = {
  id: "prod-1",
  code: "SKY-01",
  name: "Sky Shot",
  nameEng: "Sky Shot EN",
  nameTam: null as string | null,
  stock: 15,
  minOrderQty: 1,
  maxOrderQty: null as number | null,
  isActive: true,
  isFeatured: false,
  imageUrl: null as string | null,
  price: new Prisma.Decimal("120.00"),
  actualPrice: new Prisma.Decimal("150.00"),
  categoryId: null as string | null,
  updatedAt: new Date("2026-10-13T10:00:00.000Z"),
};

test("inventory list returns paginated items with correct stock statuses", async () => {
  const products = [
    makeProduct({ id: "prod-1", stock: 15 }), // IN_STOCK
    makeProduct({ id: "prod-2", code: "SKY-02", stock: 5 }), // LOW_STOCK
    makeProduct({ id: "prod-3", code: "SKY-03", stock: 0 }), // OUT_OF_STOCK
  ];

  const delegate = db.product as unknown as object;
  const origFindMany = Object.getOwnPropertyDescriptor(delegate, "findMany");
  const origCount = Object.getOwnPropertyDescriptor(delegate, "count");

  Object.defineProperty(delegate, "findMany", {
    configurable: true,
    value: async () => products,
  });
  Object.defineProperty(delegate, "count", {
    configurable: true,
    value: async () => 3,
  });

  const result = createResponse();
  try {
    await getAdminInventory(
      { query: { page: "1", limit: "20" } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (origFindMany) Object.defineProperty(delegate, "findMany", origFindMany);
    else Reflect.deleteProperty(delegate, "findMany");
    if (origCount) Object.defineProperty(delegate, "count", origCount);
    else Reflect.deleteProperty(delegate, "count");
  }

  assert.equal(result.statusCode, 200);
  const body = result.body as {
    items: Array<{ id: string; stock: number; stockStatus: string; price: string }>;
    pagination: { page: number; limit: number; totalItems: number; totalPages: number };
  };
  assert.equal(body.items.length, 3);
  assert.equal(body.items[0]!.stockStatus, "IN_STOCK");
  assert.equal(body.items[1]!.stockStatus, "LOW_STOCK");
  assert.equal(body.items[2]!.stockStatus, "OUT_OF_STOCK");
  assert.equal(body.items[0]!.price, "120.00");
  assert.deepEqual(body.pagination, { page: 1, limit: 20, totalItems: 3, totalPages: 1 });
});

test("inventory list returns 400 for invalid query parameters", async () => {
  const result = createResponse();
  await getAdminInventory(
    { query: { page: "0" } } as unknown as Request,
    result.response,
    () => undefined,
  );
  assert.equal(result.statusCode, 400);
});

test("inventory list returns 500 on database failure", async () => {
  const delegate = db.product as unknown as object;
  const origFindMany = Object.getOwnPropertyDescriptor(delegate, "findMany");
  const origCount = Object.getOwnPropertyDescriptor(delegate, "count");

  Object.defineProperty(delegate, "findMany", {
    configurable: true,
    value: async () => {
      throw new Error("DB gone");
    },
  });
  Object.defineProperty(delegate, "count", {
    configurable: true,
    value: async () => 0,
  });

  const result = createResponse();
  try {
    await getAdminInventory({ query: {} } as unknown as Request, result.response, () => undefined);
  } finally {
    if (origFindMany) Object.defineProperty(delegate, "findMany", origFindMany);
    else Reflect.deleteProperty(delegate, "findMany");
    if (origCount) Object.defineProperty(delegate, "count", origCount);
    else Reflect.deleteProperty(delegate, "count");
  }

  assert.equal(result.statusCode, 500);
  const body = result.body as { error: string };
  assert.ok(body.error);
  assert.ok(!body.error.includes("DB gone"));
});

// ── updateProductStock ────────────────────────────────────────────────────────

test("updateProductStock sets stock and returns updated item with recalculated stockStatus", async () => {
  const updatedProduct = makeProduct({ stock: 8 }); // LOW_STOCK after update

  let updateArgs: unknown;
  const delegate = db.product as unknown as object;
  const origUpdateMany = Object.getOwnPropertyDescriptor(delegate, "updateMany");
  const origFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "updateMany", {
    configurable: true,
    value: async (args: unknown) => {
      updateArgs = args;
      return { count: 1 };
    },
  });
  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    value: async () => updatedProduct,
  });

  const result = createResponse();
  try {
    await updateProductStock(
      { params: { id: "prod-1" }, body: { stock: 8, expectedStock: 15 } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (origUpdateMany) Object.defineProperty(delegate, "updateMany", origUpdateMany);
    else Reflect.deleteProperty(delegate, "updateMany");
    if (origFindUnique) Object.defineProperty(delegate, "findUnique", origFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 200);
  const body = result.body as {
    item: { id: string; stock: number; stockStatus: string; price: string };
  };
  assert.equal(body.item.id, "prod-1");
  assert.equal(body.item.stock, 8);
  assert.equal(body.item.stockStatus, "LOW_STOCK");
  assert.equal(body.item.price, "120.00");

  // Verify the WHERE clause used expectedStock as a compare-and-swap guard.
  const where = (updateArgs as { where: { stock: number } }).where;
  assert.equal(where.stock, 15, "WHERE clause must pin stock to expectedStock");
});

test("updateProductStock returns 409 with currentStock when expectedStock does not match", async () => {
  // Simulate a concurrent checkout having decremented stock from 15 to 10.
  const delegate = db.product as unknown as object;
  const origUpdateMany = Object.getOwnPropertyDescriptor(delegate, "updateMany");
  const origFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "updateMany", {
    configurable: true,
    // count = 0 means the WHERE clause (stock = expectedStock) didn't match.
    value: async () => ({ count: 0 }),
  });
  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    // Product exists but stock differs from expectedStock.
    value: async () => ({ id: "prod-1", stock: 10 }),
  });

  const result = createResponse();
  try {
    await updateProductStock(
      // Admin saw 15 but current stock is 10.
      { params: { id: "prod-1" }, body: { stock: 200, expectedStock: 15 } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (origUpdateMany) Object.defineProperty(delegate, "updateMany", origUpdateMany);
    else Reflect.deleteProperty(delegate, "updateMany");
    if (origFindUnique) Object.defineProperty(delegate, "findUnique", origFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 409);
  const body = result.body as { error: string; currentStock: number };
  assert.ok(body.error.toLowerCase().includes("concurrently"));
  assert.equal(body.currentStock, 10, "Response must include the actual current stock");
});

test("updateProductStock returns 404 when the product does not exist", async () => {
  const delegate = db.product as unknown as object;
  const origUpdateMany = Object.getOwnPropertyDescriptor(delegate, "updateMany");
  const origFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "updateMany", {
    configurable: true,
    value: async () => ({ count: 0 }),
  });
  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    value: async () => null,
  });

  const result = createResponse();
  try {
    await updateProductStock(
      {
        params: { id: "nonexistent" },
        body: { stock: 10, expectedStock: 0 },
      } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (origUpdateMany) Object.defineProperty(delegate, "updateMany", origUpdateMany);
    else Reflect.deleteProperty(delegate, "updateMany");
    if (origFindUnique) Object.defineProperty(delegate, "findUnique", origFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.body, { error: "Product not found." });
});

test.describe("updateProductStock rejects invalid stock values", () => {
  const invalidCases: Array<{ label: string; body: unknown }> = [
    { label: "negative stock", body: { stock: -1, expectedStock: 0 } },
    { label: "fractional stock", body: { stock: 2.5, expectedStock: 0 } },
    { label: "missing stock field", body: { expectedStock: 0 } },
    { label: "string stock", body: { stock: "10", expectedStock: 0 } },
    { label: "null stock", body: { stock: null, expectedStock: 0 } },
    { label: "missing expectedStock", body: { stock: 10 } },
    { label: "negative expectedStock", body: { stock: 10, expectedStock: -1 } },
    { label: "fractional expectedStock", body: { stock: 10, expectedStock: 2.5 } },
    { label: "string expectedStock", body: { stock: 10, expectedStock: "10" } },
    { label: "null expectedStock", body: { stock: 10, expectedStock: null } },
    { label: "not an object", body: 42 },
  ];

  for (const { label, body } of invalidCases) {
    test(`rejects ${label}`, async () => {
      const result = createResponse();
      await updateProductStock(
        { params: { id: "prod-1" }, body } as unknown as Request,
        result.response,
        () => undefined,
      );
      assert.equal(result.statusCode, 400);
    });
  }
});

test("updateProductStock returns 500 on database failure", async () => {
  const delegate = db.product as unknown as object;
  const origUpdateMany = Object.getOwnPropertyDescriptor(delegate, "updateMany");

  Object.defineProperty(delegate, "updateMany", {
    configurable: true,
    value: async () => {
      throw new Error("connection timeout");
    },
  });

  const result = createResponse();
  try {
    await updateProductStock(
      { params: { id: "prod-1" }, body: { stock: 5, expectedStock: 10 } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (origUpdateMany) Object.defineProperty(delegate, "updateMany", origUpdateMany);
    else Reflect.deleteProperty(delegate, "updateMany");
  }

  assert.equal(result.statusCode, 500);
  const body = result.body as { error: string };
  assert.ok(body.error);
  assert.ok(!body.error.includes("connection timeout"));
});

// ── requireAdmin guards both inventory endpoints ───────────────────────────────

const makeAdminEnv = () => {
  const salt = randomBytes(16);
  return {
    ADMIN_USERNAME: "inventory-admin",
    ADMIN_SESSION_SECRET: "s".repeat(32),
    ADMIN_PASSWORD_HASH: `scrypt$${salt.toString("hex")}$${scryptSync("pw", salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    }).toString("hex")}`,
  };
};

const setAdminEnv = (env: Record<string, string>) => {
  const originals: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    originals[k] = process.env[k];
    process.env[k] = v;
  }
  return () => {
    for (const [k, orig] of Object.entries(originals)) {
      if (orig === undefined) delete process.env[k];
      else process.env[k] = orig;
    }
  };
};

test("GET /admin/inventory requires admin authentication", () => {
  const restore = setAdminEnv(makeAdminEnv());
  try {
    const result = createResponse();
    let nextCalled = false;
    requireAdmin(
      { get: (_name: string) => undefined } as unknown as Request,
      result.response,
      () => {
        nextCalled = true;
      },
    );
    assert.equal(nextCalled, false);
    assert.equal(result.statusCode, 401);
    assert.ok((result.body as { error: string }).error);
  } finally {
    restore();
  }
});

test("PATCH /admin/inventory/:id requires admin authentication", () => {
  const restore = setAdminEnv(makeAdminEnv());
  try {
    const result = createResponse();
    let nextCalled = false;
    requireAdmin(
      { get: (_name: string) => undefined } as unknown as Request,
      result.response,
      () => {
        nextCalled = true;
      },
    );
    assert.equal(nextCalled, false);
    assert.equal(result.statusCode, 401);
    assert.ok((result.body as { error: string }).error);
  } finally {
    restore();
  }
});
