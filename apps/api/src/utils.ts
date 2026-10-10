/**
 * Generates a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculates the percentage discount given actualPrice and selling price.
 * Formula: ((actualPrice - price) / actualPrice) * 100
 */
export function calculateDiscount(actualPrice: number, price: number): number {
  if (actualPrice <= 0) {
    return 0;
  }
  const discount = ((actualPrice - price) / actualPrice) * 100;
  return Number(Math.max(0, Math.min(100, discount)).toFixed(2));
}
import type { ProductSortOption } from "./types.js";

export const SUPPORTED_SORT_OPTIONS: readonly ProductSortOption[] = [
  "newest",
  "price_asc",
  "price_desc",
  "name_asc",
  "name_desc",
] as const;

export const isValidPositiveInteger = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  return /^[1-9]\d*$/.test(trimmed);
};

export const isValidLimit = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }
  const trimmed = value.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    return false;
  }
  const num = Number(trimmed);
  return num >= 1 && num <= 10;
};

export const isValidSortOption = (value: unknown): value is ProductSortOption => {
  if (typeof value !== "string") {
    return false;
  }
  return (SUPPORTED_SORT_OPTIONS as readonly string[]).includes(value.trim());
};

export type DecimalLike =
  | {
      toFixed: (dp?: number) => string;
    }
  | number
  | string;

export const formatDecimalPrice = (
  value: DecimalLike | null | undefined,
): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toFixed" in value &&
    typeof (value as { toFixed: unknown }).toFixed === "function"
  ) {
    return (value as { toFixed: (dp: number) => string }).toFixed(2);
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? value : num.toFixed(2);
  }
  return null;
};
