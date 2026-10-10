import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type {
  CatalogProductResponse,
  CategoryListItemResponse,
  CategoryWithCount,
  CreateCategoryBody,
  CreateProductBody,
  GetCategoriesResponse,
  ProductSortOption,
  UpdateCategoryBody,
  UpdateProductBody,
  UpdateProductFeaturedBody,
  UpdateProductStatusBody,
  UpdateProductStockBody,
} from "./types.js";
import {
  calculateDiscount,
  formatDecimalPrice,
  isValidLimit,
  isValidPositiveInteger,
  isValidSortOption,
  slugify,
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
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error
    ) {
      const code = (error as { code: unknown }).code;
      if (code === "P2002") {
        response.status(409).json({ error: "A product with this code already exists." });
        return;
      }

      if (code === "P2003") {
        response.status(400).json({
          error: "The provided category does not exist.",
        });
        return;
      }
    }

    console.error("Failed to create product:", error);
    response.status(500).json({ error: "Failed to create product." });
  }
};

// ==========================================
// 1. /admin/products/:id/edit - Product Edit
// ==========================================

export const getAdminProductById = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Product ID is required." });
      return;
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }

    response.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for getProductById:
 * 
 * Method: GET
 * URL: http://localhost:3007/api/admin/products/:id
 * Path Param: id = <product_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: None required
 * Body: None
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "product": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "code": "251",
 *     "name": "3000 COMBO PACK (Kids Pack)",
 *     "description": "Premium Diwali combo pack",
 *     "content": "Box",
 *     "actualPrice": "3000.00",
 *     "price": "300.00",
 *     "discount": "90.00",
 *     "stock": 100,
 *     "minOrderQty": 1,
 *     "maxOrderQty": 10,
 *     "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/251.jpg",
 *     "categoryId": "cat123",
 *     "isActive": true,
 *     "isFeatured": false,
 *     "createdAt": "2026-10-10T00:00:00.000Z",
 *     "updatedAt": "2026-10-10T00:00:00.000Z",
 *     "category": {
 *       "id": "cat123",
 *       "name": "Combo Packs",
 *       "slug": "combo-packs",
 *       "description": "All Diwali combos",
 *       "imageUrl": null,
 *       "sortOrder": 1,
 *       "isActive": true,
 *       "createdAt": "2026-10-10T00:00:00.000Z",
 *       "updatedAt": "2026-10-10T00:00:00.000Z"
 *     }
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "error": {
 *     "code": "PRODUCT_NOT_FOUND",
 *     "message": "Product not found."
 *   }
 * }
 */

export const updateProduct = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Product ID is required." });
      return;
    }

    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }

    const {
      code,
      name,
      description,
      content,
      actualPrice,
      price,
      stock,
      minOrderQty,
      maxOrderQty,
      imageUrl,
      categoryId,
      categorySlug,
      isActive,
      isFeatured,
    } = request.body as UpdateProductBody;

    const dataToUpdate: Record<string, unknown> = {};

    // 1. Code validation
    if (code !== undefined) {
      const trimmedCode = String(code).trim();
      if (!trimmedCode) {
        response.status(400).json({ error: "Product code cannot be empty." });
        return;
      }
      if (trimmedCode !== existingProduct.code) {
        const duplicate = await db.product.findUnique({
          where: { code: trimmedCode },
        });
        if (duplicate && duplicate.id !== id) {
          response.status(400).json({ error: "Product code must be unique." });
          return;
        }
      }
      dataToUpdate.code = trimmedCode;
    }

    // 2. Name validation
    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        response.status(400).json({ error: "Product name cannot be empty." });
        return;
      }
      dataToUpdate.name = trimmedName;
    }

    // 3. Description
    if (description !== undefined) {
      dataToUpdate.description =
        description !== null ? String(description).trim() : null;
    }

    // 4. Content validation
    if (content !== undefined) {
      const trimmedContent = String(content).trim();
      if (!trimmedContent) {
        response.status(400).json({ error: "Product content cannot be empty." });
        return;
      }
      dataToUpdate.content = trimmedContent;
    }

    // 5. Price validations & discount calculation
    const effectiveActualPrice =
      actualPrice !== undefined
        ? Number(actualPrice)
        : Number(existingProduct.actualPrice);
    const effectivePrice =
      price !== undefined ? Number(price) : Number(existingProduct.price);

    if (actualPrice !== undefined) {
      if (isNaN(effectiveActualPrice) || effectiveActualPrice < 0) {
        response.status(400).json({
          error: "Actual price must be a non-negative number.",
        });
        return;
      }
      dataToUpdate.actualPrice = effectiveActualPrice;
    }

    if (price !== undefined) {
      if (isNaN(effectivePrice) || effectivePrice < 0) {
        response.status(400).json({
          error: "Selling price must be a non-negative number.",
        });
        return;
      }
      dataToUpdate.price = effectivePrice;
    }

    if (effectivePrice > effectiveActualPrice) {
      response.status(400).json({
        error: "Selling price cannot be greater than actual price.",
      });
      return;
    }

    if (actualPrice !== undefined || price !== undefined) {
      dataToUpdate.discount = calculateDiscount(
        effectiveActualPrice,
        effectivePrice,
      );
    }

    // 6. Stock & Inventory validation
    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        response.status(400).json({
          error: "Stock must be a non-negative integer.",
        });
        return;
      }
      dataToUpdate.stock = stockNum;
    }

    const effectiveMinQty =
      minOrderQty !== undefined
        ? Number(minOrderQty)
        : existingProduct.minOrderQty;
    const effectiveMaxQty =
      maxOrderQty !== undefined
        ? maxOrderQty === null || (maxOrderQty as unknown) === ""
          ? null
          : Number(maxOrderQty)
        : existingProduct.maxOrderQty;

    if (minOrderQty !== undefined) {
      if (!Number.isInteger(effectiveMinQty) || effectiveMinQty < 1) {
        response.status(400).json({
          error: "Minimum order quantity must be an integer >= 1.",
        });
        return;
      }
      if (effectiveMaxQty !== null && effectiveMinQty > effectiveMaxQty) {
        response.status(400).json({
          error:
            "Minimum order quantity cannot be greater than maximum order quantity.",
        });
        return;
      }
      dataToUpdate.minOrderQty = effectiveMinQty;
    }

    if (maxOrderQty !== undefined) {
      if (maxOrderQty === null || (maxOrderQty as unknown) === "") {
        dataToUpdate.maxOrderQty = null;
      } else {
        const maxQtyNum = Number(maxOrderQty);
        if (!Number.isInteger(maxQtyNum) || maxQtyNum < effectiveMinQty) {
          response.status(400).json({
            error:
              "Maximum order quantity must be greater than or equal to minimum order quantity.",
          });
          return;
        }
        dataToUpdate.maxOrderQty = maxQtyNum;
      }
    }

    // 7. Image URL
    if (imageUrl !== undefined) {
      dataToUpdate.imageUrl = imageUrl ? String(imageUrl).trim() : null;
    }

    // 8. Category validation
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
      dataToUpdate.categoryId = category.id;
    } else if (categoryId !== undefined) {
      if (
        categoryId &&
        typeof categoryId === "string" &&
        categoryId.trim() !== ""
      ) {
        const cat = await db.category.findUnique({
          where: { id: categoryId.trim() },
        });
        if (!cat) {
          response.status(400).json({
            error: "Selected category does not exist.",
          });
          return;
        }
        dataToUpdate.categoryId = categoryId.trim();
      } else {
        dataToUpdate.categoryId = null;
      }
    }

    // 9. Status & Featured
    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }
    if (isFeatured !== undefined) {
      dataToUpdate.isFeatured = Boolean(isFeatured);
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
      },
    });

    response.json({
      success: true,
      product: updatedProduct,
      message: "Product updated successfully.",
    });
  } catch (err) {
    console.error("Error updating product:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for updateProduct:
 * 
 * Method: PATCH or PUT
 * URL: http://localhost:3007/api/admin/products/:id
 * Path Param: id = <product_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "name": "3000 COMBO PACK (Updated)",
 *   "actualPrice": 3200,
 *   "price": 350,
 *   "stock": 85,
 *   "minOrderQty": 1,
 *   "maxOrderQty": 15,
 *   "isActive": true,
 *   "isFeatured": true
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "product": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "code": "251",
 *     "name": "3000 COMBO PACK (Updated)",
 *     "description": "Premium Diwali combo pack",
 *     "content": "Box",
 *     "actualPrice": "3200.00",
 *     "price": "350.00",
 *     "discount": "89.06",
 *     "stock": 85,
 *     "minOrderQty": 1,
 *     "maxOrderQty": 15,
 *     "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/251.jpg",
 *     "categoryId": "cat123",
 *     "isActive": true,
 *     "isFeatured": true,
 *     "category": {
 *       "id": "cat123",
 *       "name": "Combo Packs",
 *       "slug": "combo-packs"
 *     }
 *   },
 *   "message": "Product updated successfully."
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "error": "Selling price cannot be greater than actual price."
 * }
 */

export const updateProductStatus = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Product ID is required." });
      return;
    }

    const body = request.body as UpdateProductStatusBody;
    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : body.status !== undefined
          ? body.status === true ||
            body.status === "ACTIVE" ||
            body.status === "active"
          : undefined;

    if (isActive === undefined) {
      response
        .status(400)
        .json({ error: "isActive status boolean is required." });
      return;
    }

    const updated = await db.product.update({
      where: { id },
      data: { isActive },
      include: { category: true },
    });

    response.json({ success: true, product: updated });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }
    console.error("Error updating product status:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for updateProductStatus:
 * 
 * Method: PATCH
 * URL: http://localhost:3007/api/admin/products/:id/status
 * Path Param: id = <product_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "isActive": false
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "product": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "code": "251",
 *     "name": "3000 COMBO PACK (Kids Pack)",
 *     "isActive": false,
 *     "category": {
 *       "id": "cat123",
 *       "name": "Combo Packs"
 *     }
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "error": {
 *     "code": "PRODUCT_NOT_FOUND",
 *     "message": "Product not found."
 *   }
 * }
 */

export const updateProductFeatured = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Product ID is required." });
      return;
    }

    const { isFeatured } = request.body as UpdateProductFeaturedBody;

    if (isFeatured === undefined) {
      response.status(400).json({ error: "isFeatured boolean is required." });
      return;
    }

    const updated = await db.product.update({
      where: { id },
      data: { isFeatured: Boolean(isFeatured) },
      include: { category: true },
    });

    response.json({ success: true, product: updated });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }
    console.error("Error updating product featured status:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for updateProductFeatured:
 * 
 * Method: PATCH
 * URL: http://localhost:3007/api/admin/products/:id/featured
 * Path Param: id = <product_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "isFeatured": true
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "product": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "code": "251",
 *     "name": "3000 COMBO PACK (Kids Pack)",
 *     "isFeatured": true,
 *     "category": {
 *       "id": "cat123",
 *       "name": "Combo Packs"
 *     }
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "error": {
 *     "code": "PRODUCT_NOT_FOUND",
 *     "message": "Product not found."
 *   }
 * }
 */

export const updateProductStock = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Product ID is required." });
      return;
    }

    const { stock } = request.body as UpdateProductStockBody;
    const stockNum = Number(stock);

    if (stock === undefined || !Number.isInteger(stockNum) || stockNum < 0) {
      response
        .status(400)
        .json({ error: "Stock must be a non-negative integer." });
      return;
    }

    const updated = await db.product.update({
      where: { id },
      data: { stock: stockNum },
      include: { category: true },
    });

    response.json({ success: true, product: updated });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      response.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found.",
        },
      });
      return;
    }
    console.error("Error updating product stock:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for updateProductStock:
 * 
 * Method: PATCH
 * URL: http://localhost:3007/api/admin/products/:id/stock
 * Path Param: id = <product_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "stock": 120
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "product": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "code": "251",
 *     "name": "3000 COMBO PACK (Kids Pack)",
 *     "stock": 120,
 *     "category": {
 *       "id": "cat123",
 *       "name": "Combo Packs"
 *     }
 *   }
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "error": "Stock must be a non-negative integer."
 * }
 */

// ==========================================
// 2. /admin/categories - Category Management
// ==========================================

export const createCategory = async (
  request: Request<Record<string, string>, unknown, CreateCategoryBody>,
  response: Response,
): Promise<void> => {
  const { name, slug, description, imageUrl, sortOrder, isActive } = request.body;

  try {
    if (!name || typeof name !== "string" || !name.trim()) {
      response.status(400).json({ error: "Category name is required." });
      return;
    }

    const generatedSlug = slug && slug.trim() !== "" ? slugify(slug) : slugify(name);

    if (!generatedSlug) {
      response.status(400).json({ error: "Valid category slug is required." });
      return;
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description ? description.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    response
      .status(201)
      .json({ status: true, message: "Category Created Successfully", category });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      response.status(409).json({
        error: "A category with this name or slug already exists.",
      });
      return;
    }

    console.error("Failed to create category:", error);
    response.status(500).json({ error: "Failed to create category." });
  }
};
/*
 * Postman Verification for createCategory:
 * 
 * Method: POST
 * URL: http://localhost:3007/api/admin/categories
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "name": "Sparklers",
 *   "slug": "sparklers",
 *   "description": "Premium Sivakasi colorful sparklers",
 *   "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/sparklers.jpg",
 *   "sortOrder": 2,
 *   "isActive": true
 * }
 * 
 * Success Response (201 Created):
 * {
 *   "status": true,
 *   "message": "Category Created Successfully",
 *   "category": {
 *     "id": "cm4b2c3d4e5f6g7h8i9j0k1l",
 *     "name": "Sparklers",
 *     "slug": "sparklers",
 *     "description": "Premium Sivakasi colorful sparklers",
 *     "imageUrl": "https://res.cloudinary.com/example/image/upload/v123/sparklers.jpg",
 *     "sortOrder": 2,
 *     "isActive": true,
 *     "createdAt": "2026-10-10T00:00:00.000Z",
 *     "updatedAt": "2026-10-10T00:00:00.000Z"
 *   }
 * }
 * 
 * Error Response (409 Conflict):
 * {
 *   "error": "A category with this name or slug already exists."
 * }
 */

export const getAdminCategories = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  try {
    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((cat: CategoryWithCount) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    response.json({
      success: true,
      categories: formatted,
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for getCategories:
 * 
 * Method: GET
 * URL: http://localhost:3007/api/admin/categories
 * Headers: None required
 * Body: None
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "categories": [
 *     {
 *       "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *       "name": "Combo Packs",
 *       "slug": "combo-packs",
 *       "description": "All Diwali combos",
 *       "imageUrl": null,
 *       "sortOrder": 1,
 *       "isActive": true,
 *       "productCount": 24,
 *       "createdAt": "2026-10-10T00:00:00.000Z",
 *       "updatedAt": "2026-10-10T00:00:00.000Z"
 *     }
 *   ]
 * }
 */

export const getCategoryById = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawIdOrSlug = request.params.id;
    const idOrSlug =
      typeof rawIdOrSlug === "string"
        ? rawIdOrSlug
        : Array.isArray(rawIdOrSlug)
          ? rawIdOrSlug[0]
          : undefined;

    if (!idOrSlug) {
      response.status(400).json({ error: "Category ID or slug is required." });
      return;
    }

    const category = await db.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      response.status(404).json({ error: "Category not found." });
      return;
    }

    const categoryWithCount = category as typeof category & {
      _count?: { products: number };
    };

    response.json({
      success: true,
      category: {
        ...category,
        productCount: categoryWithCount._count?.products ?? 0,
      },
    });
  } catch (err) {
    console.error("Error fetching category:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for getCategoryById:
 * 
 * Method: GET
 * URL: http://localhost:3007/api/admin/categories/:id
 * Path Param: id = <category_id_or_slug> (e.g. "combo-packs" or "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: None required
 * Body: None
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "category": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "name": "Combo Packs",
 *     "slug": "combo-packs",
 *     "description": "All Diwali combos",
 *     "imageUrl": null,
 *     "sortOrder": 1,
 *     "isActive": true,
 *     "productCount": 24,
 *     "createdAt": "2026-10-10T00:00:00.000Z",
 *     "updatedAt": "2026-10-10T00:00:00.000Z"
 *   }
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "error": "Category not found."
 * }
 */

export const updateCategory = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Category ID is required." });
      return;
    }

    const existingCategory = await db.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      response.status(404).json({ error: "Category not found." });
      return;
    }

    const { name, slug, description, imageUrl, sortOrder, isActive } =
      request.body as UpdateCategoryBody;

    const dataToUpdate: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        response.status(400).json({ error: "Category name cannot be empty." });
        return;
      }
      if (trimmedName !== existingCategory.name) {
        const duplicate = await db.category.findUnique({
          where: { name: trimmedName },
        });
        if (duplicate && duplicate.id !== id) {
          response
            .status(400)
            .json({ error: "Category with this name already exists." });
          return;
        }
      }
      dataToUpdate.name = trimmedName;
    }

    if (slug !== undefined) {
      const cleanedSlug = slugify(String(slug));
      if (!cleanedSlug) {
        response.status(400).json({ error: "Category slug cannot be empty." });
        return;
      }
      if (cleanedSlug !== existingCategory.slug) {
        const duplicate = await db.category.findUnique({
          where: { slug: cleanedSlug },
        });
        if (duplicate && duplicate.id !== id) {
          response
            .status(400)
            .json({ error: "Category with this slug already exists." });
          return;
        }
      }
      dataToUpdate.slug = cleanedSlug;
    }

    if (description !== undefined) {
      dataToUpdate.description =
        description !== null ? String(description).trim() : null;
    }

    if (imageUrl !== undefined) {
      dataToUpdate.imageUrl =
        imageUrl !== null ? String(imageUrl).trim() : null;
    }

    if (sortOrder !== undefined) {
      const sortOrderNum = Number(sortOrder);
      if (!Number.isInteger(sortOrderNum)) {
        response.status(400).json({ error: "Sort order must be an integer." });
        return;
      }
      dataToUpdate.sortOrder = sortOrderNum;
    }

    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const updatedWithCount = updatedCategory as typeof updatedCategory & {
      _count?: { products: number };
    };

    response.json({
      success: true,
      category: {
        ...updatedCategory,
        productCount: updatedWithCount._count?.products ?? 0,
      },
      message: "Category updated successfully.",
    });
  } catch (err) {
    console.error("Error updating category:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for updateCategory:
 * 
 * Method: PATCH or PUT
 * URL: http://localhost:3007/api/admin/categories/:id
 * Path Param: id = <category_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: Content-Type: application/json
 * Body (Raw JSON):
 * {
 *   "name": "Combo Packs & Gift Boxes",
 *   "sortOrder": 1,
 *   "isActive": true
 * }
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "category": {
 *     "id": "cm4a1b2c3d4e5f6g7h8i9j0k",
 *     "name": "Combo Packs & Gift Boxes",
 *     "slug": "combo-packs",
 *     "sortOrder": 1,
 *     "isActive": true,
 *     "productCount": 24
 *   },
 *   "message": "Category updated successfully."
 * }
 * 
 * Error Response (400 Bad Request):
 * {
 *   "error": "Category with this name already exists."
 * }
 */

export const deleteCategory = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const rawId = request.params.id;
    const id =
      typeof rawId === "string"
        ? rawId
        : Array.isArray(rawId)
          ? rawId[0]
          : undefined;

    if (!id) {
      response.status(400).json({ error: "Category ID is required." });
      return;
    }

    const category = await db.category.findUnique({
      where: { id },
    });

    if (!category) {
      response.status(404).json({ error: "Category not found." });
      return;
    }

    // Check if category still contains products
    const productCount = await db.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      response.status(400).json({
        error:
          "Cannot delete category containing existing products. Please reassign or delete the products first.",
        productCount,
      });
      return;
    }

    await db.category.delete({
      where: { id },
    });

    response.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    response.status(500).json({ error: "Internal server error." });
  }
};
/*
 * Postman Verification for deleteCategory:
 * 
 * Method: DELETE
 * URL: http://localhost:3007/api/admin/categories/:id
 * Path Param: id = <category_id> (e.g. "cm4a1b2c3d4e5f6g7h8i9j0k")
 * Headers: None required
 * Body: None
 * 
 * Success Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Category deleted successfully."
 * }
 * 
 * Error Response (400 Bad Request - products still linked):
 * {
 *   "error": "Cannot delete category containing existing products. Please reassign or delete the products first.",
 *   "productCount": 5
 * }
 * 
 * Error Response (404 Not Found):
 * {
 *   "error": "Category not found."
 * }
 */

// ==========================================
// 3. Cart Management
// ==========================================

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


