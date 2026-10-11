import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { createCategoryApi, fetchCategoriesApi } from "./api/categories";
import { createProductApi, fetchProductsApi, updateProductApi, deleteProductApi } from "./api/products";
import { type CustomerQuery, fetchQueriesApi } from "./api/queries";
import { 
  LayoutDashboard, Package, ListTree, ShoppingCart, 
  LogOut, Menu, Search, X, Edit, Eye, 
  Trash2, Plus, ImageIcon, ChevronLeft, ChevronRight,
  FileText, Printer, Truck, User, Phone, MapPin, CreditCard, ChevronDown,
  ArrowUp, ArrowDown, Layers, RefreshCw, Star, MessageSquare
} from "lucide-react";
import { useLanguage } from "./context/LanguageContext";
import "./App.css";

// ── Types & Data ─────────────────────────────────────────────────────────────
export interface OrderItem {
  id: number;
  code: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  count: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  payment: "Paid" | "Pending" | "Failed" | "Refunded";
  paymentMethod: string;
  status: "Processing" | "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  count: number;
  sort: number;
  status: "Active" | "Inactive";
}

export interface Product {
  id: number | string;
  code: string;
  name: string;
  category: string;
  categorySlug?: string;
  description?: string;
  content?: string;
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

const INITIAL_ORDERS: Order[] = [
  {
    id: "DK-10842",
    customer: "Maya Srinivasan",
    phone: "+91 98765 43210",
    email: "maya.srinivasan@gmail.com",
    address: "Door 42, Anna Nagar West, near Shanthi Bhavan",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600040",
    count: 3,
    subtotal: 2450,
    discount: 150,
    deliveryFee: 235,
    total: 2535,
    payment: "Paid",
    paymentMethod: "UPI (Google Pay)",
    status: "Processing",
    date: "9 Oct 2026",
    updatedAt: "9 Oct 2026, 04:30 PM",
    items: [
      { id: 1, code: "GAR-1000-01", name: "1000 Wala Garland", qty: 2, unitPrice: 299, total: 598 },
      { id: 2, code: "COM-DIW-24", name: "Diwali Celebration Combo", qty: 1, unitPrice: 1852, total: 1852 }
    ]
  },
  {
    id: "DK-10841",
    customer: "Arun Kumar",
    phone: "+91 94431 12345",
    email: "arun.k@yahoo.com",
    address: "15/B Main Street, Gandhi Nagar",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625020",
    count: 2,
    subtotal: 750,
    discount: 0,
    deliveryFee: 60,
    total: 810,
    payment: "Paid",
    paymentMethod: "Net Banking (HDFC)",
    status: "Pending",
    date: "8 Oct 2026",
    updatedAt: "8 Oct 2026, 11:15 AM",
    items: [
      { id: 3, code: "FLP-ASH-08", name: "Ashoka Flower Pot", qty: 1, unitPrice: 670, total: 670 },
      { id: 4, code: "RKT-FLR-05", name: "Anil Flower Rocket", qty: 1, unitPrice: 140, total: 140 }
    ]
  },
  {
    id: "DK-10840",
    customer: "Kavitha Rajan",
    phone: "+91 98220 99887",
    email: "kavitha.rajan@gmail.com",
    address: "78 Lotus Apartments, Cross Road 4",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641002",
    count: 3,
    subtotal: 560,
    discount: 50,
    deliveryFee: 100,
    total: 610,
    payment: "Pending",
    paymentMethod: "Cash on Delivery (COD)",
    status: "Confirmed",
    date: "8 Oct 2026",
    updatedAt: "8 Oct 2026, 02:20 PM",
    items: [
      { id: 5, code: "GCK-DEL-10", name: "Deluxe Ground Chakkar", qty: 2, unitPrice: 155, total: 310 },
      { id: 6, code: "RKT-FLR-05", name: "Anil Flower Rocket", qty: 1, unitPrice: 250, total: 250 }
    ]
  },
  {
    id: "DK-10839",
    customer: "Vijayalakshmi S",
    phone: "+91 97900 11223",
    email: "vijayalakshmi.s@gmail.com",
    address: "Plot 12, VIP Colony, Sivakasi West",
    city: "Sivakasi",
    state: "Tamil Nadu",
    pincode: "626123",
    count: 1,
    subtotal: 1099,
    discount: 50,
    deliveryFee: 50,
    total: 1099,
    payment: "Paid",
    paymentMethod: "Credit Card (Visa)",
    status: "Shipped",
    date: "7 Oct 2026",
    updatedAt: "8 Oct 2026, 09:00 AM",
    items: [
      { id: 7, code: "GAR-DEL-10", name: "Deluxe Garland 5000", qty: 1, unitPrice: 1099, total: 1099 }
    ]
  },
  {
    id: "DK-10838",
    customer: "R. Balaji",
    phone: "+91 96001 88776",
    email: "balaji.r@gmail.com",
    address: "99 Temple Street, Palayamkottai",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    pincode: "627002",
    count: 4,
    subtotal: 800,
    discount: 0,
    deliveryFee: 45,
    total: 845,
    payment: "Failed",
    paymentMethod: "UPI (Paytm)",
    status: "Cancelled",
    date: "6 Oct 2026",
    updatedAt: "6 Oct 2026, 07:10 PM",
    items: [
      { id: 8, code: "GCK-DEL-10", name: "Deluxe Ground Chakkar", qty: 4, unitPrice: 200, total: 800 }
    ]
  },
  {
    id: "DK-10837",
    customer: "Siddharth Verma",
    phone: "+91 91234 56789",
    email: "siddharth.v@gmail.com",
    address: "Flat 402, Green Valley Enclave",
    city: "Trichy",
    state: "Tamil Nadu",
    pincode: "620001",
    count: 5,
    subtotal: 3200,
    discount: 200,
    deliveryFee: 150,
    total: 3150,
    payment: "Paid",
    paymentMethod: "UPI (PhonePe)",
    status: "Delivered",
    date: "5 Oct 2026",
    updatedAt: "7 Oct 2026, 05:00 PM",
    items: [
      { id: 9, code: "COM-DIW-24", name: "Diwali Celebration Combo", qty: 1, unitPrice: 2155, total: 2155 },
      { id: 10, code: "GAR-1000-01", name: "1000 Wala Garland", qty: 2, unitPrice: 299, total: 598 },
      { id: 11, code: "RKT-FLR-05", name: "Anil Flower Rocket", qty: 2, unitPrice: 198, total: 396 }
    ]
  }
];

// ── Main App Component ───────────────────────────────────────────────────────
export default function App() {
  const { language, toggleLanguage, t, tProduct, tCategory, isTamil } = useLanguage();
  const [currentRoute, setCurrentRoute] = useState("/admin/login");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Orders State
  const [ordersList, setOrdersList] = useState<Order[]>(INITIAL_ORDERS);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const ordersPerPage = 5;

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
  const [prodCode, setProdCode] = useState("");
  const [prodCategory, setProdCategory] = useState("Rockets");
  const [prodCategorySlug, setProdCategorySlug] = useState("rockets");
  const [prodDescription, setProdDescription] = useState("");
  const [prodContent, setProdContent] = useState("Pack of 5");
  const [prodActualPrice, setProdActualPrice] = useState<number>(500);
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(425);
  const [prodDiscount, setProdDiscount] = useState<number>(15);
  const [prodStock, setProdStock] = useState<number>(20);
  const [prodMinOrderQty, setProdMinOrderQty] = useState<number>(1);
  const [prodMaxOrderQty, setProdMaxOrderQty] = useState<number>(5);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodStatus, setProdStatus] = useState<"Active" | "Inactive">("Active");
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
          return {
            id: p.id,
            code: p.code,
            name: p.name,
            category: cat ? cat.name : (p.categorySlug || "Crackers"),
            categorySlug: p.categorySlug,
            description: p.description || "",
            content: p.content || "",
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
    setProdCode("");
    const defaultCat = categoriesList.find(c => c.slug === "rockets") || categoriesList[0];
    setProdCategory(defaultCat?.name || "Rockets");
    setProdCategorySlug(defaultCat?.slug || "rockets");
    setProdDescription("Colorful sky rocket for Diwali celebrations");
    setProdContent("Pack of 5");
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
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCode(prod.code);
    setProdCategory(prod.category);
    setProdCategorySlug(prod.categorySlug || "");
    setProdDescription(prod.description || "");
    setProdContent(prod.content || "");
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
  };

  const handleSaveAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodCode.trim()) {
      setProdError("Product Name and Code are required.");
      return;
    }

    setProdIsSubmitting(true);
    setProdError(null);

    const targetCat = categoriesList.find(c => c.slug === prodCategorySlug || c.name === prodCategory);
    const resolvedCatSlug = targetCat?.slug || prodCategorySlug || "rockets";

    try {
      const res = await createProductApi({
        code: prodCode.trim().toUpperCase(),
        name: prodName.trim(),
        description: prodDescription.trim(),
        content: prodContent.trim(),
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
        name: bp?.name || prodName.trim(),
        category: targetCat?.name || prodCategory,
        categorySlug: bp?.categorySlug || resolvedCatSlug,
        description: bp?.description || prodDescription.trim(),
        content: bp?.content || prodContent.trim(),
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
        message: `Product "${newProd.name}" (${newProd.code}) successfully created on API (localhost:3007/api/product)!`,
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
    if (!editingProduct || !prodName.trim() || !prodCode.trim()) {
      setProdError("Product Name and Code are required.");
      return;
    }

    setProdIsSubmitting(true);
    setProdError(null);

    const targetCat = categoriesList.find(c => c.slug === prodCategorySlug || c.name === prodCategory);
    const resolvedCatSlug = targetCat?.slug || prodCategorySlug || undefined;

    try {
      const res = await updateProductApi(editingProduct.id, {
        code: prodCode.trim().toUpperCase(),
        name: prodName.trim(),
        description: prodDescription.trim(),
        content: prodContent.trim(),
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
        name: bp?.name || prodName.trim(),
        category: targetCat?.name || prodCategory,
        categorySlug: bp?.categorySlug || resolvedCatSlug || prodCategorySlug,
        description: bp?.description || prodDescription.trim(),
        content: bp?.content || prodContent.trim(),
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
        message: `Product "${updatedProduct.name}" (${updatedProduct.code}) updated successfully!`,
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
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImageUrl, setCatImageUrl] = useState("");
  const [catSort, setCatSort] = useState<number>(1);
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
        const mapped: Category[] = data.map((c, idx) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || "",
          imageUrl: c.imageUrl || "",
          count: typeof c.productCount === "number" ? c.productCount : 0,
          sort: c.sortOrder ?? idx + 1,
          status: c.isActive === false ? "Inactive" : "Active",
        }));
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
    setCatSlug("");
    setCatDesc("");
    setCatImageUrl("");
    setCatSort(categoriesList.length + 1);
    setCatStatus("Active");
    setCatError(null);
    setIsAddCategoryOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || "");
    setCatImageUrl(cat.imageUrl || "");
    setCatSort(cat.sort);
    setCatStatus(cat.status);
    setCatError(null);
  };

  const handleCategoryNameChange = (val: string) => {
    setCatName(val);
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setCatSlug(autoSlug);
  };

  const handleSaveAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCatIsSubmitting(true);
    setCatError(null);

    const cleanSlug = catSlug.trim().replace(/^\//, '') || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sortNumber = Number(catSort) || categoriesList.length + 1;
    const isActive = catStatus === "Active";

    try {
      // POST to backend localhost:3007/api/categories
      const response = await createCategoryApi({
        name: catName.trim(),
        slug: cleanSlug,
        description: catDesc.trim(),
        imageUrl: catImageUrl.trim() || undefined,
        sortOrder: sortNumber,
        isActive,
      });

      const backendCat = response.category;
      const newCat: Category = {
        id: backendCat?.id || Date.now(),
        name: backendCat?.name || catName.trim(),
        slug: backendCat?.slug || cleanSlug,
        description: backendCat?.description || catDesc.trim(),
        imageUrl: backendCat?.imageUrl || catImageUrl.trim(),
        sort: backendCat?.sortOrder ?? sortNumber,
        status: backendCat?.isActive === false ? "Inactive" : "Active",
        count: backendCat?.productCount || 0,
      };

      setCategoriesList(prev => [...prev, newCat]);
      setCatNotification({
        type: "success",
        message: `Category "${newCat.name}" successfully created on API (localhost:3007/api/categories)!`,
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

  const handleSaveEditCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !catName.trim()) return;
    const cleanSlug = catSlug.trim().replace(/^\//, '') || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? {
      ...c,
      name: catName.trim(),
      slug: cleanSlug,
      description: catDesc.trim(),
      imageUrl: catImageUrl.trim(),
      sort: Number(catSort),
      status: catStatus
    } : c));
    setEditingCategory(null);
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

  // Status & Payment Updates
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const formattedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: formattedDate } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus, updatedAt: formattedDate } : null);
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newPayment: Order["payment"]) => {
    setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, payment: newPayment } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, payment: newPayment } : null);
    }
  };

  // PDF Invoice Extraction
  const handleExportPDF = (order: Order) => {
    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) return;

    const itemsRows = order.items.map((item, index) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px; text-align: center; color: #64748b;">${index + 1}</td>
        <td style="padding: 12px;">
          <div style="font-weight: 700; color: #0f172a;">${item.name}</div>
          <div style="font-size: 12px; color: #64748b;">Code: ${item.code}</div>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: 600;">${item.qty}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">₹${item.unitPrice}</td>
        <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${item.total}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Invoice - ${order.id}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #0f172a; background: #fff; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0000FF; padding-bottom: 20px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 800; color: #0000FF; text-transform: uppercase; letter-spacing: 0.5px; }
            .subbrand { font-size: 13px; font-weight: 600; color: #64748b; margin-top: 2px; }
            .order-title { text-align: right; }
            .order-no { font-size: 20px; font-weight: 800; color: #0f172a; }
            .order-date { font-size: 13px; color: #64748b; margin-top: 4px; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; background: #f8fafc; padding: 20px; border: 1px solid #f1f5f9; border-radius: 8px; }
            .block-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 8px; }
            .info-p { font-size: 14px; margin-bottom: 4px; color: #334155; }
            .info-p strong { color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #475569; border-bottom: 2px solid #e2e8f0; }
            .totals { width: 320px; margin-left: auto; margin-bottom: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #475569; }
            .grand-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 800; color: #0000FF; border-top: 2px solid #0f172a; margin-top: 8px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="brand">Shanthi Sivakasi Crackers</div>
                <div class="subbrand">Official Order Invoice & Summary</div>
              </div>
              <div class="order-title">
                <div class="order-no">${order.id}</div>
                <div class="order-date">Date: ${order.date}</div>
              </div>
            </div>

            <div class="grid-2">
              <div>
                <div class="block-title">Customer & Delivery Details</div>
                <div class="info-p"><strong>Customer:</strong> ${order.customer}</div>
                <div class="info-p"><strong>Phone:</strong> ${order.phone}</div>
                <div class="info-p"><strong>Email:</strong> ${order.email}</div>
                <div class="info-p"><strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} - ${order.pincode}</div>
              </div>
              <div>
                <div class="block-title">Payment & Status Summary</div>
                <div class="info-p"><strong>Payment Status:</strong> ${order.payment}</div>
                <div class="info-p"><strong>Payment Mode:</strong> ${order.paymentMethod}</div>
                <div class="info-p"><strong>Order Status:</strong> ${order.status}</div>
                <div class="info-p"><strong>Last Updated:</strong> ${order.updatedAt}</div>
              </div>
            </div>

            <div class="block-title">Ordered Items Breakdown</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center; width: 40px;">#</th>
                  <th>Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
              ${order.discount > 0 ? `<div class="total-row" style="color: #16a34a;"><span>Discount</span><span>-₹${order.discount}</span></div>` : ''}
              <div class="total-row"><span>Delivery Fee</span><span>₹${order.deliveryFee}</span></div>
              <div class="grand-total"><span>Grand Total</span><span>₹${order.total}</span></div>
            </div>

            <div class="footer">
              Thank you for ordering with Shanthi Sivakasi Crackers!<br/>
              Computer generated invoice summary.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered Orders calculation
  const filteredOrders = ordersList.filter((o) => {
    const query = orderSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      o.id.toLowerCase().includes(query) ||
      o.customer.toLowerCase().includes(query) ||
      o.phone.toLowerCase().includes(query);

    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    const matchesPayment = paymentStatusFilter === "All" || o.payment === paymentStatusFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderCurrentPage - 1) * ordersPerPage,
    orderCurrentPage * ordersPerPage
  );

  const navigate = (path: string) => {
    setCurrentRoute(path);
    setSidebarOpen(false);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    navigate("/admin");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/admin/login");
  };

  // ── Route: Login ─────────────────────────────────────────────────────────────
  if (!isAuthenticated || currentRoute === "/admin/login") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F4] p-6 text-black font-manrope">
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <img src="/logo-santhi.png" alt="Shanthi Sivakasi Crackers Logo" className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-md rounded-2xl" />
            <h1 className="text-3xl font-bold text-black mb-2">Shanthi Sivakasi Crackers</h1>
            <p className="text-lg text-black font-semibold">Manage your store.</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-center text-sm font-bold">
            DEMO SIGN-IN
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-black mb-2">Email address</label>
              <input type="email" required defaultValue="admin@deepakart.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-lg font-medium" />
            </div>
            <div>
              <label className="block text-base font-bold text-black mb-2">Password</label>
              <input type="password" required defaultValue="password123" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-lg font-medium" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-5 h-5 text-[#0000FF] border-gray-300 rounded focus:ring-[#0000FF]" />
              <label htmlFor="remember" className="ml-3 block text-base font-semibold text-black">Remember me</label>
            </div>
            <button type="submit" className="w-full py-4 bg-[#0000FF] text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 transition-colors">
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
        className={`w-full flex items-center justify-between px-4 py-3 mb-2 rounded-lg transition-colors text-lg ${
          isActive 
            ? "bg-[#0000FF] text-white font-bold border-l-4 border-yellow-400" 
            : "text-black font-semibold hover:bg-gray-100 border-l-4 border-transparent"
        }`}
      >
        <div className="flex items-center gap-4">
          <Icon size={24} className={isActive ? "text-white" : "text-black"} />
          <span>{label}</span>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 text-sm font-bold rounded-full ${isActive ? "bg-white text-[#0000FF]" : "bg-gray-200 text-black"}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  const Sidebar = () => (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo-santhi.png" alt="Logo" className="w-12 h-12 object-contain rounded-xl shadow-xs" />
          <div>
            <h2 className="font-bold text-lg text-black leading-tight">Shanthi Sivakasi</h2>
            <p className="text-sm font-semibold text-black">ADMIN</p>
          </div>
        </div>
        <button className="lg:hidden p-2 text-black cursor-pointer" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-sm font-bold text-black uppercase tracking-wider mb-4">Workspace</p>
        <nav>
          <NavItem icon={LayoutDashboard} label={t("Dashboard")} path="/admin" />
          <NavItem icon={Package} label={t("Products")} path="/admin/products" />
          <NavItem icon={ListTree} label={t("Categories")} path="/admin/categories" />
          <NavItem icon={ShoppingCart} label={t("Orders")} path="/admin/orders" badge={24} />
          <NavItem icon={MessageSquare} label={t("Queries")} path="/admin/queries" badge={queriesList.length > 0 ? queriesList.length : undefined} />
        </nav>

        <div className="my-6 border-t border-gray-100"></div>

        {/* Language switch toggle in sidebar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Language / மொழி</p>
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <span>🌐</span>
              <span>{language === "ta" ? "தமிழ் (Tamil)" : "English"}</span>
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold">
              {language === "ta" ? "English" : "தமிழ்"}
            </span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-white">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold text-lg hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <LogOut size={24} />
          <span>{t("Log out")}</span>
        </button>
      </div>
    </aside>
  );

  const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-black hover:bg-slate-100 rounded-lg cursor-pointer" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-3">
          <img src="/logo-santhi.png" alt="Logo" className="w-9 h-9 object-contain rounded-lg lg:hidden" />
          <div>
            <h1 className="text-xl font-extrabold text-black leading-tight">{t(title)}</h1>
            {subtitle && <p className="text-xs font-medium text-black">{t(subtitle)}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Language switch button */}
        <button
          type="button"
          onClick={toggleLanguage}
          id="admin-header-lang-btn"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all shadow-2xs cursor-pointer"
          title={language === "en" ? "தமிழில் மாற்றவும்" : "Switch to English"}
        >
          <span className="text-sm">🌐</span>
          <span>{language === "ta" ? "தமிழ்" : "English"}</span>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {language === "ta" ? "TA" : "EN"}
          </span>
        </button>
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <img src="/logo-santhi.png" alt="Logo" className="w-6 h-6 object-contain" />
          <span className="text-xs font-bold text-black">{t("Santhi Crackers Admin")}</span>
        </div>
      </div>
    </header>
  );

  // ── Views ────────────────────────────────────────────────────────────────────

  const renderDashboard = () => {
    const totalProductsCount = productsList.length;
    const activeProductsCount = productsList.filter(p => p.status === 'Active').length;
    const totalOrdersCount = ordersList.length;
    const pendingOrdersCount = ordersList.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const totalSalesRevenue = ordersList.filter(o => o.payment === 'Paid').reduce((sum, o) => sum + o.total, 0);
    const outOfStockCount = productsList.filter(p => p.stock === 0).length;

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Executive Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-[#0000FF] to-blue-900 text-white p-8 rounded-2xl shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
              <img src="/logo-santhi.png" alt="Logo" className="w-4 h-4 object-contain" />
              <span>{t("Shanthi Sivakasi Crackers Panel")}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">{t("Store Executive Overview")}</h2>
            <p className="text-blue-100 text-base font-medium leading-relaxed">
              {t("Real-time metrics, live inventory monitoring, and customer order management for Shanthi Sivakasi Crackers.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 z-10">
            <button onClick={() => navigate("/admin/products")} className="px-5 py-2.5 bg-white text-[#0000FF] hover:bg-blue-50 font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Package size={18} />
              <span>{t("Manage Catalog")}</span>
            </button>
            <button onClick={() => navigate("/admin/orders")} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <ShoppingCart size={18} />
              <span>{t("View Orders")}</span>
            </button>
          </div>
        </div>
        
        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: t("Total Products"), value: totalProductsCount.toString(), sub: t("In store catalog"), bg: "bg-white" },
            { label: t("Active Products"), value: activeProductsCount.toString(), sub: t("Visible to customers"), bg: "bg-white" },
            { label: t("Total Orders"), value: totalOrdersCount.toString(), sub: t("All time orders"), bg: "bg-white" },
            { label: t("Pending Orders"), value: pendingOrdersCount.toString(), sub: t("Requires processing"), bg: "bg-yellow-50 border-yellow-200" },
            { label: t("Total Sales Revenue"), value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`, sub: t("From paid orders"), bg: "bg-green-50 border-green-200" },
            { label: t("Out of Stock"), value: outOfStockCount.toString(), sub: t("Products need restocking"), bg: "bg-red-50 border-red-200" }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-xl border border-gray-200 shadow-sm ${stat.bg}`}>
              <p className="text-base font-bold text-black mb-2">{stat.label}</p>
              <p className="text-4xl font-extrabold text-black mb-1">{stat.value}</p>
              <p className="text-sm font-semibold text-black">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Live Recent Orders & Low Stock Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-black">{t("Recent orders")}</h2>
                <p className="text-base font-semibold text-black">{t("The latest activity from your store")}</p>
              </div>
              <button onClick={() => navigate("/admin/orders")} className="text-[#0000FF] font-bold text-base hover:underline cursor-pointer">{t("View all orders →")}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm font-bold text-black uppercase">
                    <th className="pb-3 px-2">{t("Order")}</th>
                    <th className="pb-3 px-2">{t("Customer")}</th>
                    <th className="pb-3 px-2">{t("Total")}</th>
                    <th className="pb-3 px-2">{t("Status")}</th>
                    <th className="pb-3 px-2">{t("Date")}</th>
                    <th className="pb-3 px-2 text-right">{t("Action")}</th>
                  </tr>
                </thead>
                <tbody className="text-base font-semibold text-black divide-y divide-gray-100">
                  {ordersList.slice(0, 5).map((o) => (
                    <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="py-4 px-2 font-bold">{o.id}</td>
                      <td className="py-4 px-2">{o.customer}</td>
                      <td className="py-4 px-2 font-bold">₹{o.total}</td>
                      <td className="py-4 px-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          o.status === 'Processing' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                          o.status === 'Pending' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                          o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                          o.status === 'Delivered' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                        }`}>{t(o.status)}</span>
                      </td>
                      <td className="py-4 px-2 text-black text-sm">{o.date}</td>
                      <td className="py-4 px-2 text-right text-[#0000FF] font-bold text-sm">{t("View")} →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">{t("Low stock products")}</h2>
              <button onClick={() => navigate("/admin/products")} className="text-[#0000FF] font-bold text-base hover:underline cursor-pointer">{t("Manage →")}</button>
            </div>
            <div className="space-y-4">
              {productsList.filter((p: Product) => p.stock < 10).length === 0 ? (
                <div className="p-4 text-center text-black font-semibold text-sm">
                  {t("All products are well stocked!")}
                </div>
              ) : (
                productsList.filter((p: Product) => p.stock < 10).slice(0, 5).map((p: Product) => (
                  <div 
                    key={p.id} 
                    onClick={() => { setProductSearch(p.name); navigate("/admin/products"); }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-black text-base">{tProduct(p.code, p.name)}</p>
                      {isTamil && tProduct(p.code, p.name) !== p.name && (
                        <p className="text-xs text-slate-500 font-normal">{p.name}</p>
                      )}
                      <p className="text-xs font-mono text-black">{p.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base text-black">{p.stock} pcs</p>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${p.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Product Notification Toast */}
      {prodNotification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm font-bold animate-in fade-in duration-200 ${
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
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("Product Catalog")}</h2>
              <p className="text-xs font-medium text-black">{t("Manage items, prices, inventory, and promotions")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {filteredProducts.length} {t("items")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input 
                type="text" 
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setProductCurrentPage(1); }}
                placeholder={t("Search by name or code...")} 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {productSearch && (
                <button onClick={() => { setProductSearch(""); setProductCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dynamic Category Select */}
            <div className="relative min-w-[140px]">
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
            <div className="relative min-w-[120px]">
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

            {/* Refresh from API Button */}
            <button
              onClick={loadProductsFromApi}
              disabled={isProductsLoading}
              title="Reload products from localhost:3007/api/products"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw size={14} className={isProductsLoading ? "animate-spin text-blue-600" : ""} />
              <span>{isProductsLoading ? "Syncing..." : "Refresh"}</span>
            </button>

            {/* Add Product Button */}
            <button 
              onClick={handleOpenAddProduct} 
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t("Add Product")}</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                                {tProduct(p.code, p.name)}
                              </p>
                              {p.featured && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                                  <Star size={10} className="fill-amber-500 text-amber-500" />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>
                            {isTamil && tProduct(p.code, p.name) !== p.name && (
                              <p className="text-[11px] text-slate-500 font-normal mt-0.5">{p.name}</p>
                            )}
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono tracking-wide mt-0.5">
                              <span>{p.code}</span>
                              {p.content && <span className="text-slate-400 font-sans">• {p.content}</span>}
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
          <div className="p-4 bg-slate-50/50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-semibold text-black">
              {t("Showing")} <span className="font-bold text-black">{(productCurrentPage - 1) * productsPerPage + 1}</span> {t("to")} <span className="font-bold text-black">{Math.min(productCurrentPage * productsPerPage, filteredProducts.length)}</span> {t("of")} <span className="font-bold text-black">{filteredProducts.length}</span> {t("products")}
            </p>
            <div className="flex items-center gap-1.5">
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

              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Deluxe Rocket"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Product Code/SKU *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ROCKET-002"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Category & Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Category (categorySlug)</label>
                  <select 
                    value={prodCategorySlug}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    {categoriesList.map(c => (
                      <option key={c.id} value={c.slug}>
                        {c.name} (/{c.slug})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Packaging / Content</label>
                  <input 
                    type="text" 
                    value={prodContent}
                    onChange={(e) => setProdContent(e.target.value)}
                    placeholder="e.g. Pack of 5"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="e.g. Colorful sky rocket for Diwali celebrations"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                />
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

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Image URL</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://example.com/images/sparklers.jpg"
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

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  disabled={prodIsSubmitting}
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={prodIsSubmitting}
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Category</label>
                  <select 
                    value={prodCategorySlug}
                    onChange={(e) => handleCategorySelectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    {categoriesList.map(c => <option key={c.id} value={c.slug}>{c.name} (/{c.slug})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">Packaging / Content</label>
                  <input 
                    type="text" 
                    value={prodContent}
                    onChange={(e) => setProdContent(e.target.value)}
                    placeholder="e.g. Pack of 5"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                />
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

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">Image URL</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    placeholder="https://example.com/images/sparklers.jpg"
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

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                <button 
                  type="button" 
                  disabled={prodIsSubmitting}
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={prodIsSubmitting}
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-black">{tProduct(viewingProduct.code, viewingProduct.name)}</h3>
                  {viewingProduct.featured && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>
                {isTamil && tProduct(viewingProduct.code, viewingProduct.name) !== viewingProduct.name && (
                  <p className="text-xs text-slate-500 font-normal mt-0.5">{viewingProduct.name}</p>
                )}
                <p className="text-xs text-black font-mono mt-0.5">{viewingProduct.code}</p>
              </div>
              <button onClick={() => setViewingProduct(null)} className="p-1 text-black hover:text-black rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
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

              {viewingProduct.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {viewingProduct.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-black uppercase">Selling Price</p>
                  <p className="text-xl font-extrabold text-black">₹{viewingProduct.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase">MRP (Actual Price)</p>
                  <p className="text-lg font-bold text-black line-through">₹{viewingProduct.actualPrice}</p>
                </div>
                {viewingProduct.actualPrice > viewingProduct.sellingPrice && (
                  <div className="col-span-2 pt-2 border-t border-gray-200 flex justify-between text-xs font-bold text-green-700">
                    <span>Discount Offer:</span>
                    <span>Save ₹{viewingProduct.actualPrice - viewingProduct.sellingPrice} ({viewingProduct.discount || Math.round(((viewingProduct.actualPrice - viewingProduct.sellingPrice) / viewingProduct.actualPrice) * 100)}% OFF)</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">Category:</span>
                  <span className="font-bold text-black">{tCategory(viewingProduct.categorySlug, viewingProduct.category)}</span>
                </div>
                {viewingProduct.content && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-black">Package / Content:</span>
                    <span className="font-bold text-black">{viewingProduct.content}</span>
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
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-black">Delete Product?</h3>
            <p className="text-base text-black font-medium">
              Are you sure you want to delete <span className="font-bold text-black">"{deletingProduct.name}"</span>? This will remove it from the catalog.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button 
                type="button" 
                disabled={prodIsSubmitting}
                onClick={() => setDeletingProduct(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={prodIsSubmitting}
                onClick={handleConfirmDeleteProduct}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {catNotification && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between shadow-md transition-all ${
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
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("Product Categories")}</h2>
              <p className="text-xs font-medium text-black">{t("Organize fireworks catalog into structured store categories")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {categoriesList.length} {t("categories")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input 
                type="text" 
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder={t("Search category or slug...")} 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {categorySearch && (
                <button onClick={() => setCategorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Refresh from API Button */}
            <button
              onClick={loadCategoriesFromApi}
              disabled={isCategoriesLoading}
              title="Reload categories from localhost:3007/api/categories"
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw size={14} className={isCategoriesLoading ? "animate-spin text-blue-600" : ""} />
              <span>{isCategoriesLoading ? "Syncing..." : "Refresh"}</span>
            </button>

            {/* Add Category Button */}
            <button 
              onClick={handleOpenAddCategory} 
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t("Add Category")}</span>
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
                              <span className="font-extrabold text-sm text-black">{tCategory(c.slug, c.name)}</span>
                              {typeof c.id === "string" && (
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={`ID: ${c.id}`}>
                                  {c.id.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                            {isTamil && tCategory(c.slug, c.name) !== c.name && (
                              <div className="text-[11px] text-slate-500 font-normal mt-0.5">{c.name}</div>
                            )}
                            {c.description && (
                              <div className="text-xs text-slate-500 font-normal line-clamp-1 max-w-xs">{c.description}</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Add New Category</h3>
                <p className="text-xs text-blue-600 font-mono mt-0.5">POST http://localhost:3007/api/categories</p>
              </div>
              <button onClick={() => setIsAddCategoryOpen(false)} className="p-1 text-black hover:text-black rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddCategory} className="p-6 space-y-4">
              {catError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{catError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Name *</label>
                <input 
                  type="text" 
                  required 
                  value={catName}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="e.g. Sparklers"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Slug</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-black font-bold font-mono">/</span>
                  <input 
                    type="text" 
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="sparklers"
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <p className="text-xs text-black mt-1 font-medium">Auto-generated slug used in store URLs and API</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Explore our collection of high-quality sparklers for festive celebrations."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Image URL</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://example.com/images/sparklers.jpg"
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

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  disabled={catIsSubmitting}
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={catIsSubmitting}
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">Edit Category</h3>
              <button onClick={() => setEditingCategory(null)} className="p-1 text-black hover:text-black rounded-lg cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Name *</label>
                <input 
                  type="text" 
                  required 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Category Slug</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-black font-bold font-mono">/</span>
                  <input 
                    type="text" 
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category description..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">Image URL</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="url" 
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
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

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-black">Delete Category?</h3>
            <p className="text-base text-black font-medium">
              Are you sure you want to delete <span className="font-bold text-black">"{deletingCategory.name}"</span>? This will remove it from category selections across your catalog.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button 
                onClick={() => setDeletingCategory(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteCategory}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Orders Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("Order Management")}</h2>
              <p className="text-xs font-medium text-black">{t("Track customer purchases, fulfillment status, and invoice summaries")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {filteredOrders.length} {t("orders")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input 
                type="text" 
                value={orderSearch}
                onChange={(e) => { setOrderSearch(e.target.value); setOrderCurrentPage(1); }}
                placeholder={t("Search order, customer or phone...")} 
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {orderSearch && (
                <button onClick={() => { setOrderSearch(""); setOrderCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Order Status Select */}
            <div className="relative min-w-[150px]">
              <select 
                value={orderStatusFilter}
                onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer transition-all"
              >
                <option value="All">{t("All Order Statuses")}</option>
                <option value="Pending">{t("Pending")}</option>
                <option value="Processing">{t("Processing")}</option>
                <option value="Confirmed">{t("Confirmed")}</option>
                <option value="Shipped">{t("Shipped")}</option>
                <option value="Delivered">{t("Delivered")}</option>
                <option value="Cancelled">{t("Cancelled")}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>

            {/* Payment Status Select */}
            <div className="relative min-w-[150px]">
              <select 
                value={paymentStatusFilter}
                onChange={(e) => { setPaymentStatusFilter(e.target.value); setOrderCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none cursor-pointer transition-all"
              >
                <option value="All">{t("All Payment Statuses")}</option>
                <option value="Paid">{t("Paid")}</option>
                <option value="Pending">{t("Pending")}</option>
                <option value="Failed">{t("Failed")}</option>
                <option value="Refunded">{t("Refunded")}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                <th className="py-3.5 px-5">{t("Order")} ID</th>
                <th className="py-3.5 px-5">{t("Customer")}</th>
                <th className="py-3.5 px-5 text-center">{t("items")}</th>
                <th className="py-3.5 px-5">{t("Total")}</th>
                <th className="py-3.5 px-5">{t("Payment Method")}</th>
                <th className="py-3.5 px-5">{t("Status")}</th>
                <th className="py-3.5 px-5">{t("Date")}</th>
                <th className="py-3.5 px-5 text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <ShoppingCart size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">No orders found</h3>
                      <p className="text-xs text-black">
                        No orders match your filter criteria or search. Try clearing filters or searching for another customer name.
                      </p>
                      <button 
                        onClick={() => { setOrderSearch(""); setOrderStatusFilter("All"); setPaymentStatusFilter("All"); setOrderCurrentPage(1); }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        Clear Order Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-extrabold text-xs text-blue-600">{o.id}</td>
                    <td className="py-3.5 px-5">
                      <p className="font-extrabold text-sm text-black leading-tight">{o.customer}</p>
                      <p className="text-[11px] text-black font-mono mt-0.5">{o.phone}</p>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-black text-xs font-bold rounded-full border border-slate-200">
                        {o.count}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-extrabold text-sm text-black">₹{o.total}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        o.payment === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        o.payment === 'Failed' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {t(o.payment)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="relative inline-block">
                        <select 
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order["status"])}
                          className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${
                            o.status === 'Processing' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            o.status === 'Pending' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                            o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            o.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <option value="Pending">{t("Pending")}</option>
                          <option value="Processing">{t("Processing")}</option>
                          <option value="Confirmed">{t("Confirmed")}</option>
                          <option value="Shipped">{t("Shipped")}</option>
                          <option value="Delivered">{t("Delivered")}</option>
                          <option value="Cancelled">{t("Cancelled")}</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-black text-xs font-medium">{o.date}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl border border-blue-200 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>{t("View Details")}</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Results Counter & Pagination Footer */}
        {filteredOrders.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-bold text-black">
              {t("Showing")} <span className="text-black">{(orderCurrentPage - 1) * ordersPerPage + 1}</span> {t("to")} <span className="text-black">{Math.min(orderCurrentPage * ordersPerPage, filteredOrders.length)}</span> {t("of")} <span className="text-black">{filteredOrders.length}</span> {t("orders")}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={orderCurrentPage === 1}
                onClick={() => setOrderCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-300 rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-1 text-black"
              >
                <ChevronLeft size={16} />
                <span>{t("Prev")}</span>
              </button>
              {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setOrderCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${orderCurrentPage === page ? "bg-[#0000FF] text-white shadow-xs" : "border border-gray-300 bg-white hover:bg-gray-100 text-black"}`}
                >
                  {page}
                </button>
              ))}
              <button 
                disabled={orderCurrentPage === totalOrderPages}
                onClick={() => setOrderCurrentPage(p => Math.min(p + 1, totalOrderPages))}
                className="p-2 border border-gray-300 rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-1 text-black"
              >
                <span>{t("Next")}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Order Details Modal ────────────────────────────────────────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
            {/* Modal Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-extrabold text-black">Order #{selectedOrder.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedOrder.status === 'Processing' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                    selectedOrder.status === 'Pending' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    selectedOrder.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                    selectedOrder.status === 'Delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                    selectedOrder.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-black">Placed on {selectedOrder.date} • Last updated: {selectedOrder.updatedAt}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* PDF Extract Button */}
                <button 
                  onClick={() => handleExportPDF(selectedOrder)}
                  className="px-4 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Printer size={18} />
                  <span>Download Summary PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-black hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 admin-scroll flex-1">
              {/* Quick Status Update Bar */}
              <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0000FF] text-white rounded-lg">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">Update Order & Payment Status</p>
                    <p className="text-xs text-black font-medium">Changes take effect live across the dashboard</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Change Order Status */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-black uppercase">Status:</label>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as Order["status"])}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Change Payment Status */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-black uppercase">Payment:</label>
                    <select 
                      value={selectedOrder.payment}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as Order["payment"])}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] outline-none cursor-pointer"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#0000FF] font-bold text-sm uppercase tracking-wider">
                    <User size={18} />
                    <span>{t("Customer Information")}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-black">{selectedOrder.customer}</p>
                    <p className="text-sm font-semibold text-black flex items-center gap-2 mt-1">
                      <Phone size={14} />
                      <span>{selectedOrder.phone}</span>
                    </p>
                    <p className="text-sm font-semibold text-black flex items-center gap-2 mt-1">
                      <FileText size={14} />
                      <span>{selectedOrder.email}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#0000FF] font-bold text-sm uppercase tracking-wider">
                    <MapPin size={18} />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-base font-semibold text-black leading-relaxed">
                    {selectedOrder.address}<br/>
                    {selectedOrder.city}, {selectedOrder.state} - <span className="font-bold">{selectedOrder.pincode}</span>
                  </p>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">Ordered Crackers Breakdown</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-black uppercase">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Item Code & Name</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-semibold text-black">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-black font-bold">{index + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-black">{tProduct(item.code, item.name)}</p>
                            {isTamil && tProduct(item.code, item.name) !== item.name && (
                              <p className="text-xs text-slate-500 font-normal">{item.name}</p>
                            )}
                            <p className="text-xs text-black font-mono">{item.code}</p>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{item.qty}</td>
                          <td className="py-3 px-4 text-right text-black">₹{item.unitPrice}</td>
                          <td className="py-3 px-4 text-right font-bold text-black">₹{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial & Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <CreditCard size={24} className="text-[#0000FF]" />
                  <div>
                    <p className="text-xs font-bold text-black uppercase">{t("Payment Method")}</p>
                    <p className="text-base font-bold text-black">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-black">
                    <span>{t("Items Subtotal")}</span>
                    <span className="text-black font-bold">₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-green-600">
                      <span>{t("Discount Applied")}</span>
                      <span className="font-bold">-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-black">
                    <span>{t("Delivery Charges")}</span>
                    <span className="text-black font-bold">₹{selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-300 flex justify-between items-center text-lg font-extrabold text-black">
                    <span>{t("Grand Total")}</span>
                    <span className="text-2xl text-[#0000FF]">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── Customer Queries View ───────────────────────────────────────────────────
  const renderQueries = () => (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Queries Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("Customer Queries")}</h2>
              <p className="text-xs font-medium text-slate-500">
                {t("Review customer inquiries and messages submitted from the store website")}
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {queriesList.length} {t("Queries")}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Live Search Input */}
            <div className="relative flex-1 md:w-72 min-w-[200px]">
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
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw size={14} className={isQueriesLoading ? "animate-spin text-blue-600" : ""} />
              <span>{isQueriesLoading ? "Syncing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Queries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
          <div className="p-4 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
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

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  {t("Mobile Number")}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{selectedQuery.mobileNumber}</span>
                  <a
                    href={`tel:${selectedQuery.mobileNumber}`}
                    className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                  >
                    <Phone size={12} /> Call
                  </a>
                  <a
                    href={`https://wa.me/91${selectedQuery.mobileNumber.replace(/\D/g, '')}?text=${encodeURIComponent("வணக்கம்! சாந்தி சிவகாசி பட்டாசுகள் சார்பாக உங்களைத் தொடர்பு கொள்கிறோம்.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare size={12} /> WhatsApp
                  </a>
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
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedQuery.message}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedQuery(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
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
      case "/admin/orders": return renderOrders();
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
    if (currentRoute === "/admin/orders") return { title: "Orders", sub: "Admin / Orders" };
    if (currentRoute === "/admin/queries") return { title: "Customer Queries", sub: "Admin / Queries" };
    return { title: "Admin Portal", sub: "Admin" };
  };

  const headers = getHeaderTitles();

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F4] font-manrope">
      <Sidebar />
      <div className={`flex-1 flex flex-col transition-all duration-300 lg:ml-72`}>
        <Header title={headers.title} subtitle={headers.sub} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}
