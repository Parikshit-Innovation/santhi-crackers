import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ChevronLeft, ChevronRight,
    Clock,
    Edit, Eye, EyeOff,
    ImageIcon,
    Layers,
    LayoutDashboard,
    ListTree,
    LogOut,
    Menu,
    MessageSquare,
    Package,
    Phone,
    Plus,
    RefreshCw,
    Search,
    Star,
    Trash2,
    Upload,
    Loader2,
    X
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { createCategoryApi, fetchCategoriesApi, updateCategoryApi } from "./api/categories";
import { createProductApi, deleteProductApi, fetchProductsApi, updateProductApi } from "./api/products";
import { type CustomerQuery, fetchQueriesApi } from "./api/queries";
import { uploadImage } from "./api/upload";
import "./App.css";
import { useLanguage } from "./context/LanguageContext";

// ── Types & Data ─────────────────────────────────────────────────────────────


export interface Category {
  id: number | string;
  name: string;
  nameEng?: string;
  nameTam?: string | null;
  slug: string;
  description?: string;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  imageUrl?: string;
  count: number;
  sort: number;
  status: "Active" | "Inactive";
}

export interface Product {
  id: number | string;
  code: string;
  name: string;
  nameEng?: string;
  nameTam?: string | null;
  category: string;
  categorySlug?: string;
  description?: string;
  descriptionEng?: string | null;
  descriptionTam?: string | null;
  content?: string;
  contentEng?: string | null;
  contentTam?: string | null;
  actualPrice: number;
  sellingPrice: number;
  discount?: number;
  stock: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  imageUrl?: string | null;
  status: "Active" | "Inactive";
  featured: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, code: "GAR-1000-01", name: "1000 Wala Garland", category: "Fancy Crackers", actualPrice: 550, sellingPrice: 299, stock: 0, status: "Active", featured: false },
  { id: 2, code: "RKT-FLR-05", name: "Anil Flower Rocket", category: "Rockets", actualPrice: 210, sellingPrice: 180, stock: 45, status: "Active", featured: false },
  { id: 3, code: "FLP-ASH-08", name: "Ashoka Flower Pot", category: "Flower Pots", actualPrice: 750, sellingPrice: 670, stock: 3, status: "Active", featured: false },
  { id: 4, code: "GAR-DEL-10", name: "Deluxe Garland", category: "Fancy Crackers", actualPrice: 680, sellingPrice: 599, stock: 12, status: "Active", featured: false },
  { id: 5, code: "GCK-DEL-10", name: "Deluxe Ground Chakkar", category: "Ground Chakkars", actualPrice: 180, sellingPrice: 155, stock: 5, status: "Active", featured: false },
  { id: 6, code: "COM-DIW-24", name: "Diwali Celebration Combo", category: "Combo Packs", actualPrice: 2450, sellingPrice: 2155, stock: 20, status: "Active", featured: true },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: "Combo Packs", slug: "combo-packs", count: 1, sort: 1, status: "Active" },
  { id: 2, name: "Sparklers", slug: "sparklers", count: 2, sort: 2, status: "Active" },
  { id: 3, name: "Flower Pots", slug: "flower-pots", count: 2, sort: 3, status: "Active" },
  { id: 4, name: "Ground Chakkars", slug: "ground-chakkars", count: 1, sort: 4, status: "Active" },
  { id: 5, name: "Rockets", slug: "rockets", count: 2, sort: 5, status: "Active" },
  { id: 6, name: "Kids Special", slug: "kids-special", count: 1, sort: 6, status: "Active" },
];



// ── Admin Session & Route Storage ───────────────────────────────────────────
const ADMIN_AUTH_KEY = "santhi_admin_session_auth";
const ADMIN_LAST_ROUTE_KEY = "santhi_admin_last_route";

// Standard session: 4 hours (14,400,000 ms). Extended ("Remember me"): 24 hours (86,400,000 ms).
const DEFAULT_SESSION_DURATION = 4 * 60 * 60 * 1000;
const REMEMBER_SESSION_DURATION = 24 * 60 * 60 * 1000;

interface AdminSessionData {
  token: string;
  email: string;
  loginAt: number;
  expiresAt: number;
  rememberMe: boolean;
}

const getStoredSession = (): AdminSessionData | null => {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!raw) return null;
    const data: AdminSessionData = JSON.parse(raw);
    if (!data || !data.expiresAt) return null;
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const formatRemainingTime = (minutes: number): string => {
  if (minutes <= 0) return "Expiring soon";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const getInitialRoute = (isAuth: boolean): string => {
  if (!isAuth) return "/admin/login";

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const validAdminRoutes = ["/admin", "/admin/products", "/admin/categories", "/admin/queries"];

  if (validAdminRoutes.includes(pathname)) {
    return pathname;
  }

  try {
    const saved = localStorage.getItem(ADMIN_LAST_ROUTE_KEY);
    if (saved && validAdminRoutes.includes(saved)) {
      return saved;
    }
  } catch {}

  return "/admin";
};

// ── Main App Component ───────────────────────────────────────────────────────
export default function App() {
  const { language, toggleLanguage, t, tProduct, tCategory, isTamil } = useLanguage();
  
  // Session & Authentication State
  const initialSession = getStoredSession();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(initialSession));
  const [sessionData, setSessionData] = useState<AdminSessionData | null>(initialSession);
  const [sessionRemainingMinutes, setSessionRemainingMinutes] = useState<number>(() => {
    if (!initialSession) return 0;
    return Math.max(0, Math.round((initialSession.expiresAt - Date.now()) / (60 * 1000)));
  });
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState<string | null>(null);

  // Form & Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => getInitialRoute(Boolean(initialSession)));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@deepakart.com");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);



  // Products State
  const [productsList, setProductsList] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productStatusFilter, setProductStatusFilter] = useState("All");
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Product Modals State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodNameEng, setProdNameEng] = useState("");
  const [prodNameTam, setProdNameTam] = useState("");
  const [prodCode, setProdCode] = useState("");
  const [prodCategory, setProdCategory] = useState("Rockets");
  const [prodCategorySlug, setProdCategorySlug] = useState("rockets");
  const [prodDescription, setProdDescription] = useState("");
  const [prodDescEng, setProdDescEng] = useState("");
  const [prodDescTam, setProdDescTam] = useState("");
  const [prodContent, setProdContent] = useState("Pack of 5");
  const [prodContentEng, setProdContentEng] = useState("Pack of 5");
  const [prodContentTam, setProdContentTam] = useState("");
  const [prodLangTab, setProdLangTab] = useState<"en" | "ta">("en");
  const [prodActualPrice, setProdActualPrice] = useState<number>(500);
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(425);
  const [prodDiscount, setProdDiscount] = useState<number>(15);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodMinOrderQty, setProdMinOrderQty] = useState<number>(1);
  const [prodMaxOrderQty, setProdMaxOrderQty] = useState<number>(5);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodStatus, setProdStatus] = useState<"Active" | "Inactive">("Active");
  const [isUploadingProdImg, setIsUploadingProdImg] = useState(false);
  const [uploadProdImgError, setUploadProdImgError] = useState<string | null>(null);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingProdImg(true);
    setUploadProdImgError(null);
    try {
      const url = await uploadImage(file, "santhi-crackers/products");
      setProdImageUrl(url);
    } catch (err: any) {
      setUploadProdImgError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingProdImg(false);
      e.target.value = "";
    }
  };
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodIsSubmitting, setProdIsSubmitting] = useState(false);
  const [prodError, setProdError] = useState<string | null>(null);
  const [prodNotification, setProdNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Load real products from API
  const loadProductsFromApi = async () => {
    setIsProductsLoading(true);
    try {
      const data = await fetchProductsApi();
      if (data && data.length > 0) {
        const mapped: Product[] = data.map((p) => {
          const cat = categoriesList.find(c => c.slug === p.categorySlug);
          const nameEng = p.nameEng || p.name;
          const descEng = p.descriptionEng || p.description || "";
          const contentEng = p.contentEng || p.content || "";
          return {
            id: p.id,
            code: p.code,
            name: nameEng,
            nameEng,
            nameTam: p.nameTam || null,
            category: cat ? (cat.nameEng || cat.name) : (p.categorySlug || "Crackers"),
            categorySlug: p.categorySlug,
            description: descEng,
            descriptionEng: descEng,
            descriptionTam: p.descriptionTam || null,
            content: contentEng,
            contentEng: contentEng,
            contentTam: p.contentTam || null,
            actualPrice: Number(p.actualPrice) || 0,
            sellingPrice: Number(p.price) || 0,
            discount: Number(p.discount) || 0,
            stock: Number(p.stock) || 0,
            minOrderQty: p.minOrderQty ?? 1,
            maxOrderQty: p.maxOrderQty ?? 10,
            imageUrl: p.imageUrl || "",
            status: p.isActive === false ? "Inactive" : "Active",
            featured: Boolean(p.isFeatured),
          };
        });
        setProductsList(mapped);
      }
    } catch (err) {
      console.warn("Could not load products from API:", err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleCategorySelectChange = (slugOrName: string) => {
    const matched = categoriesList.find(c => c.slug === slugOrName || c.name === slugOrName);
    if (matched) {
      setProdCategory(matched.name);
      setProdCategorySlug(matched.slug);
    } else {
      setProdCategory(slugOrName);
      setProdCategorySlug(slugOrName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleActualPriceChange = (val: number) => {
    setProdActualPrice(val);
    if (val > 0 && prodSellingPrice > 0) {
      setProdDiscount(Math.max(0, Math.round(((val - prodSellingPrice) / val) * 100)));
    }
  };

  const handleSellingPriceChange = (val: number) => {
    setProdSellingPrice(val);
    if (prodActualPrice > 0 && val > 0) {
      setProdDiscount(Math.max(0, Math.round(((prodActualPrice - val) / prodActualPrice) * 100)));
    }
  };

  const handleDiscountChange = (val: number) => {
    setProdDiscount(val);
    if (prodActualPrice > 0 && val >= 0) {
      setProdSellingPrice(Math.round(prodActualPrice * (1 - val / 100)));
    }
  };

  const handleOpenAddProduct = () => {
    setProdName("");
    setProdNameEng("");
    setProdNameTam("");
    setProdCode("");
    const defaultCat = categoriesList.find(c => c.slug === "rockets") || categoriesList[0];
    setProdCategory(defaultCat?.name || "Rockets");
    setProdCategorySlug(defaultCat?.slug || "rockets");
    setProdDescription("");
    setProdDescEng("");
    setProdDescTam("");
    setProdContent("Pack of 5");
    setProdContentEng("Pack of 5");
    setProdContentTam("");
    setProdActualPrice(500);
    setProdSellingPrice(425);
    setProdDiscount(15);
    setProdStock(20);
    setProdMinOrderQty(1);
    setProdMaxOrderQty(5);
    setProdImageUrl("");
    setProdStatus("Active");
    setProdIsFeatured(true);
    setProdError(null);
    setProdLangTab("en");
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    const nEng = prod.nameEng || prod.name || "";
    setProdName(nEng);
    setProdNameEng(nEng);
    setProdNameTam(prod.nameTam || "");
    setProdCode(prod.code);
    setProdCategory(prod.category);
    setProdCategorySlug(prod.categorySlug || "");
    const dEng = prod.descriptionEng || prod.description || "";
    setProdDescription(dEng);
    setProdDescEng(dEng);
    setProdDescTam(prod.descriptionTam || "");
    const cEng = prod.contentEng || prod.content || "";
    setProdContent(cEng);
    setProdContentEng(cEng);
    setProdContentTam(prod.contentTam || "");
    setProdActualPrice(prod.actualPrice);
    setProdSellingPrice(prod.sellingPrice);
    setProdDiscount(prod.discount || 0);
    setProdStock(prod.stock);
    setProdMinOrderQty(prod.minOrderQty || 1);
    setProdMaxOrderQty(prod.maxOrderQty || 10);
    setProdImageUrl(prod.imageUrl || "");
    setProdStatus(prod.status);
    setProdIsFeatured(prod.featured);
    setProdError(null);
    setProdLangTab("en");
  };

  const handleSaveAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    const finalNameEng = prodNameEng.trim() || prodName.trim();
    const finalNameTam = prodNameTam.trim();

    if (!finalNameEng || !prodCode.trim()) {
      setProdError("English Product Name and Product Code are required.");
      return;
    }

    setProdIsSubmitting(true);
    setProdError(null);

    const targetCat = categoriesList.find(c => c.slug === prodCategorySlug || c.name === prodCategory);
    const resolvedCatSlug = targetCat?.slug || prodCategorySlug || "rockets";

    const finalDescEng = prodDescEng.trim() || prodDescription.trim();
    const finalDescTam = prodDescTam.trim();
    const finalContentEng = prodContentEng.trim() || prodContent.trim();
    const finalContentTam = prodContentTam.trim();

    try {
      const res = await createProductApi({
        code: prodCode.trim().toUpperCase(),
        name: finalNameEng,
        nameEng: finalNameEng,
        nameTam: finalNameTam || null,
        description: finalDescEng,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam || null,
        content: finalContentEng,
        contentEng: finalContentEng,
        contentTam: finalContentTam || null,
        actualPrice: Number(prodActualPrice) || 0,
        price: Number(prodSellingPrice) || 0,
        discount: Number(prodDiscount) || 0,
        stock: Number(prodStock) || 0,
        minOrderQty: Number(prodMinOrderQty) || 1,
        maxOrderQty: Number(prodMaxOrderQty) || 5,
        imageUrl: prodImageUrl.trim() || null,
        categorySlug: resolvedCatSlug,
        isActive: prodStatus === "Active",
        isFeatured: prodIsFeatured,
      });

      const bp = res.product;
      const newProd: Product = {
        id: bp?.id || Date.now(),
        code: bp?.code || prodCode.trim().toUpperCase(),
        name: bp?.nameEng || bp?.name || finalNameEng,
        nameEng: bp?.nameEng || finalNameEng,
        nameTam: bp?.nameTam !== undefined ? bp.nameTam : (finalNameTam || null),
        category: targetCat?.name || prodCategory,
        categorySlug: bp?.categorySlug || resolvedCatSlug,
        description: bp?.descriptionEng || bp?.description || finalDescEng,
        descriptionEng: bp?.descriptionEng || finalDescEng,
        descriptionTam: bp?.descriptionTam !== undefined ? bp.descriptionTam : (finalDescTam || null),
        content: bp?.contentEng || bp?.content || finalContentEng,
        contentEng: bp?.contentEng || finalContentEng,
        contentTam: bp?.contentTam !== undefined ? bp.contentTam : (finalContentTam || null),
        actualPrice: Number(bp?.actualPrice ?? prodActualPrice),
        sellingPrice: Number(bp?.price ?? prodSellingPrice),
        discount: Number(bp?.discount ?? prodDiscount),
        stock: Number(bp?.stock ?? prodStock),
        minOrderQty: bp?.minOrderQty ?? Number(prodMinOrderQty),
        maxOrderQty: bp?.maxOrderQty ?? Number(prodMaxOrderQty),
        imageUrl: bp?.imageUrl || prodImageUrl.trim() || "",
        status: bp?.isActive === false ? "Inactive" : "Active",
        featured: Boolean(bp?.isFeatured ?? prodIsFeatured),
      };

      setProductsList(prev => [newProd, ...prev]);
      setProdNotification({
        type: "success",
        message: `Product "${newProd.name}" (${newProd.code}) created successfully with bilingual support!`,
      });
      setTimeout(() => setProdNotification(null), 4500);
      setIsAddProductOpen(false);

      // Refresh categories to update productCount
      loadCategoriesFromApi();
    } catch (err: any) {
      console.error("Failed to create product:", err);
      setProdError(err?.message || "Failed to create product on API.");
    } finally {
      setProdIsSubmitting(false);
    }
  };

  const handleSaveEditProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const finalNameEng = prodNameEng.trim() || prodName.trim();
    const finalNameTam = prodNameTam.trim();

    if (!finalNameEng || !prodCode.trim()) {
      setProdError("English Product Name and Product Code are required.");
      return;
    }

    setProdIsSubmitting(true);
    setProdError(null);

    const targetCat = categoriesList.find(c => c.slug === prodCategorySlug || c.name === prodCategory);
    const resolvedCatSlug = targetCat?.slug || prodCategorySlug || undefined;

    const finalDescEng = prodDescEng.trim() || prodDescription.trim();
    const finalDescTam = prodDescTam.trim();
    const finalContentEng = prodContentEng.trim() || prodContent.trim();
    const finalContentTam = prodContentTam.trim();

    try {
      const res = await updateProductApi(editingProduct.id, {
        code: prodCode.trim().toUpperCase(),
        name: finalNameEng,
        nameEng: finalNameEng,
        nameTam: finalNameTam || null,
        description: finalDescEng,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam || null,
        content: finalContentEng,
        contentEng: finalContentEng,
        contentTam: finalContentTam || null,
        actualPrice: Number(prodActualPrice) || 0,
        price: Number(prodSellingPrice) || 0,
        discount: Number(prodDiscount) || 0,
        stock: Number(prodStock) || 0,
        minOrderQty: Number(prodMinOrderQty) || 1,
        maxOrderQty: Number(prodMaxOrderQty) || 10,
        imageUrl: prodImageUrl.trim() || null,
        categorySlug: resolvedCatSlug,
        isActive: prodStatus === "Active",
        isFeatured: prodIsFeatured,
      });

      const bp = res.product;
      const updatedProduct: Product = {
        ...editingProduct,
        id: bp?.id || editingProduct.id,
        code: bp?.code || prodCode.trim().toUpperCase(),
        name: bp?.nameEng || bp?.name || finalNameEng,
        nameEng: bp?.nameEng || finalNameEng,
        nameTam: bp?.nameTam !== undefined ? bp.nameTam : (finalNameTam || null),
        category: targetCat?.name || prodCategory,
        categorySlug: bp?.categorySlug || resolvedCatSlug || prodCategorySlug,
        description: bp?.descriptionEng || bp?.description || finalDescEng,
        descriptionEng: bp?.descriptionEng || finalDescEng,
        descriptionTam: bp?.descriptionTam !== undefined ? bp.descriptionTam : (finalDescTam || null),
        content: bp?.contentEng || bp?.content || finalContentEng,
        contentEng: bp?.contentEng || finalContentEng,
        contentTam: bp?.contentTam !== undefined ? bp.contentTam : (finalContentTam || null),
        actualPrice: Number(bp?.actualPrice ?? prodActualPrice),
        sellingPrice: Number(bp?.price ?? prodSellingPrice),
        discount: Number(bp?.discount ?? prodDiscount),
        stock: Number(bp?.stock ?? prodStock),
        minOrderQty: bp?.minOrderQty ?? Number(prodMinOrderQty),
        maxOrderQty: bp?.maxOrderQty ?? Number(prodMaxOrderQty),
        imageUrl: bp?.imageUrl || prodImageUrl.trim() || null,
        status: bp?.isActive === false ? "Inactive" : "Active",
        featured: Boolean(bp?.isFeatured ?? prodIsFeatured),
      };

      setProductsList(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      setProdNotification({
        type: "success",
        message: `Product "${updatedProduct.name}" (${updatedProduct.code}) updated successfully with bilingual content!`,
      });
      setTimeout(() => setProdNotification(null), 4500);
      setEditingProduct(null);

      // Refresh categories to update productCount
      loadCategoriesFromApi();
    } catch (err: any) {
      console.error("Failed to update product:", err);
      setProdError(err?.message || "Failed to update product on API.");
    } finally {
      setProdIsSubmitting(false);
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setProdIsSubmitting(true);
    try {
      await deleteProductApi(deletingProduct.id);
      setProductsList(prev => prev.filter(p => p.id !== deletingProduct.id));
      setProdNotification({
        type: "success",
        message: `Product "${deletingProduct.name}" deleted successfully!`,
      });
      setTimeout(() => setProdNotification(null), 4500);
      setDeletingProduct(null);

      // Refresh categories to update productCount
      loadCategoriesFromApi();
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setProdNotification({
        type: "error",
        message: err?.message || "Failed to delete product on API.",
      });
      setTimeout(() => setProdNotification(null), 4500);
    } finally {
      setProdIsSubmitting(false);
    }
  };

  const handleToggleProductStatus = async (id: number | string) => {
    const targetProduct = productsList.find(p => p.id === id);
    if (!targetProduct) return;
    const newStatus: "Active" | "Inactive" = targetProduct.status === "Active" ? "Inactive" : "Active";
    const newIsActive = newStatus === "Active";

    // Optimistically update
    setProductsList(prev => prev.map(p => p.id === id ? {
      ...p,
      status: newStatus
    } : p));

    try {
      await updateProductApi(id, { isActive: newIsActive });
    } catch (err: any) {
      console.error("Failed to toggle product status on API:", err);
      // Revert if error
      setProductsList(prev => prev.map(p => p.id === id ? {
        ...p,
        status: targetProduct.status
      } : p));
      setProdNotification({
        type: "error",
        message: err?.message || "Failed to update status on server.",
      });
      setTimeout(() => setProdNotification(null), 4500);
    }
  };

  const filteredProducts = productsList.filter(p => {
    const q = productSearch.trim().toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchesCategory = productCategoryFilter === "All" || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const matchesStatus = productStatusFilter === "All" || p.status === productStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productCurrentPage - 1) * productsPerPage,
    productCurrentPage * productsPerPage
  );

  // Categories State
  const [categoriesList, setCategoriesList] = useState<Category[]>(INITIAL_CATEGORIES);
  const [categorySearch, setCategorySearch] = useState("");
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form State
  const [catName, setCatName] = useState("");
  const [catNameEng, setCatNameEng] = useState("");
  const [catNameTam, setCatNameTam] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catDescEng, setCatDescEng] = useState("");
  const [catDescTam, setCatDescTam] = useState("");
  const [catLangTab, setCatLangTab] = useState<"en" | "ta">("en");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catSort, setCatSort] = useState<number>(1);
  const [isUploadingCatImg, setIsUploadingCatImg] = useState(false);
  const [uploadCatImgError, setUploadCatImgError] = useState<string | null>(null);

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCatImg(true);
    setUploadCatImgError(null);
    try {
      const url = await uploadImage(file, "santhi-crackers/categories");
      setCatImageUrl(url);
    } catch (err: any) {
      setUploadCatImgError(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingCatImg(false);
      e.target.value = "";
    }
  };
  const [catStatus, setCatStatus] = useState<"Active" | "Inactive">("Active");
  const [catIsSubmitting, setCatIsSubmitting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [catNotification, setCatNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load real categories from API on mount
  const loadCategoriesFromApi = async () => {
    setIsCategoriesLoading(true);
    try {
      const data = await fetchCategoriesApi();
      if (data && data.length > 0) {
        const mapped: Category[] = data.map((c, idx) => {
          const nameEng = c.nameEng || c.name;
          const descEng = c.descriptionEng || c.description || "";
          return {
            id: c.id,
            name: nameEng,
            nameEng,
            nameTam: c.nameTam || null,
            slug: c.slug,
            description: descEng,
            descriptionEng: descEng,
            descriptionTam: c.descriptionTam || null,
            imageUrl: c.imageUrl || "",
            count: typeof c.productCount === "number" ? c.productCount : 0,
            sort: c.sortOrder ?? idx + 1,
            status: c.isActive === false ? "Inactive" : "Active",
          };
        });
        setCategoriesList(mapped);
      }
    } catch (err) {
      console.warn("Could not load categories from API:", err);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  // Customer Queries State
  const [queriesList, setQueriesList] = useState<CustomerQuery[]>([]);
  const [queriesSearch, setQueriesSearch] = useState("");
  const [isQueriesLoading, setIsQueriesLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<CustomerQuery | null>(null);
  const [queriesCurrentPage, setQueriesCurrentPage] = useState(1);
  const queriesPerPage = 10;

  const loadQueriesFromApi = async () => {
    setIsQueriesLoading(true);
    try {
      const data = await fetchQueriesApi();
      if (data && Array.isArray(data.queries)) {
        setQueriesList(data.queries);
      }
    } catch (err) {
      console.warn("Could not load queries from API:", err);
    } finally {
      setIsQueriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesFromApi();
    loadProductsFromApi();
    loadQueriesFromApi();
  }, []);

  // Handle Browser Back / Forward Button and Route Sync
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const activeSession = getStoredSession();
      if (!activeSession) {
        setIsAuthenticated(false);
        setSessionData(null);
        setSessionRemainingMinutes(0);
        setCurrentRoute("/admin/login");
        return;
      }

      const targetPath = e.state?.path || (typeof window !== "undefined" ? window.location.pathname : "") || "/admin";
      if (targetPath === "/admin/login") {
        setCurrentRoute("/admin");
        try {
          window.history.replaceState({ path: "/admin" }, "", "/admin");
        } catch {}
      } else {
        setCurrentRoute(targetPath);
        try {
          localStorage.setItem(ADMIN_LAST_ROUTE_KEY, targetPath);
        } catch {}
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync initial URL on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && currentRoute !== "/admin/login") {
      try {
        if (window.location.pathname !== currentRoute) {
          window.history.replaceState({ path: currentRoute }, "", currentRoute);
        }
      } catch {}
    }
  }, []);

  // Session Expiration Monitoring & Activity Refresher
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const activeSession = getStoredSession();
      if (!activeSession) {
        setIsAuthenticated(false);
        setSessionData(null);
        setSessionRemainingMinutes(0);
        setSessionExpiredMsg("Your session has timed out. Please sign in again.");
        setCurrentRoute("/admin/login");
        try {
          window.history.replaceState({ path: "/admin/login" }, "", "/admin/login");
        } catch {}
      } else {
        const remainingMs = activeSession.expiresAt - Date.now();
        const mins = Math.max(0, Math.round(remainingMs / (60 * 1000)));
        setSessionRemainingMinutes(mins);
      }
    };

    checkSession();
    const intervalId = setInterval(checkSession, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isAuthenticated]);

  const filteredQueries = queriesList.filter((q) => {
    const term = queriesSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      q.mobileNumber.toLowerCase().includes(term) ||
      q.message.toLowerCase().includes(term) ||
      (q.status && q.status.toLowerCase().includes(term))
    );
  });

  const totalQueryPages = Math.ceil(filteredQueries.length / queriesPerPage) || 1;
  const paginatedQueries = filteredQueries.slice(
    (queriesCurrentPage - 1) * queriesPerPage,
    queriesCurrentPage * queriesPerPage
  );

  const handleOpenAddCategory = () => {
    setCatName("");
    setCatNameEng("");
    setCatNameTam("");
    setCatSlug("");
    setCatDesc("");
    setCatDescEng("");
    setCatDescTam("");
    setCatLangTab("en");
    setCatImageUrl("");
    setCatSort(categoriesList.length + 1);
    setCatStatus("Active");
    setCatError(null);
    setIsAddCategoryOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    const nEng = cat.nameEng || cat.name || "";
    setCatName(nEng);
    setCatNameEng(nEng);
    setCatNameTam(cat.nameTam || "");
    setCatSlug(cat.slug);
    const dEng = cat.descriptionEng || cat.description || "";
    setCatDesc(dEng);
    setCatDescEng(dEng);
    setCatDescTam(cat.descriptionTam || "");
    setCatLangTab("en");
    setCatImageUrl(cat.imageUrl || "");
    setCatSort(cat.sort);
    setCatStatus(cat.status);
    setCatError(null);
  };

  const handleCategoryNameChange = (val: string) => {
    setCatName(val);
    setCatNameEng(val);
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setCatSlug(autoSlug);
  };

  const handleSaveAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    const finalNameEng = catNameEng.trim() || catName.trim();
    const finalNameTam = catNameTam.trim();

    if (!finalNameEng) {
      setCatError("English Category Name is required.");
      return;
    }

    setCatIsSubmitting(true);
    setCatError(null);

    const cleanSlug = catSlug.trim().replace(/^\//, '') || finalNameEng.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sortNumber = Number(catSort) || categoriesList.length + 1;
    const isActive = catStatus === "Active";

    const finalDescEng = catDescEng.trim() || catDesc.trim();
    const finalDescTam = catDescTam.trim();

    try {
      // POST to backend localhost:3007/api/categories
      const response = await createCategoryApi({
        name: finalNameEng,
        nameEng: finalNameEng,
        nameTam: finalNameTam || null,
        slug: cleanSlug,
        description: finalDescEng,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam || null,
        imageUrl: catImageUrl.trim() || undefined,
        sortOrder: sortNumber,
        isActive,
      });

      const backendCat = response.category;
      const newCat: Category = {
        id: backendCat?.id || Date.now(),
        name: backendCat?.nameEng || backendCat?.name || finalNameEng,
        nameEng: backendCat?.nameEng || finalNameEng,
        nameTam: backendCat?.nameTam !== undefined ? backendCat.nameTam : (finalNameTam || null),
        slug: backendCat?.slug || cleanSlug,
        description: backendCat?.descriptionEng || backendCat?.description || finalDescEng,
        descriptionEng: backendCat?.descriptionEng || finalDescEng,
        descriptionTam: backendCat?.descriptionTam !== undefined ? backendCat.descriptionTam : (finalDescTam || null),
        imageUrl: backendCat?.imageUrl || catImageUrl.trim(),
        sort: backendCat?.sortOrder ?? sortNumber,
        status: backendCat?.isActive === false ? "Inactive" : "Active",
        count: backendCat?.productCount || 0,
      };

      setCategoriesList(prev => [...prev, newCat]);
      setCatNotification({
        type: "success",
        message: `Category "${newCat.name}" successfully created with bilingual support!`,
      });
      setTimeout(() => setCatNotification(null), 4500);
      setIsAddCategoryOpen(false);
    } catch (err: any) {
      console.error("Failed to create category on backend:", err);
      setCatError(err?.message || "Failed to create category on API.");
    } finally {
      setCatIsSubmitting(false);
    }
  };

  const handleSaveEditCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const finalNameEng = catNameEng.trim() || catName.trim();
    const finalNameTam = catNameTam.trim();

    if (!finalNameEng) {
      setCatError("Category Name is required.");
      return;
    }

    setCatIsSubmitting(true);
    setCatError(null);

    const cleanSlug = catSlug.trim().replace(/^\//, '') || finalNameEng.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sortNumber = Number(catSort) || editingCategory.sort;
    const isActive = catStatus === "Active";

    const finalDescEng = catDescEng.trim() || catDesc.trim();
    const finalDescTam = catDescTam.trim();

    try {
      const response = await updateCategoryApi(editingCategory.id, {
        name: finalNameEng,
        nameEng: finalNameEng,
        nameTam: finalNameTam || null,
        slug: cleanSlug,
        description: finalDescEng,
        descriptionEng: finalDescEng,
        descriptionTam: finalDescTam || null,
        imageUrl: catImageUrl.trim() || undefined,
        sortOrder: sortNumber,
        isActive,
      });

      const backendCat = response.category;
      const updatedCat: Category = {
        ...editingCategory,
        name: backendCat?.nameEng || backendCat?.name || finalNameEng,
        nameEng: backendCat?.nameEng || finalNameEng,
        nameTam: backendCat?.nameTam !== undefined ? backendCat.nameTam : (finalNameTam || null),
        slug: backendCat?.slug || cleanSlug,
        description: backendCat?.descriptionEng || backendCat?.description || finalDescEng,
        descriptionEng: backendCat?.descriptionEng || finalDescEng,
        descriptionTam: backendCat?.descriptionTam !== undefined ? backendCat.descriptionTam : (finalDescTam || null),
        imageUrl: backendCat?.imageUrl || catImageUrl.trim(),
        sort: backendCat?.sortOrder ?? sortNumber,
        status: backendCat?.isActive === false ? "Inactive" : "Active",
      };

      setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? updatedCat : c));
      setCatNotification({
        type: "success",
        message: `Category "${updatedCat.name}" updated successfully!`,
      });
      setTimeout(() => setCatNotification(null), 4500);
      setEditingCategory(null);
    } catch (err: any) {
      console.error("Failed to update category on backend:", err);
      setCatError(err?.message || "Failed to update category on API.");
    } finally {
      setCatIsSubmitting(false);
    }
  };

  const handleConfirmDeleteCategory = () => {
    if (!deletingCategory) return;
    setCategoriesList(prev => prev.filter(c => c.id !== deletingCategory.id));
    setDeletingCategory(null);
  };

  const handleToggleCategoryStatus = (id: number | string) => {
    setCategoriesList(prev => prev.map(c => c.id === id ? {
      ...c,
      status: c.status === "Active" ? "Inactive" : "Active"
    } : c));
  };

  const handleMoveCategorySort = (id: number | string, direction: "up" | "down") => {
    setCategoriesList(prev => {
      // Create new shallow copies of objects sorted by current sort order
      const list = prev.map(item => ({ ...item })).sort((a, b) => a.sort - b.sort);

      // Find current index in sorted list
      const index = list.findIndex(c => c.id === id);
      if (index < 0) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      // Swap elements cleanly in the array
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      // Re-assign 1-based sequential sort numbers to new copies
      list.forEach((item, i) => {
        item.sort = i + 1;
      });

      return list;
    });
  };

  const handleDirectSortChange = (id: number | string, newSort: number) => {
    const val = Math.max(1, Math.floor(newSort) || 1);
    setCategoriesList(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, sort: val } : { ...c });
      return updated.sort((a, b) => a.sort - b.sort);
    });
  };

  const filteredCategories = categoriesList
    .filter(c => {
      const q = categorySearch.toLowerCase().trim();
      return !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    })
    .sort((a, b) => a.sort - b.sort);




  const navigate = (path: string, replace = false) => {
    setCurrentRoute(path);
    setSidebarOpen(false);
    if (path !== "/admin/login") {
      try {
        localStorage.setItem(ADMIN_LAST_ROUTE_KEY, path);
      } catch {}
    }
    try {
      if (replace) {
        window.history.replaceState({ path }, "", path);
      } else if (window.location.pathname !== path) {
        window.history.pushState({ path }, "", path);
      }
    } catch (e) {
      console.warn("History navigation error:", e);
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const duration = rememberMe ? REMEMBER_SESSION_DURATION : DEFAULT_SESSION_DURATION;
    const now = Date.now();
    const newSession: AdminSessionData = {
      token: "admin-" + Math.random().toString(36).substring(2) + "-" + now,
      email: loginEmail || "admin@deepakart.com",
      loginAt: now,
      expiresAt: now + duration,
      rememberMe,
    };

    try {
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(newSession));
    } catch (err) {
      console.warn("Could not save session to localStorage:", err);
    }

    setSessionData(newSession);
    setIsAuthenticated(true);
    setSessionExpiredMsg(null);
    setSessionRemainingMinutes(Math.round(duration / (60 * 1000)));

    const nextRoute = getInitialRoute(true);
    navigate(nextRoute === "/admin/login" ? "/admin" : nextRoute, true);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
      localStorage.removeItem(ADMIN_LAST_ROUTE_KEY);
    } catch {}
    setIsAuthenticated(false);
    setSessionData(null);
    setSessionExpiredMsg(null);
    setSessionRemainingMinutes(0);
    navigate("/admin/login", true);
  };

  // ── Route: Login ─────────────────────────────────────────────────────────────
  if (!isAuthenticated || currentRoute === "/admin/login") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F4] p-4 sm:p-6 text-black font-manrope">
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-8 shadow-xl">
          <div className="text-center mb-6 sm:mb-8">
            <img src="/logo-santhi.png" alt="Shanthi Sivakasi Crackers Logo" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 object-contain drop-shadow-md rounded-2xl" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-1 sm:mb-2 tracking-tight">Shanthi Sivakasi Crackers</h1>
            <p className="text-base sm:text-lg text-black font-semibold">Manage your store.</p>
          </div>

          {sessionExpiredMsg && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
              <Clock size={18} className="shrink-0 text-amber-600" />
              <span>{sessionExpiredMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-bold text-black mb-1.5 sm:mb-2">Email address</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-base font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-bold text-black mb-1.5 sm:mb-2">Password</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-3.5 sm:pl-4 pr-11 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-base font-medium" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-gray-500 hover:text-black cursor-pointer rounded-lg transition-colors flex items-center justify-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#0000FF] border-gray-300 rounded focus:ring-[#0000FF] cursor-pointer" 
              />
              <label htmlFor="remember" className="ml-2.5 sm:ml-3 block text-sm sm:text-base font-semibold text-black cursor-pointer">
                Remember me
              </label>
            </div>
            <button type="submit" className="w-full py-3.5 sm:py-4 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-md transition-colors cursor-pointer">
              Log in
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Layout Components ────────────────────────────────────────────────────────
  const NavItem = ({ icon: Icon, label, path, badge }: { icon: any, label: string, path: string, badge?: number }) => {
    const isActive = currentRoute === path || (path !== "/admin" && currentRoute.startsWith(path));
    return (
      <button 
        onClick={() => navigate(path)}
        className={`w-full flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 mb-1.5 sm:mb-2 rounded-xl transition-all text-base sm:text-lg cursor-pointer ${
          isActive 
            ? "bg-[#0000FF] text-white font-bold border-l-4 border-yellow-400 shadow-xs" 
            : "text-black font-semibold hover:bg-gray-100 border-l-4 border-transparent"
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Icon size={22} className={`shrink-0 ${isActive ? "text-white" : "text-black"}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full shrink-0 ml-2 ${isActive ? "bg-white text-[#0000FF]" : "bg-gray-200 text-black"}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-white border-r border-gray-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo-santhi.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl shadow-2xs shrink-0" />
          <div className="min-w-0">
            <h2 className="font-extrabold text-base sm:text-lg text-black leading-tight truncate">Shanthi Sivakasi</h2>
            <p className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider">ADMIN PANEL</p>
          </div>
        </div>
        <button 
          className="lg:hidden p-2 text-black hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>
      </div>
      
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto admin-scroll">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Workspace</p>
        <nav className="space-y-0.5">
          <NavItem icon={LayoutDashboard} label={t("Dashboard")} path="/admin" />
          <NavItem icon={Package} label={t("Products")} path="/admin/products" />
          <NavItem icon={ListTree} label={t("Categories")} path="/admin/categories" />
          <NavItem icon={MessageSquare} label={t("Queries")} path="/admin/queries" badge={queriesList.length > 0 ? queriesList.length : undefined} />
        </nav>
      </div>

      <div className="p-4 sm:p-6 border-t border-gray-100 bg-white shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 text-red-600 font-bold text-base sm:text-lg hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
          <LogOut size={22} className="shrink-0" />
          <span>{t("Log out")}</span>
        </button>
      </div>
    </aside>
  );

  const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-2xs gap-2 min-w-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button 
          className="lg:hidden p-2 -ml-1 text-black hover:bg-slate-100 rounded-xl cursor-pointer shrink-0 transition-colors" 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img src="/logo-santhi.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg lg:hidden shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold text-black leading-tight truncate">{t(title)}</h1>
            {subtitle && <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate hidden xs:block">{t(subtitle)}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Session Timer Badge */}
        {sessionRemainingMinutes > 0 && (
          <div 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-50/90 border border-blue-200/80 rounded-xl text-blue-700 text-xs font-bold shrink-0 shadow-2xs"
            title={`Security timeout: automatic logout in ${formatRemainingTime(sessionRemainingMinutes)}`}
          >
            <Clock size={13} className="text-blue-600 shrink-0" />
            <span className="hidden xs:inline">{t("Session") || "Session"}:</span>
            <span className="font-mono">{formatRemainingTime(sessionRemainingMinutes)}</span>
          </div>
        )}
        {/* Language switch button */}
        <button
          type="button"
          onClick={toggleLanguage}
          id="admin-header-lang-btn"
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
          title={language === "en" ? "தமிழில் மாற்றவும்" : "Switch to English"}
        >
          <span className="text-sm">🌐</span>
          <span className="hidden sm:inline">{language === "ta" ? "தமிழ்" : "English"}</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {language === "ta" ? "TA" : "EN"}
          </span>
        </button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shrink-0">
          <img src="/logo-santhi.png" alt="Logo" className="w-5 h-5 object-contain" />
          <span className="text-xs font-bold text-black truncate max-w-[150px]">{sessionData?.email || t("Santhi Crackers Admin")}</span>
        </div>
      </div>
    </header>
  );

  // ── Views ────────────────────────────────────────────────────────────────────

  const renderDashboard = () => {
    const totalProductsCount = productsList.length;
    const activeProductsCount = productsList.filter(p => p.status === 'Active').length;
    const outOfStockCount = productsList.filter(p => p.stock === 0).length;

    return (
      <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Executive Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-[#0000FF] to-blue-900 text-white p-5 sm:p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl z-10 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
              <img src="/logo-santhi.png" alt="Logo" className="w-4 h-4 object-contain" />
              <span className="truncate">{t("Shanthi Sivakasi Crackers Panel")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">{t("Store Executive Overview")}</h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium leading-relaxed">
              {t("Real-time metrics, live inventory monitoring, and customer order management for Shanthi Sivakasi Crackers.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 z-10 w-full sm:w-auto">
            <button 
              onClick={() => navigate("/admin/products")} 
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#0000FF] hover:bg-blue-50 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package size={18} />
              <span>{t("Manage Catalog")}</span>
            </button>
          </div>
        </div>
        
        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {[
            { label: t("Total Products"), value: totalProductsCount.toString(), sub: t("In store catalog"), bg: "bg-white" },
            { label: t("Active Products"), value: activeProductsCount.toString(), sub: t("Visible to customers"), bg: "bg-white" },
            { label: t("Out of Stock"), value: outOfStockCount.toString(), sub: t("Products need restocking"), bg: "bg-red-50 border-red-200" }
          ].map((stat, i) => (
            <div key={i} className={`p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs ${stat.bg}`}>
              <p className="text-sm sm:text-base font-bold text-black mb-1 sm:mb-2">{stat.label}</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-black mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-600">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Low Stock Products */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-black">{t("Low stock products")}</h2>
              <button onClick={() => navigate("/admin/products")} className="text-[#0000FF] font-bold text-sm sm:text-base hover:underline cursor-pointer">{t("Manage →")}</button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {productsList.filter((p: Product) => p.stock < 10).length === 0 ? (
                <div className="p-4 text-center text-black font-semibold text-sm">
                  {t("All products are well stocked!")}
                </div>
              ) : (
                productsList.filter((p: Product) => p.stock < 10).slice(0, 5).map((p: Product) => (
                  <div 
                    key={p.id} 
                    onClick={() => { setProductSearch(p.name); navigate("/admin/products"); }}
                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer gap-3 min-w-0"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-black text-sm sm:text-base truncate">{tProduct(p.code, p.name)}</p>
                      {isTamil && tProduct(p.code, p.name) !== p.name && (
                        <p className="text-xs text-slate-500 font-normal truncate">{p.name}</p>
                      )}
                      <p className="text-xs font-mono text-gray-500">{p.code}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm sm:text-base text-black">{p.stock} pcs</p>
                      <span className={`text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full border ${p.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                        {p.stock === 0 ? t('Out of Stock') : t('Low Stock')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Product Notification Toast */}
      {prodNotification && (
        <div className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between text-sm font-bold animate-in fade-in duration-200 ${
          prodNotification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <div className="flex items-center gap-2">
            <span>{prodNotification.type === "success" ? "✓" : "⚠️"}</span>
            <span>{prodNotification.message}</span>
          </div>
          <button onClick={() => setProdNotification(null)} className="text-black hover:opacity-75 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Products Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-black leading-tight">{t("Product Catalog")}</h2>
              <p className="text-xs font-medium text-slate-500">{t("Manage items, prices, inventory, and promotions")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 shrink-0">
              {filteredProducts.length} {t("items")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setProductCurrentPage(1); }}
                placeholder={t("Search by name or code...")} 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {productSearch && (
                <button onClick={() => { setProductSearch(""); setProductCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dynamic Category Select */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[140px]">
              <select 
                value={productCategoryFilter}
                onChange={(e) => { setProductCategoryFilter(e.target.value); setProductCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer transition-all"
              >
                <option value="All">{t("All Categories")}</option>
                {categoriesList.map(c => (
                  <option key={c.id} value={c.name}>{tCategory(c.slug, c.name)}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>

            {/* Status Select */}
            <div className="relative w-full sm:w-auto min-w-0 sm:min-w-[120px]">
              <select 
                value={productStatusFilter}
                onChange={(e) => { setProductStatusFilter(e.target.value); setProductCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer transition-all"
              >
                <option value="All">{t("All Status")}</option>
                <option value="Active">{t("Active")}</option>
                <option value="Inactive">{t("Inactive")}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
              {/* Refresh from API Button */}
              <button
                onClick={loadProductsFromApi}
                disabled={isProductsLoading}
                title="Reload products from localhost:3007/api/products"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw size={14} className={isProductsLoading ? "animate-spin text-blue-600" : ""} />
                <span>{isProductsLoading ? "Syncing..." : "Refresh"}</span>
              </button>

              {/* Add Product Button */}
              <button 
                onClick={handleOpenAddProduct} 
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>{t("Add Product")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto admin-scroll">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                <th className="py-3.5 px-5">{t("Product Details")}</th>
                <th className="py-3.5 px-5">{t("Category")}</th>
                <th className="py-3.5 px-5">{t("Pricing")}</th>
                <th className="py-3.5 px-5">{t("Stock Level")}</th>
                <th className="py-3.5 px-5">{t("Status")}</th>
                <th className="py-3.5 px-5 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Package size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">{t("No products found")}</h3>
                      <p className="text-xs text-black">
                        No items match your search or filter options. Try clearing filters or add a new product.
                      </p>
                      <button 
                        onClick={() => { setProductSearch(""); setProductCategoryFilter("All"); setProductStatusFilter("All"); setProductCurrentPage(1); }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const categoryBadgeColor = 
                    p.category.includes("Fancy") ? "bg-purple-50 text-purple-700 border-purple-200" :
                    p.category.includes("Rocket") ? "bg-rose-50 text-rose-700 border-rose-200" :
                    p.category.includes("Flower") ? "bg-amber-50 text-amber-700 border-amber-200" :
                    p.category.includes("Ground") ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-xl flex flex-shrink-0 items-center justify-center font-bold text-xs border overflow-hidden relative bg-slate-100 ${categoryBadgeColor}`}>
                            <span className="text-slate-500">{p.name.slice(0, 2).toUpperCase()}</span>
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-extrabold text-sm text-black leading-tight">
                                {isTamil ? (p.nameTam || p.nameEng || p.name) : (p.nameEng || p.name)}
                              </p>
                              {p.featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                  <Star size={10} className="fill-amber-500 text-amber-500" />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>
                            {!isTamil && p.nameTam ? (
                              <p className="text-[11px] text-blue-700 font-medium mt-0.5">{p.nameTam}</p>
                            ) : isTamil && (p.nameEng || p.name) ? (
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5">{p.nameEng || p.name}</p>
                            ) : null}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tracking-wide mt-0.5">
                              <span>{p.code}</span>
                              {(p.contentEng || p.content) && (
                                <span className="text-slate-400 font-sans">
                                  • {isTamil && p.contentTam ? p.contentTam : (p.contentEng || p.content)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryBadgeColor}`}>
                          {tCategory(p.categorySlug, p.category)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-black">₹{p.sellingPrice}</span>
                            {p.discount ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">
                                {p.discount}% OFF
                              </span>
                            ) : null}
                          </div>
                          {p.actualPrice > p.sellingPrice && (
                            <span className="text-[11px] text-slate-400 line-through">₹{p.actualPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          p.stock === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          p.stock < 10 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.stock === 0 ? 'bg-rose-500' : p.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                          <span>{p.stock === 0 ? t('Out of Stock') : p.stock < 10 ? `${t('Low Stock')} (${p.stock})` : `${t('In Stock')} (${p.stock})`}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleProductStatus(p.id)}
                          title="Click to toggle visibility status"
                          className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            p.status === "Active" 
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                              : "text-black bg-slate-100 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          <span>{p.status === "Active" ? t("Active") : t("Inactive")}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setViewingProduct(p)}
                            title={t("View")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditProduct(p)}
                            title={t("Edit")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingProduct(p)}
                            title={t("Delete")}
                            className="p-1.5 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Results Summary & Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div className="p-3.5 sm:p-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs font-semibold text-black">
              {t("Showing")} <span className="font-bold text-black">{(productCurrentPage - 1) * productsPerPage + 1}</span> {t("to")} <span className="font-bold text-black">{Math.min(productCurrentPage * productsPerPage, filteredProducts.length)}</span> {t("of")} <span className="font-bold text-black">{filteredProducts.length}</span> {t("products")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button 
                disabled={productCurrentPage === 1}
                onClick={() => setProductCurrentPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>{t("Prev")}</span>
              </button>
              {Array.from({ length: totalProductPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setProductCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${productCurrentPage === page ? "bg-blue-600 text-white shadow-2xs" : "border border-slate-200 bg-white hover:bg-slate-100 text-black"}`}
                >
                  {page}
                </button>
              ))}
              <button 
                disabled={productCurrentPage === totalProductPages}
                onClick={() => setProductCurrentPage(p => Math.min(p + 1, totalProductPages))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>{t("Next")}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ─────────────────────────────────────────────────── */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-black">Add New Product</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">POST http://localhost:3007/api/product</p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="p-1 text-black hover:text-black rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAddProduct} className="p-6 overflow-y-auto space-y-4">
              {prodError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{prodError}</span>
                </div>
              )}

              {/* Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Product Code/SKU *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SF2026-124"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Category (categorySlug)</label>
                  <select 
                    value={prodCategorySlug}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.nameEng || c.name} {c.nameTam ? `(${c.nameTam})` : ""} (/{c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bilingual Content Tabs */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                <div className="flex border-b border-gray-200 bg-gray-50 p-1.5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProdLangTab("en")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      prodLangTab === "en"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇬🇧 English Content</span>
                    {prodNameEng.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="English name entered" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">*</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdLangTab("ta")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      prodLangTab === "ta"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇮🇳 Tamil Content (தமிழ்)</span>
                    {prodNameTam.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tamil name entered" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {prodLangTab === "en" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Product Name (English) *
                        </label>
                        <input 
                          type="text" 
                          value={prodNameEng}
                          onChange={(e) => {
                            setProdNameEng(e.target.value);
                            setProdName(e.target.value);
                          }}
                          placeholder="e.g. Flower Pots Small (10 Pcs)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Packaging / Content (English)
                        </label>
                        <input 
                          type="text" 
                          value={prodContentEng}
                          onChange={(e) => {
                            setProdContentEng(e.target.value);
                            setProdContent(e.target.value);
                          }}
                          placeholder="e.g. Small flower pot crackers (10 pieces)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (English)
                        </label>
                        <textarea 
                          rows={2}
                          value={prodDescEng}
                          onChange={(e) => {
                            setProdDescEng(e.target.value);
                            setProdDescription(e.target.value);
                          }}
                          placeholder="e.g. Small flower pot crackers, pack of 10."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Product Name (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={prodNameTam}
                          onChange={(e) => setProdNameTam(e.target.value)}
                          placeholder="e.g. சிறிய பூந்தொட்டி (10 பீஸ்)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Packaging / Content (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={prodContentTam}
                          onChange={(e) => setProdContentTam(e.target.value)}
                          placeholder="e.g. சிறிய பூந்தொட்டி பட்டாசுகள் (10 எண்ணிக்கை)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (Tamil - தமிழ்)
                        </label>
                        <textarea 
                          rows={2}
                          value={prodDescTam}
                          onChange={(e) => setProdDescTam(e.target.value)}
                          placeholder="e.g. 10 எண்ணிக்கை கொண்ட சிறிய பூந்தொட்டி பட்டாசுகள்."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  )}
                  <p className="text-[11px] text-gray-500 italic">
                    💡 Both English and Tamil fields are preserved when switching tabs.
                  </p>
                </div>
              </div>

              {/* Pricing (Actual MRP, Selling Price, Discount) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Actual MRP (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodActualPrice}
                    onChange={(e) => handleActualPriceChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodSellingPrice}
                    onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Discount (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={prodDiscount}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Stock, Min Qty, Max Qty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Stock Units</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Min Order Qty</label>
                  <input 
                    type="number" 
                    min={1}
                    value={prodMinOrderQty}
                    onChange={(e) => setProdMinOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Max Order Qty</label>
                  <input 
                    type="number" 
                    min={1}
                    value={prodMaxOrderQty}
                    onChange={(e) => setProdMaxOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-black uppercase">Product Image</label>
                  <label className="text-xs font-semibold text-[#0000FF] hover:underline cursor-pointer flex items-center gap-1">
                    {isUploadingProdImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingProdImg ? "Uploading..." : "Upload File"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingProdImg}
                      onChange={handleProductImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="Paste image URL or click 'Upload File'"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                  {prodImageUrl && (
                    <img 
                      src={prodImageUrl} 
                      alt="Preview" 
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-300 shrink-0" 
                    />
                  )}
                </div>
                {uploadProdImgError && (
                  <p className="text-xs text-red-600 mt-1">{uploadProdImgError}</p>
                )}
              </div>

              {/* Status and Featured toggle */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Status (isActive)</label>
                  <select 
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">Active (isActive: true)</option>
                    <option value="Inactive">Inactive (isActive: false)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input 
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-black flex items-center gap-1">
                      <Star size={13} className={prodIsFeatured ? "fill-amber-500 text-amber-500" : "text-gray-400"} />
                      <span>Featured (isFeatured)</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
                <button 
                  type="button" 
                  disabled={prodIsSubmitting}
                  onClick={() => setIsAddProductOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={prodIsSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {prodIsSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ────────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-black">Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="p-1 text-black hover:text-black rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditProduct} className="p-6 overflow-y-auto space-y-4">
              {prodError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{prodError}</span>
                </div>
              )}
              {/* Code & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Product Code/SKU *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Category</label>
                  <select 
                    value={prodCategorySlug}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.nameEng || c.name} {c.nameTam ? `(${c.nameTam})` : ""} (/{c.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bilingual Content Tabs */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                <div className="flex border-b border-gray-200 bg-gray-50 p-1.5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setProdLangTab("en")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      prodLangTab === "en"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇬🇧 English Content</span>
                    {prodNameEng.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="English name set" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">*</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdLangTab("ta")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      prodLangTab === "ta"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇮🇳 Tamil Content (தமிழ்)</span>
                    {prodNameTam.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tamil name set" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {prodLangTab === "en" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Product Name (English) *
                        </label>
                        <input 
                          type="text" 
                          value={prodNameEng}
                          onChange={(e) => {
                            setProdNameEng(e.target.value);
                            setProdName(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Packaging / Content (English)
                        </label>
                        <input 
                          type="text" 
                          value={prodContentEng}
                          onChange={(e) => {
                            setProdContentEng(e.target.value);
                            setProdContent(e.target.value);
                          }}
                          placeholder="e.g. Small flower pot crackers (10 pieces)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (English)
                        </label>
                        <textarea 
                          rows={2}
                          value={prodDescEng}
                          onChange={(e) => {
                            setProdDescEng(e.target.value);
                            setProdDescription(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Product Name (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={prodNameTam}
                          onChange={(e) => setProdNameTam(e.target.value)}
                          placeholder="e.g. சிறிய பூந்தொட்டி (10 பீஸ்)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Packaging / Content (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={prodContentTam}
                          onChange={(e) => setProdContentTam(e.target.value)}
                          placeholder="e.g. சிறிய பூந்தொட்டி பட்டாசுகள் (10 எண்ணிக்கை)"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (Tamil - தமிழ்)
                        </label>
                        <textarea 
                          rows={2}
                          value={prodDescTam}
                          onChange={(e) => setProdDescTam(e.target.value)}
                          placeholder="e.g. 10 எண்ணிக்கை கொண்ட சிறிய பூந்தொட்டி பட்டாசுகள்."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  )}
                  <p className="text-[11px] text-gray-500 italic">
                    💡 Both English and Tamil fields are preserved when switching tabs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Actual MRP (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodActualPrice}
                    onChange={(e) => handleActualPriceChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodSellingPrice}
                    onChange={(e) => handleSellingPriceChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Discount (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={prodDiscount}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-emerald-700 focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Stock Units</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Min Order Qty</label>
                  <input 
                    type="number" 
                    min={1}
                    value={prodMinOrderQty}
                    onChange={(e) => setProdMinOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Max Order Qty</label>
                  <input 
                    type="number" 
                    min={1}
                    value={prodMaxOrderQty}
                    onChange={(e) => setProdMaxOrderQty(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-black uppercase">Product Image</label>
                  <label className="text-xs font-semibold text-[#0000FF] hover:underline cursor-pointer flex items-center gap-1">
                    {isUploadingProdImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingProdImg ? "Uploading..." : "Upload File"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingProdImg}
                      onChange={handleProductImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="Paste image URL or click 'Upload File'"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                  {prodImageUrl && (
                    <img 
                      src={prodImageUrl} 
                      alt="Preview" 
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-300 shrink-0" 
                    />
                  )}
                </div>
                {uploadProdImgError && (
                  <p className="text-xs text-red-600 mt-1">{uploadProdImgError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Status (isActive)</label>
                  <select 
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input 
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-black flex items-center gap-1">
                      <Star size={13} className={prodIsFeatured ? "fill-amber-500 text-amber-500" : "text-gray-400"} />
                      <span>Featured (isFeatured)</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
                <button 
                  type="button" 
                  disabled={prodIsSubmitting}
                  onClick={() => setEditingProduct(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={prodIsSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {prodIsSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Product Details Modal ────────────────────────────────────────── */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-black truncate">{viewingProduct.nameEng || viewingProduct.name}</h3>
                  {viewingProduct.featured && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md shrink-0">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>
                {viewingProduct.nameTam && (
                  <p className="text-xs sm:text-sm font-semibold text-blue-800 mt-0.5 truncate">{viewingProduct.nameTam}</p>
                )}
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingProduct.code}</p>
              </div>
              <button onClick={() => setViewingProduct(null)} className="p-1.5 text-black hover:bg-gray-200 rounded-lg cursor-pointer shrink-0">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 admin-scroll">
              {viewingProduct.imageUrl ? (
                <div className="w-full h-44 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img 
                    src={viewingProduct.imageUrl} 
                    alt={viewingProduct.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.style.display = "none"; }} 
                  />
                </div>
              ) : (
                <div className="w-full h-24 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-black">
                  <ImageIcon size={36} />
                </div>
              )}

              {/* Bilingual Descriptions */}
              {(viewingProduct.descriptionEng || viewingProduct.description || viewingProduct.descriptionTam) && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  {(viewingProduct.descriptionEng || viewingProduct.description) && (
                    <div>
                      <span className="font-bold text-slate-700 block text-[10px] uppercase">English Description:</span>
                      <p className="text-slate-600 mt-0.5">{viewingProduct.descriptionEng || viewingProduct.description}</p>
                    </div>
                  )}
                  {viewingProduct.descriptionTam && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-blue-900 block text-[10px] uppercase">Tamil Description (தமிழ்):</span>
                      <p className="text-slate-700 mt-0.5">{viewingProduct.descriptionTam}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 sm:p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-black uppercase">Selling Price</p>
                  <p className="text-lg sm:text-xl font-extrabold text-black">₹{viewingProduct.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase">MRP (Actual Price)</p>
                  <p className="text-base sm:text-lg font-bold text-black line-through">₹{viewingProduct.actualPrice}</p>
                </div>
                {viewingProduct.actualPrice > viewingProduct.sellingPrice && (
                  <div className="col-span-2 pt-2 border-t border-gray-200 flex justify-between text-xs font-bold text-green-700">
                    <span>Discount Offer:</span>
                    <span>Save ₹{viewingProduct.actualPrice - viewingProduct.sellingPrice} ({viewingProduct.discount || Math.round(((viewingProduct.actualPrice - viewingProduct.sellingPrice) / viewingProduct.actualPrice) * 100)}% OFF)</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs sm:text-sm font-semibold">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">Category:</span>
                  <span className="font-bold text-black">{tCategory(viewingProduct.categorySlug, viewingProduct.category)}</span>
                </div>
                {(viewingProduct.contentEng || viewingProduct.content) && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-black">Packaging (English):</span>
                    <span className="font-bold text-black">{viewingProduct.contentEng || viewingProduct.content}</span>
                  </div>
                )}
                {viewingProduct.contentTam && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-black">Packaging (Tamil):</span>
                    <span className="font-bold text-blue-900">{viewingProduct.contentTam}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">Stock Quantity:</span>
                  <span className="font-bold text-black">{viewingProduct.stock} units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">Order Limits (Min - Max):</span>
                  <span className="font-bold text-black">{viewingProduct.minOrderQty ?? 1} - {viewingProduct.maxOrderQty ?? 10} units</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">Availability:</span>
                  <span className={`font-bold ${viewingProduct.stock === 0 ? 'text-red-600' : viewingProduct.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {viewingProduct.stock === 0 ? t('Out of Stock') : viewingProduct.stock < 10 ? t('Low Stock') : t('In Stock')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-black">Catalog Status:</span>
                  <span className={`font-bold ${viewingProduct.status === 'Active' ? 'text-green-600' : 'text-black'}`}>{viewingProduct.status}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setViewingProduct(null)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Close Overview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-5 sm:p-6 space-y-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-black">Delete Product?</h3>
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              Are you sure you want to delete <span className="font-bold text-black">"{deletingProduct.name}"</span>? This will remove it from the catalog.
            </p>
            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-center gap-2.5 sm:gap-3">
              <button 
                type="button" 
                disabled={prodIsSubmitting}
                onClick={() => setDeletingProduct(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={prodIsSubmitting}
                onClick={handleConfirmDeleteProduct}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {prodIsSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {catNotification && (
        <div className={`p-3.5 sm:p-4 rounded-xl text-sm font-bold flex items-center justify-between shadow-md transition-all ${
          catNotification.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border border-emerald-300" 
            : "bg-red-50 text-red-800 border border-red-300"
        }`}>
          <div className="flex items-center gap-2">
            <span>{catNotification.type === "success" ? "✓" : "⚠️"}</span>
            <span>{catNotification.message}</span>
          </div>
          <button onClick={() => setCatNotification(null)} className="text-black hover:opacity-75 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Categories Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-black leading-tight">{t("Product Categories")}</h2>
              <p className="text-xs font-medium text-slate-500">{t("Organize fireworks catalog into structured store categories")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 shrink-0">
              {categoriesList.length} {t("categories")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input 
                type="text" 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder={t("Search category or slug...")} 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {categorySearch && (
                <button onClick={() => setCategorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
              {/* Refresh from API Button */}
              <button
                onClick={loadCategoriesFromApi}
                disabled={isCategoriesLoading}
                title="Reload categories from localhost:3007/api/categories"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw size={14} className={isCategoriesLoading ? "animate-spin text-blue-600" : ""} />
                <span>{isCategoriesLoading ? "Syncing..." : "Refresh"}</span>
              </button>

              {/* Add Category Button */}
              <button 
                onClick={handleOpenAddCategory} 
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus size={16} />
                <span>{t("Add Category")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto admin-scroll">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                <th className="py-3.5 px-5">{t("Category Name")}</th>
                <th className="py-3.5 px-5">{t("Slug Route")}</th>
                <th className="py-3.5 px-5 text-center">{t("Product Count")}</th>
                <th className="py-3.5 px-5 text-center">{t("Sort Order")}</th>
                <th className="py-3.5 px-5 text-center">{t("Status")}</th>
                <th className="py-3.5 px-5 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Layers size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">{t("No categories found")}</h3>
                      <p className="text-xs text-black font-medium">Try searching for a different keyword or create a new category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c, index) => {
                  const count = typeof c.count === "number" ? c.count : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl border border-slate-200 shrink-0 overflow-hidden relative bg-slate-100 flex items-center justify-center">
                            <span className="font-bold text-xs text-slate-500 uppercase select-none">
                              {c.name.slice(0, 2)}
                            </span>
                            {c.imageUrl && (
                              <img 
                                src={c.imageUrl} 
                                alt={c.name} 
                                className="absolute inset-0 w-full h-full object-cover" 
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }} 
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-black">
                                {isTamil ? (c.nameTam || c.nameEng || c.name) : (c.nameEng || c.name)}
                              </span>
                              {typeof c.id === "string" && (
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={`ID: ${c.id}`}>
                                  {c.id.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                            {!isTamil && c.nameTam ? (
                              <div className="text-[11px] text-blue-700 font-medium mt-0.5">{c.nameTam}</div>
                            ) : isTamil && (c.nameEng || c.name) ? (
                              <div className="text-[11px] text-slate-500 font-normal mt-0.5">{c.nameEng || c.name}</div>
                            ) : null}
                            {(c.descriptionEng || c.description || c.descriptionTam) && (
                              <div className="text-xs text-slate-500 font-normal line-clamp-1 max-w-xs">
                                {isTamil && c.descriptionTam ? c.descriptionTam : (c.descriptionEng || c.description)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-black font-mono text-xs">/{c.slug}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-black text-xs font-bold rounded-full border border-slate-200">
                          {count} {t("products")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.5 rounded-lg border border-slate-200">
                          <button 
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveCategorySort(c.id, "up")} 
                            title="Move 1 step up"
                            className="p-1 text-black hover:text-black hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <input 
                            type="number"
                            min={1}
                            value={c.sort}
                            onChange={(e) => handleDirectSortChange(c.id, Number(e.target.value))}
                            className="w-10 text-center font-extrabold text-xs bg-transparent outline-none border-b border-transparent focus:border-blue-600 focus:bg-white rounded text-black"
                            title="Type sort number directly"
                          />
                          <button 
                            type="button"
                            disabled={index === filteredCategories.length - 1}
                            onClick={() => handleMoveCategorySort(c.id, "down")} 
                            title="Move 1 step down"
                            className="p-1 text-black hover:text-black hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => handleToggleCategoryStatus(c.id)}
                          title="Click to toggle status"
                          className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            c.status === "Active" 
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                              : "text-black bg-slate-100 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          <span>{c.status === "Active" ? t("Active") : t("Inactive")}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditCategory(c)}
                            title={t("Edit")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingCategory(c)}
                            title={t("Delete")}
                            className="p-1.5 text-black hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Category Modal ────────────────────────────────────────────────── */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-black">Add New Category</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">POST http://localhost:3007/api/categories</p>
              </div>
              <button onClick={() => setIsAddCategoryOpen(false)} className="p-1.5 text-black hover:bg-gray-200 rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddCategory} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 admin-scroll">
              {catError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{catError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Slug *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-black font-bold font-mono">/</span>
                  <input 
                    type="text" 
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="sparklers"
                    className="w-full pl-7 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">Language-independent slug used for URLs, routing, and filtering</p>
              </div>

              {/* Bilingual Category Tabs */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                <div className="flex border-b border-gray-200 bg-gray-50 p-1.5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCatLangTab("en")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      catLangTab === "en"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇬🇧 English Content</span>
                    {catNameEng.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="English name entered" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">*</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatLangTab("ta")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      catLangTab === "ta"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇮🇳 Tamil Content (தமிழ்)</span>
                    {catNameTam.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tamil name entered" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {catLangTab === "en" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Category Name (English) *
                        </label>
                        <input 
                          type="text" 
                          value={catNameEng}
                          onChange={(e) => handleCategoryNameChange(e.target.value)}
                          placeholder="e.g. Flower Pots"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (English)
                        </label>
                        <textarea 
                          rows={2}
                          value={catDescEng}
                          onChange={(e) => {
                            setCatDescEng(e.target.value);
                            setCatDesc(e.target.value);
                          }}
                          placeholder="e.g. Explore our flower pot collection."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Category Name (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={catNameTam}
                          onChange={(e) => setCatNameTam(e.target.value)}
                          placeholder="e.g. பூந்தொட்டிகள்"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (Tamil - தமிழ்)
                        </label>
                        <textarea 
                          rows={2}
                          value={catDescTam}
                          onChange={(e) => setCatDescTam(e.target.value)}
                          placeholder="e.g. எங்கள் பூந்தொட்டி பட்டாசுகளின் தொகுப்பைப் பாருங்கள்."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  )}
                  <p className="text-[11px] text-gray-500 italic">
                    💡 English and Tamil values can be edited and saved independently.
                  </p>
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-black">Category Image</label>
                  <label className="text-xs font-semibold text-[#0000FF] hover:underline cursor-pointer flex items-center gap-1">
                    {isUploadingCatImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingCatImg ? "Uploading..." : "Upload File"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingCatImg}
                      onChange={handleCategoryImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="Paste image URL or click 'Upload File'"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                  {catImageUrl && (
                    <img 
                      src={catImageUrl} 
                      alt="Preview" 
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-300 shrink-0" 
                    />
                  )}
                </div>
                {uploadCatImgError && (
                  <p className="text-xs text-red-600 mt-1">{uploadCatImgError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Sort Order</label>
                  <input 
                    type="number" 
                    min={1}
                    value={catSort}
                    onChange={(e) => setCatSort(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1">Status</label>
                  <select 
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">Active (isActive: true)</option>
                    <option value="Inactive">Inactive (isActive: false)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
                <button 
                  type="button" 
                  disabled={catIsSubmitting}
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={catIsSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {catIsSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ────────────────────────────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-base sm:text-xl font-bold text-black">Edit Category</h3>
              <button onClick={() => setEditingCategory(null)} className="p-1.5 text-black hover:bg-gray-200 rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditCategory} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 admin-scroll">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Slug *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-black font-bold font-mono">/</span>
                  <input 
                    type="text" 
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-medium">Language-independent slug used for URLs, routing, and filtering</p>
              </div>

              {/* Bilingual Category Tabs */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                <div className="flex border-b border-gray-200 bg-gray-50 p-1.5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCatLangTab("en")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      catLangTab === "en"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇬🇧 English Content</span>
                    {catNameEng.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="English name set" />
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">*</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatLangTab("ta")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      catLangTab === "ta"
                        ? "bg-white text-blue-700 shadow-xs border border-gray-200"
                        : "text-gray-600 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    <span>🇮🇳 Tamil Content (தமிழ்)</span>
                    {catNameTam.trim() ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Tamil name set" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    )}
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {catLangTab === "en" ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Category Name (English) *
                        </label>
                        <input 
                          type="text" 
                          value={catNameEng}
                          onChange={(e) => {
                            setCatNameEng(e.target.value);
                            setCatName(e.target.value);
                          }}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (English)
                        </label>
                        <textarea 
                          rows={2}
                          value={catDescEng}
                          onChange={(e) => {
                            setCatDescEng(e.target.value);
                            setCatDesc(e.target.value);
                          }}
                          placeholder="Category description in English..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Category Name (Tamil - தமிழ்)
                        </label>
                        <input 
                          type="text" 
                          value={catNameTam}
                          onChange={(e) => setCatNameTam(e.target.value)}
                          placeholder="e.g. பூந்தொட்டிகள்"
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">
                          Description (Tamil - தமிழ்)
                        </label>
                        <textarea 
                          rows={2}
                          value={catDescTam}
                          onChange={(e) => setCatDescTam(e.target.value)}
                          placeholder="Category description in Tamil..."
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                        />
                      </div>
                    </>
                  )}
                  <p className="text-[11px] text-gray-500 italic">
                    💡 English and Tamil values can be edited and saved independently.
                  </p>
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-black">Category Image</label>
                  <label className="text-xs font-semibold text-[#0000FF] hover:underline cursor-pointer flex items-center gap-1">
                    {isUploadingCatImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingCatImg ? "Uploading..." : "Upload File"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploadingCatImg}
                      onChange={handleCategoryImageUpload}
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="Paste image URL or click 'Upload File'"
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                  {catImageUrl && (
                    <img 
                      src={catImageUrl} 
                      alt="Preview" 
                      onError={(e) => (e.currentTarget.style.display = "none")}
                      className="w-9 h-9 object-cover rounded-lg border border-gray-300 shrink-0" 
                    />
                  )}
                </div>
                {uploadCatImgError && (
                  <p className="text-xs text-red-600 mt-1">{uploadCatImgError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">Sort Order</label>
                  <input 
                    type="number" 
                    min={1}
                    value={catSort}
                    onChange={(e) => setCatSort(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1">Status</label>
                  <select 
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer text-center"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-5 sm:p-6 space-y-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-black">Delete Category?</h3>
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              Are you sure you want to delete <span className="font-bold text-black">"{deletingCategory.name}"</span>? This will remove it from category selections across your catalog.
            </p>
            <div className="pt-2 flex flex-col-reverse sm:flex-row justify-center gap-2.5 sm:gap-3">
              <button 
                onClick={() => setDeletingCategory(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteCategory}
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  // ── Customer Queries View ───────────────────────────────────────────────────
  const renderQueries = () => (
    <div className="p-3.5 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Queries Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-3.5 sm:p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-black leading-tight">{t("Customer Queries")}</h2>
              <p className="text-xs font-medium text-slate-500">
                {t("Review customer inquiries and messages submitted from the store website")}
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 shrink-0">
              {queriesList.length} {t("Queries")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={queriesSearch}
                onChange={(e) => {
                  setQueriesSearch(e.target.value);
                  setQueriesCurrentPage(1);
                }}
                placeholder={t("Search by mobile or message...") || "Search by mobile or message..."}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-slate-400"
              />
              {queriesSearch && (
                <button
                  onClick={() => setQueriesSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Refresh from API Button */}
            <button
              onClick={loadQueriesFromApi}
              disabled={isQueriesLoading}
              title="Reload queries from API"
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw size={14} className={isQueriesLoading ? "animate-spin text-blue-600" : ""} />
              <span>{isQueriesLoading ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Queries Table */}
        <div className="overflow-x-auto admin-scroll">
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-black font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">{t("Mobile Number")}</th>
                <th className="py-3.5 px-4">{t("Inquiry Message") || "Message"}</th>
                <th className="py-3.5 px-4">{t("Received Date") || "Date"}</th>
                <th className="py-3.5 px-4">{t("Status")}</th>
                <th className="py-3.5 px-4 text-right">{t("Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedQueries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MessageSquare size={38} className="text-slate-300" />
                      <p className="font-bold text-sm text-slate-800">{t("No queries found")}</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Customer contact requests and messages submitted via the website will appear here in real time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQueries.map((q, idx) => {
                  const cleanPhone = q.mobileNumber.replace(/\D/g, "");
                  const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent("வணக்கம்! சாந்தி சிவகாசி பட்டாசுகள் சார்பாக உங்களைத் தொடர்பு கொள்கிறோம்.")}`;
                  const formattedDate = new Date(q.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={q.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {(queriesCurrentPage - 1) * queriesPerPage + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {q.mobileNumber}
                          </span>
                          <a
                            href={`tel:${q.mobileNumber}`}
                            title="Call customer directly"
                            className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Phone size={13} />
                          </a>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open WhatsApp chat with customer"
                            className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <MessageSquare size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-800 line-clamp-2 text-xs leading-relaxed font-medium">
                          {q.message}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-extrabold rounded-md uppercase tracking-wider">
                          {q.status || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedQuery(q)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>{t("View")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalQueryPages > 1 && (
          <div className="p-3.5 sm:p-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600 text-center sm:text-left">
            <span>
              Showing page <strong>{queriesCurrentPage}</strong> of <strong>{totalQueryPages}</strong> ({filteredQueries.length} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQueriesCurrentPage((p) => Math.max(1, p - 1))}
                disabled={queriesCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setQueriesCurrentPage((p) => Math.min(totalQueryPages, p + 1))}
                disabled={queriesCurrentPage === totalQueryPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Query Details Modal */}
      {selectedQuery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">{t("Customer Query Details")}</h3>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 admin-scroll">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t("Mobile Number")}
                </label>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-base sm:text-lg font-bold text-slate-900">{selectedQuery.mobileNumber}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedQuery.mobileNumber}`}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Phone size={12} /> Call
                    </a>
                    <a
                      href={`https://wa.me/91${selectedQuery.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent("வணக்கம்! சாந்தி சிவகாசி பட்டாசுகள் சார்பாக உங்களைத் தொடர்பு கொள்கிறோம்.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t("Received Date") || "Date"}
                </label>
                <p className="text-xs text-slate-600 font-medium">
                  {new Date(selectedQuery.createdAt).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t("Inquiry Message") || "Message"}
                </label>
                <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedQuery.message}
                </div>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setSelectedQuery(null)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Render Switcher ──────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (currentRoute) {
      case "/admin": return renderDashboard();
      case "/admin/products": return renderProducts();
      case "/admin/categories": return renderCategories();
      case "/admin/queries": return renderQueries();
      default: return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">Coming Soon</h2>
            <p className="text-lg font-semibold text-black">This section is part of the prototype and will be fully functional soon.</p>
          </div>
        </div>
      );
    }
  };

  const getHeaderTitles = () => {
    if (currentRoute === "/admin") return { title: "Dashboard", sub: "Dashboard" };
    if (currentRoute === "/admin/products") return { title: "Products", sub: "Admin / Products" };
    if (currentRoute === "/admin/categories") return { title: "Categories", sub: "Admin / Categories" };
    if (currentRoute === "/admin/queries") return { title: "Customer Queries", sub: "Admin / Queries" };
    return { title: "Admin Portal", sub: "Admin" };
  };

  const headers = getHeaderTitles();

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F4] font-manrope">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-72">
        <Header title={headers.title} subtitle={headers.sub} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden admin-scroll">
          {renderContent()}
        </main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden transition-opacity" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
