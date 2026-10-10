import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { CreateCategoryBody, CreateProductBody } from "./types.js";
import { CART_COOKIE_NAME, formatCart, getCartCookieOptions, parsePagination } from "./utils.js";


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
    const cookieToken = request.cookies?.[CART_COOKIE_NAME] as string | undefined;

    let cart = cookieToken
      ? await db.cart.findFirst({
          where: {
            OR: [{ guestToken: cookieToken }, { id: cookieToken }],
          },
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
      const guestToken = randomUUID();
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

      response.cookie(CART_COOKIE_NAME, guestToken, getCartCookieOptions());
    }

    response.json({
      cart: formatCart(cart),
    });
  } catch (error) {
    console.error("Failed to retrieve cart:", error);
    response.status(500).json({ error: "Failed to retrieve cart." });
  }
};

export const getProductsByCategory = async (request: Request, response: Response): Promise<void> => {
  const { slug } = request.params;
  const pagination = parsePagination(request.query.page, request.query.limit);

  if (!pagination) {
    response.status(400).json({
      error: {
        code: "INVALID_PAGINATION",
        message: "Page must be a positive integer and limit must be between 1 and 10.",
      },
    });
    return;
  }

  const { page, limit } = pagination;

  try {
    const category = await db.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });

    if (!category || !category.isActive) {
      response.status(404).json({ error: "Category not found." });
      return;
    }

    const where = {
      categoryId: category.id,
      isActive: true,
    };

    const [totalItems, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: { slug: true },
          },
        },
      }),
    ]);

    response.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      items: products.map(formatProduct),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error("Failed to retrieve products by category:", error);
    response.status(500).json({ error: "Failed to retrieve products." });
  }
};


