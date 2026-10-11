export interface CreateProductInput {
  code: string;
  name: string;
  description?: string;
  content?: string;
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
}

export interface BackendProductItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  content?: string | null;
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

const API_PRODUCT_ENDPOINTS = [
  "http://localhost:3007/api/product",
  "/api/product",
];

const API_PRODUCTS_ENDPOINTS = [
  "http://localhost:3007/api/products",
  "/api/products",
];

export async function createProductApi(input: CreateProductInput): Promise<CreateProductResponse> {
  let lastError: Error = new Error("Failed to create product");

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
          name: input.name.trim(),
          description: input.description?.trim() || "",
          content: input.content?.trim() || "",
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
      // If server responded with a known backend validation/conflict error, rethrow immediately
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
  const endpoints = [
    `http://localhost:3007/api/product/${idStr}`,
    `http://localhost:3007/api/products/${idStr}`,
    `/api/product/${idStr}`,
    `/api/products/${idStr}`,
  ];

  const bodyData: Record<string, any> = {};
  if (input.code !== undefined) bodyData.code = input.code.trim().toUpperCase();
  if (input.name !== undefined) bodyData.name = input.name.trim();
  if (input.description !== undefined) bodyData.description = input.description.trim();
  if (input.content !== undefined) bodyData.content = input.content.trim();
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
  const endpoints = [
    `http://localhost:3007/api/product/${idStr}`,
    `http://localhost:3007/api/products/${idStr}`,
    `/api/product/${idStr}`,
    `/api/products/${idStr}`,
  ];

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
