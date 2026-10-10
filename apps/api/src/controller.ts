import { Prisma } from "@prisma/client";
import { db } from "@repo/db/client";
import type { Request, RequestHandler, Response } from "express";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type {
    AdminProductBody,
    AdminSessionBody,
    CreateCategoryBody,
    CreateProductBody,
} from "./types.js";

const adminSessionCookie = "sc_admin_session";
const adminSessionLifetimeSeconds = 60 * 60 * 8;
const cloudinaryProductFolder = "santhi-crackers/products";

type AdminAuthSettings = {
  username: string;
  password: string;
  sessionSecret: string;
};

type AdminProductData = {
  code?: string;
  name?: string;
  description?: string | null;
  content?: string;
  actualPrice?: number;
  price?: number;
  stock?: number;
  minOrderQty?: number;
  maxOrderQty?: number | null;
  imageUrl?: string | null;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
};

type CompleteAdminProductData = AdminProductData &
  Required<
    Pick<
      AdminProductData,
      "code" | "name" | "content" | "actualPrice" | "price" | "stock"
    >
  >;

class InvalidAdminProductQueryError extends Error {}

const apiError = (response: Response, status: number, code: string, message: string): void => {
  response.status(status).json({ error: { code, message } });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getAdminAuthSettings = (): AdminAuthSettings | null => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET } = process.env;

  if (
    !ADMIN_USERNAME ||
    !ADMIN_PASSWORD ||
    !ADMIN_SESSION_SECRET ||
    ADMIN_SESSION_SECRET.length < 32
  ) {
    return null;
  }

  return {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    sessionSecret: ADMIN_SESSION_SECRET,
  };
};

const constantTimeStringEqual = (left: string, right: string): boolean => {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
};

const signAdminSession = (username: string, sessionSecret: string): string => {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      expiresAt: Math.floor(Date.now() / 1000) + adminSessionLifetimeSeconds,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifyAdminSession = (token: string, settings: AdminAuthSettings): boolean => {
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra !== undefined) return false;

  const expectedSignature = createHmac("sha256", settings.sessionSecret)
    .update(payload)
    .digest("base64url");
  if (!constantTimeStringEqual(suppliedSignature, expectedSignature)) return false;

  try {
    const claims: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      isRecord(claims) &&
      claims.username === settings.username &&
      typeof claims.expiresAt === "number" &&
      claims.expiresAt > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
};

const adminCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api",
  maxAge: adminSessionLifetimeSeconds * 1000,
});

export const requireAdminSession: RequestHandler = (request, response, next) => {
  const settings = getAdminAuthSettings();
  if (!settings) {
    apiError(response, 503, "ADMIN_AUTH_NOT_CONFIGURED", "Admin authentication is not configured.");
    return;
  }

  const token = request.cookies?.[adminSessionCookie];
  if (!token || !verifyAdminSession(token, settings)) {
    apiError(response, 401, "UNAUTHORIZED", "A valid admin session is required.");
    return;
  }

  next();
  /*
   * GET /api/admin/products (also exercised on admin categories, product/category
   * creation, product update, legacy creation, and Cloudinary signature routes)
   * Request: no session cookie.
   * Actual response in this environment (503 Service Unavailable):
   * {
   *   "error": {
   *     "code": "ADMIN_AUTH_NOT_CONFIGURED",
   *     "message": "Admin authentication is not configured."
   *   }
   * }
   * With auth configured, a missing or invalid cookie returns 401 UNAUTHORIZED
   * (implementation-derived; not runtime-tested).
   */
};

export const requireSameOrigin: RequestHandler = (request, response, next) => {
  const origin = request.get("origin");
  const host = request.get("host");

  if (!origin || !host) {
    apiError(response, 403, "ORIGIN_NOT_ALLOWED", "A same-origin request is required.");
    return;
  }

  try {
    if (new URL(origin).host.toLowerCase() !== host.toLowerCase()) {
      apiError(response, 403, "ORIGIN_NOT_ALLOWED", "A same-origin request is required.");
      return;
    }
  } catch {
    apiError(response, 403, "ORIGIN_NOT_ALLOWED", "A same-origin request is required.");
    return;
  }

  next();
  /*
   * POST /api/admin/session
   * Request: JSON body {}; Origin header omitted.
   * Actual response (403 Forbidden):
   * {
   *   "error": {
   *     "code": "ORIGIN_NOT_ALLOWED",
   *     "message": "A same-origin request is required."
   *   }
   * }
   */
};

export const createAdminSession = (
  request: Request<Record<string, string>, unknown, AdminSessionBody>,
  response: Response,
): void => {
  const settings = getAdminAuthSettings();
  if (!settings) {
    apiError(response, 503, "ADMIN_AUTH_NOT_CONFIGURED", "Admin authentication is not configured.");
    return;
  }

  const { username, password } = request.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length === 0 ||
    password.length === 0 ||
    username.length > 256 ||
    password.length > 256
  ) {
    apiError(response, 400, "INVALID_CREDENTIALS", "Username and password are required.");
    return;
  }

  const usernameMatches = constantTimeStringEqual(username, settings.username);
  const passwordMatches = constantTimeStringEqual(password, settings.password);
  if (!usernameMatches || !passwordMatches) {
    apiError(response, 401, "UNAUTHORIZED", "Invalid username or password.");
    return;
  }

  response.cookie(
    adminSessionCookie,
    signAdminSession(settings.username, settings.sessionSecret),
    adminCookieOptions(),
  );
  const { maxAge: _maxAge, ...clearOptions } = adminCookieOptions();
  response.clearCookie(adminSessionCookie, { ...clearOptions, path: "/api/admin" });
  response.setHeader("Cache-Control", "no-store");
  response.json({ status: true, expiresIn: adminSessionLifetimeSeconds });
  /*
   * POST /api/admin/session
   * Request body:
   * {
   *   "username": "<configured-admin-username>",
   *   "password": "<configured-admin-password>"
   * }
   * Expected response (200 OK; implementation-derived, not runtime-tested):
   * {
   *   "status": true,
   *   "expiresIn": 28800
   * }
   * Also sets the HttpOnly sc_admin_session cookie (8-hour lifetime).
   * Actual response in this environment for body {} and a same-origin Origin
   * (503 Service Unavailable):
   * {
   *   "error": {
   *     "code": "ADMIN_AUTH_NOT_CONFIGURED",
   *     "message": "Admin authentication is not configured."
   *   }
   * }
   * Other implemented failures: 400 INVALID_CREDENTIALS; 401 UNAUTHORIZED.
   */
};

export const clearAdminSession = (_request: Request, response: Response): void => {
  const { maxAge: _maxAge, ...clearOptions } = adminCookieOptions();
  response.clearCookie(adminSessionCookie, clearOptions);
  response.clearCookie(adminSessionCookie, { ...clearOptions, path: "/api/admin" });
  response.status(204).end();
  /*
   * DELETE /api/admin/session
   * Request: same-origin Origin header; no body required.
   * Actual response (204 No Content): empty body.
   */
};

export const getAdminCategories = async (_request: Request, response: Response): Promise<void> => {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    });

    response.json({ categories });
  } catch (error) {
    console.error("Failed to retrieve admin categories:", error);
    apiError(response, 500, "INTERNAL_ERROR", "Failed to retrieve categories.");
  }
  /*
   * GET /api/admin/categories
   * Response shape (200 OK; implementation-derived, not runtime-tested):
   * {
   *   "categories": [
   *     { "id": "<category-id>", "name": "<category-name>", "slug": "<category-slug>" }
   *   ]
   * }
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

const productBodyFields = new Set([
  "code",
  "name",
  "description",
  "content",
  "actualPrice",
  "price",
  "stock",
  "minOrderQty",
  "maxOrderQty",
  "imageUrl",
  "categoryId",
  "isActive",
  "isFeatured",
]);
const legacyProductBodyFields = new Set([...productBodyFields, "categorySlug", "discount"]);

const parseAdminProductBody = (
  body: unknown,
  partial: boolean,
  requireCategory = true,
): { data?: AdminProductData; error?: string } => {
  if (!isRecord(body)) return { error: "Request body must be a JSON object." };

  const unknownField = Object.keys(body).find((key) => !productBodyFields.has(key));
  if (unknownField) return { error: `Unknown product field: ${unknownField}.` };

  const requiredFields = ["code", "name", "content", "actualPrice", "price", "stock"];
  if (requireCategory) requiredFields.push("categoryId");
  if (!partial) {
    const missingField = requiredFields.find((field) => body[field] === undefined);
    if (missingField) return { error: `${missingField} is required.` };
  }

  const data: AdminProductData = {};
  for (const field of ["code", "name", "content"] as const) {
    const value = body[field];
    if (value === undefined && partial) continue;
    if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > 500) {
      return { error: `${field} must be a non-empty string of at most 500 characters.` };
    }
    data[field] = value.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      return { error: "description must be a string or null." };
    }
    data.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }

  if (body.categoryId !== undefined) {
    if (typeof body.categoryId !== "string" || body.categoryId.trim().length === 0) {
      return { error: "categoryId must be a non-empty category ID." };
    }
    data.categoryId = body.categoryId.trim();
  }

  for (const field of ["actualPrice", "price"] as const) {
    const value = body[field];
    if (value === undefined && partial) continue;
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 99_999_999.99 ||
      Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
    ) {
      return { error: `${field} must be a non-negative amount with at most two decimal places.` };
    }
    data[field] = value;
  }

  for (const field of ["stock", "minOrderQty", "maxOrderQty"] as const) {
    const value = body[field];
    if (value === undefined && (partial || field === "minOrderQty" || field === "maxOrderQty")) continue;
    if (field === "maxOrderQty" && value === null) {
      data.maxOrderQty = null;
      continue;
    }
    if (
      typeof value !== "number" ||
      !Number.isSafeInteger(value) ||
      value < (field === "stock" ? 0 : 1) ||
      value > 2_147_483_647
    ) {
      return {
        error:
          field === "stock"
            ? "stock must be a non-negative 32-bit integer."
            : `${field} must be a positive 32-bit integer or null for maxOrderQty.`,
      };
    }
    data[field] = value;
  }

  if (body.imageUrl !== undefined) {
    if (body.imageUrl === null) {
      data.imageUrl = null;
    } else if (typeof body.imageUrl !== "string") {
      return { error: "imageUrl must be a Cloudinary URL or null." };
    } else {
      try {
        const imageUrl = new URL(body.imageUrl);
        if (imageUrl.protocol !== "https:" || imageUrl.hostname !== "res.cloudinary.com") {
          return { error: "imageUrl must be an HTTPS Cloudinary URL." };
        }
        data.imageUrl = imageUrl.toString();
      } catch {
        return { error: "imageUrl must be a valid HTTPS Cloudinary URL." };
      }
    }
  }

  for (const field of ["isActive", "isFeatured"] as const) {
    const value = body[field];
    if (value === undefined) continue;
    if (typeof value !== "boolean") return { error: `${field} must be a boolean.` };
    data[field] = value;
  }

  return { data };
};

const calculateDiscount = (actualPrice: number, sellingPrice: number): number => {
  if (actualPrice === 0) return 0;
  return Math.round((((actualPrice - sellingPrice) / actualPrice) * 100 + Number.EPSILON) * 100) / 100;
};

const validatePricePair = (actualPrice: number, sellingPrice: number): string | null => {
  if (sellingPrice > actualPrice) return "price cannot be greater than actualPrice.";
  return null;
};

const validateOrderQuantities = (minOrderQty: number, maxOrderQty: number | null): string | null => {
  if (maxOrderQty !== null && maxOrderQty < minOrderQty) {
    return "maxOrderQty must be greater than or equal to minOrderQty.";
  }
  return null;
};

const validateActiveCategory = async (categoryId: string): Promise<boolean> => {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    select: { id: true, isActive: true },
  });
  return category?.isActive === true;
};

type ProductCreationResult =
  | { success: true; product: ProductWithCategory }
  | { success: false; error: { code: string; message: string } };

const createValidatedProduct = async (
  data: CompleteAdminProductData,
  requireCategory: boolean,
): Promise<ProductCreationResult> => {
  const priceError = validatePricePair(data.actualPrice, data.price);
  const orderError = validateOrderQuantities(data.minOrderQty ?? 1, data.maxOrderQty ?? null);
  if (priceError || orderError) {
    return { success: false, error: { code: "INVALID_PRODUCT", message: priceError ?? orderError! } };
  }

  if (requireCategory && !data.categoryId) {
    return { success: false, error: { code: "INVALID_CATEGORY", message: "An active category is required." } };
  }
  if (data.categoryId && !(await validateActiveCategory(data.categoryId))) {
    return { success: false, error: { code: "INVALID_CATEGORY", message: "An active category is required." } };
  }

  const product = await db.product.create({
    data: {
      ...data,
      discount: calculateDiscount(data.actualPrice, data.price),
    },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return { success: true, product };
};

const parseListInteger = (value: unknown, field: string, fallback: number, maximum: number): number => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new InvalidAdminProductQueryError(`${field} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new InvalidAdminProductQueryError(`${field} must be between 1 and ${maximum}.`);
  }
  return parsed;
};

export const getAdminProducts = async (request: Request, response: Response): Promise<void> => {
  const query = request.query as unknown as Record<string, unknown>;
  const getQueryString = (key: string): string | undefined => {
    const value = query[key];
    if (value === undefined) return undefined;
    if (typeof value !== "string") {
      throw new InvalidAdminProductQueryError(`${key} must be a single string value.`);
    }
    return value;
  };

  try {
    const page = parseListInteger(query.page, "page", 1, Number.MAX_SAFE_INTEGER);
    const limit = parseListInteger(query.limit, "limit", 20, 100);
    const search = getQueryString("search")?.trim() ?? "";
    const categoryId = getQueryString("categoryId");
    const status = getQueryString("status") ?? "all";
    const stock = getQueryString("stock") ?? "all";
    const sort = getQueryString("sort") ?? "createdAt";
    const direction = getQueryString("direction") ?? "desc";

    if (search.length > 200) {
      throw new InvalidAdminProductQueryError("search must be at most 200 characters.");
    }
    if (categoryId !== undefined && categoryId.length === 0) {
      throw new InvalidAdminProductQueryError("categoryId cannot be empty.");
    }
    if (!["all", "active", "inactive"].includes(status)) {
      throw new InvalidAdminProductQueryError("status must be all, active, or inactive.");
    }
    if (!["all", "inStock", "outOfStock", "lowStock"].includes(stock)) {
      throw new InvalidAdminProductQueryError("stock must be all, inStock, outOfStock, or lowStock.");
    }
    if (!["price", "stock", "createdAt"].includes(sort)) {
      throw new InvalidAdminProductQueryError("sort must be price, stock, or createdAt.");
    }
    if (!["asc", "desc"].includes(direction)) {
      throw new InvalidAdminProductQueryError("direction must be asc or desc.");
    }

    const conditions: Prisma.Sql[] = [];
    if (search) {
      const term = `%${search}%`;
      conditions.push(Prisma.sql`(p."name" ILIKE ${term} OR p."code" ILIKE ${term})`);
    }
    if (categoryId !== undefined) conditions.push(Prisma.sql`p."categoryId" = ${categoryId}`);
    if (status === "active") conditions.push(Prisma.sql`p."isActive" = TRUE`);
    if (status === "inactive") conditions.push(Prisma.sql`p."isActive" = FALSE`);
    if (stock === "inStock") conditions.push(Prisma.sql`p."stock" > 0`);
    if (stock === "outOfStock") conditions.push(Prisma.sql`p."stock" = 0`);
    if (stock === "lowStock") {
      conditions.push(Prisma.sql`p."stock" > 0 AND p."stock" < p."minOrderQty"`);
    }

    const whereClause = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
      : Prisma.empty;
    const sortColumn =
      sort === "price"
        ? Prisma.raw('p."price"')
        : sort === "stock"
          ? Prisma.raw('p."stock"')
          : Prisma.raw('p."createdAt"');
    const sortDirection = direction === "asc" ? Prisma.raw("ASC") : Prisma.raw("DESC");
    const offset = (page - 1) * limit;
    if (!Number.isSafeInteger(offset)) {
      throw new InvalidAdminProductQueryError("The requested page is too large.");
    }

    type AdminProductRow = Prisma.ProductGetPayload<{}> & {
      categoryName: string | null;
      categorySlug: string | null;
    };

    const [rows, countRows] = await Promise.all([
      db.$queryRaw<AdminProductRow[]>(Prisma.sql`
        SELECT p.*, c."name" AS "categoryName", c."slug" AS "categorySlug"
        FROM "Product" AS p
        LEFT JOIN "Category" AS c ON c."id" = p."categoryId"
        ${whereClause}
        ORDER BY ${sortColumn} ${sortDirection}, p."id" ASC
        LIMIT ${limit} OFFSET ${offset}
      `),
      db.$queryRaw<Array<{ totalItems: bigint }>>(Prisma.sql`
        SELECT COUNT(*) AS "totalItems"
        FROM "Product" AS p
        ${whereClause}
      `),
    ]);
    const totalItems = Number(countRows[0]?.totalItems ?? 0);
    const items = rows.map(({ categoryName, categorySlug, ...product }) => ({
      ...product,
      category:
        categoryName === null
          ? null
          : { id: product.categoryId, name: categoryName, slug: categorySlug },
    }));

    response.json({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    if (error instanceof InvalidAdminProductQueryError) {
      apiError(response, 400, "INVALID_PRODUCT_QUERY", error.message);
      return;
    }
    console.error("Failed to retrieve admin products:", error);
    apiError(response, 500, "INTERNAL_ERROR", "Failed to retrieve products.");
  }
  /*
   * GET /api/admin/products?page=1&limit=20
   * Response shape when no products match (200 OK; implementation-derived,
   * not runtime-tested):
   * {
   *   "items": [],
   *   "pagination": { "page": 1, "limit": 20, "totalItems": 0, "totalPages": 0 }
   * }
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

export const createAdminProduct = async (
  request: Request<Record<string, string>, unknown, AdminProductBody>,
  response: Response,
): Promise<void> => {
  const parsed = parseAdminProductBody(request.body, false);
  if (!parsed.data) {
    apiError(response, 400, "INVALID_PRODUCT", parsed.error ?? "Invalid product data.");
    return;
  }

  const data = parsed.data as CompleteAdminProductData;

  try {
    const result = await createValidatedProduct(data, true);
    if (!result.success) {
      apiError(response, 400, result.error.code, result.error.message);
      return;
    }

    response.status(201).json({ product: result.product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      apiError(response, 409, "DUPLICATE_PRODUCT_CODE", "A product with this code already exists.");
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      apiError(response, 400, "INVALID_CATEGORY", "The provided category does not exist.");
      return;
    }
    console.error("Failed to create admin product:", error);
    apiError(response, 500, "INTERNAL_ERROR", "Failed to create product.");
  }
  /*
   * POST /api/admin/products
   * Request body example (categoryId must identify an active category):
   * {
   *   "code": "<unique-code>", "name": "<product-name>", "content": "Box",
   *   "actualPrice": 100, "price": 80, "stock": 10,
   *   "categoryId": "<active-category-id>"
   * }
   * Response envelope (201 Created; implementation-derived, not runtime-tested;
   * selected product fields shown, including the selected category relation):
   * {
   *   "product": {
   *     "id": "<generated-id>", "code": "<unique-code>", "name": "<product-name>",
   *     "category": { "id": "<category-id>", "name": "<category-name>", "slug": "<category-slug>" }
   *   }
   * }
   * Implemented errors: 400 INVALID_PRODUCT/INVALID_CATEGORY; 409 DUPLICATE_PRODUCT_CODE.
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

export const updateAdminProduct = async (
  request: Request<Record<string, string>, unknown, AdminProductBody>,
  response: Response,
): Promise<void> => {
  const parsed = parseAdminProductBody(request.body, true);
  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    apiError(response, 400, "INVALID_PRODUCT", parsed.error ?? "At least one product field is required.");
    return;
  }

  try {
    const existing = await db.product.findUnique({
      where: { id: request.params.id },
      select: { id: true, actualPrice: true, price: true, minOrderQty: true, maxOrderQty: true },
    });
    if (!existing) {
      apiError(response, 404, "PRODUCT_NOT_FOUND", "Product not found.");
      return;
    }

    const data = parsed.data;
    const actualPrice = data.actualPrice ?? Number(existing.actualPrice);
    const sellingPrice = data.price ?? Number(existing.price);
    const minOrderQty = data.minOrderQty ?? existing.minOrderQty;
    const maxOrderQty = data.maxOrderQty === undefined ? existing.maxOrderQty : data.maxOrderQty;
    const priceError = validatePricePair(actualPrice, sellingPrice);
    const orderError = validateOrderQuantities(minOrderQty, maxOrderQty);
    if (priceError || orderError) {
      apiError(response, 400, "INVALID_PRODUCT", priceError ?? orderError!);
      return;
    }

    if (data.categoryId !== undefined && !(await validateActiveCategory(data.categoryId))) {
      apiError(response, 400, "INVALID_CATEGORY", "An active category is required.");
      return;
    }

    const priceChanged = data.actualPrice !== undefined || data.price !== undefined;
    const product = await db.product.update({
      where: { id: existing.id },
      data: {
        ...data,
        ...(priceChanged ? { discount: calculateDiscount(actualPrice, sellingPrice) } : {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    response.json({ product });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      apiError(response, 409, "DUPLICATE_PRODUCT_CODE", "A product with this code already exists.");
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      apiError(response, 404, "PRODUCT_NOT_FOUND", "Product not found.");
      return;
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      apiError(response, 400, "INVALID_CATEGORY", "The provided category does not exist.");
      return;
    }
    console.error("Failed to update admin product:", error);
    apiError(response, 500, "INTERNAL_ERROR", "Failed to update product.");
  }
  /*
   * PATCH /api/admin/products/:id
   * Request body example: { "stock": 0, "isActive": false }
   * Response envelope (200 OK; implementation-derived, not runtime-tested;
   * selected product fields shown, including the selected category relation):
   * {
   *   "product": {
   *     "id": "<product-id>", "stock": 0, "isActive": false,
   *     "category": { "id": "<category-id>", "name": "<category-name>", "slug": "<category-slug>" }
   *   }
   * }
   * Implemented errors: 400 INVALID_PRODUCT/INVALID_CATEGORY; 404 PRODUCT_NOT_FOUND;
   * 409 DUPLICATE_PRODUCT_CODE.
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

export const createCloudinaryUploadSignature = (_request: Request, response: Response): void => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    apiError(response, 503, "CLOUDINARY_NOT_CONFIGURED", "Cloudinary uploads are not configured.");
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${cloudinaryProductFolder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex");

  response.json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    timestamp,
    folder: cloudinaryProductFolder,
    signature,
  });
  /*
   * POST /api/admin/cloudinary/signature
   * Request body: none; requires an admin session and configured Cloudinary variables.
   * Response shape (200 OK; implementation-derived, not runtime-tested; values shown by type):
   * {
   *   "cloudName": <string>, "apiKey": <string>, "timestamp": <number>,
   *   "folder": "santhi-crackers/products", "signature": <hex-string>
   * }
   * Missing Cloudinary configuration returns 503 CLOUDINARY_NOT_CONFIGURED after auth.
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

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
  const body: unknown = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: "Request body must be a JSON object." });
    return;
  }

  const unknownField = Object.keys(body).find((key) => !legacyProductBodyFields.has(key));
  if (unknownField) {
    response.status(400).json({ error: `Unknown product field: ${unknownField}.` });
    return;
  }
  if (
    body.categorySlug !== undefined &&
    body.categorySlug !== null &&
    typeof body.categorySlug !== "string"
  ) {
    response.status(400).json({ error: "categorySlug must be a string or null." });
    return;
  }
  if (
    body.discount !== undefined &&
    body.discount !== null &&
    (typeof body.discount !== "number" || !Number.isFinite(body.discount) || body.discount < 0 || body.discount > 100)
  ) {
    response.status(400).json({ error: "discount must be a percentage between 0 and 100." });
    return;
  }

  const normalizedBody: Record<string, unknown> = { ...body };
  delete normalizedBody.categorySlug;
  delete normalizedBody.discount;
  if (normalizedBody.categoryId === null) delete normalizedBody.categoryId;
  if (normalizedBody.minOrderQty === undefined) normalizedBody.minOrderQty = 1;

  try {
    if (typeof body.categorySlug === "string" && body.categorySlug.length > 0) {
      const category = await db.category.findUnique({
        where: { slug: body.categorySlug },
        select: { id: true },
      });

      if (!category) {
        response.status(400).json({
          error: `No category exists with slug "${body.categorySlug}".`,
        });
        return;
      }

      normalizedBody.categoryId = category.id;
    }

    const parsed = parseAdminProductBody(normalizedBody, false, false);
    if (!parsed.data) {
      response.status(400).json({ error: parsed.error ?? "Invalid product data." });
      return;
    }

    const data = parsed.data as CompleteAdminProductData;
    const result = await createValidatedProduct(data, false);
    if (!result.success) {
      response.status(400).json({ error: result.error.message });
      return;
    }

    response.status(201).json({
      status: true,
      message: "Product created Sucessfully",
      product: formatProduct(result.product),
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
  /*
   * POST /api/items (protected legacy product-create route)
   * Request body: same product fields as POST /api/admin/products; categorySlug
   * may be used instead of categoryId.
   * Response envelope (201 Created; implementation-derived, not runtime-tested;
   * selected product fields shown):
   * {
   *   "status": true,
   *   "message": "Product created Sucessfully",
   *   "product": { "id": "<generated-id>", "code": "<product-code>", "categorySlug": "<category-slug>" }
   * }
   * The executed request was blocked by requireAdminSession; see its auth probe.
   */
};

export const createCategory = async (
  request: Request<Record<string, string>, unknown, CreateCategoryBody>,
  response: Response,
): Promise<void> => {
  const body: unknown = request.body;
  if (!isRecord(body)) {
    response.status(400).json({ error: "Request body must be a JSON object." });
    return;
  }

  const allowedFields = new Set([
    "name",
    "slug",
    "description",
    "imageUrl",
    "sortOrder",
    "isActive",
  ]);
  const unknownField = Object.keys(body).find((field) => !allowedFields.has(field));
  if (unknownField) {
    response.status(400).json({ error: `Unknown category field: ${unknownField}.` });
    return;
  }

  const name = body.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    response.status(400).json({ error: "name must be a non-empty string." });
    return;
  }

  const slug = body.slug;
  if (typeof slug !== "string" || slug.trim().length === 0) {
    response.status(400).json({ error: "slug must be a non-empty string." });
    return;
  }

  for (const field of ["description", "imageUrl"] as const) {
    const value = body[field];
    if (value !== undefined && value !== null && typeof value !== "string") {
      response.status(400).json({ error: `${field} must be a string or null.` });
      return;
    }
  }

  const sortOrder = body.sortOrder;
  if (
    sortOrder !== undefined &&
    (typeof sortOrder !== "number" ||
      !Number.isSafeInteger(sortOrder) ||
      sortOrder < -2_147_483_648 ||
      sortOrder > 2_147_483_647)
  ) {
    response.status(400).json({ error: "sortOrder must be a signed 32-bit integer." });
    return;
  }

  const isActive = body.isActive;
  if (isActive !== undefined && typeof isActive !== "boolean") {
    response.status(400).json({ error: "isActive must be a boolean." });
    return;
  }

  const descriptionValue = body.description;
  const description =
    typeof descriptionValue === "string"
      ? descriptionValue.trim() || null
      : descriptionValue === null || descriptionValue === undefined
        ? descriptionValue
        : undefined;
  const imageUrlValue = body.imageUrl;
  const imageUrl =
    typeof imageUrlValue === "string"
      ? imageUrlValue.trim() || null
      : imageUrlValue === null || imageUrlValue === undefined
        ? imageUrlValue
        : undefined;

  try {
    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim(),
        description,
        imageUrl,
        sortOrder,
        isActive,
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
  /*
   * POST /api/admin/categories and protected legacy POST /api/categories
   * Request body:
   * { "name": "<category-name>", "slug": "<category-slug>", "sortOrder": 0, "isActive": true }
   * Response envelope (201 Created; implementation-derived, not runtime-tested;
   * selected category fields shown):
   * {
   *   "status": true,
   *   "message": "Category Created Successfully ",
   *   "category": { "id": "<generated-id>", "name": "<category-name>", "slug": "<category-slug>" }
   * }
   * Implemented errors: 400 invalid body/fields; 409 duplicate name or slug.
   * The executed requests were blocked by requireAdminSession; see its auth probe.
   */
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
