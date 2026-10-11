export type CreateProductBody = {
  code: string;
  name?: string;
  nameEng?: string;
  nameTam?: string | null;
  description?: string | null;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  content?: string;
  contentEng?: string;
  contentTam?: string | null;
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
  name?: string;
  nameEng?: string;
  nameTam?: string | null;
  slug: string;
  description?: string | null;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

export type ProductCatalogCategory = {
  id: string;
  name: string;
  nameEng?: string | null;
  nameTam?: string | null;
  slug: string;
};

export type CatalogProductResponse = {
  id: string;
  code: string;
  name: string;
  nameEng: string | null;
  nameTam: string | null;
  description: string | null;
  descriptionEng: string | null;
  descriptionTam: string | null;
  content: string;
  contentEng: string | null;
  contentTam: string | null;
  actualPrice: string;
  price: string;
  discount: string | null;
  stock: number;
  imageUrl: string | null;
  category: ProductCatalogCategory | null;
  categorySlug?: string | null;
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
  pagination?: ProductPaginationResponse;
};

export type CategoryListItemResponse = {
  id: string;
  name: string;
  nameEng: string | null;
  nameTam: string | null;
  slug: string;
  description: string | null;
  descriptionEng: string | null;
  descriptionTam: string | null;
  imageUrl: string | null;
  sortOrder: number;
  productCount: number;
  isActive?: boolean;
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
  nameEng?: string | null;
  nameTam?: string | null;
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
