import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type {
  CatalogProductResponse,
  CategoryListItemResponse,
  CreateCategoryBody,
  CreateProductBody,
  GetCategoriesResponse,
  UpdateCategoryBody,
  UpdateProductBody,
} from "./types.js";

import {
  CART_COOKIE_NAME,
  formatCart,
  formatDecimalPrice,
  getCartCookieOptions,
  isValidLimit,
  isValidPositiveInteger,
} from "./utils.js";
import { sendContactEmail } from "./mail.js";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: {
      select: {
        id: true;
        name: true;
        nameEng: true;
        nameTam: true;
        slug: true;
      };
    };
  };
}>;

const formatProduct = (product: ProductWithCategory) => {
  const { categoryId: _categoryId, category, ...productData } = product;

  const nameEng = productData.nameEng || productData.name || "";
  const nameTam = productData.nameTam || null;
  const descriptionEng = productData.descriptionEng || productData.description || null;
  const descriptionTam = productData.descriptionTam || null;
  const contentEng = productData.contentEng || productData.content || "";
  const contentTam = productData.contentTam || null;

  return {
    ...productData,
    name: nameEng || nameTam || "",
    nameEng: nameEng || null,
    nameTam,
    description: descriptionEng || descriptionTam || null,
    descriptionEng,
    descriptionTam,
    content: contentEng || contentTam || "",
    contentEng: contentEng || null,
    contentTam,
    categorySlug: category?.slug ?? null,
    category: category
      ? {
          id: category.id,
          name: category.nameEng || category.name || "",
          nameEng: category.nameEng || category.name || null,
          nameTam: category.nameTam || null,
          slug: category.slug,
        }
      : null,
  };
};

export const getCrackersData = async (request: Request, response: Response): Promise<void> => {
  try {
    const { search, category, slug, code } = request.query;

    const where: Prisma.ProductWhereInput = {};

    if (typeof category === "string" && category.trim().length > 0) {
      const catTrim = category.trim();
      where.OR = [
        { category: { slug: catTrim } },
        { categoryId: catTrim },
      ];
    } else if (typeof slug === "string" && slug.trim().length > 0) {
      where.category = { slug: slug.trim() };
    }

    if (typeof code === "string" && code.trim().length > 0) {
      where.code = { equals: code.trim().toUpperCase(), mode: "insensitive" };
    }

    if (typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        ...(where.OR || []),
        { name: { contains: q, mode: "insensitive" } },
        { nameEng: { contains: q, mode: "insensitive" } },
        { nameTam: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { descriptionEng: { contains: q, mode: "insensitive" } },
        { descriptionTam: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
      ];
    }

    const items = await db.product.findMany({
      where,
      orderBy: [
        { category: { sortOrder: "asc" } },
        { category: { name: "asc" } },
        { createdAt: "desc" },
      ],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEng: true,
            nameTam: true,
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
    nameEng,
    nameTam,
    description,
    descriptionEng,
    descriptionTam,
    content,
    contentEng,
    contentTam,
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
    const finalNameEng = nameEng?.trim() || name?.trim() || "";
    const finalNameTam = nameTam?.trim() || null;
    const finalName = finalNameEng || finalNameTam || "";

    const finalDescEng = descriptionEng !== undefined ? descriptionEng?.trim() : (description ? description.trim() : null);
    const finalDescTam = descriptionTam !== undefined ? descriptionTam?.trim() : null;
    const finalDesc = finalDescEng || finalDescTam || null;

    const finalContentEng = contentEng !== undefined ? contentEng.trim() : (content ? content.trim() : "");
    const finalContentTam = contentTam !== undefined ? contentTam?.trim() : null;
    const finalContent = finalContentEng || finalContentTam || "";

    let resolvedCategoryId = categoryId;
    const targetSlug = categorySlug || (request.body as any).categorySlugEng;

    if (targetSlug) {
      const category = await db.category.findUnique({
        where: { slug: targetSlug },
        select: { id: true },
      });

      if (!category) {
        response.status(400).json({
          error: `No category exists with slug "${targetSlug}".`,
        });
        return;
      }

      resolvedCategoryId = category.id;
    }

    const product = await db.product.create({
      data: {
        code: code.trim().toUpperCase(),
        name: finalName,
        nameEng: finalNameEng || finalName,
        nameTam: finalNameTam,
        description: finalDesc,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam,
        content: finalContent,
        contentEng: finalContentEng || finalContent,
        contentTam: finalContentTam,
        actualPrice,
        price,
        discount,
        stock,
        minOrderQty: minOrderQty !== undefined ? minOrderQty : 1,
        maxOrderQty: maxOrderQty !== undefined ? maxOrderQty : 10,
        imageUrl,
        categoryId: resolvedCategoryId,
        isActive: isActive === undefined ? true : Boolean(isActive),
        isFeatured: isFeatured === undefined ? false : Boolean(isFeatured),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEng: true,
            nameTam: true,
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

export const updateProduct = async (
  request: Request<{ id?: string }, unknown, UpdateProductBody>,
  response: Response,
): Promise<void> => {
  const id = request.params.id;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    response.status(400).json({
      error: "Product ID is required.",
    });
    return;
  }

  const cleanId = id.trim();
  const {
    code,
    name,
    nameEng,
    nameTam,
    description,
    descriptionEng,
    descriptionTam,
    content,
    contentEng,
    contentTam,
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
    const existingProduct = await db.product.findFirst({
      where: {
        OR: [{ id: cleanId }, { code: cleanId.toUpperCase() }],
      },
    });

    if (!existingProduct) {
      response.status(404).json({
        error: "Product not found.",
      });
      return;
    }

    let resolvedCategoryId = categoryId;

    if (categorySlug !== undefined) {
      if (categorySlug && categorySlug.trim().length > 0) {
        const category = await db.category.findUnique({
          where: { slug: categorySlug.trim() },
          select: { id: true },
        });

        if (!category) {
          response.status(400).json({
            error: `No category exists with slug "${categorySlug}".`,
          });
          return;
        }

        resolvedCategoryId = category.id;
      } else {
        resolvedCategoryId = null;
      }
    }

    const data: Prisma.ProductUpdateInput = {};

    if (code !== undefined) data.code = code.trim().toUpperCase();
    if (nameEng !== undefined) {
      data.nameEng = nameEng.trim();
      data.name = nameEng.trim();
    }
    if (nameTam !== undefined) {
      data.nameTam = nameTam ? nameTam.trim() : null;
    }
    if (name !== undefined && nameEng === undefined) {
      data.name = name.trim();
      if (!existingProduct.nameEng) {
        data.nameEng = name.trim();
      }
    }

    if (descriptionEng !== undefined) {
      data.descriptionEng = descriptionEng;
      data.description = descriptionEng;
    }
    if (descriptionTam !== undefined) {
      data.descriptionTam = descriptionTam;
    }
    if (description !== undefined && descriptionEng === undefined) {
      data.description = description;
      if (!existingProduct.descriptionEng) {
        data.descriptionEng = description;
      }
    }

    if (contentEng !== undefined) {
      data.contentEng = contentEng.trim();
      data.content = contentEng.trim();
    }
    if (contentTam !== undefined) {
      data.contentTam = contentTam ? contentTam.trim() : null;
    }
    if (content !== undefined && contentEng === undefined) {
      data.content = content.trim();
      if (!existingProduct.contentEng) {
        data.contentEng = content.trim();
      }
    }

    if (actualPrice !== undefined) data.actualPrice = actualPrice;
    if (price !== undefined) data.price = price;
    if (discount !== undefined) data.discount = discount;
    if (stock !== undefined) data.stock = stock;
    if (minOrderQty !== undefined) data.minOrderQty = minOrderQty;
    if (maxOrderQty !== undefined) data.maxOrderQty = maxOrderQty;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);

    if (resolvedCategoryId !== undefined) {
      if (resolvedCategoryId === null) {
        data.category = { disconnect: true };
      } else {
        data.category = { connect: { id: resolvedCategoryId } };
      }
    }

    const product = await db.product.update({
      where: { id: existingProduct.id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            nameEng: true,
            nameTam: true,
            slug: true,
          },
        },
      },
    });

    response.status(200).json({
      status: true,
      message: "Product updated successfully",
      product: formatProduct(product),
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      response.status(409).json({ error: "A product with this code already exists." });
      return;
    }

    if (error?.code === "P2025") {
      response.status(404).json({ error: "Product not found." });
      return;
    }

    console.error("Failed to update product:", error);
    response.status(500).json({ error: "Failed to update product." });
  }
};

export const deleteProduct = async (
  request: Request<{ id?: string }>,
  response: Response,
): Promise<void> => {
  const id = request.params.id;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    response.status(400).json({
      error: "Product ID is required.",
    });
    return;
  }

  const cleanId = id.trim();

  try {
    const existing = await db.product.findFirst({
      where: {
        OR: [{ id: cleanId }, { code: cleanId.toUpperCase() }],
      },
    });

    if (!existing) {
      response.status(404).json({
        error: "Product not found.",
      });
      return;
    }

    // Clean up dependent cart items before deleting product
    await db.cartItem.deleteMany({
      where: { productId: existing.id },
    });

    await db.product.delete({
      where: { id: existing.id },
    });

    response.status(200).json({
      status: true,
      message: "Product deleted successfully",
      id: existing.id,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      response.status(404).json({ error: "Product not found." });
      return;
    }

    console.error("Failed to delete product:", error);
    response.status(500).json({ error: "Failed to delete product." });
  }
};

export const createCategory = async (
  request: Request<Record<string, string>, unknown, CreateCategoryBody>,
  response: Response,
): Promise<void> => {
  const {
    name,
    nameEng,
    nameTam,
    slug,
    description,
    descriptionEng,
    descriptionTam,
    imageUrl,
    sortOrder,
    isActive,
  } = request.body;

  try {
    const finalNameEng = nameEng?.trim() || name?.trim() || "";
    const finalNameTam = nameTam?.trim() || null;
    const finalName = finalNameEng || finalNameTam || "";

    const finalDescEng = descriptionEng !== undefined ? descriptionEng : (description || null);
    const finalDescTam = descriptionTam !== undefined ? descriptionTam : null;
    const finalDesc = finalDescEng || finalDescTam || null;

    const category = await db.category.create({
      data: {
        name: finalName,
        nameEng: finalNameEng || finalName,
        nameTam: finalNameTam,
        slug: slug.trim().toLowerCase(),
        description: finalDesc,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam,
        imageUrl: imageUrl || null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 1,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    response.status(201).json({
      status: true,
      message: "Category Created Successfully",
      category: {
        id: category.id,
        name: category.nameEng || category.name || "",
        nameEng: category.nameEng || category.name || null,
        nameTam: category.nameTam || null,
        slug: category.slug,
        description: category.descriptionEng || category.description || null,
        descriptionEng: category.descriptionEng || category.description || null,
        descriptionTam: category.descriptionTam || null,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });
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

export const updateCategory = async (
  request: Request<{ id?: string }, unknown, UpdateCategoryBody>,
  response: Response,
): Promise<void> => {
  const idOrSlug = request.params.id;

  if (!idOrSlug || typeof idOrSlug !== "string" || idOrSlug.trim().length === 0) {
    response.status(400).json({
      error: "Category ID or slug is required.",
    });
    return;
  }

  const cleanParam = idOrSlug.trim();
  const {
    name,
    nameEng,
    nameTam,
    slug,
    description,
    descriptionEng,
    descriptionTam,
    imageUrl,
    sortOrder,
    isActive,
  } = request.body;

  try {
    const existingCategory = await db.category.findFirst({
      where: {
        OR: [{ id: cleanParam }, { slug: cleanParam }],
      },
    });

    if (!existingCategory) {
      response.status(404).json({
        error: "Category not found.",
      });
      return;
    }

    const data: Prisma.CategoryUpdateInput = {};

    if (nameEng !== undefined) {
      data.nameEng = nameEng.trim();
      data.name = nameEng.trim();
    }
    if (nameTam !== undefined) {
      data.nameTam = nameTam ? nameTam.trim() : null;
    }
    if (name !== undefined && nameEng === undefined) {
      data.name = name.trim();
      if (!existingCategory.nameEng) {
        data.nameEng = name.trim();
      }
    }

    if (slug !== undefined) {
      data.slug = slug.trim().toLowerCase();
    }

    if (descriptionEng !== undefined) {
      data.descriptionEng = descriptionEng;
      data.description = descriptionEng;
    }
    if (descriptionTam !== undefined) {
      data.descriptionTam = descriptionTam;
    }
    if (description !== undefined && descriptionEng === undefined) {
      data.description = description;
      if (!existingCategory.descriptionEng) {
        data.descriptionEng = description;
      }
    }

    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const updated = await db.category.update({
      where: { id: existingCategory.id },
      data,
    });

    response.status(200).json({
      status: true,
      message: "Category updated successfully",
      category: {
        id: updated.id,
        name: updated.nameEng || updated.name || "",
        nameEng: updated.nameEng || updated.name || null,
        nameTam: updated.nameTam || null,
        slug: updated.slug,
        description: updated.descriptionEng || updated.description || null,
        descriptionEng: updated.descriptionEng || updated.description || null,
        descriptionTam: updated.descriptionTam || null,
        imageUrl: updated.imageUrl,
        sortOrder: updated.sortOrder,
        isActive: updated.isActive,
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      response.status(409).json({
        error: "A category with this slug already exists.",
      });
      return;
    }

    console.error("Failed to update category:", error);
    response.status(500).json({ error: "Failed to update category." });
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

// export const getProducts = async (
//   request: Request,
//   response: Response,
// ): Promise<void> => {
//   try {
//     const { page, limit, search, category, sort } = request.query;

//     if (page !== undefined && !isValidPositiveInteger(page)) {
//       response.status(400).json({
//         error: {
//           code: "INVALID_PAGINATION",
//           message: "Page must be a positive integer and limit must be between 1 and 10.",
//         },
//       });
//       return;
//     }

//     if (limit !== undefined && !isValidLimit(limit)) {
//       response.status(400).json({
//         error: {
//           code: "INVALID_PAGINATION",
//           message: "Page must be a positive integer and limit must be between 1 and 10.",
//         },
//       });
//       return;
//     }

//     if (sort !== undefined && !isValidSortOption(sort)) {
//       response.status(400).json({
//         error: {
//           code: "INVALID_SORT",
//           message: "Sort must be one of: newest, price_asc, price_desc, name_asc, name_desc.",
//         },
//       });
//       return;
//     }

//     const pageNumber = page !== undefined ? parseInt((page as string).trim(), 10) : 1;
//     const limitNumber = limit !== undefined ? parseInt((limit as string).trim(), 10) : 10;
//     const sortOption: ProductSortOption =
//       sort !== undefined ? ((sort as string).trim() as ProductSortOption) : "newest";

//     const where: Prisma.ProductWhereInput = { isActive: true };

//     if (typeof category === "string" && category.trim().length > 0) {
//       where.category = { slug: category.trim(), isActive: true };
//     }

//     if (typeof search === "string" && search.trim().length > 0) {
//       const searchTerm = search.trim();
//       where.OR = [
//         { name: { contains: searchTerm, mode: "insensitive" } },
//         { code: { contains: searchTerm, mode: "insensitive" } },
//       ];
//     }

//     let orderBy: Prisma.ProductOrderByWithRelationInput[];
//     switch (sortOption) {

//       case "price_asc":
//         orderBy = [{ price: "asc" }, { id: "asc" }];
//         break;
//       case "price_desc":
//         orderBy = [{ price: "desc" }, { id: "asc" }];
//         break;
//       case "name_asc":
//         orderBy = [{ name: "asc" }, { id: "asc" }];
//         break;
//       case "name_desc":
//         orderBy = [{ name: "desc" }, { id: "asc" }];
//         break;
//       case "newest":
//       default:
//         orderBy = [{ createdAt: "desc" }, { id: "asc" }];
//         break;
//     }

//     const skip = (pageNumber - 1) * limitNumber;
//     const take = limitNumber;

//     const [products, totalItems] = await Promise.all([
//       db.product.findMany({
//         where,
//         skip,
//         take,
//         orderBy,
//         include: {
//           category: {
//             select: { id: true, name: true, slug: true, isActive: true },
//           },
//         },
//       }),
//       db.product.count({ where }),
//     ]);

//     const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limitNumber);

//     const items: CatalogProductResponse[] = products.map(
//       (product: (typeof products)[number]) => ({
//         id: product.id,
//         code: product.code,
//         name: product.name,
//         description: product.description,
//         content: product.content,
//         actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
//         price: formatDecimalPrice(product.price) ?? "0.00",
//         discount: formatDecimalPrice(product.discount),
//         stock: product.stock,
//         imageUrl: product.imageUrl,
//         category:
//           product.category && product.category.isActive
//             ? { id: product.category.id, name: product.category.name, slug: product.category.slug }
//             : null,
//         isActive: product.isActive,
//         isFeatured: product.isFeatured,
//       }),
//     );

//     response.status(200).json({
//       items,
//       pagination: { page: pageNumber, limit: limitNumber, totalItems, totalPages },
//     });
//   } catch (error) {
//     console.error("Failed to retrieve products:", error);
//     response.status(500).json({
//       error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve products." },
//     });
//   }
// };

export const getProductById = async (
  request: Request<{ id: string }>,
  response: Response,
): Promise<void> => {
  try {
    const { id } = request.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      response.status(400).json({
        error: { code: "INVALID_ID", message: "Product ID is required." },
      });
      return;
    }

    const cleanId = id.trim();
    const product = await db.product.findFirst({
      where: {
        OR: [{ id: cleanId }, { code: cleanId.toUpperCase() }],
      },
      include: {
        category: {
          select: { id: true, name: true, nameEng: true, nameTam: true, slug: true, isActive: true },
        },
      },
    });

    if (!product || !product.isActive) {
      response.status(404).json({
        error: { code: "PRODUCT_NOT_FOUND", message: "Product not found." },
      });
      return;
    }

    const nameEng = product.nameEng || product.name || "";
    const nameTam = product.nameTam || null;
    const descriptionEng = product.descriptionEng || product.description || null;
    const descriptionTam = product.descriptionTam || null;
    const contentEng = product.contentEng || product.content || "";
    const contentTam = product.contentTam || null;

    const item: CatalogProductResponse = {
      id: product.id,
      code: product.code,
      name: nameEng || nameTam || "",
      nameEng: nameEng || null,
      nameTam,
      description: descriptionEng || descriptionTam || null,
      descriptionEng,
      descriptionTam,
      content: contentEng || contentTam || "",
      contentEng: contentEng || null,
      contentTam,
      actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
      price: formatDecimalPrice(product.price) ?? "0.00",
      discount: formatDecimalPrice(product.discount),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category:
        product.category && product.category.isActive
          ? {
              id: product.category.id,
              name: product.category.nameEng || product.category.name || "",
              nameEng: product.category.nameEng || product.category.name || null,
              nameTam: product.category.nameTam || null,
              slug: product.category.slug,
            }
          : null,
      categorySlug: product.category?.slug ?? null,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    };

    response.status(200).json(item);
  } catch (error) {
    console.error("Failed to retrieve product by ID:", error);
    response.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve product." },
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
            products: { where: { isActive: true } },
          },
        },
      },
    });

    const result: CategoryListItemResponse[] = categories.map(
      (cat: (typeof categories)[number]) => ({
        id: cat.id,
        name: cat.nameEng || cat.name || "",
        nameEng: cat.nameEng || cat.name || null,
        nameTam: cat.nameTam || null,
        slug: cat.slug,
        description: cat.descriptionEng || cat.description || null,
        descriptionEng: cat.descriptionEng || cat.description || null,
        descriptionTam: cat.descriptionTam || null,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        productCount: cat._count.products,
      }),
    );

    const responseBody: GetCategoriesResponse = { categories: result };
    response.status(200).json(responseBody);
  } catch (error) {
    console.error("Failed to retrieve categories:", error);
    response.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve categories." },
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
        error: { code: "INVALID_SLUG", message: "Category slug is required." },
      });
      return;
    }

    if (page !== undefined && !isValidPositiveInteger(page)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message: "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    if (limit !== undefined && !isValidLimit(limit)) {
      response.status(400).json({
        error: {
          code: "INVALID_PAGINATION",
          message: "Page must be a positive integer and limit must be between 1 and 10.",
        },
      });
      return;
    }

    const pageNumber = page !== undefined ? parseInt((page as string).trim(), 10) : 1;
    const limitNumber = limit !== undefined ? parseInt((limit as string).trim(), 10) : 10;

    const category = await db.category.findUnique({
      where: { slug: slug.trim() },
    });

    if (!category || !category.isActive) {
      response.status(404).json({
        error: { code: "CATEGORY_NOT_FOUND", message: "Category not found." },
      });
      return;
    }

    const where = { categoryId: category.id, isActive: true };
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
            select: { id: true, name: true, nameEng: true, nameTam: true, slug: true, isActive: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limitNumber);

    const items: CatalogProductResponse[] = products.map(
      (product: (typeof products)[number]) => {
        const nameEng = product.nameEng || product.name || "";
        const nameTam = product.nameTam || null;
        const descriptionEng = product.descriptionEng || product.description || null;
        const descriptionTam = product.descriptionTam || null;
        const contentEng = product.contentEng || product.content || "";
        const contentTam = product.contentTam || null;

        return {
          id: product.id,
          code: product.code,
          name: nameEng || nameTam || "",
          nameEng: nameEng || null,
          nameTam,
          description: descriptionEng || descriptionTam || null,
          descriptionEng,
          descriptionTam,
          content: contentEng || contentTam || "",
          contentEng: contentEng || null,
          contentTam,
          actualPrice: formatDecimalPrice(product.actualPrice) ?? "0.00",
          price: formatDecimalPrice(product.price) ?? "0.00",
          discount: formatDecimalPrice(product.discount),
          stock: product.stock,
          imageUrl: product.imageUrl,
          category:
            product.category && product.category.isActive
              ? {
                  id: product.category.id,
                  name: product.category.nameEng || product.category.name || "",
                  nameEng: product.category.nameEng || product.category.name || null,
                  nameTam: product.category.nameTam || null,
                  slug: product.category.slug,
                }
              : null,
          categorySlug: product.category?.slug ?? null,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        };
      },
    );

    response.status(200).json({
      category: {
        id: category.id,
        name: category.nameEng || category.name || "",
        nameEng: category.nameEng || category.name || null,
        nameTam: category.nameTam || null,
        slug: category.slug,
        description: category.descriptionEng || category.description || null,
        descriptionEng: category.descriptionEng || category.description || null,
        descriptionTam: category.descriptionTam || null,
      },
      items,
      pagination: { page: pageNumber, limit: limitNumber, totalItems, totalPages },
    });
  } catch (error) {
    console.error("Failed to retrieve category by slug:", error);
    response.status(500).json({
      error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve category." },
    });
  }
};

export const handleContactForm = async (request: Request, response: Response): Promise<void> => {
  try {
    const { email, message, name, phone } = request.body ?? {};

    if (!email || typeof email !== "string" || !email.trim()) {
      response.status(400).json({ error: "A valid email address is required." });
      return;
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      response.status(400).json({ error: "Message content is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      response.status(400).json({ error: "Invalid email address format." });
      return;
    }

    const result = await sendContactEmail({
      email: email.trim(),
      message: message.trim(),
      name: typeof name === "string" ? name.trim() : undefined,
      phone: typeof phone === "string" ? phone.trim() : undefined,
    });

    response.status(200).json({
      message: "Your message has been sent successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Failed to process contact email:", error);
    response.status(500).json({
      error: "Failed to send email. Please try again or reach out directly via WhatsApp.",
    });
  }
};

export const createQuery = async (request: Request, response: Response): Promise<void> => {
  try {
    const { mobileNumber, phone, message } = request.body ?? {};

    const rawMobile = mobileNumber || phone;

    if (!rawMobile || typeof rawMobile !== "string" || !rawMobile.trim()) {
      response.status(400).json({ error: "Mobile number is required." });
      return;
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      response.status(400).json({ error: "Message content is required." });
      return;
    }

    const cleanMobile = rawMobile.trim();
    const cleanMessage = message.trim();

    // Store in database
    const savedQuery = await db.query.create({
      data: {
        mobileNumber: cleanMobile,
        message: cleanMessage,
      },
    });

    // Also dispatch email notification to shanthicracker@gmail.com
    try {
      await sendContactEmail({
        email: `mobile-${cleanMobile.replace(/\s+/g, "")}@santhicrackers.com`,
        phone: cleanMobile,
        message: cleanMessage,
      });
    } catch (mailErr) {
      console.warn("Failed to dispatch email notification for query:", mailErr);
    }

    response.status(201).json({
      success: true,
      message: "Query submitted successfully.",
      query: savedQuery,
    });
  } catch (error) {
    console.error("Failed to create query:", error);
    response.status(500).json({
      error: "Failed to submit query. Please try again or reach out via WhatsApp.",
    });
  }
};

export const getQueries = async (_request: Request, response: Response): Promise<void> => {
  try {
    const queries = await db.query.findMany({
      orderBy: { createdAt: "desc" },
    });

    response.status(200).json({
      success: true,
      queries,
      total: queries.length,
    });
  } catch (error) {
    console.error("Failed to retrieve queries:", error);
    response.status(500).json({
      error: "Failed to retrieve queries.",
    });
  }
};

