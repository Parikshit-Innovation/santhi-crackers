import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import test from "node:test";
import { requireAdmin } from "../src/admin-auth.js";
import { createOrder, getAdminOrderById, getAdminOrders } from "../src/orders.js";

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

const createRequest = (quantity: number): Request =>
  ({
    body: {
      customerName: "A Customer",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "12 Example Street, Sivakasi",
      items: [{ productId: "product-a", quantity }],
    },
  }) as Request;

const withMockTransaction = async <T>(transaction: unknown, run: () => Promise<T>): Promise<T> => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(db, "$transaction");
  Object.defineProperty(db, "$transaction", {
    configurable: true,
    value: (callback: (client: unknown) => Promise<unknown>) => callback(transaction),
  });

  try {
    return await run();
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(db, "$transaction", originalDescriptor);
    } else {
      Reflect.deleteProperty(db, "$transaction");
    }
  }
};

const availableProduct = {
  id: "product-a",
  code: "CRACKER-01",
  name: "Cracker",
  nameEng: "Celebration Cracker",
  price: new Prisma.Decimal("12.34"),
  stock: 8,
  minOrderQty: 1,
  maxOrderQty: 5,
  isActive: true,
};

test("checkout creates price snapshots and decrements stock atomically", async () => {
  let stockUpdate: unknown;
  let orderData: Record<string, unknown> | undefined;
  const transaction = {
    product: {
      findMany: async () => [availableProduct],
      updateMany: async (args: unknown) => {
        stockUpdate = args;
        return { count: 1 };
      },
    },
    order: {
      create: async (args: { data: Record<string, unknown> }) => {
        orderData = args.data;
        return {
          id: "order-a",
          status: "PENDING",
          paymentStatus: "PENDING",
          total: new Prisma.Decimal("37.02"),
          createdAt: new Date("2026-10-13T12:00:00.000Z"),
          items: [{ quantity: 3 }],
        };
      },
    },
  };

  const result = createResponse();
  await withMockTransaction(transaction, () =>
    createOrder(createRequest(3), result.response, () => undefined),
  );

  assert.equal(result.statusCode, 201);
  const responseBody = result.body as { order: { total: string; paymentStatus: string } };
  assert.equal(responseBody.order.total, "37.02");
  assert.equal(responseBody.order.paymentStatus, "PENDING");
  assert.ok(stockUpdate);
  const stockArgs = stockUpdate as {
    where: { stock: { gte: number } };
    data: { stock: { decrement: number } };
  };
  assert.equal(stockArgs.where.stock.gte, 3);
  assert.equal(stockArgs.data.stock.decrement, 3);

  assert.ok(orderData);
  assert.equal((orderData.subtotal as Prisma.Decimal).toFixed(2), "37.02");
  assert.equal((orderData.total as Prisma.Decimal).toFixed(2), "37.02");
  assert.equal((orderData.shippingAmount as Prisma.Decimal).toFixed(2), "0.00");
  assert.equal((orderData.discountAmount as Prisma.Decimal).toFixed(2), "0.00");
  const nestedItems = orderData.items as { create: Array<Record<string, unknown>> };
  assert.equal(nestedItems.create[0].productName, "Celebration Cracker");
  assert.equal(nestedItems.create[0].productCode, "CRACKER-01");
  assert.equal((nestedItems.create[0].unitPrice as Prisma.Decimal).toFixed(2), "12.34");
  assert.equal((nestedItems.create[0].lineTotal as Prisma.Decimal).toFixed(2), "37.02");
});

test("checkout rejects insufficient stock without writing inventory or an order", async () => {
  let inventoryWrites = 0;
  let orderWrites = 0;
  const transaction = {
    product: {
      findMany: async () => [{ ...availableProduct, stock: 2 }],
      updateMany: async () => {
        inventoryWrites += 1;
        return { count: 1 };
      },
    },
    order: {
      create: async () => {
        orderWrites += 1;
        throw new Error("Order creation should not be reached");
      },
    },
  };

  const result = createResponse();
  await withMockTransaction(transaction, () =>
    createOrder(createRequest(3), result.response, () => undefined),
  );

  assert.equal(result.statusCode, 409);
  assert.equal(inventoryWrites, 0);
  assert.equal(orderWrites, 0);
});

test("checkout maps Prisma serialization conflicts to a retryable response", async () => {
  const conflict = new Prisma.PrismaClientKnownRequestError("Transaction conflict", {
    code: "P2034",
    clientVersion: "6.19.3",
  });
  const originalDescriptor = Object.getOwnPropertyDescriptor(db, "$transaction");
  Object.defineProperty(db, "$transaction", {
    configurable: true,
    value: async () => {
      throw conflict;
    },
  });

  const result = createResponse();
  try {
    await createOrder(createRequest(1), result.response, () => undefined);
  } finally {
    if (originalDescriptor) {
      Object.defineProperty(db, "$transaction", originalDescriptor);
    } else {
      Reflect.deleteProperty(db, "$transaction");
    }
  }

  assert.equal(result.statusCode, 409);
  assert.deepEqual(result.body, {
    error: "Product stock changed during checkout. Please try again.",
  });
});

test("admin order list applies filters, search, pagination, and stable ordering", async () => {
  const delegate = db.order as unknown as object;
  const originalFindMany = Object.getOwnPropertyDescriptor(delegate, "findMany");
  const originalCount = Object.getOwnPropertyDescriptor(delegate, "count");
  let queryArgs: Record<string, unknown> | undefined;

  Object.defineProperty(delegate, "findMany", {
    configurable: true,
    value: async (args: Record<string, unknown>) => {
      queryArgs = args;
      return [
        {
          id: "order-a",
          customerName: "A Customer",
          customerPhone: "9876543210",
          status: "PENDING",
          paymentStatus: "PENDING",
          total: new Prisma.Decimal("23.45"),
          createdAt: new Date("2026-10-13T12:00:00.000Z"),
          items: [{ quantity: 1 }, { quantity: 2 }],
        },
      ];
    },
  });
  Object.defineProperty(delegate, "count", {
    configurable: true,
    value: async () => 5,
  });

  const result = createResponse();
  try {
    await getAdminOrders(
      {
        query: {
          search: "9876543210",
          status: "pending",
          paymentStatus: "pending",
          page: "2",
          limit: "2",
        },
      } as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (originalFindMany) Object.defineProperty(delegate, "findMany", originalFindMany);
    else Reflect.deleteProperty(delegate, "findMany");
    if (originalCount) Object.defineProperty(delegate, "count", originalCount);
    else Reflect.deleteProperty(delegate, "count");
  }

  assert.equal(result.statusCode, 200);
  assert.ok(queryArgs);
  assert.equal(queryArgs.skip, 2);
  assert.equal(queryArgs.take, 2);
  assert.deepEqual(queryArgs.orderBy, [{ createdAt: "desc" }, { id: "desc" }]);
  const where = queryArgs.where as {
    status: string;
    paymentStatus: string;
    OR: Array<Record<string, unknown>>;
  };
  assert.equal(where.status, "PENDING");
  assert.equal(where.paymentStatus, "PENDING");
  assert.deepEqual(
    where.OR.map((condition) => Object.keys(condition)[0]),
    ["id", "customerName", "customerPhone"],
  );

  const body = result.body as {
    items: Array<{ itemCount: number; total: string; customer: { phone: string } }>;
    pagination: { page: number; limit: number; totalItems: number; totalPages: number };
  };
  assert.equal(body.items[0].itemCount, 3);
  assert.equal(body.items[0].total, "23.45");
  assert.equal(body.items[0].customer.phone, "9876543210");
  assert.deepEqual(body.pagination, { page: 2, limit: 2, totalItems: 5, totalPages: 3 });
});

// ── getAdminOrderById tests ──────────────────────────────────────────────────

const sampleOrder = {
  id: "order-b",
  customerName: "Test Customer",
  customerPhone: "+91 99999 00000",
  deliveryAddress: "5 Main Road, Sivakasi",
  status: "CONFIRMED" as const,
  paymentStatus: "PAID" as const,
  subtotal: new Prisma.Decimal("100.00"),
  shippingAmount: new Prisma.Decimal("10.00"),
  discountAmount: new Prisma.Decimal("5.00"),
  total: new Prisma.Decimal("105.00"),
  createdAt: new Date("2026-10-13T08:00:00.000Z"),
  updatedAt: new Date("2026-10-13T09:00:00.000Z"),
  items: [
    {
      id: "item-1",
      productName: "Sky Shot",
      productCode: "SKY-01",
      quantity: 2,
      unitPrice: new Prisma.Decimal("50.00"),
      lineTotal: new Prisma.Decimal("100.00"),
    },
  ],
};

test("admin order details returns full order with customer, totals, timestamps, and item snapshots", async () => {
  const delegate = db.order as unknown as object;
  const originalFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    value: async (_args: unknown) => sampleOrder,
  });

  const result = createResponse();
  try {
    await getAdminOrderById(
      { params: { id: "order-b" } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (originalFindUnique) Object.defineProperty(delegate, "findUnique", originalFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 200);
  const body = result.body as {
    order: {
      id: string;
      customer: { name: string; phone: string };
      deliveryAddress: string;
      status: string;
      paymentStatus: string;
      subtotal: string;
      shippingAmount: string;
      discountAmount: string;
      total: string;
      createdAt: Date;
      updatedAt: Date;
      items: Array<{
        id: string;
        productName: string;
        productCode: string;
        quantity: number;
        unitPrice: string;
        lineTotal: string;
      }>;
    };
  };
  assert.equal(body.order.id, "order-b");
  assert.equal(body.order.customer.name, "Test Customer");
  assert.equal(body.order.customer.phone, "+91 99999 00000");
  assert.equal(body.order.deliveryAddress, "5 Main Road, Sivakasi");
  assert.equal(body.order.status, "CONFIRMED");
  assert.equal(body.order.paymentStatus, "PAID");
  assert.equal(body.order.subtotal, "100.00");
  assert.equal(body.order.shippingAmount, "10.00");
  assert.equal(body.order.discountAmount, "5.00");
  assert.equal(body.order.total, "105.00");
  assert.deepEqual(body.order.createdAt, new Date("2026-10-13T08:00:00.000Z"));
  assert.deepEqual(body.order.updatedAt, new Date("2026-10-13T09:00:00.000Z"));
  assert.equal(body.order.items.length, 1);
  assert.equal(body.order.items[0]!.productName, "Sky Shot");
  assert.equal(body.order.items[0]!.productCode, "SKY-01");
  assert.equal(body.order.items[0]!.quantity, 2);
  assert.equal(body.order.items[0]!.unitPrice, "50.00");
  assert.equal(body.order.items[0]!.lineTotal, "100.00");
});

test("admin order details returns 404 when the order does not exist", async () => {
  const delegate = db.order as unknown as object;
  const originalFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    value: async (_args: unknown) => null,
  });

  const result = createResponse();
  try {
    await getAdminOrderById(
      { params: { id: "nonexistent-id" } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (originalFindUnique) Object.defineProperty(delegate, "findUnique", originalFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 404);
  assert.deepEqual(result.body, { error: "Order not found." });
});

test("admin order details returns a generic 500 on database failure", async () => {
  const delegate = db.order as unknown as object;
  const originalFindUnique = Object.getOwnPropertyDescriptor(delegate, "findUnique");

  Object.defineProperty(delegate, "findUnique", {
    configurable: true,
    value: async (_args: unknown) => {
      throw new Error("DB connection lost");
    },
  });

  const result = createResponse();
  try {
    await getAdminOrderById(
      { params: { id: "order-b" } } as unknown as Request,
      result.response,
      () => undefined,
    );
  } finally {
    if (originalFindUnique) Object.defineProperty(delegate, "findUnique", originalFindUnique);
    else Reflect.deleteProperty(delegate, "findUnique");
  }

  assert.equal(result.statusCode, 500);
  const responseBody = result.body as { error: string };
  assert.ok(responseBody.error);
  assert.ok(!responseBody.error.includes("DB connection lost"));
});

test("admin order details requires authentication via requireAdmin middleware", () => {
  const originalUsername = process.env.ADMIN_USERNAME;
  const originalPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const originalSession = process.env.ADMIN_SESSION_SECRET;

  // Provide valid admin config so requireAdmin parses config successfully and
  // can evaluate the (absent) token — then reject with 401, not 503.
  const salt = randomBytes(16);
  process.env.ADMIN_USERNAME = "test-admin";
  process.env.ADMIN_SESSION_SECRET = "a".repeat(32);
  process.env.ADMIN_PASSWORD_HASH = `scrypt$${salt.toString("hex")}$${scryptSync("pass", salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  }).toString("hex")}`;

  try {
    const result = createResponse();
    let nextCalled = false;
    requireAdmin(
      // No Authorization header — simulates an unauthenticated request.
      { get: (_name: string) => undefined } as unknown as Request,
      result.response,
      () => {
        nextCalled = true;
      },
    );
    assert.equal(nextCalled, false);
    assert.equal(result.statusCode, 401);
    const responseBody = result.body as { error: string };
    assert.ok(responseBody.error);
  } finally {
    if (originalUsername === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = originalUsername;
    if (originalPasswordHash === undefined) delete process.env.ADMIN_PASSWORD_HASH;
    else process.env.ADMIN_PASSWORD_HASH = originalPasswordHash;
    if (originalSession === undefined) delete process.env.ADMIN_SESSION_SECRET;
    else process.env.ADMIN_SESSION_SECRET = originalSession;
  }
});
