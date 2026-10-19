import { ComboItem } from "../components/ComboPackTable";
import { CartEntry } from "../components/StoreCartDrawer";

export interface BackendCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  total: string;
  name?: string;
  imageUrl?: string | null;
  categorySlug?: string | null;
}

export interface BackendCartSummary {
  totalItems: number;
  subtotal: string;
}

export interface BackendCart {
  id: string;
  items: BackendCartItem[];
  summary: BackendCartSummary;
}

export interface GetCartResponse {
  cart: BackendCart;
}

export const CART_STORAGE_KEY = "santhi_crackers_cart_items_v1";
export const CART_ID_KEY = "santhi_crackers_cart_id_v1";

import { getApiEndpoints } from "./config";

/**
 * Connects to GET /api/cart with cookie credentials to get or initialize the server guest cart.
 */
export async function fetchBackendCart(): Promise<BackendCart | null> {
  const endpoints = getApiEndpoints("/api/cart");

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = (await response.json()) as GetCartResponse;
        if (data && data.cart) {
          if (data.cart.id) {
            try {
              localStorage.setItem(CART_ID_KEY, data.cart.id);
            } catch {
              // ignore localStorage errors in sandboxed environments
            }
          }
          return data.cart;
        }
      }
    } catch {
      // Continue to next fallback endpoint
    }
  }

  return null;
}

/**
 * Maps a BackendCartItem into frontend CartEntry format.
 */
export function mapBackendCartItemToCartEntry(
  backendItem: BackendCartItem,
  productLookup?: Record<string, ComboItem>,
): CartEntry {
  const priceNum = Number(backendItem.price) || 0;
  const matched = productLookup?.[backendItem.productId];

  const item: ComboItem = matched || {
    id: backendItem.productId,
    code: "CRK",
    name: backendItem.name || "Celebration Cracker",
    category: backendItem.categorySlug
      ? backendItem.categorySlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Crackers",
    content: "1 Unit",
    actualPrice: priceNum > 0 ? Math.round(priceNum * 1.25) : 0,
    price: priceNum,
    image:
      backendItem.imageUrl ||
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  };

  return {
    item,
    quantity: backendItem.quantity || 1,
  };
}

/**
 * Loads stored cart items from localStorage as fallback/cache.
 */
export function loadCachedCart(): CartEntry[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }
  return [];
}

/**
 * Persists cart items to localStorage.
 */
export function saveCachedCart(items: CartEntry[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota/security error
  }
}
