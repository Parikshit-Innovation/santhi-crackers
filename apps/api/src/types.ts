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

export type AdminSessionBody = {
  username?: unknown;
  password?: unknown;
};

export type AdminProductBody = {
  code?: unknown;
  name?: unknown;
  description?: unknown;
  content?: unknown;
  actualPrice?: unknown;
  price?: unknown;
  stock?: unknown;
  minOrderQty?: unknown;
  maxOrderQty?: unknown;
  imageUrl?: unknown;
  categoryId?: unknown;
  isActive?: unknown;
  isFeatured?: unknown;
};
