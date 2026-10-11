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

export type UpdateProductBody = Partial<CreateProductBody>;

export type CreateCategoryBody = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export type ProductCatalogCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogProductResponse = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  content: string;
  actualPrice: string;
  price: string;
  discount: string | null;
  stock: number;
  imageUrl: string | null;
  category: ProductCatalogCategory | null;
  isActive: boolean;
  isFeatured: boolean;
};

export type ProductPaginationResponse = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type GetProductsResponse = {
  items: CatalogProductResponse[];
  pagination: ProductPaginationResponse;
};

export type CategoryListItemResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
};

export type GetCategoriesResponse = {
  categories: CategoryListItemResponse[];
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
