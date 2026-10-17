import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  fetchBackendCategories,
  fetchBackendProducts,
  mapBackendProductToComboItem,
} from "../api/products";
import { CartEntry } from "./StoreCartDrawer";
import { useLanguage } from "../context/LanguageContext";
import "./ComboPackTable.css";

export interface ComboItem {
  id: string;
  code: string;
  name: string;
  nameEng?: string;
  nameTam?: string | null;
  category: string;
  categorySlug?: string;
  categoryEng?: string;
  categoryTam?: string | null;
  content: string;
  contentEng?: string;
  contentTam?: string | null;
  description?: string;
  descriptionEng?: string;
  descriptionTam?: string | null;
  actualPrice: number;
  price: number;
  image: string;
}

interface ComboPackTableProps {
  cartItems?: CartEntry[];
  onSetQuantity?: (item: ComboItem, qty: number) => void;
  onAddToCart?: (count: number, item: ComboItem) => void;
  onCartClick?: () => void;
}

const FALLBACK_THUMB = "/home/logo-santhi.png";

export const ComboPackTable: React.FC<ComboPackTableProps> = ({
  cartItems,
  onSetQuantity,
  onAddToCart,
  onCartClick,
}) => {
  const { t, tProduct, tCategory, language } = useLanguage();

  const getProductName = useCallback(
    (item: ComboItem): string => {
      if (language === "ta") {
        return item.nameTam || tProduct(item.code, item.nameEng || item.name);
      }
      return item.nameEng || item.name;
    },
    [language, tProduct],
  );

  const getProductContent = useCallback(
    (item: ComboItem): string => {
      if (language === "ta" && item.contentTam) {
        return item.contentTam;
      }
      return item.contentEng || item.content || "";
    },
    [language],
  );

  const getProductDesc = useCallback(
    (item: ComboItem): string => {
      if (language === "ta" && item.descriptionTam) {
        return item.descriptionTam;
      }
      return item.descriptionEng || item.description || "";
    },
    [language],
  );

  const [items, setItems] = useState<ComboItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePreview, setActivePreview] = useState<ComboItem | null>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersDropdownRef.current &&
        !filtersDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };
    if (isFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFiltersOpen]);

  // Load catalog
  const loadCatalog = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([fetchBackendProducts(), fetchBackendCategories()])
      .then(([productsRes, categoriesRes]) => {
        if (!isMounted) return;

        const categoryMap: Record<string, string> = {};
        const categoryTamMap: Record<string, string> = {};
        const fetchedCatNames: string[] = [];

        if (categoriesRes.status === "fulfilled" && categoriesRes.value) {
          for (const cat of categoriesRes.value) {
            const displayName = cat.nameEng || cat.name;
            categoryMap[cat.slug.toLowerCase()] = displayName;
            if (cat.nameTam) {
              categoryTamMap[cat.slug.toLowerCase()] = cat.nameTam;
            }
            if (displayName && !fetchedCatNames.includes(displayName)) {
              fetchedCatNames.push(displayName);
            }
          }
        }

        if (
          productsRes.status === "fulfilled" &&
          Array.isArray(productsRes.value) &&
          productsRes.value.length > 0
        ) {
          const mapped = productsRes.value.map((prod) =>
            mapBackendProductToComboItem(prod, categoryMap, categoryTamMap),
          );
          setItems(mapped);

          const productCategories = Array.from(
            new Set(mapped.map((it) => it.category).filter(Boolean)),
          );
          setCategoriesList(
            Array.from(new Set([...fetchedCatNames, ...productCategories])),
          );
        } else {
          setItems([]);
          setCategoriesList([]);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch backend products:", err);
        if (isMounted) {
          setItems([]);
          setCategoriesList([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return loadCatalog();
  }, [loadCatalog]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    categoriesList.forEach((c) => set.add(c));
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [categoriesList, items]);

  // Lookup quantity from parent cartItems or local fallback
  const quantityMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (cartItems) {
      for (const entry of cartItems) {
        map[entry.item.id] = entry.quantity;
      }
    } else {
      return localQuantities;
    }
    return map;
  }, [cartItems, localQuantities]);

  // Quantity input handler
  const handleQuantityInputChange = (item: ComboItem, rawValue: string) => {
    if (rawValue === "") {
      if (onSetQuantity) {
        onSetQuantity(item, 0);
      }
      setLocalQuantities((prev) => ({ ...prev, [item.id]: 0 }));
      return;
    }
    const val = parseInt(rawValue, 10);
    const qty = isNaN(val) || val < 0 ? 0 : val;
    if (onSetQuantity) {
      onSetQuantity(item, qty);
    } else {
      setLocalQuantities((prev) => ({ ...prev, [item.id]: qty }));
      if (onAddToCart && qty > 0) {
        onAddToCart(qty, item);
      }
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== "all") {
      result = result.filter((it) => it.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((it) => {
        const matchesName = Boolean(it.name && it.name.toLowerCase().includes(q));
        const matchesNameEng = Boolean(it.nameEng && it.nameEng.toLowerCase().includes(q));
        const matchesNameTam = Boolean(it.nameTam && it.nameTam.toLowerCase().includes(q));
        const matchesContent = Boolean(it.content && it.content.toLowerCase().includes(q));
        const matchesContentEng = Boolean(it.contentEng && it.contentEng.toLowerCase().includes(q));
        const matchesContentTam = Boolean(it.contentTam && it.contentTam.toLowerCase().includes(q));
        const matchesCode = Boolean(it.code && it.code.toLowerCase().includes(q));
        const matchesCategory = Boolean(it.category && it.category.toLowerCase().includes(q));
        const matchesCategoryTam = Boolean(it.categoryTam && it.categoryTam.toLowerCase().includes(q));

        return (
          matchesName ||
          matchesNameEng ||
          matchesNameTam ||
          matchesContent ||
          matchesContentEng ||
          matchesContentTam ||
          matchesCode ||
          matchesCategory ||
          matchesCategoryTam
        );
      });
    }

    return result;
  }, [items, searchQuery, selectedCategory]);

  // Grouped categories for table display
  const groupedCategories = useMemo(() => {
    const categoryOrder = [
      "Combo Packs & Gift Boxes",
      "Gift Box",
      "One Sound Crackers",
      "Sound Crackers",
      "Flash Sound Crackers",
      "Sparklers",
      "Ground Chakkars",
      "Flower Pots & Fountains",
      "Flower Pots",
      "Rockets",
      "Rockets & Aerial Skyshots",
      "Atom Bombs",
      "Deluxe Crackers",
      "Bijili Crackers",
      "Garlands",
    ];

    const groups: { category: string; items: ComboItem[] }[] = [];
    const processed = new Set<string>();

    for (const cat of categoryOrder) {
      const matched = filteredItems.filter((it) => it.category === cat);
      if (matched.length > 0) {
        groups.push({ category: cat, items: matched });
        processed.add(cat);
      }
    }

    for (const it of filteredItems) {
      if (!processed.has(it.category)) {
        processed.add(it.category);
        const matched = filteredItems.filter((x) => x.category === it.category);
        groups.push({ category: it.category, items: matched });
      }
    }

    return groups;
  }, [filteredItems]);

  // Category banner title calculation (without discount)
  const getCategoryHeaderTitle = useCallback(
    (category: string, catItems: ComboItem[]): string => {
      let displayName = category;
      const first = catItems?.[0];
      if (language === "ta" && first?.categoryTam) {
        displayName = first.categoryTam;
      } else {
        displayName = tCategory(category, category);
      }
      return displayName.toUpperCase();
    },
    [language, tCategory],
  );


  // Category collapse state
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };


  // Quantity stepper increment/decrement
  const handleStepQuantity = (item: ComboItem, step: number) => {
    const current = quantityMap[item.id] || 0;
    const next = Math.max(0, current + step);
    if (onSetQuantity) {
      onSetQuantity(item, next);
    } else {
      setLocalQuantities((prev) => ({ ...prev, [item.id]: next }));
      if (onAddToCart && next > current) {
        onAddToCart(step, item);
      }
    }
  };

  // Cart summary calculations
  const totalCartCount = useMemo(() => {
    if (cartItems) {
      return cartItems.reduce((sum, entry) => sum + entry.quantity, 0);
    }
    return Object.values(localQuantities).reduce((sum, q) => sum + q, 0);
  }, [cartItems, localQuantities]);

  const totalCartAmount = useMemo(() => {
    if (cartItems) {
      return cartItems.reduce((sum, entry) => sum + entry.quantity * entry.item.price, 0);
    }
    return Object.entries(localQuantities).reduce((sum, [id, qty]) => {
      const it = items.find((x) => x.id === id);
      return sum + (it ? it.price * qty : 0);
    }, 0);
  }, [cartItems, localQuantities, items]);

  return (
    <section className="combo-table-wrapper">
      <div className="combo-table-inner">
        {/* 1. Top Summary Banner (Items, Total ₹, View Cart) */}
        <div className="combo-summary-banner">
          <div className="combo-summary-col">
            <span className="combo-summary-label">{t("ITEMS")}</span>
            <span className="combo-summary-value">{totalCartCount}</span>
          </div>

          <div className="combo-summary-col">
            <span className="combo-summary-label">{t("TOTAL")}</span>
            <span className="combo-summary-value">₹{totalCartAmount}</span>
          </div>

          <button
            type="button"
            className="combo-summary-cart-btn"
            onClick={onCartClick}
            aria-label={t("View Cart")}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t("View Cart")}</span>
          </button>
        </div>

        {/* 2. Single-line Search & Filter Bar */}
        <div className="combo-search-filter-row">
          <div className="combo-search-container">
            <svg
              className="combo-search-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              placeholder={
                language === "ta"
                  ? "பொருளை பெயர் அல்லது வகை மூலம் தேடுக..."
                  : "Search products by name, code, or category..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="combo-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="combo-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label={t("Clear Search")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="combo-filters-wrap" ref={filtersDropdownRef}>
            <button
              type="button"
              className={`combo-filters-btn ${isFiltersOpen ? "active" : ""}`}
              onClick={() => setIsFiltersOpen((prev) => !prev)}
              aria-expanded={isFiltersOpen}
            >
              <span>{t("Filters")}</span>
              <span className="combo-filters-arrow">▾</span>
              {selectedCategory !== "all" && <span className="combo-filters-active-dot" />}
            </button>

            {isFiltersOpen && (
              <div className="combo-filters-menu">
                <div className="combo-filter-group">
                  <label className="combo-filter-label">{t("Category")}</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setIsFiltersOpen(false);
                    }}
                    className="combo-filter-select"
                  >
                    <option value="all">{t("All Categories")}</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {tCategory(cat, cat)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCategory !== "all" && (
                  <button
                    type="button"
                    className="combo-filter-clear-btn"
                    onClick={() => {
                      setSelectedCategory("all");
                      setIsFiltersOpen(false);
                    }}
                  >
                    {t("Clear Filters")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Products Catalog Section */}
        <div className="combo-catalog-container">
          {isLoading ? (
            <div className="combo-loading-box">
              <div className="combo-loading-spinner" />
              <p className="combo-loading-text">{t("Loading crackers catalog...")}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="combo-empty-bucket-box">
              <h3 className="combo-empty-bucket-title">
                {t("Your Crackers Bucket is Empty")}
              </h3>
              <p className="combo-empty-bucket-desc">
                {t(
                  "No crackers are currently available in the catalog. New festival stock will be arriving soon!",
                )}
              </p>
              <button
                type="button"
                className="combo-empty-refresh-btn"
                onClick={loadCatalog}
              >
                {t("Refresh Catalog")}
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="combo-empty-search-box">
              <h4 className="combo-empty-search-title">
                {t("No crackers match your search")} &ldquo;{searchQuery}&rdquo;
              </h4>
              <button
                type="button"
                className="combo-clear-search-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                {t("Clear Search")}
              </button>
            </div>
          ) : (
            <div className="combo-category-accordion-list">
              {groupedCategories.map(({ category, items }) => {
                const isCollapsed = Boolean(collapsedCategories[category]);

                return (
                  <div key={category} className="combo-cat-section">
                    {/* Category Header Accordion Bar */}
                    <button
                      type="button"
                      className="combo-cat-header-btn"
                      onClick={() => toggleCategoryCollapse(category)}
                      aria-expanded={!isCollapsed}
                    >
                      <div className="combo-cat-header-left">
                        <div className="combo-cat-icon-box">
                          <img
                            src={FALLBACK_THUMB}
                            alt="Category Logo"
                            className="combo-cat-icon-img"
                            loading="lazy"
                          />
                        </div>
                        <div className="combo-cat-title-wrap">
                          <h3 className="combo-cat-name">
                            {getCategoryHeaderTitle(category, items)}
                          </h3>
                          <span className="combo-cat-count">
                            {items.length} {language === "ta" ? "பட்டாசுகள்" : "products"}
                          </span>
                        </div>
                      </div>

                      <div className={`combo-cat-chevron ${isCollapsed ? "collapsed" : ""}`}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </div>
                    </button>

                    {/* Products Grid / Cards inside this category */}
                    {!isCollapsed && (
                      <div className="combo-product-cards-grid">
                        {items.map((item) => {
                          const qty = quantityMap[item.id] || 0;
                          const total = qty > 0 ? qty * item.price : 0;
                          const contentDesc = getProductContent(item);

                          return (
                            <div key={item.id} className="combo-product-card">
                              {/* Top row: Image & Product Details */}
                              <div className="combo-card-top">
                                <div
                                  className="combo-card-thumb-wrap"
                                  onClick={() => setActivePreview(item)}
                                  title={getProductName(item)}
                                >
                                  <img
                                    src={item.image}
                                    alt={getProductName(item)}
                                    loading="lazy"
                                    className="combo-card-thumb"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_THUMB;
                                    }}
                                  />
                                </div>

                                <div className="combo-card-info">
                                  {/* Product Title (Language-dependent) */}
                                  <h4 className="combo-card-title-en">
                                    {getProductName(item)}
                                  </h4>


                                  {/* Content / Packing Pill */}
                                  {contentDesc && (
                                    <span className="combo-card-content-pill">
                                      {contentDesc}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Bottom row: Prices, Quantity Stepper, and Row Total */}
                              <div className="combo-card-bottom">
                                {/* Price Box */}
                                <div className="combo-card-price-col">
                                  {item.actualPrice > item.price && (
                                    <span className="combo-card-actual-price">
                                      {item.actualPrice}
                                    </span>
                                  )}
                                  <span className="combo-card-sale-price">
                                    ₹{item.price}
                                  </span>
                                </div>

                                {/* Stepper (- 0 +) and numeric manual input */}
                                <div className="combo-card-stepper">
                                  <button
                                    type="button"
                                    className="combo-stepper-btn minus"
                                    onClick={() => handleStepQuantity(item, -1)}
                                    disabled={qty <= 0}
                                    aria-label="Decrease quantity"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="combo-stepper-input"
                                    value={qty > 0 ? qty : 0}
                                    onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                                    aria-label={`${getProductName(item)} quantity`}
                                  />
                                  <button
                                    type="button"
                                    className="combo-stepper-btn plus"
                                    onClick={() => handleStepQuantity(item, 1)}
                                    aria-label="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Subtotal Box */}
                                <div className="combo-card-total-col">
                                  <span className="combo-card-total-val">
                                    ₹{total}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lightbox Preview Dialog */}
        {activePreview && (
          <div
            className="combo-lightbox-backdrop"
            onClick={() => setActivePreview(null)}
          >
            <div
              className="combo-lightbox-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="combo-lightbox-close"
                onClick={() => setActivePreview(null)}
                aria-label={t("Close preview")}
              >
                ✕
              </button>
              <img
                src={activePreview.image}
                alt={getProductName(activePreview)}
                className="combo-lightbox-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_THUMB;
                }}
              />
              <div className="combo-lightbox-info">
                <h3>{getProductName(activePreview)}</h3>
                {getProductDesc(activePreview) && (
                  <p style={{ margin: "4px 0 8px", fontSize: "11px", color: "#64748b" }}>
                    {getProductDesc(activePreview)}
                  </p>
                )}
                <p>
                  {t("Price")}: ₹{activePreview.price} • {getProductContent(activePreview)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
