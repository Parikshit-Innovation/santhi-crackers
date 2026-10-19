export interface CreateCategoryInput {
  name: string;
  nameEng?: string;
  nameTam?: string | null;
  slug: string;
  description?: string;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BackendCategoryItem {
  id: string;
  name: string;
  nameEng?: string | null;
  nameTam?: string | null;
  slug: string;
  description?: string | null;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  productCount?: number;
  isActive?: boolean;
}

export interface CreateCategoryResponse {
  status: boolean;
  message: string;
  category: BackendCategoryItem;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export interface UpdateCategoryResponse {
  status: boolean;
  message: string;
  category: BackendCategoryItem;
}

import { getApiEndpoints } from "./config";

const API_ENDPOINTS = getApiEndpoints("/api/categories");

export async function createCategoryApi(input: CreateCategoryInput): Promise<CreateCategoryResponse> {
  let lastError: Error = new Error("Failed to create category");

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: input.nameEng || input.name,
          nameEng: input.nameEng || input.name,
          nameTam: input.nameTam || null,
          slug: input.slug,
          description: input.descriptionEng || input.description || "",
          descriptionEng: input.descriptionEng || input.description || "",
          descriptionTam: input.descriptionTam || null,
          imageUrl: input.imageUrl || null,
          sortOrder: input.sortOrder !== undefined ? Number(input.sortOrder) : 1,
          isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Error ${response.status}: Failed to create category`;
        throw new Error(errorMsg);
      }

      return data as CreateCategoryResponse;
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
    }
  }

  throw lastError;
}

export async function updateCategoryApi(
  idOrSlug: string | number,
  input: UpdateCategoryInput
): Promise<UpdateCategoryResponse> {
  const param = encodeURIComponent(String(idOrSlug).trim());
  const endpoints = getApiEndpoints(`/api/categories/${param}`);

  const bodyData: Record<string, any> = {};
  if (input.nameEng !== undefined) bodyData.nameEng = input.nameEng ? input.nameEng.trim() : "";
  if (input.nameTam !== undefined) bodyData.nameTam = input.nameTam ? input.nameTam.trim() : null;
  if (input.name !== undefined) bodyData.name = input.name ? input.name.trim() : "";
  if (input.slug !== undefined) bodyData.slug = input.slug.trim().toLowerCase();
  if (input.descriptionEng !== undefined) bodyData.descriptionEng = input.descriptionEng ? input.descriptionEng.trim() : null;
  if (input.descriptionTam !== undefined) bodyData.descriptionTam = input.descriptionTam ? input.descriptionTam.trim() : null;
  if (input.description !== undefined) bodyData.description = input.description ? input.description.trim() : null;
  if (input.imageUrl !== undefined) bodyData.imageUrl = input.imageUrl ? input.imageUrl.trim() : null;
  if (input.sortOrder !== undefined) bodyData.sortOrder = Number(input.sortOrder);
  if (input.isActive !== undefined) bodyData.isActive = Boolean(input.isActive);

  let lastError: Error = new Error("Failed to update category");

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
        const errorMsg = data?.error || data?.message || `Error ${response.status}: Failed to update category`;
        throw new Error(errorMsg);
      }

      return data as UpdateCategoryResponse;
    } catch (err: any) {
      lastError = err;
      if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
        throw err;
      }
    }
  }

  throw lastError;
}

export interface GetCategoriesResponse {
  categories: BackendCategoryItem[];
}

export async function fetchCategoriesApi(): Promise<BackendCategoryItem[]> {
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.categories)) {
          return data.categories as BackendCategoryItem[];
        }
        if (Array.isArray(data)) {
          return data as BackendCategoryItem[];
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return [];
}
