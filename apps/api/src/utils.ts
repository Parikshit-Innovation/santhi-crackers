import type { Prisma } from "@prisma/client";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import type { CartItemResponse, CartResponse } from "./types.js";

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
            name: item.product.name,
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
