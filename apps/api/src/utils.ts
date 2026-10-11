import type { Prisma } from "@prisma/client";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import type { CartItemResponse, CartResponse, ProductSortOption } from "./types.js";

// ── Cart ─────────────────────────────────────────────────────────────────────

export const CART_COOKIE_NAME = "cart_id";

export const getCartCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  path: "/",
});

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            category: {
              select: {
                slug: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export const formatCart = (cart: CartWithItems): CartResponse => {
  const items: CartItemResponse[] = (cart.items ?? []).map((item) => {
    const unitPrice = Number(item.price);

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: unitPrice.toFixed(2),
      total: (unitPrice * item.quantity).toFixed(2),
      ...(item.product
        ? {
            name: item.product.nameEng || item.product.name || "",
            nameEng: item.product.nameEng || item.product.name || null,
            nameTam: item.product.nameTam || null,
            imageUrl: item.product.imageUrl,
            categorySlug: item.product.category?.slug ?? null,
          }
        : {}),
    };
  });

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items
    .reduce((total, item) => total + Number(item.total), 0)
    .toFixed(2);

  return {
    id: cart.id,
    items,
    summary: {
      totalItems,
      subtotal,
    },
  };
};

// ── CORS ─────────────────────────────────────────────────────────────────────

export const corsMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  const origin = request.headers.origin;

  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    response.setHeader("Access-Control-Allow-Origin", "*");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (request.method === "OPTIONS") {
    response.sendStatus(204);
    return;
  }

  next();
};

// ── Pagination ────────────────────────────────────────────────────────────────

export const parsePagination = (
  pageQuery: unknown,
  limitQuery: unknown,
): { page: number; limit: number } | null => {
  const page = Number(pageQuery);
  const limit = Number(limitQuery);

  if (!Number.isInteger(page) || page < 1) {
    return null;
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
    return null;
  }

  return { page, limit };
};

export const SUPPORTED_SORT_OPTIONS: readonly ProductSortOption[] = [
  "newest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export const isValidPositiveInteger = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return /^[1-9]\d*$/.test(trimmed);
};

export const isValidLimit = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return false;
  }
  const num = Number(trimmed);
  return num >= 1 && num <= 10;
};

export const isValidSortOption = (value: unknown): value is ProductSortOption => {
  if (typeof value !== "string") {
    return false;
  }
  return (SUPPORTED_SORT_OPTIONS as readonly string[]).includes(value.trim());
};

export type DecimalLike =
  | {
      toFixed: (dp?: number) => string;
    }
  | number
  | string;

export const formatDecimalPrice = (
  value: DecimalLike | null | undefined,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toFixed" in value &&
    typeof (value as { toFixed: unknown }).toFixed === "function"
  ) {
    return (value as { toFixed: (dp: number) => string }).toFixed(2);
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? value : num.toFixed(2);
  }
  return null;
};
