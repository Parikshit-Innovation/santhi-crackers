import { Prisma, db } from "@repo/db/client";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type {
  CatalogProductResponse,
  CategoryListItemResponse,
  CreateCategoryBody,
  CreateProductBody,
  GetCategoriesResponse,
  ProductSortOption,
} from "./types.js";
import {
  formatDecimalPrice,
  isValidLimit,
  isValidPositiveInteger,
  isValidSortOption,
} from "./utils.js";

type ProductWithCategory = NonNullable<
  Awaited<
    ReturnType<
      typeof db.product.findFirst<{
        include: {
          category: {
            select: {
              slug: true;
            };
          };
        };
      }>
    >
  >
>;

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
  } catch (error: any) {
    if (error?.code === "P2002") {
      response.status(409).json({ error: "A product with this code already exists." });
      return;
    }

    if (error?.code === "P2003") {
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
      
  } catch (error: any) {
    if (error?.code === "P2002") {
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

    const items = cart.items.map((item: (typeof cart.items)[number]) => {
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

    const totalItems = items.reduce(
      (total: number, item: (typeof items)[number]) => total + item.quantity,
      0,
    );
    const subtotal = items
      .reduce(
        (total: number, item: (typeof items)[number]) =>
          total + Number(item.total),
        0,
      )
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

export const getProducts = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { page, limit, search, category, sort } = request.query;

    if (page !== undefined && !isValidPositiveInteger(page)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message:
            "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    if (limit !== undefined && !isValidLimit(limit)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message:
            "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    if (sort !== undefined && !isValidSortOption(sort)) {
      response.status(400).json({
        error: {
          code: "INVALID_SORT",
          message:
            "Sort must be one of: newest, price_asc, price_desc, name_asc, name_desc.",
        },
      });
      return;
    }

    const pageNumber =
      page !== undefined ? parseInt((page as string).trim(), 10) : 1;
    const limitNumber =
      limit !== undefined ? parseInt((limit as string).trim(), 10) : 10;
    const sortOption: ProductSortOption =
      sort !== undefined
        ? ((sort as string).trim() as ProductSortOption)
        : "newest";

    type ProductFindManyArgs = NonNullable<Parameters<typeof db.product.findMany>[0]>;
    type ProductWhereInput = NonNullable<ProductFindManyArgs["where"]>;
    type ProductOrderByInput = NonNullable<ProductFindManyArgs["orderBy"]>;

    const where: ProductWhereInput = {
      isActive: true,
    };

    if (typeof category === "string" && category.trim().length > 0) {
      where.category = {
        slug: category.trim(),
        isActive: true,
      };
    }

    if (typeof search === "string" && search.trim().length > 0) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { code: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    let orderBy: ProductOrderByInput;
    switch (sortOption) {
      case "price_asc":
        orderBy = [{ price: "asc" }, { id: "asc" }];
        break;
      case "price_desc":
        orderBy = [{ price: "desc" }, { id: "asc" }];
        break;
      case "name_asc":
        orderBy = [{ name: "asc" }, { id: "asc" }];
        break;
      case "name_desc":
        orderBy = [{ name: "desc" }, { id: "asc" }];
        break;
      case "newest":
      default:
        orderBy = [{ createdAt: "desc" }, { id: "asc" }];
        break;
    }

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const [products, totalItems] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / limitNumber);

    const items: CatalogProductResponse[] = products.map(
      (product: (typeof products)[number]) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      content: product.content,
      actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
      price: formatDecimalPrice(product.price) ?? "0.00",
      discount: formatDecimalPrice(product.discount),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category:
        product.category && product.category.isActive
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    }));

    response.status(200).json({
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages,
      },
    });
    /*
    GET /api/products

    Response (200 OK):
    {
      "items": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 0,
        "totalPages": 0
      }
    }
    */
  } catch (error) {
    console.error("Failed to retrieve products:", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve products.",
      },
    });
  }
};

export const getProductById = async (
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> => {
  try {
    const { id } = request.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      response.status(400).json({
        error: {
          code: "INVALID_ID",
          message: "Product ID is required.",
        },
      });
      return;
    }

    const product = await db.product.findUnique({
      where: { id: id.trim() },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
          },
        },
      },
    });

    if (!product || !product.isActive) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }

    const item: CatalogProductResponse = {
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description,
      content: product.content,
      actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
      price: formatDecimalPrice(product.price) ?? "0.00",
      discount: formatDecimalPrice(product.discount),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category:
        product.category && product.category.isActive
          ? {
              id: product.category.id,
              name: product.category.name,
              slug: product.category.slug,
            }
          : null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    };

    response.status(200).json(item);
    /*
    GET /api/products/:id

    Response (200 OK):
    {
      "id": "product-id",
      "code": "ROCKET-001",
      "name": "Deluxe Rocket",
      "description": "Colorful sky rocket",
      "content": "Pack of 5",
      "actualPrice": "500.00",
      "price": "425.00",
      "discount": "15.00",
      "stock": 20,
      "imageUrl": "/images/deluxe-rocket.jpg",
      "category": {
        "id": "category-id",
        "name": "Rockets",
        "slug": "rockets"
      },
      "isActive": true,
      "isFeatured": true
    }
    */
  } catch (error) {
    console.error("Failed to retrieve product by ID:", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve product.",
      },
    });
  }
};

export const getCategories = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const result: CategoryListItemResponse[] = categories.map(
      (cat: (typeof categories)[number]) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        productCount: cat._count.products,
      }),
    );

    const responseBody: GetCategoriesResponse = { categories: result };
    response.status(200).json(responseBody);
    /*
    GET /api/categories

    Response (200 OK):
    {
      "categories": [
        {
          "id": "category-id",
          "name": "Rockets",
          "slug": "rockets",
          "description": "Colorful sky rockets",
          "imageUrl": "/images/categories/rockets.jpg",
          "sortOrder": 1,
          "productCount": 12
        }
      ]
    }
    */
  } catch (error) {
    console.error("Failed to retrieve categories:", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve categories.",
      },
    });
  }
};

export const getCategoryBySlug = async (
  request: Request<{ slug: string }>,
  response: Response,
): Promise<void> => {
  try {
    const { slug } = request.params;
    const { page, limit } = request.query;

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      response.status(400).json({
        error: {
          code: "INVALID_SLUG",
          message: "Category slug is required.",
        },
      });
      return;
    }

    if (page !== undefined && !isValidPositiveInteger(page)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message:
            "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    if (limit !== undefined && !isValidLimit(limit)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message:
            "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    const pageNumber =
      page !== undefined ? parseInt((page as string).trim(), 10) : 1;
    const limitNumber =
      limit !== undefined ? parseInt((limit as string).trim(), 10) : 10;

    const category = await db.category.findUnique({
      where: { slug: slug.trim() },
    });

    if (!category || !category.isActive) {
      response.status(404).json({
        error: {
          code: "CATEGORY_NOT_FOUND",
          message: "Category not found.",
        },
      });
      return;
    }

    const where = {
      categoryId: category.id,
      isActive: true,
    };

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    const [products, totalItems] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / limitNumber);

    const items: CatalogProductResponse[] = products.map(
      (product: (typeof products)[number]) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        content: product.content,
        actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
        price: formatDecimalPrice(product.price) ?? "0.00",
        discount: formatDecimalPrice(product.discount),
        stock: product.stock,
        imageUrl: product.imageUrl,
        category:
          product.category && product.category.isActive
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
              }
            : null,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
      }),
    );

    response.status(200).json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      items,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalItems,
        totalPages,
      },
    });
    /*
    GET /api/categories/:slug

    Response (200 OK):
    {
      "category": {
        "id": "category-id",
        "name": "Sparklers",
        "slug": "sparklers"
      },
      "items": [],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 0,
        "totalPages": 0
      }
    }
    */
  } catch (error) {
    console.error("Failed to retrieve category by slug:", error);
    response.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve category.",
      },
    });
  }
};


