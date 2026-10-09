import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { CreateCategoryBody, CreateProductBody } from "./types.js";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        slug: true;
      };
    };
  };
}>;

const formatProduct = (product: ProductWithCategory) => {
  const { categoryId: _categoryId, category, ...productData } = product;

  return {
    ...productData,
    categorySlug: category?.slug ?? null,
  };
};

export const getCrackersData = async (_request: Request, response: Response): Promise<void> => {
  try {
    const items = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    response.json({ items: items.map(formatProduct) });
    /*
       
    */
    
  } catch (error) {
    console.error("Failed to retrieve items:", error);
    response.status(500).json({
      error: "Failed to retrieve items.",
    });
  }
};

export const createProduct = async (
  request: Request<Record<string, string>, unknown, CreateProductBody>,
  response: Response,
): Promise<void> => {
  const {
    code,
    name,
    description,
    content,
    actualPrice,
    price,
    discount,
    stock,
    minOrderQty,
    maxOrderQty,
    imageUrl,
    categoryId,
    categorySlug,
    isActive,
    isFeatured,
  } = request.body;

  try {
    let resolvedCategoryId = categoryId;

    if (categorySlug) {
      const category = await db.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (!category) {
        response.status(400).json({
          error: `No category exists with slug "${categorySlug}".`,
        });
        return;
      }

      resolvedCategoryId = category.id;
    }

    const product = await db.product.create({
      data: {
        code,
        name,
        description,
        content,
        actualPrice,
        price,
        discount,
        stock,
        minOrderQty,
        maxOrderQty,
        imageUrl,
        categoryId: resolvedCategoryId,
        isActive: isActive === undefined ? true : Boolean(isActive),
        isFeatured: isFeatured === undefined ? false : Boolean(isFeatured),
      },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    response.status(201).json({
      status: true,
      message: "Product created Sucessfully",
      product: formatProduct(product),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({ error: "A product with this code already exists." });
      return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      response.status(400).json({
        error: "The provided category does not exist.",
      });
      return;
    }

    console.error("Failed to create product:", error);
    response.status(500).json({ error: "Failed to create product." });
  }
};

export const createCategory = async (
  request: Request<Record<string, string>, unknown, CreateCategoryBody>,
  response: Response,
): Promise<void> => {
  const { name, slug, description, imageUrl, sortOrder, isActive } = request.body;

  try {
    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        imageUrl,
        sortOrder,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    response
      .status(201)
      .json({ status: true, message: "Category Created Successfully ", category });
      
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      response.status(409).json({
        error: "A category with this name or slug already exists.",
      });
      return;
    }

    console.error("Failed to create category:", error);
    response.status(500).json({ error: "Failed to create category." });
  }
};

export const getCart = async (request: Request, response: Response): Promise<void> => {
  try {
    let guestToken = request.cookies.cart_id as string | undefined;
    let cart = guestToken
      ? await db.cart.findUnique({
          where: { guestToken },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: {
                      select: { slug: true },
                    },
                  },
                },
              },
            },
          },
        })
      : null;

    if (!cart) {
      guestToken = randomUUID();
      cart = await db.cart.create({
        data: { guestToken },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: {
                    select: { slug: true },
                  },
                },
              },
            },
          },
        },
      });

      response.cookie("cart_id", guestToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 30,
        path: "/",
      });
    }

    const items = cart.items.map((item) => {
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

    response.json({
      cart: {
        id: cart.id,
        items,
        summary: { totalItems, subtotal },
      },
    });
  } catch (error) {
    console.error("Failed to retrieve cart:", error);
    response.status(500).json({ error: "Failed to retrieve cart." });
  }
};
