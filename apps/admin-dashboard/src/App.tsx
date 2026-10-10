import {
    ArrowDown,
    ArrowUp,
    ChevronDown,
    ChevronLeft, ChevronRight,
    CreditCard,
    Edit, Eye,
    FileText,
    ImageIcon,
    Layers,
    LayoutDashboard,
    ListTree,
    LogOut,
    MapPin,
    Menu,
    Package,
    Phone,
    Plus,
    Printer,
    Search,
    ShoppingCart,
    Trash2,
    Truck, User,
    X
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import "./App.css";
import { translate, type Language } from "./lib/i18n";

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
  id: number;
  name: string;
  slug: string;
  count: number;
  sort: number;
  status: "Active" | "Inactive";
}

export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  actualPrice: number;
  sellingPrice: number;
  stock: number;
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
  const [language, setLanguage] = useState<Language>(() =>
    window.localStorage.getItem("admin-language") === "ta" ? "ta" : "en",
  );
  const t = (key: string, values?: Record<string, string | number>) => translate(language, key, values);
  const statusLabel = (status: string) => t(`status.${status.toLowerCase()}`);

  useEffect(() => {
    window.localStorage.setItem("admin-language", language);
    document.documentElement.lang = language;
    document.title = translate(language, "app.title");
  }, [language]);

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
  const productsPerPage = 5;

  // Product Modals State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodCode, setProdCode] = useState("");
  const [prodCategory, setProdCategory] = useState("Fancy Crackers");
  const [prodActualPrice, setProdActualPrice] = useState<number>(0);
  const [prodSellingPrice, setProdSellingPrice] = useState<number>(0);
  const [prodStock, setProdStock] = useState<number>(10);
  const [prodStatus, setProdStatus] = useState<"Active" | "Inactive">("Active");

  const handleOpenAddProduct = () => {
    setProdName("");
    setProdCode("");
    setProdCategory(categoriesList[0]?.name || "Fancy Crackers");
    setProdActualPrice(500);
    setProdSellingPrice(399);
    setProdStock(20);
    setProdStatus("Active");
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCode(prod.code);
    setProdCategory(prod.category);
    setProdActualPrice(prod.actualPrice);
    setProdSellingPrice(prod.sellingPrice);
    setProdStock(prod.stock);
    setProdStatus(prod.status);
  };

  const handleSaveAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodCode.trim()) return;
    const newProd: Product = {
      id: Date.now(),
      code: prodCode.trim().toUpperCase(),
      name: prodName.trim(),
      category: prodCategory,
      actualPrice: Number(prodActualPrice) || 0,
      sellingPrice: Number(prodSellingPrice) || 0,
      stock: Number(prodStock) || 0,
      status: prodStatus,
      featured: false
    };
    setProductsList(prev => [newProd, ...prev]);
    setIsAddProductOpen(false);
  };

  const handleSaveEditProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !prodName.trim()) return;
    setProductsList(prev => prev.map(p => p.id === editingProduct.id ? {
      ...p,
      name: prodName.trim(),
      code: prodCode.trim().toUpperCase(),
      category: prodCategory,
      actualPrice: Number(prodActualPrice),
      sellingPrice: Number(prodSellingPrice),
      stock: Number(prodStock),
      status: prodStatus
    } : p));
    setEditingProduct(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProduct) return;
    setProductsList(prev => prev.filter(p => p.id !== deletingProduct.id));
    setDeletingProduct(null);
  };

  const handleToggleProductStatus = (id: number) => {
    setProductsList(prev => prev.map(p => p.id === id ? {
      ...p,
      status: p.status === "Active" ? "Inactive" : "Active"
    } : p));
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
  const [catSort, setCatSort] = useState<number>(1);
  const [catStatus, setCatStatus] = useState<"Active" | "Inactive">("Active");

  const handleOpenAddCategory = () => {
    setCatName("");
    setCatSlug("");
    setCatSort(categoriesList.length + 1);
    setCatStatus("Active");
    setIsAddCategoryOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatSort(cat.sort);
    setCatStatus(cat.status);
  };

  const handleCategoryNameChange = (val: string) => {
    setCatName(val);
    const autoSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setCatSlug(autoSlug);
  };

  const handleSaveAddCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const cleanSlug = catSlug.trim().replace(/^\//, '') || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat: Category = {
      id: Date.now(),
      name: catName.trim(),
      slug: cleanSlug,
      sort: Number(catSort) || categoriesList.length + 1,
      status: catStatus,
      count: 0
    };
    setCategoriesList(prev => [...prev, newCat]);
    setIsAddCategoryOpen(false);
  };

  const handleSaveEditCategory = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !catName.trim()) return;
    const cleanSlug = catSlug.trim().replace(/^\//, '') || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setCategoriesList(prev => prev.map(c => c.id === editingCategory.id ? {
      ...c,
      name: catName.trim(),
      slug: cleanSlug,
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

  const handleToggleCategoryStatus = (id: number) => {
    setCategoriesList(prev => prev.map(c => c.id === id ? {
      ...c,
      status: c.status === "Active" ? "Inactive" : "Active"
    } : c));
  };

  const handleMoveCategorySort = (id: number, direction: "up" | "down") => {
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

  const handleDirectSortChange = (id: number, newSort: number) => {
    const val = Math.max(1, Math.floor(newSort) || 1);
    setCategoriesList(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, sort: val } : { ...c });
      return updated.sort((a, b) => a.sort - b.sort);
    });
  };

  const getCategoryProductCount = (categoryName: string, fallbackCount: number) => {
    const matchedCount = productsList.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).length;
    return matchedCount > 0 ? matchedCount : fallbackCount;
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
          <div style="font-size: 12px; color: #64748b;">${t("invoice.code")} ${item.code}</div>
        </td>
        <td style="padding: 12px; text-align: center; font-weight: 600;">${item.qty}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">₹${item.unitPrice}</td>
        <td style="padding: 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${item.total}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${language}">
        <head>
          <title>${t("order.invoiceTitle", { id: order.id })}</title>
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
                <div class="brand">${t("app.brand")}</div>
                <div class="subbrand">${t("invoice.summary")}</div>
              </div>
              <div class="order-title">
                <div class="order-no">${order.id}</div>
                <div class="order-date">${t("invoice.date")} ${order.date}</div>
              </div>
            </div>

            <div class="grid-2">
              <div>
                <div class="block-title">${t("invoice.customerDelivery")}</div>
                <div class="info-p"><strong>${t("invoice.customer")}</strong> ${order.customer}</div>
                <div class="info-p"><strong>${t("invoice.phone")}</strong> ${order.phone}</div>
                <div class="info-p"><strong>${t("invoice.email")}</strong> ${order.email}</div>
                <div class="info-p"><strong>${t("invoice.address")}</strong> ${order.address}, ${order.city}, ${order.state} - ${order.pincode}</div>
              </div>
              <div>
                <div class="block-title">${t("invoice.paymentSummary")}</div>
                <div class="info-p"><strong>${t("invoice.paymentStatus")}</strong> ${statusLabel(order.payment)}</div>
                <div class="info-p"><strong>${t("invoice.paymentMode")}</strong> ${order.paymentMethod}</div>
                <div class="info-p"><strong>${t("invoice.orderStatus")}</strong> ${statusLabel(order.status)}</div>
                <div class="info-p"><strong>${t("invoice.lastUpdated")}</strong> ${order.updatedAt}</div>
              </div>
            </div>

            <div class="block-title">${t("invoice.itemsBreakdown")}</div>
            <table>
              <thead>
                <tr>
                  <th style="text-align: center; width: 40px;">#</th>
                  <th>${t("invoice.itemDescription")}</th>
                  <th style="text-align: center;">${t("invoice.quantity")}</th>
                  <th style="text-align: right;">${t("invoice.unitPrice")}</th>
                  <th style="text-align: right;">${t("invoice.total")}</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="totals">
              <div class="total-row"><span>${t("invoice.subtotal")}</span><span>₹${order.subtotal}</span></div>
              ${order.discount > 0 ? `<div class="total-row" style="color: #16a34a;"><span>${t("invoice.discount")}</span><span>-₹${order.discount}</span></div>` : ''}
              <div class="total-row"><span>${t("invoice.deliveryFee")}</span><span>₹${order.deliveryFee}</span></div>
              <div class="grand-total"><span>${t("invoice.grandTotal")}</span><span>₹${order.total}</span></div>
            </div>

            <div class="footer">
              ${t("invoice.thankYou")}<br/>
              ${t("invoice.generated")}
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
        <div className="fixed top-4 right-4 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm" role="group" aria-label={t("language.switch")}>
          <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === "en" ? "bg-[#0000FF] text-white" : "text-black hover:bg-gray-100"}`}>{t("language.english")}</button>
          <button type="button" onClick={() => setLanguage("ta")} aria-pressed={language === "ta"} className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === "ta" ? "bg-[#0000FF] text-white" : "text-black hover:bg-gray-100"}`}>{t("language.tamil")}</button>
        </div>
        <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt={t("app.logoAlt")} className="w-24 h-24 mx-auto mb-4 object-contain drop-shadow-md rounded-full" />
            <h1 className="text-3xl font-bold text-black mb-2">{t("app.brand")}</h1>
            <p className="text-lg text-black font-semibold">{t("login.manageStore")}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-center text-sm font-bold">
            {t("login.demo")}
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-bold text-black mb-2">{t("login.email")}</label>
              <input type="email" required onInvalid={(event) => event.currentTarget.setCustomValidity(event.currentTarget.validity.typeMismatch ? t("validation.email") : t("validation.required"))} onInput={(event) => event.currentTarget.setCustomValidity("")} defaultValue="admin@deepakart.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-lg font-medium" />
            </div>
            <div>
              <label className="block text-base font-bold text-black mb-2">{t("login.password")}</label>
              <input type="password" required onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))} onInput={(event) => event.currentTarget.setCustomValidity("")} defaultValue="password123" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0000FF] text-lg font-medium" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="w-5 h-5 text-[#0000FF] border-gray-300 rounded focus:ring-[#0000FF]" />
              <label htmlFor="remember" className="ml-3 block text-base font-semibold text-black">{t("login.remember")}</label>
            </div>
            <button type="submit" className="w-full py-4 bg-[#0000FF] text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-700 transition-colors">
              {t("login.submit")}
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
          <img src="/logo.jpg" alt={t("app.logoAlt")} className="w-12 h-12 object-contain rounded-full shadow-sm" />
          <div>
            <h2 className="font-bold text-lg text-black leading-tight">{t("app.brandShort")}</h2>
            <p className="text-sm font-semibold text-black">{t("nav.admin")}</p>
          </div>
        </div>
        <button aria-label={t("common.closeNavigation")} className="lg:hidden p-2 text-black" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-sm font-bold text-black uppercase tracking-wider mb-4">{t("common.workspace")}</p>
        <nav>
          <NavItem icon={LayoutDashboard} label={t("common.dashboard")} path="/admin" />
          <NavItem icon={Package} label={t("common.products")} path="/admin/products" />
          <NavItem icon={ListTree} label={t("common.categories")} path="/admin/categories" />
          <NavItem icon={ShoppingCart} label={t("common.orders")} path="/admin/orders" badge={24} />
        </nav>

        <div className="my-6 border-t border-gray-100"></div>
      </div>

      <div className="absolute bottom-0 w-full p-6 border-t border-gray-100 bg-white">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold text-lg hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={24} />
          <span>{t("common.logout")}</span>
        </button>
      </div>
    </aside>
  );

  const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-4">
        <button aria-label={t("common.openNavigation")} className="lg:hidden p-2 -ml-2 text-black hover:bg-slate-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-black leading-tight">{title}</h1>
          {subtitle && <p className="text-xs font-medium text-black">{subtitle}</p>}
        </div>
      </div>
      <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1" role="group" aria-label={t("language.switch")}>
        <button type="button" onClick={() => setLanguage("en")} aria-pressed={language === "en"} className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === "en" ? "bg-[#0000FF] text-white" : "text-black hover:bg-gray-100"}`}>{t("language.english")}</button>
        <button type="button" onClick={() => setLanguage("ta")} aria-pressed={language === "ta"} className={`px-3 py-1.5 rounded-md text-sm font-bold ${language === "ta" ? "bg-[#0000FF] text-white" : "text-black hover:bg-gray-100"}`}>{t("language.tamil")}</button>
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
            <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-200 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/30">
              <span>{t("dashboard.panel")}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">{t("dashboard.overview")}</h2>
            <p className="text-blue-100 text-base font-medium leading-relaxed">
              {t("dashboard.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 z-10">
            <button onClick={() => navigate("/admin/products")} className="px-5 py-2.5 bg-white text-[#0000FF] hover:bg-blue-50 font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Package size={18} />
              <span>{t("dashboard.manageCatalog")}</span>
            </button>
            <button onClick={() => navigate("/admin/orders")} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <ShoppingCart size={18} />
              <span>{t("dashboard.viewOrders")}</span>
            </button>
          </div>
        </div>
        
        {/* Dynamic Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: t("dashboard.totalProducts"), value: totalProductsCount.toString(), sub: t("dashboard.catalog"), bg: "bg-white" },
            { label: t("dashboard.activeProducts"), value: activeProductsCount.toString(), sub: t("dashboard.visibleCustomers"), bg: "bg-white" },
            { label: t("dashboard.totalOrders"), value: totalOrdersCount.toString(), sub: t("dashboard.allTimeOrders"), bg: "bg-white" },
            { label: t("dashboard.pendingOrders"), value: pendingOrdersCount.toString(), sub: t("dashboard.requiresProcessing"), bg: "bg-yellow-50 border-yellow-200" },
            { label: t("dashboard.salesRevenue"), value: `₹${totalSalesRevenue.toLocaleString('en-IN')}`, sub: t("dashboard.fromPaidOrders"), bg: "bg-green-50 border-green-200" },
            { label: t("dashboard.outOfStock"), value: outOfStockCount.toString(), sub: t("dashboard.restock"), bg: "bg-red-50 border-red-200" }
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
                <h2 className="text-xl font-bold text-black">{t("dashboard.recentOrders")}</h2>
                <p className="text-base font-semibold text-black">{t("dashboard.latestActivity")}</p>
              </div>
              <button onClick={() => navigate("/admin/orders")} className="text-[#0000FF] font-bold text-base hover:underline cursor-pointer">{t("dashboard.viewAllOrders")}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-sm font-bold text-black uppercase">
                    <th className="pb-3 px-2">{t("order.id")}</th>
                    <th className="pb-3 px-2">{t("dashboard.customer")}</th>
                    <th className="pb-3 px-2">{t("common.total")}</th>
                    <th className="pb-3 px-2">{t("common.status")}</th>
                    <th className="pb-3 px-2">{t("common.date")}</th>
                    <th className="pb-3 px-2 text-right">{t("dashboard.action")}</th>
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
                        }`}>{statusLabel(o.status)}</span>
                      </td>
                      <td className="py-4 px-2 text-black text-sm">{o.date}</td>
                      <td className="py-4 px-2 text-right text-[#0000FF] font-bold text-sm">{t("dashboard.view")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-black">{t("dashboard.lowStockProducts")}</h2>
              <button onClick={() => navigate("/admin/products")} className="text-[#0000FF] font-bold text-base hover:underline cursor-pointer">{t("dashboard.manage")}</button>
            </div>
            <div className="space-y-4">
              {productsList.filter((p: Product) => p.stock < 10).length === 0 ? (
                <div className="p-4 text-center text-black font-semibold text-sm">
                  {t("dashboard.wellStocked")}
                </div>
              ) : (
                productsList.filter((p: Product) => p.stock < 10).slice(0, 5).map((p: Product) => (
                  <div 
                    key={p.id} 
                    onClick={() => { setProductSearch(p.name); navigate("/admin/products"); }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-black text-base">{p.name}</p>
                      <p className="text-xs font-mono text-black">{p.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base text-black">{p.stock} {t("stock.pieces")}</p>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${p.stock === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'}`}>
                        {p.stock === 0 ? t("stock.out") : t("stock.low")}
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
      {/* Products Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("product.catalog")}</h2>
              <p className="text-xs font-medium text-black">{t("product.description")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {t("common.itemCount", { count: filteredProducts.length })}
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
                placeholder={t("product.search")}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {productSearch && (
                <button aria-label={t("common.clearSearch")} onClick={() => { setProductSearch(""); setProductCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
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
                <option value="All">{t("product.allCategories")}</option>
                {categoriesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
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
                <option value="All">{t("product.allStatuses")}</option>
                <option value="Active">{statusLabel("Active")}</option>
                <option value="Inactive">{statusLabel("Inactive")}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>

            {/* Add Product Button */}
            <button 
              onClick={handleOpenAddProduct} 
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t("product.add")}</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                <th className="py-3.5 px-5">{t("product.details")}</th>
                <th className="py-3.5 px-5">{t("common.category")}</th>
                <th className="py-3.5 px-5">{t("product.pricing")}</th>
                <th className="py-3.5 px-5">{t("product.stockLevel")}</th>
                <th className="py-3.5 px-5">{t("common.status")}</th>
                <th className="py-3.5 px-5 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Package size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">{t("product.noResults")}</h3>
                      <p className="text-xs text-black">
                        {t("product.noResultsDescription")}
                      </p>
                      <button 
                        onClick={() => { setProductSearch(""); setProductCategoryFilter("All"); setProductStatusFilter("All"); setProductCurrentPage(1); }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        {t("product.clearFilters")}
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
                          <div className={`w-11 h-11 rounded-xl flex flex-shrink-0 items-center justify-center font-bold text-xs border ${categoryBadgeColor}`}>
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-black leading-tight">{p.name}</p>
                            <p className="text-[11px] text-black font-mono tracking-wide mt-0.5">{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryBadgeColor}`}>
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm text-black">₹{p.sellingPrice}</span>
                          {p.actualPrice > p.sellingPrice && (
                            <span className="text-[11px] text-black line-through">₹{p.actualPrice}</span>
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
                          <span>{p.stock === 0 ? t("stock.out") : p.stock < 10 ? t("stock.lowCount", { count: p.stock }) : t("stock.inCount", { count: p.stock })}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <button
                          onClick={() => handleToggleProductStatus(p.id)}
                          title={t("product.toggleVisibility")}
                          className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            p.status === "Active" 
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                              : "text-black bg-slate-100 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${p.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          <span>{statusLabel(p.status)}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setViewingProduct(p)}
                            title={t("product.viewOverview")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditProduct(p)}
                            title={t("product.editDetails")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingProduct(p)}
                            title={t("product.deleteAction")}
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
              {t("common.showingRange", { start: (productCurrentPage - 1) * productsPerPage + 1, end: Math.min(productCurrentPage * productsPerPage, filteredProducts.length), count: filteredProducts.length, items: t("common.items") })}
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                disabled={productCurrentPage === 1}
                onClick={() => setProductCurrentPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>{t("common.prev")}</span>
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
                <span>{t("common.next")}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Product Modal ─────────────────────────────────────────────────── */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">{t("product.addTitle")}</h3>
              <button aria-label={t("common.closeDialog")} onClick={() => setIsAddProductOpen(false)} className="p-1 text-black hover:text-black rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.name")} *</label>
                  <input 
                    type="text" 
                    required
                    onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                    onInput={(event) => event.currentTarget.setCustomValidity("")}
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder={t("product.nameExample")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.code")} *</label>
                  <input 
                    type="text" 
                    required
                    onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                    onInput={(event) => event.currentTarget.setCustomValidity("")}
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder={t("product.codeExample")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-mono font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">{t("common.category")}</label>
                <select 
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                >
                  {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.actualPrice")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodActualPrice}
                    onChange={(e) => setProdActualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.sellingPrice")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodSellingPrice}
                    onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.stockQuantity")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("common.status")}</label>
                  <select 
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">{statusLabel("Active")}</option>
                    <option value="Inactive">{statusLabel("Inactive")}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                >
                  {t("product.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ────────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">{t("product.editTitle")}</h3>
              <button aria-label={t("common.closeDialog")} onClick={() => setEditingProduct(null)} className="p-1 text-black hover:text-black rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.name")} *</label>
                  <input 
                    type="text" 
                    required
                    onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                    onInput={(event) => event.currentTarget.setCustomValidity("")}
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.code")} *</label>
                  <input 
                    type="text" 
                    required
                    onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                    onInput={(event) => event.currentTarget.setCustomValidity("")}
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-mono font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black uppercase mb-1">{t("common.category")}</label>
                <select 
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                >
                  {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.actualPrice")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodActualPrice}
                    onChange={(e) => setProdActualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.sellingPrice")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodSellingPrice}
                    onChange={(e) => setProdSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("product.stockQuantity")}</label>
                  <input 
                    type="number" 
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1">{t("common.status")}</label>
                  <select 
                    value={prodStatus}
                    onChange={(e) => setProdStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold text-black focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">{statusLabel("Active")}</option>
                    <option value="Inactive">{statusLabel("Inactive")}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                >
                  {t("product.update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Product Details Modal ────────────────────────────────────────── */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-black">{viewingProduct.name}</h3>
                <p className="text-xs text-black font-mono">{viewingProduct.code}</p>
              </div>
              <button aria-label={t("common.closeDialog")} onClick={() => setViewingProduct(null)} className="p-1 text-black hover:text-black rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="w-full h-36 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-black">
                <ImageIcon size={48} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-bold text-black uppercase">{t("product.sellingPrice")}</p>
                  <p className="text-xl font-extrabold text-black">₹{viewingProduct.sellingPrice}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase">{t("product.mrp")}</p>
                  <p className="text-lg font-bold text-black line-through">₹{viewingProduct.actualPrice}</p>
                </div>
                {viewingProduct.actualPrice > viewingProduct.sellingPrice && (
                  <div className="col-span-2 pt-2 border-t border-gray-200 flex justify-between text-xs font-bold text-green-700">
                    <span>{t("product.discountOffer")}</span>
                    <span>{t("product.saveAmount", { amount: viewingProduct.actualPrice - viewingProduct.sellingPrice, percent: Math.round(((viewingProduct.actualPrice - viewingProduct.sellingPrice) / viewingProduct.actualPrice) * 100) })}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm font-semibold">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">{t("common.category")}:</span>
                  <span className="font-bold text-black">{viewingProduct.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">{t("product.stockQuantity")}:</span>
                  <span className="font-bold text-black">{viewingProduct.stock} {t("product.units")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-black">{t("product.availability")}</span>
                  <span className={`font-bold ${viewingProduct.stock === 0 ? 'text-red-600' : viewingProduct.stock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {viewingProduct.stock === 0 ? t("stock.out") : viewingProduct.stock < 10 ? t("stock.low") : t("stock.in")}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-black">{t("product.catalogStatus")}</span>
                  <span className={`font-bold ${viewingProduct.status === 'Active' ? 'text-green-600' : 'text-black'}`}>{statusLabel(viewingProduct.status)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => setViewingProduct(null)}
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  {t("product.closeOverview")}
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
            <h3 className="text-xl font-bold text-black">{t("product.deleteTitle")}</h3>
            <p className="text-base text-black font-medium">
              {t("product.deleteConfirm", { name: deletingProduct.name })}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button 
                onClick={() => setDeletingProduct(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={handleConfirmDeleteProduct}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
              >
                {t("product.deleteAction")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCategories = () => (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Categories Unified Single Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Card Header & Filter Bar */}
        <div className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("category.title")}</h2>
              <p className="text-xs font-medium text-black">{t("category.description")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {t("common.categoryCount", { count: categoriesList.length })}
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
                placeholder={t("category.search")}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {categorySearch && (
                <button aria-label={t("common.clearSearch")} onClick={() => setCategorySearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Add Category Button */}
            <button 
              onClick={handleOpenAddCategory} 
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} />
              <span>{t("category.add")}</span>
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200/80">
              <tr className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                <th className="py-3.5 px-5">{t("category.name")}</th>
                <th className="py-3.5 px-5">{t("category.slug")}</th>
                <th className="py-3.5 px-5 text-center">{t("category.productCount")}</th>
                <th className="py-3.5 px-5 text-center">{t("category.sortOrder")}</th>
                <th className="py-3.5 px-5 text-center">{t("common.status")}</th>
                <th className="py-3.5 px-5 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <Layers size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">{t("category.noResults")}</h3>
                      <p className="text-xs text-black font-medium">{t("category.noResultsDescription")}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c, index) => {
                  const count = getCategoryProductCount(c.name, c.count);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-extrabold text-sm text-black">{c.name}</td>
                      <td className="py-3.5 px-5 text-black font-mono text-xs">/{c.slug}</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="px-2.5 py-0.5 bg-slate-100 text-black text-xs font-bold rounded-full border border-slate-200">
                          {t("common.productCount", { count })}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100/80 px-1.5 py-0.5 rounded-lg border border-slate-200">
                          <button 
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveCategorySort(c.id, "up")} 
                            title={t("category.moveUp")}
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
                            title={t("category.sortDirect")}
                          />
                          <button 
                            type="button"
                            disabled={index === filteredCategories.length - 1}
                            onClick={() => handleMoveCategorySort(c.id, "down")} 
                            title={t("category.moveDown")}
                            className="p-1 text-black hover:text-black hover:bg-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <button
                          onClick={() => handleToggleCategoryStatus(c.id)}
                          title={t("category.toggleStatus")}
                          className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                            c.status === "Active" 
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" 
                              : "text-black bg-slate-100 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-500" : "bg-slate-400"}`}></span>
                          <span>{statusLabel(c.status)}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditCategory(c)}
                            title={t("category.editAction")}
                            className="p-1.5 text-black hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => setDeletingCategory(c)}
                            title={t("category.deleteAction")}
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">{t("category.addTitle")}</h3>
              <button aria-label={t("common.closeDialog")} onClick={() => setIsAddCategoryOpen(false)} className="p-1 text-black hover:text-black rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">{t("category.name")} *</label>
                <input 
                  type="text" 
                  required
                  onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  value={catName}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder={t("category.nameExample")}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">{t("category.slugName")}</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-black font-bold font-mono">/</span>
                  <input 
                    type="text" 
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder={t("category.slugExample")}
                    className="w-full pl-7 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>
                <p className="text-xs text-black mt-1 font-medium">{t("category.slugDescription")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">{t("category.sortOrder")}</label>
                  <input 
                    type="number" 
                    min={1}
                    value={catSort}
                    onChange={(e) => setCatSort(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1">{t("common.status")}</label>
                  <select 
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">{statusLabel("Active")}</option>
                    <option value="Inactive">{statusLabel("Inactive")}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                >
                  {t("category.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ────────────────────────────────────────────────── */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-black">{t("category.updateTitle")}</h3>
              <button aria-label={t("common.closeDialog")} onClick={() => setEditingCategory(null)} className="p-1 text-black hover:text-black rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEditCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-1">{t("category.name")} *</label>
                <input 
                  type="text" 
                  required
                  onInvalid={(event) => event.currentTarget.setCustomValidity(t("validation.required"))}
                  onInput={(event) => event.currentTarget.setCustomValidity("")}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-1">{t("category.slugName")}</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-black mb-1">{t("category.sortOrder")}</label>
                  <input 
                    type="number" 
                    min={1}
                    value={catSort}
                    onChange={(e) => setCatSort(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black mb-1">{t("common.status")}</label>
                  <select 
                    value={catStatus}
                    onChange={(e) => setCatStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-base font-bold focus:ring-2 focus:ring-[#0000FF] focus:bg-white outline-none cursor-pointer"
                  >
                    <option value="Active">{statusLabel("Active")}</option>
                    <option value="Inactive">{statusLabel("Inactive")}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingCategory(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
                >
                  {t("category.update")}
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
            <h3 className="text-xl font-bold text-black">{t("category.deleteTitle")}</h3>
            <p className="text-base text-black font-medium">
              {t("category.deleteConfirm", { name: deletingCategory.name })}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button 
                onClick={() => setDeletingCategory(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black font-bold text-sm rounded-lg transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button 
                onClick={handleConfirmDeleteCategory}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors"
              >
                {t("category.deleteAction")}
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
              <h2 className="text-lg font-extrabold text-black leading-tight">{t("order.title")}</h2>
              <p className="text-xs font-medium text-black">{t("order.description")}</p>
            </div>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {t("common.orderCount", { count: filteredOrders.length })}
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
                placeholder={t("order.search")}
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-black placeholder:text-black"
              />
              {orderSearch && (
                <button aria-label={t("common.clearSearch")} onClick={() => { setOrderSearch(""); setOrderCurrentPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black hover:text-black">
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
                <option value="All">{t("order.allStatuses")}</option>
                <option value="Pending">{statusLabel("Pending")}</option>
                <option value="Processing">{statusLabel("Processing")}</option>
                <option value="Confirmed">{statusLabel("Confirmed")}</option>
                <option value="Shipped">{statusLabel("Shipped")}</option>
                <option value="Delivered">{statusLabel("Delivered")}</option>
                <option value="Cancelled">{statusLabel("Cancelled")}</option>
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
                <option value="All">{t("order.allPayments")}</option>
                <option value="Paid">{statusLabel("Paid")}</option>
                <option value="Pending">{statusLabel("Pending")}</option>
                <option value="Failed">{statusLabel("Failed")}</option>
                <option value="Refunded">{statusLabel("Refunded")}</option>
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
                <th className="py-3.5 px-5">{t("order.id")}</th>
                <th className="py-3.5 px-5">{t("order.customerPhone")}</th>
                <th className="py-3.5 px-5 text-center">{t("order.items")}</th>
                <th className="py-3.5 px-5">{t("common.total")}</th>
                <th className="py-3.5 px-5">{t("common.payment")}</th>
                <th className="py-3.5 px-5">{t("order.fulfillment")}</th>
                <th className="py-3.5 px-5">{t("common.date")}</th>
                <th className="py-3.5 px-5 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-black divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-2">
                      <ShoppingCart size={40} className="mx-auto text-black" />
                      <h3 className="text-base font-bold text-black">{t("order.noResults")}</h3>
                      <p className="text-xs text-black">
                        {t("order.noResultsDescription")}
                      </p>
                      <button 
                        onClick={() => { setOrderSearch(""); setOrderStatusFilter("All"); setPaymentStatusFilter("All"); setOrderCurrentPage(1); }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs rounded-lg transition-colors inline-block cursor-pointer"
                      >
                        {t("order.clearFilters")}
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
                        {statusLabel(o.payment)}
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
                          <option value="Pending">{statusLabel("Pending")}</option>
                          <option value="Processing">{statusLabel("Processing")}</option>
                          <option value="Confirmed">{statusLabel("Confirmed")}</option>
                          <option value="Shipped">{statusLabel("Shipped")}</option>
                          <option value="Delivered">{statusLabel("Delivered")}</option>
                          <option value="Cancelled">{statusLabel("Cancelled")}</option>
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
                        <span>{t("order.viewDetails")}</span>
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
              {t("common.showingRange", { start: (orderCurrentPage - 1) * ordersPerPage + 1, end: Math.min(orderCurrentPage * ordersPerPage, filteredOrders.length), count: filteredOrders.length, items: t("common.ordersCount") })}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={orderCurrentPage === 1}
                onClick={() => setOrderCurrentPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-gray-300 rounded-lg text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition-colors flex items-center gap-1 text-black"
              >
                <ChevronLeft size={16} />
                <span>{t("common.prev")}</span>
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
                <span>{t("common.next")}</span>
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
                  <h3 className="text-2xl font-extrabold text-black">{t("order.detailsTitle", { id: selectedOrder.id })}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedOrder.status === 'Processing' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' :
                    selectedOrder.status === 'Pending' ? 'bg-orange-50 text-orange-800 border-orange-200' :
                    selectedOrder.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                    selectedOrder.status === 'Delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                    selectedOrder.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-green-50 text-green-800 border-green-200'
                  }`}>
                    {statusLabel(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-black">{t("order.placedOn", { date: selectedOrder.date, updatedAt: selectedOrder.updatedAt })}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* PDF Extract Button */}
                <button 
                  onClick={() => handleExportPDF(selectedOrder)}
                  className="px-4 py-2.5 bg-[#0000FF] hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Printer size={18} />
                  <span>{t("order.downloadPdf")}</span>
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  aria-label={t("common.closeDialog")}
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
                    <p className="text-sm font-bold text-black">{t("order.updateStatus")}</p>
                    <p className="text-xs text-black font-medium">{t("order.liveChanges")}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Change Order Status */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-black uppercase">{t("common.status")}:</label>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as Order["status"])}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] outline-none cursor-pointer"
                    >
                      <option value="Pending">{statusLabel("Pending")}</option>
                      <option value="Processing">{statusLabel("Processing")}</option>
                      <option value="Confirmed">{statusLabel("Confirmed")}</option>
                      <option value="Shipped">{statusLabel("Shipped")}</option>
                      <option value="Delivered">{statusLabel("Delivered")}</option>
                      <option value="Cancelled">{statusLabel("Cancelled")}</option>
                    </select>
                  </div>

                  {/* Change Payment Status */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-black uppercase">{t("common.payment")}:</label>
                    <select 
                      value={selectedOrder.payment}
                      onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as Order["payment"])}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-black focus:ring-2 focus:ring-[#0000FF] outline-none cursor-pointer"
                    >
                      <option value="Paid">{statusLabel("Paid")}</option>
                      <option value="Pending">{statusLabel("Pending")}</option>
                      <option value="Failed">{statusLabel("Failed")}</option>
                      <option value="Refunded">{statusLabel("Refunded")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#0000FF] font-bold text-sm uppercase tracking-wider">
                    <User size={18} />
                    <span>{t("order.customerInfo")}</span>
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
                    <span>{t("order.deliveryAddress")}</span>
                  </div>
                  <p className="text-base font-semibold text-black leading-relaxed">
                    {selectedOrder.address}<br/>
                    {selectedOrder.city}, {selectedOrder.state} - <span className="font-bold">{selectedOrder.pincode}</span>
                  </p>
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-black">{t("order.itemsBreakdown")}</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-black uppercase">
                      <tr>
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">{t("order.itemCodeName")}</th>
                        <th className="py-3 px-4 text-center">{t("order.quantity")}</th>
                        <th className="py-3 px-4 text-right">{t("order.unitPrice")}</th>
                        <th className="py-3 px-4 text-right">{t("order.totalPrice")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm font-semibold text-black">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-black font-bold">{index + 1}</td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-black">{item.name}</p>
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
                    <p className="text-xs font-bold text-black uppercase">{t("order.paymentMethod")}</p>
                    <p className="text-base font-bold text-black">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>

                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-black">
                    <span>{t("order.itemsSubtotal")}</span>
                    <span className="text-black font-bold">₹{selectedOrder.subtotal}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm font-semibold text-green-600">
                      <span>{t("order.discountApplied")}</span>
                      <span className="font-bold">-₹{selectedOrder.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-black">
                    <span>{t("order.deliveryCharges")}</span>
                    <span className="text-black font-bold">₹{selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-300 flex justify-between items-center text-lg font-extrabold text-black">
                    <span>{t("order.grandTotal")}</span>
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
                {t("order.closeWindow")}
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
      default: return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">{t("route.comingSoon")}</h2>
            <p className="text-lg font-semibold text-black">{t("route.prototype")}</p>
          </div>
        </div>
      );
    }
  };

  const getHeaderTitles = () => {
    if (currentRoute === "/admin") return { title: t("common.dashboard"), sub: t("common.dashboard") };
    if (currentRoute === "/admin/products") return { title: t("common.products"), sub: `${t("nav.admin")} / ${t("common.products")}` };
    if (currentRoute === "/admin/categories") return { title: t("common.categories"), sub: `${t("nav.admin")} / ${t("common.categories")}` };
    if (currentRoute === "/admin/orders") return { title: t("common.orders"), sub: `${t("nav.admin")} / ${t("common.orders")}` };
    return { title: t("header.adminPortal"), sub: t("nav.admin") };
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
