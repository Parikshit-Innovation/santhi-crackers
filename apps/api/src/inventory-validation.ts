export type InventoryListQuery = {
  page: number;
  limit: number;
  search?: string;
};

export type StockUpdateRequest = {
  stock: number;
  expectedStock: number;
};

// ── Shared helpers (mirrored from order-validation, kept local to avoid
// coupling the two modules) ─────────────────────────────────────────────────

const isNonNegativeSafeInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 9_999_999;

const parsePageInteger = (value: unknown, fallback: number, maximum: number): number | null => {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value.trim())) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
};

// ── Exported parsers ───────────────────────────────────────────────────────

/**
 * Re-export the existing parseOrderId under the same name so callers within
 * this module do not need a cross-module import, and so the test file can
 * import directly from inventory-validation.
 */
export { parseOrderId } from "./order-validation.js";

export const parseInventoryListQuery = (
  query: Record<string, unknown>,
): InventoryListQuery | null => {
  const page = parsePageInteger(query.page, 1, 1_000_000);
  const limit = parsePageInteger(query.limit, 20, 100);

  if (page === null || limit === null) return null;

  let search: string | undefined;
  if (query.search !== undefined) {
    if (typeof query.search !== "string") return null;
    search = query.search.trim();
    if (search.length > 100 || /[\u0000-\u001f\u007f]/.test(search)) return null;
    if (!search) search = undefined;
  }

  return { page, limit, search };
};

export const parseStockUpdate = (body: unknown): StockUpdateRequest | null => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  const candidate = body as Record<string, unknown>;

  // Both fields must be non-negative safe integers.
  if (!isNonNegativeSafeInt(candidate.stock)) return null;
  if (!isNonNegativeSafeInt(candidate.expectedStock)) return null;

  return { stock: candidate.stock, expectedStock: candidate.expectedStock };
};
