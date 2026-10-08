import type { Request, Response } from "express";
import { db } from "@repo/db/client";

const PAGE_SIZE = 10;

export const getItems = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const requestedPage = Number(request.query.page ?? 1);

  if (!Number.isInteger(requestedPage) || requestedPage < 1) {
    response.status(400).json({
      error: "The page query parameter must be a positive integer.",
    });
    return;
  }
  
  const [items, totalItems] = await Promise.all([
    db.product.findMany({
      skip: (requestedPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    db.product.count(),
  ]);

  response.json({
    items,
    pagination: {
      page: requestedPage,
      limit: PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
    },
  });
};