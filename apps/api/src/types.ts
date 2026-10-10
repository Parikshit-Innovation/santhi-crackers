export type CreateProductBody = {
  code: string;
  name: string;
  description?: string | null;
  content: string;
  actualPrice: number;
  price: number;
  discount?: number | null;
  stock: number;
  minOrderQty?: number;
  maxOrderQty?: number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
};

export type CreateCategoryBody = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type CartItemResponse = {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  total: string;
  name?: string;
  imageUrl?: string | null;
  categorySlug?: string | null;
};

export type CartSummaryResponse = {
  totalItems: number;
  subtotal: string;
};

export type CartResponse = {
  id: string;
  items: CartItemResponse[];
  summary: CartSummaryResponse;
};

export type GetCartResponse = {
  cart: CartResponse;
};

export type PaginationResponse = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type GetProductsByCategoryResponse = {
  category: CategorySummary;
  items: Record<string, unknown>[];
  pagination: PaginationResponse;
};
