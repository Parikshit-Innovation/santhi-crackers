export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BackendCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
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

const API_ENDPOINTS = [
  "http://localhost:3007/api/categories",
  "/api/categories",
];

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
          name: input.name,
          slug: input.slug,
          description: input.description || "",
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
      // If server responded with a known backend validation/conflict error, rethrow immediately
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
