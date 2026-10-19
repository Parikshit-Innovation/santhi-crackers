export interface CreateProductInput {
  code: string;
  name?: string;
  nameEng?: string;
  nameTam?: string | null;
  description?: string;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  content?: string;
  contentEng?: string | null;
  contentTam?: string | null;
  actualPrice: number;
  price: number;
  discount?: number;
  stock?: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  imageUrl?: string | null;
  categorySlug?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface BackendProductItem {
  id: string;
  code: string;
  name: string;
  nameEng?: string | null;
  nameTam?: string | null;
  description?: string | null;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  content?: string | null;
  contentEng?: string | null;
  contentTam?: string | null;
  actualPrice: string | number;
  price: string | number;
  discount: string | number;
  stock: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  imageUrl?: string | null;
  categorySlug?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductResponse {
  status: boolean;
  message: string;
  product: BackendProductItem;
}

export interface GetProductsResponse {
  items: BackendProductItem[];
}

import { getApiEndpoints } from "./config";

const API_PRODUCT_ENDPOINTS = getApiEndpoints("/api/product");
const API_PRODUCTS_ENDPOINTS = getApiEndpoints("/api/products");

export async function createProductApi(input: CreateProductInput): Promise<CreateProductResponse> {
  let lastError: Error = new Error("Failed to create product");

  const nameEng = input.nameEng?.trim() || input.name?.trim() || "";
  const nameTam = input.nameTam?.trim() || null;
  const name = nameEng || nameTam || "";

  const descEng = input.descriptionEng !== undefined ? input.descriptionEng?.trim() : (input.description?.trim() || "");
  const descTam = input.descriptionTam !== undefined ? input.descriptionTam?.trim() : null;
  const description = descEng || descTam || "";

  const contEng = input.contentEng !== undefined ? input.contentEng?.trim() : (input.content?.trim() || "");
  const contTam = input.contentTam !== undefined ? input.contentTam?.trim() : null;
  const content = contEng || contTam || "";

  for (const endpoint of API_PRODUCT_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code: input.code.trim().toUpperCase(),
          name,
          nameEng: nameEng || name,
          nameTam,
          description,
          descriptionEng: descEng,
          descriptionTam: descTam,
          content,
          contentEng: contEng,
          contentTam: contTam,
          actualPrice: Number(input.actualPrice) || 0,
          price: Number(input.price) || 0,
          discount: Number(input.discount) || 0,
          stock: Number(input.stock) || 0,
          minOrderQty: Number(input.minOrderQty) || 1,
          maxOrderQty: Number(input.maxOrderQty) || 10,
          imageUrl: input.imageUrl?.trim() || null,
          categorySlug: input.categorySlug?.trim() || undefined,
          categoryId: input.categoryId || undefined,
          isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
          isFeatured: input.isFeatured !== undefined ? Boolean(input.isFeatured) : false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Error ${response.status}: Failed to create product`;
        throw new Error(errorMsg);
      }

      return data as CreateProductResponse;
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
    }
  }

  throw lastError;
}

export async function fetchProductsApi(): Promise<BackendProductItem[]> {
  for (const endpoint of API_PRODUCTS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.items)) {
          return data.items as BackendProductItem[];
        }
        if (Array.isArray(data)) {
          return data as BackendProductItem[];
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return [];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface UpdateProductResponse {
  status: boolean;
  message: string;
  product: BackendProductItem;
}

export interface DeleteProductResponse {
  status: boolean;
  message: string;
  id: string;
}

export async function updateProductApi(
  id: string | number,
  input: UpdateProductInput
): Promise<UpdateProductResponse> {
  const idStr = encodeURIComponent(String(id).trim());
  const endpoints = getApiEndpoints(`/api/product/${idStr}`);

  const bodyData: Record<string, any> = {};
  if (input.code !== undefined) bodyData.code = input.code ? input.code.trim().toUpperCase() : "";
  if (input.nameEng !== undefined) bodyData.nameEng = input.nameEng ? input.nameEng.trim() : "";
  if (input.nameTam !== undefined) bodyData.nameTam = input.nameTam ? input.nameTam.trim() : null;
  if (input.name !== undefined) bodyData.name = input.name ? input.name.trim() : "";
  if (input.descriptionEng !== undefined) bodyData.descriptionEng = input.descriptionEng ? input.descriptionEng.trim() : null;
  if (input.descriptionTam !== undefined) bodyData.descriptionTam = input.descriptionTam ? input.descriptionTam.trim() : null;
  if (input.description !== undefined) bodyData.description = input.description ? input.description.trim() : null;
  if (input.contentEng !== undefined) bodyData.contentEng = input.contentEng ? input.contentEng.trim() : null;
  if (input.contentTam !== undefined) bodyData.contentTam = input.contentTam ? input.contentTam.trim() : null;
  if (input.content !== undefined) bodyData.content = input.content ? input.content.trim() : null;
  if (input.actualPrice !== undefined) bodyData.actualPrice = Number(input.actualPrice) || 0;
  if (input.price !== undefined) bodyData.price = Number(input.price) || 0;
  if (input.discount !== undefined) bodyData.discount = Number(input.discount) || 0;
  if (input.stock !== undefined) bodyData.stock = Number(input.stock) || 0;
  if (input.minOrderQty !== undefined) bodyData.minOrderQty = Number(input.minOrderQty) || 1;
  if (input.maxOrderQty !== undefined) bodyData.maxOrderQty = Number(input.maxOrderQty) || 10;
  if (input.imageUrl !== undefined) bodyData.imageUrl = input.imageUrl?.trim() || null;
  if (input.categorySlug !== undefined) bodyData.categorySlug = input.categorySlug.trim() || undefined;
  if (input.categoryId !== undefined) bodyData.categoryId = input.categoryId || undefined;
  if (input.isActive !== undefined) bodyData.isActive = Boolean(input.isActive);
  if (input.isFeatured !== undefined) bodyData.isFeatured = Boolean(input.isFeatured);
  if (input.sortOrder !== undefined) bodyData.sortOrder = Number(input.sortOrder);

  let lastError: Error = new Error("Failed to update product");

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Error ${response.status}: Failed to update product`;
        throw new Error(errorMsg);
      }

      return data as UpdateProductResponse;
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
    }
  }

  throw lastError;
}

export async function deleteProductApi(id: string | number): Promise<DeleteProductResponse> {
  const idStr = encodeURIComponent(String(id).trim());
  const endpoints = getApiEndpoints(`/api/product/${idStr}`);

  let lastError: Error = new Error("Failed to delete product");

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Error ${response.status}: Failed to delete product`;
        throw new Error(errorMsg);
      }

      return data as DeleteProductResponse;
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
    }
  }

  throw lastError;
}
