import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import {
  getTranslatedProductName,
  getTranslatedCategoryName,
  type SupportedLanguage,
} from "@repo/crackers";

export type Language = SupportedLanguage;

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tProduct: (codeOrName?: string | null, fallback?: string) => string;
  tCategory: (slugOrName?: string | null, fallback?: string) => string;
  isTamil: boolean;
}

const ADMIN_DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    "Dashboard": "Dashboard",
    "Products": "Products",
    "Categories": "Categories",
    "Orders": "Orders",
    "Queries": "Queries",
    "Customer Queries": "Customer Queries",
    "Log out": "Log out",
    "Santhi Crackers Admin": "Santhi Crackers Admin",
    "Shanthi Sivakasi Crackers Panel": "Shanthi Sivakasi Crackers Panel",
    "Store Executive Overview": "Store Executive Overview",
    "Real-time metrics, live inventory monitoring, and customer order management for Shanthi Sivakasi Crackers.": "Real-time metrics, live inventory monitoring, and customer order management for Shanthi Sivakasi Crackers.",
    "Manage Catalog": "Manage Catalog",
    "View Orders": "View Orders",
    "Total Products": "Total Products",
    "Active Products": "Active Products",
    "Total Orders": "Total Orders",
    "Pending Orders": "Pending Orders",
    "Total Sales Revenue": "Total Sales Revenue",
    "Out of Stock": "Out of Stock",
    "Recent orders": "Recent orders",
    "The latest activity from your store": "The latest activity from your store",
    "View all orders →": "View all orders →",
    "Order": "Order",
    "Customer": "Customer",
    "Total": "Total",
    "Status": "Status",
    "Date": "Date",
    "Action": "Action",
    "Add Product": "Add Product",
    "Product Catalog": "Product Catalog",
    "Manage items, prices, inventory, and promotions": "Manage items, prices, inventory, and promotions",
    "Search by name or code...": "Search by name or code...",
    "All Categories": "All Categories",
    "All Status": "All Status",
    "SKU / Code": "SKU / Code",
    "Product Name": "Product Name",
    "Category": "Category",
    "Actual MRP": "Actual MRP",
    "Selling Price": "Selling Price",
    "Stock": "Stock",
    "Active": "Active",
    "Inactive": "Inactive",
    "Low Stock": "Low Stock",
    "In Stock": "In Stock",
    "Delete": "Delete",
    "Edit": "Edit",
    "View": "View",
    "Category Management": "Category Management",
    "Organize and group your crackers catalog": "Organize and group your crackers catalog",
    "Add Category": "Add Category",
    "Customer Orders": "Customer Orders",
    "Track, manage, and process customer purchases": "Track, manage, and process customer purchases",
    "Low stock products": "Low stock products",
    "Manage →": "Manage →",
    "All products are well stocked!": "All products are well stocked!",
    "In store catalog": "In store catalog",
    "Visible to customers": "Visible to customers",
    "All time orders": "All time orders",
    "Requires processing": "Requires processing",
    "From paid orders": "From paid orders",
    "Products need restocking": "Products need restocking",
    "Product Details": "Product Details",
    "Pricing": "Pricing",
    "Stock Level": "Stock Level",
    "Actions": "Actions",
    "No products found": "No products found",
    "Product Categories": "Product Categories",
    "Organize fireworks catalog into structured store categories": "Organize fireworks catalog into structured store categories",
    "Search category or slug...": "Search category or slug...",
    "Category Name": "Category Name",
    "Slug Route": "Slug Route",
    "Product Count": "Product Count",
    "Sort Order": "Sort Order",
    "No categories found": "No categories found",
    "Order Management": "Order Management",
    "Track customer purchases, fulfillment status, and invoice summaries": "Track customer purchases, fulfillment status, and invoice summaries",
    "Search order, customer or phone...": "Search order, customer or phone...",
    "All Order Statuses": "All Order Statuses",
    "All Payment Statuses": "All Payment Statuses",
    "View Details": "View Details",
    "Download Summary PDF": "Download Summary PDF",
    "Customer Information": "Customer Information",
    "Payment Method": "Payment Method",
    "Items Subtotal": "Items Subtotal",
    "Discount Applied": "Discount Applied",
    "Delivery Charges": "Delivery Charges",
    "Grand Total": "Grand Total",
    "Paid": "Paid",
    "Pending": "Pending",
    "Processing": "Processing",
    "Confirmed": "Confirmed",
    "Shipped": "Shipped",
    "Delivered": "Delivered",
    "Cancelled": "Cancelled",
    "Failed": "Failed",
    "Refunded": "Refunded",
    "Prev": "Prev",
    "Next": "Next",
    "Showing": "Showing",
    "to": "to",
    "of": "of",
    "items": "items",
    "products": "products",
    "categories": "categories",
    "orders": "orders",
  },
  ta: {
    "Dashboard": "முகப்பு",
    "Products": "பட்டாசுகள்",
    "Categories": "வகைகள்",
    "Orders": "ஆர்டர்கள்",
    "Queries": "விசாரணைகள்",
    "Customer Queries": "வாடிக்கையாளர் விசாரணைகள்",
    "Log out": "வெளியேறு",
    "Santhi Crackers Admin": "சாந்தி பட்டாசுகள் நிர்வாகம்",
    "Shanthi Sivakasi Crackers Panel": "சாந்தி சிவகாசி பட்டாசுகள் குழு",
    "Store Executive Overview": "கடை நிர்வாக மேலோட்டம்",
    "Real-time metrics, live inventory monitoring, and customer order management for Shanthi Sivakasi Crackers.": "சாந்தி சிவகாசி பட்டாசுகளின் நேரடி இருப்புக் கண்காணிப்பு மற்றும் வாடிக்கையாளர் ஆர்டர் மேலாண்மை.",
    "Manage Catalog": "பட்டியல் மேலாண்மை",
    "View Orders": "ஆர்டர்களைப் பார்க்க",
    "Total Products": "மொத்த பட்டாசுகள்",
    "Active Products": "செயலில் உள்ளவை",
    "Total Orders": "மொத்த ஆர்டர்கள்",
    "Pending Orders": "நிலுவை ஆர்டர்கள்",
    "Total Sales Revenue": "மொத்த விற்பனை வருவாய்",
    "Out of Stock": "கையிருப்பில் இல்லை",
    "Recent orders": "சமீபத்திய ஆர்டர்கள்",
    "The latest activity from your store": "உங்கள் கடையின் சமீபத்திய செயல்பாடுகள்",
    "View all orders →": "அனைத்து ஆர்டர்களையும் பார்க்க →",
    "Order": "ஆர்டர்",
    "Customer": "வாடிக்கையாளர்",
    "Total": "மொத்தம்",
    "Status": "நிலை",
    "Date": "தேதி",
    "Action": "செயல்",
    "Add Product": "பட்டாசு சேர்க்க",
    "Product Catalog": "பட்டாசு பட்டியல்",
    "Manage items, prices, inventory, and promotions": "பொருட்கள், விலை, இருப்பு மற்றும் தள்ளுபடிகளை நிர்வகிக்கவும்",
    "Search by name or code...": "பெயர் அல்லது குறியீட்டால் தேடவும்...",
    "All Categories": "அனைத்து வகைகளும்",
    "All Status": "அனைத்து நிலைகளும்",
    "SKU / Code": "குறியீடு",
    "Product Name": "பட்டாசு பெயர்",
    "Category": "வகை",
    "Actual MRP": "அசல் MRP",
    "Selling Price": "விற்பனை விலை",
    "Stock": "கையிருப்பு",
    "Active": "செயலில்",
    "Inactive": "முடக்கப்பட்டது",
    "Low Stock": "குறைந்த இருப்பு",
    "In Stock": "இருப்பில் உள்ளது",
    "Delete": "நீக்க",
    "Edit": "திருத்த",
    "View": "பார்க்க",
    "Category Management": "வகை மேலாண்மை",
    "Organize and group your crackers catalog": "உங்கள் பட்டாசு வகைகளை ஒழுங்கமைத்து தொகுக்கவும்",
    "Add Category": "வகை சேர்க்க",
    "Customer Orders": "வாடிக்கையாளர் ஆர்டர்கள்",
    "Track, manage, and process customer purchases": "வாடிக்கையாளர் வாங்குதல்களைக் கண்காணித்து செயலாக்கவும்",
    "Low stock products": "குறைந்த இருப்பு பட்டாசுகள்",
    "Manage →": "நிர்வகி →",
    "All products are well stocked!": "அனைத்து பட்டாசுகளும் போதுமான அளவில் உள்ளன!",
    "In store catalog": "பட்டியலில் உள்ளவை",
    "Visible to customers": "வாடிக்கையாளர்களுக்குக் காண்பிக்கப்படுபவை",
    "All time orders": "இதுவரையிலான ஆர்டர்கள்",
    "Requires processing": "செயலாக்கப்பட வேண்டியவை",
    "From paid orders": "செலுத்தப்பட்ட ஆர்டர்களிலிருந்து",
    "Products need restocking": "மறு இருப்பு வைக்க வேண்டிய பட்டாசுகள்",
    "Product Details": "பட்டாசு விவரங்கள்",
    "Pricing": "விலை விவரம்",
    "Stock Level": "இருப்பு அளவு",
    "Actions": "செயல்கள்",
    "No products found": "பட்டாசுகள் எதுவும் கிடைக்கவில்லை",
    "Product Categories": "பட்டாசு வகைகள்",
    "Organize fireworks catalog into structured store categories": "பட்டாசு பட்டியலை வகைகளாக ஒழுங்கமைக்கவும்",
    "Search category or slug...": "வகை அல்லது ஸ்லக் தேடவும்...",
    "Category Name": "வகையின் பெயர்",
    "Slug Route": "ஸ்லக் பாதை",
    "Product Count": "பட்டாசு எண்ணிக்கை",
    "Sort Order": "வரிசை",
    "No categories found": "வகைகள் எதுவும் கிடைக்கவில்லை",
    "Order Management": "ஆர்டர் மேலாண்மை",
    "Track customer purchases, fulfillment status, and invoice summaries": "வாடிக்கையாளர் ஆர்டர்கள் மற்றும் கட்டணங்களை நிர்வகிக்கவும்",
    "Search order, customer or phone...": "ஆர்டர், வாடிக்கையாளர் அல்லது தொலைபேசி எண் தேடவும்...",
    "All Order Statuses": "அனைத்து ஆர்டர் நிலைகளும்",
    "All Payment Statuses": "அனைத்து கட்டண நிலைகளும்",
    "View Details": "விவரங்களைப் பார்க்க",
    "Download Summary PDF": "சுருக்க PDF பதிவிறக்கு",
    "Customer Information": "வாடிக்கையாளர் தகவல்",
    "Payment Method": "பணம் செலுத்தும் முறை",
    "Items Subtotal": "பொருட்களின் கூட்டுத்தொகை",
    "Discount Applied": "தள்ளுபடி",
    "Delivery Charges": "டெலிவரி கட்டணம்",
    "Grand Total": "மொத்தத் தொகை",
    "Paid": "செலுத்தப்பட்டது",
    "Pending": "நிலுவையில்",
    "Processing": "செயலாக்கத்தில்",
    "Confirmed": "உறுதிசெய்யப்பட்டது",
    "Shipped": "அனுப்பப்பட்டது",
    "Delivered": "டெலிவரி செய்யப்பட்டது",
    "Cancelled": "ரத்து செய்யப்பட்டது",
    "Failed": "தோல்வியடைந்தது",
    "Refunded": "திருப்பி அளிக்கப்பட்டது",
    "Prev": "முந்தைய",
    "Next": "அடுத்த",
    "Showing": "காண்பிக்கப்படுகிறது",
    "to": "முதல்",
    "of": "வரை / மொத்தம்",
    "items": "பொருட்கள்",
    "products": "பட்டாசுகள்",
    "categories": "வகைகள்",
    "orders": "ஆர்டர்கள்",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "santhi_admin_language";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved === "en" || saved === "ta") {
        return saved;
      }
    } catch {
      // ignore
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const tProduct = useMemo(() => {
    return (codeOrName?: string | null, fallback?: string): string => {
      return getTranslatedProductName(codeOrName, language, fallback);
    };
  }, [language]);

  const tCategory = useMemo(() => {
    return (slugOrName?: string | null, fallback?: string): string => {
      return getTranslatedCategoryName(slugOrName, language, fallback);
    };
  }, [language]);

  const t = useMemo(() => {
    return (key: string): string => {
      if (!key) return "";
      const trimmed = key.trim();
      const currentDict = ADMIN_DICTIONARY[language] || {};
      if (currentDict[trimmed] !== undefined) {
        return currentDict[trimmed];
      }

      // Check crackers translation
      const prodTranslation = getTranslatedProductName(trimmed, language);
      if (prodTranslation && prodTranslation.toLowerCase() !== trimmed.toLowerCase()) {
        return prodTranslation;
      }

      const catTranslation = getTranslatedCategoryName(trimmed, language);
      if (catTranslation && catTranslation.toLowerCase() !== trimmed.toLowerCase()) {
        return catTranslation;
      }

      return trimmed;
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      tProduct,
      tCategory,
      isTamil: language === "ta",
    }),
    [language, t, tProduct, tCategory],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
