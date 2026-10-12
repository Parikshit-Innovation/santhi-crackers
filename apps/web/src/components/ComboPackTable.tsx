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

  return (
    <section className="combo-table-wrapper">
      <div className="combo-table-inner">
        {/* Search & Filters Bar */}
        <div className="combo-toolbar">
          <div className="combo-search-container">
            <input
              type="text"
              placeholder={t("Search an item")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="combo-search-input"
            />
            <svg
              className="combo-search-icon"
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="#00a2e8"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
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
              {selectedCategory !== "all" && (
                <span className="combo-filters-active-dot" />
              )}
            </button>

            {isFiltersOpen && (
              <div className="combo-filters-menu">
                <div className="combo-filter-group">
                  <label className="combo-filter-label">{t("Category")}</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
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
                    }}
                  >
                    {t("Clear Filters")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="combo-table-card">
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
            <div className="combo-table-responsive">
              <table className="combo-grid-table">
                <thead>
                  <tr>
                    <th className="th-img">{t("Image")}</th>
                    <th className="th-name">{t("Product Name")}</th>
                    <th className="th-content">{t("Content")}</th>
                    <th className="th-actual">
                      <span className="th-actual-line">{t("Actual")}</span>
                      <span className="th-actual-line">{t("Price")}</span>
                    </th>
                    <th className="th-price">{t("Price")}</th>
                    <th className="th-qty">{t("Quantity")}</th>
                    <th className="th-total">{t("Total")}</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedCategories.map(({ category, items }) => (
                    <React.Fragment key={category}>
                      {/* Orange Category Section Header */}
                      <tr className="combo-cat-row">
                        <td colSpan={7} className="combo-cat-cell">
                          {getCategoryHeaderTitle(category, items)}
                        </td>
                      </tr>

                      {/* Product Data Rows */}
                      {items.map((item) => {
                        const qty = quantityMap[item.id] || 0;
                        const total = qty > 0 ? qty * item.price : 0;

                        return (
                          <tr key={item.id} className="combo-data-row">
                            {/* 1. Image */}
                            <td className="td-img">
                              <div
                                className="combo-img-thumbnail"
                                onClick={() => setActivePreview(item)}
                                title={getProductName(item)}
                              >
                                <img
                                  src={item.image}
                                  alt={getProductName(item)}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_THUMB;
                                  }}
                                />
                              </div>
                            </td>

                            {/* 2. Product Name */}
                            <td className="td-name">
                              <span className="combo-cell-name">{getProductName(item)}</span>
                            </td>

                            {/* 4. Content */}
                            <td className="td-content">
                              <span className="combo-cell-content">
                                {getProductContent(item)}
                              </span>
                            </td>

                            {/* 5. Actual Price */}
                            <td className="td-actual">
                              <span className="combo-cell-actual">
                                {item.actualPrice}
                              </span>
                            </td>

                            {/* 6. Price */}
                            <td className="td-price">
                              <span className="combo-cell-price">{item.price}</span>
                            </td>

                            {/* 7. Quantity */}
                            <td className="td-qty">
                              <input
                                type="number"
                                min="0"
                                step="1"
                                className="combo-input-qty"
                                value={qty > 0 ? qty : ""}
                                placeholder=""
                                onChange={(e) =>
                                  handleQuantityInputChange(item, e.target.value)
                                }
                                aria-label={`${getProductName(item)} quantity`}
                              />
                            </td>

                            {/* 8. Total */}
                            <td className="td-total">
                              <div className="combo-cell-total-box">
                                {qty > 0 ? total : ""}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
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
