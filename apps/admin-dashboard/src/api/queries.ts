export interface CustomerQuery {
  id: string;
  mobileNumber: string;
  message: string;
  status: "PENDING" | "CONTACTED" | "RESOLVED" | string;
  createdAt: string;
  updatedAt: string;
}

export interface FetchQueriesResponse {
  success: boolean;
  queries: CustomerQuery[];
  total: number;
}

const API_ENDPOINTS = [
  "http://localhost:3007/api/queries",
  "/api/queries",
];

export async function fetchQueriesApi(): Promise<FetchQueriesResponse> {
  let lastError: Error = new Error("Failed to fetch customer queries");

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} from ${endpoint}`);
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        queries: Array.isArray(data.queries) ? data.queries : [],
        total: typeof data.total === "number" ? data.total : (data.queries?.length ?? 0),
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError;
}
