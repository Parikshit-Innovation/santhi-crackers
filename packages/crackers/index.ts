import enData from "./en.json";
import taData from "./ta.json";

export type SupportedLanguage = "en" | "ta";

export interface CrackersLocaleData {
  locale: string;
  categories: Record<string, string>;
  products: Record<string, string>;
}

export const crackersEn = enData as CrackersLocaleData;
export const crackersTa = taData as CrackersLocaleData;

// Reverse lookup: English product name to code
const enNameToCodeMap: Record<string, string> = {};
for (const [code, name] of Object.entries(enData.products)) {
  enNameToCodeMap[name.trim().toLowerCase()] = code;
}

// Reverse lookup: English category name to slug
const enCategoryNameToSlugMap: Record<string, string> = {};
for (const [slug, name] of Object.entries(enData.categories)) {
  enCategoryNameToSlugMap[name.trim().toLowerCase()] = slug;
}

/**
 * Get translated product name given code or English name
 */
export function getTranslatedProductName(
  codeOrName?: string | null,
  lang: SupportedLanguage = "en",
  fallback?: string
): string {
  if (!codeOrName || !codeOrName.trim()) return fallback || "";
  const trimmed = codeOrName.trim();
  const data = lang === "ta" ? crackersTa : crackersEn;

  // 1. Direct code lookup (e.g. "SF2026-001")
  if (data.products[trimmed]) {
    return data.products[trimmed];
  }
  const upperCode = trimmed.toUpperCase();
  if (data.products[upperCode]) {
    return data.products[upperCode];
  }

  // 2. English name lookup -> find code -> get translated name
  const code = enNameToCodeMap[trimmed.toLowerCase()];
  if (code && data.products[code]) {
    return data.products[code];
  }

  return fallback || trimmed;
}

/**
 * Get translated category name given slug or English name
 */
export function getTranslatedCategoryName(
  slugOrName?: string | null,
  lang: SupportedLanguage = "en",
  fallback?: string
): string {
  if (!slugOrName || !slugOrName.trim()) return fallback || "";
  const trimmed = slugOrName.trim();
  const slug = trimmed.toLowerCase();
  const data = lang === "ta" ? crackersTa : crackersEn;

  // 1. Direct slug lookup (e.g. "flash-sound-crackers")
  if (data.categories[slug]) {
    return data.categories[slug];
  }

  // 2. English category name lookup -> find slug -> get translated name
  const matchedSlug = enCategoryNameToSlugMap[slug];
  if (matchedSlug && data.categories[matchedSlug]) {
    return data.categories[matchedSlug];
  }

  return fallback || trimmed;
}
