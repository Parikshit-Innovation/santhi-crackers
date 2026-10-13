import { db } from "@repo/db/client";
import type { RequestHandler } from "express";
import { parseInventoryListQuery, parseOrderId, parseStockUpdate } from "./inventory-validation.js";

// ── Stock status ──────────────────────────────────────────────────────────────

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export const stockStatus = (stock: number): StockStatus => {
  if (stock === 0) return "OUT_OF_STOCK";
  if (stock <= 10) return "LOW_STOCK";
  return "IN_STOCK";
};

// ── Inventory list ────────────────────────────────────────────────────────────

export const getAdminInventory: RequestHandler = async (request, response): Promise<void> => {
  const query = parseInventoryListQuery(request.query as Record<string, unknown>);
  if (!query) {
    response.status(400).json({ error: "Invalid page, limit, or search." });
    return;
  }

  const where = query.search
    ? {
        OR: [
          { code: { contains: query.search, mode: "insensitive" as const } },
          { name: { contains: query.search, mode: "insensitive" as const } },
          { nameEng: { contains: query.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  try {
    const [products, totalItems] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: [{ code: "asc" }, { id: "asc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          code: true,
          name: true,
          nameEng: true,
          nameTam: true,
          stock: true,
          minOrderQty: true,
          maxOrderQty: true,
          isActive: true,
          isFeatured: true,
          imageUrl: true,
          price: true,
          actualPrice: true,
          categoryId: true,
          updatedAt: true,
        },
      }),
      db.product.count({ where }),
    ]);

    response.json({
      items: products.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        nameEng: p.nameEng,
        nameTam: p.nameTam,
        stock: p.stock,
        stockStatus: stockStatus(p.stock),
        minOrderQty: p.minOrderQty,
        maxOrderQty: p.maxOrderQty,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        imageUrl: p.imageUrl,
        price: p.price.toFixed(2),
        actualPrice: p.actualPrice.toFixed(2),
        categoryId: p.categoryId,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / query.limit),
      },
    });
  } catch (error) {
    console.error("Failed to retrieve inventory:", error);
    response.status(500).json({ error: "Failed to retrieve inventory." });
  }
};

// ── Update product stock ──────────────────────────────────────────────────────

export const updateProductStock: RequestHandler = async (request, response): Promise<void> => {
  const id = parseOrderId(request.params["id"]);
  if (!id) {
    response.status(400).json({ error: "Invalid product ID." });
    return;
  }

  const parsed = parseStockUpdate(request.body);
  if (parsed === null) {
    response.status(400).json({
      error: "stock and expectedStock must both be non-negative integers.",
    });
    return;
  }

  try {
    // Compare-and-swap: the WHERE clause pins the *current* stock to the value
    // the admin last saw (`expectedStock`).  If a concurrent checkout decremented
    // stock, or another admin updated it, the row no longer matches and
    // `count` comes back as 0.  This is a single atomic UPDATE — no
    // application-level transaction or isolation level is needed because the
    // atomicity guarantee comes from the database row-level CAS itself.
    //
    // The checkout transaction (SERIALIZABLE + stock ≥ qty guard) remains
    // unchanged; if *this* admin write lands first, the checkout will see the
    // new stock value in its snapshot and proceed (or fail if stock is now too
    // low), or receive a P2034 serialization error when its snapshot is stale.
    const result = await db.product.updateMany({
      where: { id, stock: parsed.expectedStock },
      data: { stock: parsed.stock },
    });

    if (result.count === 0) {
      // Either the product doesn't exist, or stock was modified concurrently.
      const current = await db.product.findUnique({
        where: { id },
        select: { id: true, stock: true },
      });
      if (!current) {
        response.status(404).json({ error: "Product not found." });
        return;
      }
      // Stock changed since the admin read it — tell them the current value.
      response.status(409).json({
        error: "Stock was modified concurrently. Please refresh and retry.",
        currentStock: current.stock,
      });
      return;
    }

    // Re-fetch the updated row to return canonical data.
    const updated = await db.product.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        nameEng: true,
        nameTam: true,
        stock: true,
        minOrderQty: true,
        maxOrderQty: true,
        isActive: true,
        isFeatured: true,
        imageUrl: true,
        price: true,
        actualPrice: true,
        categoryId: true,
        updatedAt: true,
      },
    });

    if (!updated) {
      response.status(404).json({ error: "Product not found." });
      return;
    }

    response.json({
      item: {
        id: updated.id,
        code: updated.code,
        name: updated.name,
        nameEng: updated.nameEng,
        nameTam: updated.nameTam,
        stock: updated.stock,
        stockStatus: stockStatus(updated.stock),
        minOrderQty: updated.minOrderQty,
        maxOrderQty: updated.maxOrderQty,
        isActive: updated.isActive,
        isFeatured: updated.isFeatured,
        imageUrl: updated.imageUrl,
        price: updated.price.toFixed(2),
        actualPrice: updated.actualPrice.toFixed(2),
        categoryId: updated.categoryId,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update product stock:", error);
    response.status(500).json({ error: "Failed to update product stock." });
  }
};
