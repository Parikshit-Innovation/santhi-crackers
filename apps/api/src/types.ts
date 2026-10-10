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
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export interface UpdateProductBody {
  code?: string;
  name?: string;
  description?: string | null;
  content?: string;
  actualPrice?: number | string;
  price?: number | string;
  discount?: number | string | null;
  stock?: number;
  minOrderQty?: number;
  maxOrderQty?: number | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateProductStatusBody {
  isActive?: boolean;
  status?: boolean | string;
}

export interface UpdateProductFeaturedBody {
  isFeatured?: boolean;
}

export interface UpdateProductStockBody {
  stock?: number;
}

export interface UpdateCategoryBody {
  name?: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _count: {
    products: number;
  };
}
