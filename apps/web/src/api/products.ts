import { ComboItem } from "../components/ComboPackTable";

export interface BackendProduct {
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
  discount?: string | number | null;
  stock?: number | null;
  minOrderQty?: number | null;
  maxOrderQty?: number | null;
  imageUrl?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  categorySlug?: string | null;
  sortOrder?: number;
}

export interface BackendCategory {
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
}

/**
 * Reusable bilingual text resolution helper per Section 5 requirements.
 * Returns the requested language field, falling back to the alternate language,
 * the legacy field, or the safe fallback value.
 */
export function getLocalizedText<T extends Record<string, any>>(
  entity: T | null | undefined,
  field: string,
  language: "en" | "ta",
  safeDefault: string = ""
): string {
  if (!entity) return safeDefault;
  const priKey = `${field}${language === "ta" ? "Tam" : "Eng"}`;
  const secKey = `${field}${language === "ta" ? "Eng" : "Tam"}`;
  const priVal = entity[priKey];
  const secVal = entity[secKey];
  const legacyVal = entity[field];

  if (typeof priVal === "string" && priVal.trim() !== "") return priVal.trim();
  if (typeof secVal === "string" && secVal.trim() !== "") return secVal.trim();
  if (typeof legacyVal === "string" && legacyVal.trim() !== "") return legacyVal.trim();
  return safeDefault;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  rockets:
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  sparklers:
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  chakkars:
    "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  "ground-chakkars":
    "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  "flower-pots":
    "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  fountains:
    "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  "sound-crackers":
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  "combo-packs":
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
};

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80";

const SLUG_TO_CATEGORY_TITLE: Record<string, string> = {
  rockets: "Rockets & Aerial Skyshots",
  sparklers: "Sparklers",
  chakkars: "Ground Chakkars",
  "ground-chakkars": "Ground Chakkars",
  "flower-pots": "Flower Pots & Fountains",
  fountains: "Flower Pots & Fountains",
  "sound-crackers": "Sound Crackers",
  "combo-packs": "Combo Packs & Gift Boxes",
};

export const mapBackendProductToComboItem = (
  prod: BackendProduct,
  categoryNameMap?: Record<string, string>,
  categoryTamMap?: Record<string, string>,
): ComboItem => {
  const slug = (prod.categorySlug || "").toLowerCase();
  const categoryName =
    categoryNameMap?.[slug] ||
    SLUG_TO_CATEGORY_TITLE[slug] ||
    (slug
      ? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Crackers");

  const actualPriceNum = Number(prod.actualPrice) || Number(prod.price) || 0;
  const priceNum = Number(prod.price) || 0;

  const image =
    prod.imageUrl && prod.imageUrl.trim() !== ""
      ? prod.imageUrl
      : DEFAULT_CATEGORY_IMAGES[slug] || DEFAULT_FALLBACK_IMAGE;

  const nameEng = prod.nameEng || prod.name || "";
  const nameTam = prod.nameTam || null;
  const contentEng = prod.contentEng || prod.content || "1 Box";
  const contentTam = prod.contentTam || null;
  const descEng = prod.descriptionEng || prod.description || "";
  const descTam = prod.descriptionTam || null;

  return {
    id: prod.id,
    code: prod.code || "CRK",
    name: nameEng,
    nameEng,
    nameTam,
    category: categoryName,
    categorySlug: slug,
    categoryEng: categoryName,
    categoryTam: categoryTamMap?.[slug] || null,
    content: contentEng,
    contentEng,
    contentTam,
    description: descEng,
    descriptionEng: descEng,
    descriptionTam: descTam,
    actualPrice: actualPriceNum,
    price: priceNum,
    image,
    sortOrder: typeof prod.sortOrder === "number" ? prod.sortOrder : 0,
  };
};

import { getApiEndpoints } from "./config";

export async function fetchBackendProducts(): Promise<BackendProduct[]> {
  const endpoints = getApiEndpoints("/api/products");

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const json = await response.json();
        if (json && Array.isArray(json.items)) {
          return json.items;
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  throw new Error("Unable to connect to backend products endpoint");
}

export async function fetchBackendCategories(): Promise<BackendCategory[]> {
  const endpoints = getApiEndpoints("/api/categories");

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const json = await response.json();
        if (json && Array.isArray(json.categories)) {
          return json.categories;
        }
      }
    } catch {
      // Continue to next endpoint fallback
    }
  }

  return [];
}
