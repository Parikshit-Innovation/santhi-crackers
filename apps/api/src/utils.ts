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
