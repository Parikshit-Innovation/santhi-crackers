import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  fetchBackendCategories,
  fetchBackendProducts,
  mapBackendProductToComboItem,
} from "../api/products";
import { useLanguage } from "../context/LanguageContext";
import "./ComboPackTable.css";

export interface ComboItem {
  id: string;
  code: string;
  name: string;
  category: string;
  content: string;
  actualPrice: number;
  price: number;
  image: string;
}


interface ComboPackTableProps {
  onAddToCart?: (count: number, item: ComboItem) => void;
}

export const ComboPackTable: React.FC<ComboPackTableProps> = ({ onAddToCart }) => {
  const { t, tProduct, tCategory } = useLanguage();
  const [items, setItems] = useState<ComboItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<ComboItem | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };
    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  const loadCatalog = useCallback(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.allSettled([fetchBackendProducts(), fetchBackendCategories()])
      .then(([productsRes, categoriesRes]) => {
        if (!isMounted) return;

        const categoryMap: Record<string, string> = {};
        const fetchedCatNames: string[] = [];

        if (categoriesRes.status === "fulfilled" && categoriesRes.value) {
          for (const cat of categoriesRes.value) {
            categoryMap[cat.slug.toLowerCase()] = cat.name;
            if (cat.name && !fetchedCatNames.includes(cat.name)) {
              fetchedCatNames.push(cat.name);
            }
          }
        }

        if (
          productsRes.status === "fulfilled" &&
          Array.isArray(productsRes.value) &&
          productsRes.value.length > 0
        ) {
          const mapped = productsRes.value.map((prod) =>
            mapBackendProductToComboItem(prod, categoryMap),
          );
          setItems(mapped);
          setIsLiveBackend(true);

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

  const triggerFlyToCart = (item: ComboItem, qty: number, targetBtn?: HTMLElement | null) => {
    try {
      const isMobile = window.innerWidth <= 840;
      // Flying animation is only enabled in mobile view; disabled on web view per preference
      if (!isMobile) {
        return;
      }

      // Find cart target element (in mobile view: ALWAYS goes to footer bottom cart icon)
      const bottomCart = document.getElementById("footer-bottom-cart-btn");
      const destEl: HTMLElement | null = bottomCart;

      const destRect = destEl?.getBoundingClientRect();
      let destX: number;
      let destY: number;

      if (destRect && destRect.width > 0 && destRect.height > 0) {
        destX = destRect.left + destRect.width / 2;
        destY = destRect.top + destRect.height / 2;
      } else {
        // Fallback to mobile bottom navigation 4th icon location (Cart)
        destX = window.innerWidth * 0.7;
        destY = window.innerHeight - 26;
      }

      // Start position from clicked button
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      if (targetBtn) {
        const bRect = targetBtn.getBoundingClientRect();
        startX = bRect.left + bRect.width / 2;
        startY = bRect.top + bRect.height / 2;
      }

      // Create floating flyer node
      const flyer = document.createElement("div");
      flyer.className = "cart-flyer-node";
      flyer.style.position = "fixed";
      flyer.style.left = `${startX - 22}px`;
      flyer.style.top = `${startY - 22}px`;
      flyer.style.zIndex = "99999";
      flyer.style.pointerEvents = "none";
      flyer.style.willChange = "transform, opacity";

      const flyerImg = document.createElement("img");
      flyerImg.src = item.image;
      flyerImg.alt = "";
      flyerImg.className = "cart-flyer-img";
      flyer.appendChild(flyerImg);

      if (qty > 1) {
        const badge = document.createElement("span");
        badge.className = "cart-flyer-badge";
        badge.textContent = `+${qty}`;
        flyer.appendChild(badge);
      }

      document.body.appendChild(flyer);

      const deltaX = destX - startX;
      const deltaY = destY - startY;

      // Arc curve: smooth downward trajectory to mobile footer cart icon
      const midOffsetY = isMobile ? Math.min(deltaY * 0.35, 60) : -40;

      const anim = flyer.animate(
        [
          { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
          {
            offset: 0.35,
            transform: `translate(${deltaX * 0.35}px, ${deltaY * 0.25 + midOffsetY}px) scale(1.12)`,
            opacity: 1,
          },
          {
            offset: 0.75,
            transform: `translate(${deltaX * 0.8}px, ${deltaY * 0.8}px) scale(0.65)`,
            opacity: 0.85,
          },
          { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.18)`, opacity: 0 },
        ],
        {
          duration: 580,
          easing: "cubic-bezier(0.2, 0.8, 0.25, 1)",
          fill: "forwards",
        },
      );

      anim.onfinish = () => {
        flyer.remove();
        // Trigger lively bounce & bump on the cart icon (footer cart on mobile)
        const targetIcon = destEl || bottomCart;
        if (targetIcon) {
          targetIcon.classList.remove("cart-bump-animation");
          void targetIcon.offsetWidth;
          targetIcon.classList.add("cart-bump-animation");
          setTimeout(() => {
            targetIcon?.classList.remove("cart-bump-animation");
          }, 650);
        }
      };
    } catch {
      // Graceful fallback
    }
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleDirectQuantity = (id: string, value: string) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [id]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleAdd = (item: ComboItem, event?: React.MouseEvent<HTMLElement>) => {
    const currentQty = quantities[item.id] ?? 0;
    const qty = currentQty > 0 ? currentQty : 1;
    if (currentQty === 0) {
      setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    }

    if (onAddToCart) {
      onAddToCart(qty, item);
    }

    // Trigger visual checkmark feedback on button
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    }, 1200);

    // Trigger flying animation to the cart in the footer
    triggerFlyToCart(item, qty, event?.currentTarget);

    setAddedItemNotice(t("Item added to cart"));
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 2000);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    if (selectedCategory !== "all") {
      result = result.filter((it) => it.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.content.toLowerCase().includes(q) ||
          it.code.toLowerCase().includes(q) ||
          it.category.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchQuery, sortBy, selectedCategory]);

  const displayedItems = filteredAndSortedItems;

  const groupedCategories = useMemo(() => {
    const categoryOrder = [
      "Sparklers",
      "Ground Chakkars",
      "Flower Pots & Fountains",
      "Rockets",
      "Rockets & Aerial Skyshots",
      "Sound Crackers",
      "Combo Packs & Gift Boxes",
    ];

    const groups: { category: string; items: ComboItem[] }[] = [];
    const processed = new Set<string>();

    for (const cat of categoryOrder) {
      const matched = displayedItems.filter((it) => it.category === cat);
      if (matched.length > 0) {
        groups.push({ category: cat, items: matched });
        processed.add(cat);
      }
    }

    for (const it of displayedItems) {
      if (!processed.has(it.category)) {
        processed.add(it.category);
        const matched = displayedItems.filter((x) => x.category === it.category);
        groups.push({ category: it.category, items: matched });
      }
    }

    return groups;
  }, [displayedItems]);

  const formatPrice = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  return (
    <section className="combo-table-wrapper">
      <div className="combo-table-container">
        {/* Toast feedback - White Oval in Bottom Middle */}
        {addedItemNotice && (
          <div
            className="combo-toast-notice"
            style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              borderRadius: "9999px",
              border: "1.5px solid #fde047",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              zIndex: 9999,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{addedItemNotice}</span>
          </div>
        )}

        {/* Top Header & Toolbar Area */}
        <div className="combo-header-bar">
          <div className="combo-title-wrap">
            <h2 className="combo-heading">{t("Explore Crackers")}</h2>
            {items.length > 0 && (
              <div className="combo-discount-badge">{t("COMBO PACK (75% DISCOUNT)")}</div>
            )}
          </div>

          {items.length > 0 && (
            <div className="combo-controls">
            {/* Search Input */}
            <div className="combo-search-pill">
              <svg
                className="combo-search-icon"
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder={t("Search in this category...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="combo-search-field"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="combo-sort-wrapper" ref={sortDropdownRef}>
              <button
                type="button"
                className={`combo-sort-btn ${isSortOpen ? "active" : ""}`}
                onClick={() => setIsSortOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isSortOpen}
                aria-label={t("Sort products")}
                title={t("Sort products")}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="combo-sort-icon"
                  aria-hidden="true"
                >
                  <path d="m3 8 4-4 4 4" />
                  <path d="M7 4v16" />
                  <path d="m13 16 4 4 4-4" />
                  <path d="M17 4v16" />
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`combo-sort-chevron ${isSortOpen ? "open" : ""}`}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isSortOpen && (
                <div className="combo-sort-menu" role="listbox">
                  <div className="combo-sort-menu-header">{t("Sort by")}</div>
                  {[
                    { value: "price-asc", label: t("Price: Low to High") },
                    { value: "price-desc", label: t("Price: High to Low") },
                    { value: "name-asc", label: t("Name: A to Z") },
                  ].map((opt) => {
                    const isSelected = sortBy === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`combo-sort-option ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <svg
                            viewBox="0 0 24 24"
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="combo-sort-check"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Category Select Pill */}
            <div className="combo-sort-pill combo-category-pill">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "#64748b", flexShrink: 0 }}
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span className="combo-sort-label">{t("Category")}</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                className="combo-sort-select"
                aria-label={t("Category")}
              >
                <option value="all">{t("All Categories")}</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {tCategory(cat, cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}
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
              <div className="combo-empty-bucket-illustration">
                <svg
                  viewBox="0 0 200 200"
                  width="180"
                  height="180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="combo-empty-bucket-svg"
                >
                  <defs>
                    <linearGradient id="bucketGrad" x1="40" y1="60" x2="160" y2="180" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="bucketRimGrad" x1="30" y1="60" x2="170" y2="76" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="bucketInnerGrad" x1="40" y1="65" x2="160" y2="75" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#78350f" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>
                    <linearGradient id="sparkleGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id="bucketGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#ef4444" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Sparkles Floating Above */}
                  <g className="combo-bucket-sparkles">
                    <path
                      d="M100 18 L103 27 L112 30 L103 33 L100 42 L97 33 L88 30 L97 27 Z"
                      fill="url(#sparkleGrad)"
                    />
                    <path
                      d="M52 35 L54 41 L60 43 L54 45 L52 51 L50 45 L44 43 L50 41 Z"
                      fill="url(#sparkleGrad)"
                    />
                    <path
                      d="M150 32 L152 39 L159 41 L152 43 L150 50 L148 43 L141 41 L148 39 Z"
                      fill="url(#sparkleGrad)"
                    />
                    <circle cx="34" cy="58" r="2.5" fill="#fde047" opacity="0.9" />
                    <circle cx="168" cy="55" r="3" fill="#fde047" opacity="0.9" />
                  </g>

                  {/* Bucket Handle */}
                  <path
                    d="M 38 72 C 38 24, 162 24, 162 72"
                    stroke="#fbbf24"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect x="84" y="24" width="32" height="6" rx="3" fill="#d97706" stroke="#fbbf24" strokeWidth="1" />

                  {/* Bucket Body with festive gradient & drop shadow */}
                  <path
                    d="M 44 70 L 62 168 C 64 175, 72 180, 80 180 L 120 180 C 128 180, 136 175, 138 168 L 156 70 Z"
                    fill="url(#bucketGrad)"
                    filter="url(#bucketGlow)"
                  />

                  {/* Bucket Inner Cavity Depth (showing empty interior) */}
                  <ellipse cx="100" cy="70" rx="56" ry="12" fill="url(#bucketInnerGrad)" />

                  {/* Bucket Rim (Front Lip) */}
                  <path
                    d="M 42 70 C 42 77, 158 77, 158 70 C 158 63, 42 63, 42 70 Z"
                    fill="url(#bucketRimGrad)"
                  />

                  {/* Festive Ribs / Bands on Bucket */}
                  <path
                    d="M 50 102 C 65 110, 135 110, 150 102"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d="M 56 136 C 70 144, 130 144, 144 136"
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    fill="none"
                    opacity="0.85"
                  />

                  {/* Festive Emblem / Diya Star Motif on Front */}
                  <g transform="translate(100, 120)">
                    <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.25" />
                    <circle cx="0" cy="0" r="10" fill="#fde047" opacity="0.35" />
                    <path
                      d="M 0 -8 L 2 -2 L 8 0 L 2 2 L 0 8 L -2 2 L -8 0 L -2 -2 Z"
                      fill="#fff"
                    />
                  </g>

                  {/* Side Handle Hinges */}
                  <circle cx="41" cy="71" r="5" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="159" cy="71" r="5" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="combo-empty-bucket-tag">
                <span>🪔</span>
                <span>{t("Festive Crackers Catalog")}</span>
              </div>

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
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
                <span>{t("Refresh Catalog")}</span>
              </button>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="combo-empty-search-box">
              <svg
                viewBox="0 0 24 24"
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="combo-empty-search-icon"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h4 className="combo-empty-search-title">
                {t("No crackers match your search")}
              </h4>
              <p className="combo-empty-search-query">
                &ldquo;{searchQuery}&rdquo;
              </p>
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
            <>
              <div className="combo-table-responsive">
                <table className="combo-data-table">
                  <thead>
                    <tr>
                      <th className="th-product">{t("Product")}</th>
                  <th className="th-name">{t("Product Name")}</th>
                  <th className="th-content">{t("Content")}</th>
                  <th className="th-actual">{t("Actual Price")}</th>
                  <th className="th-price">{t("Price")}</th>
                  <th className="th-qty">{t("Quantity")}</th>
                  <th className="th-total">{t("Total")}</th>
                  <th className="th-action"></th>
                </tr>
              </thead>
              <tbody>
                {groupedCategories.map(({ category, items }) => (
                  <React.Fragment key={category}>
                    <tr className="combo-category-header-row">
                      <td colSpan={8} className="combo-category-header-td">
                        <div className="combo-category-header">
                          <span className="combo-category-title">{tCategory(category, category)}</span>
                          <span className="combo-category-badge">
                            {items.length} {items.length === 1 ? t("Product") : t("Products")}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {items.map((item) => {
                      const qty = quantities[item.id] || 0;
                      const total = qty * item.price;

                      return (
                        <tr key={item.id} className="combo-table-row">
                          {/* Product Thumbnail */}
                          <td className="td-product">
                            <div
                              className="combo-thumb-box"
                              onClick={() => setActivePreview(item)}
                              title={t("Click to view packaging")}
                            >
                              <img
                                src={item.image}
                                alt={tProduct(item.code, item.name)}
                                className="combo-thumb-img"
                                loading="lazy"
                              />
                            </div>
                          </td>

                          {/* Product Name */}
                          <td className="td-name">
                            <span className="combo-name-text">{tProduct(item.code, item.name)}</span>
                          </td>

                          {/* Content */}
                          <td className="td-content">
                            <span className="combo-content-text">{t(item.content)}</span>
                          </td>

                          {/* Actual Price (Strikethrough) */}
                          <td className="td-actual">
                            <span className="combo-actual-price">
                              {formatPrice(item.actualPrice)}
                            </span>
                          </td>

                          {/* Discounted Price */}
                          <td className="td-price">
                            <span className="combo-current-price">{formatPrice(item.price)}</span>
                          </td>

                          {/* Quantity Stepper */}
                          <td className="td-qty">
                            <div className="combo-qty-stepper">
                              <button
                                type="button"
                                className="combo-qty-btn"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={qty <= 0}
                                aria-label={t("Decrease quantity")}
                              >
                                –
                              </button>
                              <input
                                type="text"
                                className="combo-qty-input"
                                value={qty}
                                onChange={(e) => handleDirectQuantity(item.id, e.target.value)}
                                aria-label={t("Item quantity")}
                              />
                              <button
                                type="button"
                                className="combo-qty-btn"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                aria-label={t("Increase quantity")}
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="td-total">
                            <span className="combo-total-price">{formatPrice(total)}</span>
                          </td>

                          {/* Add Button */}
                          <td className="td-action">
                            <button
                              type="button"
                              className={`combo-add-btn ${addedItemIds[item.id] ? "added" : ""}`}
                              onClick={(e) => handleAdd(item, e)}
                            >
                              {addedItemIds[item.id] ? (
                                <>
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="13"
                                    height="13"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>{t("Added")}</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    viewBox="0 0 24 24"
                                    width="14"
                                    height="14"
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
                                  <span>{t("Add")}</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}

                {displayedItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="combo-empty-state">
                      No crackers match your query "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: 100% visible on single screen without horizontal scrolling */}
          <div className="combo-mobile-list">
            {groupedCategories.map(({ category, items }) => (
              <div key={`m-cat-${category}`} className="combo-category-mobile-section">
                <div className="combo-category-header">
                  <span className="combo-category-title">{tCategory(category, category)}</span>
                  <span className="combo-category-badge">
                    {items.length} {items.length === 1 ? t("Product") : t("Products")}
                  </span>
                </div>

                {items.map((item) => {
                  const qty = quantities[item.id] || 0;
                  const total = qty * item.price;

                  return (
                    <div key={item.id} className="combo-mobile-card">
                      <div className="combo-m-top">
                        {/* Thumbnail */}
                        <div
                          className="combo-m-thumb"
                          onClick={() => setActivePreview(item)}
                          title={t("Click to view packaging")}
                        >
                          <img src={item.image} alt={tProduct(item.code, item.name)} loading="lazy" />
                        </div>

                        {/* Info */}
                        <div className="combo-m-info">
                          <div className="combo-m-meta">
                            <span className="combo-m-content">{t(item.content)}</span>
                          </div>
                          <div className="combo-m-name">{tProduct(item.code, item.name)}</div>
                          <div className="combo-m-prices">
                            <span className="combo-m-actual">{formatPrice(item.actualPrice)}</span>
                            <span className="combo-m-current">{formatPrice(item.price)}</span>
                            {qty > 0 && (
                              <span className="combo-m-total-badge">
                                {t("Total")}: {formatPrice(total)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="combo-m-bottom">
                        <div className="combo-qty-stepper combo-m-stepper">
                          <button
                            type="button"
                            className="combo-qty-btn"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={qty <= 0}
                            aria-label={t("Decrease quantity")}
                          >
                            –
                          </button>
                          <input
                            type="text"
                            className="combo-qty-input"
                            value={qty}
                            onChange={(e) => handleDirectQuantity(item.id, e.target.value)}
                            aria-label={t("Item quantity")}
                          />
                          <button
                            type="button"
                            className="combo-qty-btn"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            aria-label={t("Increase quantity")}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className={`combo-add-btn combo-m-add-btn ${addedItemIds[item.id] ? "added" : ""}`}
                          onClick={(e) => handleAdd(item, e)}
                        >
                          {addedItemIds[item.id] ? (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                width="13"
                                height="13"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>{t("Added")}</span>
                            </>
                          ) : (
                            <>
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
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
                              <span>{t("Add")}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>

        {/* Image Preview Lightbox */}
        {activePreview && (
          <div className="combo-lightbox-backdrop" onClick={() => setActivePreview(null)}>
            <div className="combo-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
              <button
                className="combo-lightbox-close"
                onClick={() => setActivePreview(null)}
                aria-label={t("Close preview")}
              >
                ✕
              </button>
              <img
                src={activePreview.image}
                alt={tProduct(activePreview.code, activePreview.name)}
                className="combo-lightbox-img"
              />
              <div className="combo-lightbox-info">
                <h3>{tProduct(activePreview.code, activePreview.name)}</h3>
                <p>
                  {t("Price")}: {formatPrice(activePreview.price)} • {t(activePreview.content)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
