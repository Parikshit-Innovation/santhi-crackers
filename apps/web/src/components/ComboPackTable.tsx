import React, { useState, useMemo, useEffect } from "react";
import "./ComboPackTable.css";

export interface ComboItem {
  id: string;
  code: string;
  name: string;
  content: string;
  actualPrice: number;
  price: number;
  image: string;
}

const ITEMS_PER_PAGE = 10;

const COMBO_DATA: ComboItem[] = [
  {
    id: "1",
    code: "251",
    name: "3000 COMBO PACK (kids pack)",
    content: "box",
    actualPrice: 3000,
    price: 300,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    code: "252",
    name: "15000 COMBO PACK (family combo pack)",
    content: "box",
    actualPrice: 15000,
    price: 1500,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    code: "253",
    name: "Vinayagar chaturthi (15000 COMBO PACK )",
    content: "box",
    actualPrice: 15000,
    price: 1500,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    code: "0001.1",
    name: "1999 combo pack -1",
    content: "box",
    actualPrice: 2000,
    price: 200,
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    code: "0001.2",
    name: "3000 combo pack -1",
    content: "box",
    actualPrice: 3000,
    price: 300,
    image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    code: "0001.3",
    name: "5000 combo pack -1",
    content: "box",
    actualPrice: 5000,
    price: 500,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "7",
    code: "0001.5",
    name: "10,000 combo pack -1",
    content: "box",
    actualPrice: 10000,
    price: 1000,
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "8",
    code: "0002.1",
    name: "Diwali Mega Gift Box (25 Items)",
    content: "box",
    actualPrice: 6000,
    price: 600,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "9",
    code: "0002.2",
    name: "Sivakasi Royal Family Pack (35 Items)",
    content: "box",
    actualPrice: 12000,
    price: 1200,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "10",
    code: "0002.3",
    name: "Grand Festival Fireworks Hamper",
    content: "box",
    actualPrice: 18000,
    price: 1800,
    image: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "11",
    code: "0002.4",
    name: "Chakkar & Flowerpot Special Combo",
    content: "box",
    actualPrice: 2500,
    price: 250,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "12",
    code: "0002.5",
    name: "Night Sky Shot Special Pack (12 Pcs)",
    content: "box",
    actualPrice: 4500,
    price: 450,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "13",
    code: "0003.1",
    name: "Golden Sparklers Assorted Box",
    content: "box",
    actualPrice: 1500,
    price: 150,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "14",
    code: "0003.2",
    name: "Children Delight Sparkler Pack",
    content: "box",
    actualPrice: 1200,
    price: 120,
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "15",
    code: "0003.3",
    name: "Thunder Flash Sound Crackers Combo",
    content: "box",
    actualPrice: 3500,
    price: 350,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "16",
    code: "0003.4",
    name: "Multi-Color Fountain Mega Box",
    content: "box",
    actualPrice: 4000,
    price: 400,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "17",
    code: "0003.5",
    name: "Sky Rocket Spectacular Pack",
    content: "box",
    actualPrice: 3800,
    price: 380,
    image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "18",
    code: "0004.1",
    name: "Prestige VIP Celebration Hamper",
    content: "box",
    actualPrice: 22000,
    price: 2200,
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "19",
    code: "0004.2",
    name: "Classic 50 Items Festival Box",
    content: "box",
    actualPrice: 14000,
    price: 1400,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "20",
    code: "0004.3",
    name: "Eco Green Crackers Family Pack",
    content: "box",
    actualPrice: 8000,
    price: 800,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "21",
    code: "0004.4",
    name: "Twin Sparkler & Chakkars Wonder",
    content: "box",
    actualPrice: 2200,
    price: 220,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "22",
    code: "0004.5",
    name: "7 Shot Aerial Repeater Combo",
    content: "box",
    actualPrice: 5500,
    price: 550,
    image: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "23",
    code: "0005.1",
    name: "Peacock Feather Fountain Pack",
    content: "box",
    actualPrice: 3200,
    price: 320,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "24",
    code: "0005.2",
    name: "Deluxe Wedding Celebration Box",
    content: "box",
    actualPrice: 25000,
    price: 2500,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "25",
    code: "0005.3",
    name: "Deepavali Special Silver Pack",
    content: "box",
    actualPrice: 4800,
    price: 480,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "26",
    code: "0005.4",
    name: "Deepavali Special Gold Pack",
    content: "box",
    actualPrice: 9500,
    price: 950,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "27",
    code: "0005.5",
    name: "Deepavali Special Platinum Pack",
    content: "box",
    actualPrice: 16500,
    price: 1650,
    image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "28",
    code: "0006.1",
    name: "Mini Rockets & Whistling Bomb Pack",
    content: "box",
    actualPrice: 2800,
    price: 280,
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "29",
    code: "0006.2",
    name: "Twinkling Star Sparkler Assortment",
    content: "box",
    actualPrice: 1800,
    price: 180,
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "30",
    code: "0006.3",
    name: "Super Giant Wheel Chakkar Pack",
    content: "box",
    actualPrice: 3600,
    price: 360,
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "31",
    code: "0006.4",
    name: "Colourful Aerial Drone Shots Box",
    content: "box",
    actualPrice: 6200,
    price: 620,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "32",
    code: "0006.5",
    name: "Royal Sound & Light Fusion Combo",
    content: "box",
    actualPrice: 11000,
    price: 1100,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "33",
    code: "0007.1",
    name: "Diwali Budget Savings Box (15 Items)",
    content: "box",
    actualPrice: 2400,
    price: 240,
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "34",
    code: "0007.2",
    name: "Kids Safe Ground Sparkler Box",
    content: "box",
    actualPrice: 1600,
    price: 160,
    image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "35",
    code: "0007.3",
    name: "Flowerpots Deluxe Trio (Tri-Color)",
    content: "box",
    actualPrice: 2900,
    price: 290,
    image: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "36",
    code: "0007.4",
    name: "Galaxy Star Aerial Symphony Hamper",
    content: "box",
    actualPrice: 13500,
    price: 1350,
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "37",
    code: "0007.5",
    name: "Carnival Parachute Special Pack",
    content: "box",
    actualPrice: 4200,
    price: 420,
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "38",
    code: "0008.1",
    name: "Heritage Sivakasi Classic Cracker Pack",
    content: "box",
    actualPrice: 7500,
    price: 750,
    image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "39",
    code: "0008.2",
    name: "Celebration Super Saver Box (40 Items)",
    content: "box",
    actualPrice: 15500,
    price: 1550,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "40",
    code: "0008.3",
    name: "Ultimate Grand Finale Fireworks Mega Hamper",
    content: "box",
    actualPrice: 30000,
    price: 3000,
    image: "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
];

interface ComboPackTableProps {
  onAddToCart?: (count: number, item: ComboItem) => void;
}

export const ComboPackTable: React.FC<ComboPackTableProps> = ({ onAddToCart }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<ComboItem | null>(null);
  // Reset to page 1 whenever search query, sort order, or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, selectedCategory]);

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

  const handleAdd = (item: ComboItem) => {
    const currentQty = quantities[item.id] ?? 0;
    const qty = currentQty > 0 ? currentQty : 1;
    if (currentQty === 0) {
      setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    }

    if (onAddToCart) {
      onAddToCart(qty, item);
    }

    setAddedItemNotice("Item added");
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 2200);
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...COMBO_DATA];

    if (selectedCategory !== "all") {
      const cat = selectedCategory.toLowerCase();
      result = result.filter((it) => {
        const name = it.name.toLowerCase();
        if (cat === "kids") return name.includes("kids");
        if (cat === "family") return name.includes("family");
        if (cat === "gift") return name.includes("gift") || name.includes("mega") || name.includes("royal") || name.includes("hamper");
        if (cat === "combo") return name.includes("combo");
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.content.toLowerCase().includes(q)
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
  }, [searchQuery, sortBy, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedItems, currentPage]);

  const formatPrice = (val: number) => {
    return "₹" + val.toLocaleString("en-IN");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Smooth scroll back to table top
      const tableElem = document.querySelector(".combo-table-wrapper");
      if (tableElem) {
        tableElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
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
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.14)",
              zIndex: 9999,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{addedItemNotice}</span>
          </div>
        )}

        {/* Top Header & Toolbar Area */}
        <div className="combo-header-bar">
          <div className="combo-title-wrap">
            <h2 className="combo-heading">Explore Crackers</h2>
            <div className="combo-discount-badge">
              COMBO PACK (90% DISCOUNT)
            </div>
          </div>

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
                placeholder="Search in this category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="combo-search-field"
              />
            </div>

            {/* Sort Select */}
            <div className="combo-sort-pill">
              <span className="combo-sort-label">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="combo-sort-select"
                aria-label="Sort products"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
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
              <span className="combo-sort-label">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="combo-sort-select"
                aria-label="Category"
              >
                <option value="all">All</option>
                <option value="combo">Combo Packs</option>
                <option value="family">Family Packs</option>
                <option value="gift">Gift Boxes</option>
                <option value="kids">Kids Packs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="combo-table-card">
          <div className="combo-table-responsive">
            <table className="combo-data-table">
              <thead>
                <tr>
                  <th className="th-product">Product</th>
                  <th className="th-name">Product Name</th>
                  <th className="th-content">Content</th>
                  <th className="th-actual">Actual Price</th>
                  <th className="th-price">Price</th>
                  <th className="th-qty">Quantity</th>
                  <th className="th-total">Total</th>
                  <th className="th-action"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const qty = quantities[item.id] || 0;
                  const total = qty * item.price;

                  return (
                    <tr key={item.id} className="combo-table-row">
                      {/* Product Thumbnail */}
                      <td className="td-product">
                        <div
                          className="combo-thumb-box"
                          onClick={() => setActivePreview(item)}
                          title="Click to view packaging"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="combo-thumb-img"
                            loading="lazy"
                          />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="td-name">
                        <span className="combo-name-text">{item.name}</span>
                      </td>

                      {/* Content */}
                      <td className="td-content">
                        <span className="combo-content-text">{item.content}</span>
                      </td>

                      {/* Actual Price (Strikethrough) */}
                      <td className="td-actual">
                        <span className="combo-actual-price">
                          {formatPrice(item.actualPrice)}
                        </span>
                      </td>

                      {/* Discounted Price */}
                      <td className="td-price">
                        <span className="combo-current-price">
                          {formatPrice(item.price)}
                        </span>
                      </td>

                      {/* Quantity Stepper */}
                      <td className="td-qty">
                        <div className="combo-qty-stepper">
                          <button
                            type="button"
                            className="combo-qty-btn"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={qty <= 0}
                            aria-label="Decrease quantity"
                          >
                            –
                          </button>
                          <input
                            type="text"
                            className="combo-qty-input"
                            value={qty}
                            onChange={(e) => handleDirectQuantity(item.id, e.target.value)}
                            aria-label="Item quantity"
                          />
                          <button
                            type="button"
                            className="combo-qty-btn"
                            onClick={() => handleQuantityChange(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="td-total">
                        <span className="combo-total-price">
                          {formatPrice(total)}
                        </span>
                      </td>

                      {/* Add Button */}
                      <td className="td-action">
                        <button
                          type="button"
                          className="combo-add-btn"
                          onClick={() => handleAdd(item)}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
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
                          <span>Add</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paginatedItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="combo-empty-state">
                      No combo packs match your query "{searchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View: 100% visible on single screen without horizontal scrolling */}
          <div className="combo-mobile-list">
            {paginatedItems.map((item) => {
              const qty = quantities[item.id] || 0;
              const total = qty * item.price;

              return (
                <div key={item.id} className="combo-mobile-card">
                  <div className="combo-m-top">
                    {/* Thumbnail */}
                    <div
                      className="combo-m-thumb"
                      onClick={() => setActivePreview(item)}
                      title="Click to view packaging"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>

                    {/* Info */}
                    <div className="combo-m-info">
                      <div className="combo-m-meta">
                        <span className="combo-m-content">{item.content}</span>
                      </div>
                      <div className="combo-m-name">{item.name}</div>
                      <div className="combo-m-prices">
                        <span className="combo-m-actual">{formatPrice(item.actualPrice)}</span>
                        <span className="combo-m-current">{formatPrice(item.price)}</span>
                        {qty > 0 && (
                          <span className="combo-m-total-badge">
                            Total: {formatPrice(total)}
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
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <input
                        type="text"
                        className="combo-qty-input"
                        value={qty}
                        onChange={(e) => handleDirectQuantity(item.id, e.target.value)}
                        aria-label="Item quantity"
                      />
                      <button
                        type="button"
                        className="combo-qty-btn"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="combo-add-btn combo-m-add-btn"
                      onClick={() => handleAdd(item)}
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
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {paginatedItems.length === 0 && (
              <div className="combo-empty-state">
                No combo packs match your query "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Pagination Bar with Prev and Next Buttons */}
        {totalPages > 1 && (
          <div className="combo-pagination-bar">
            <div className="combo-pagination-info">
              Showing{" "}
              <span className="combo-pagination-num">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} – {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedItems.length)}
              </span>{" "}
              of{" "}
              <span className="combo-pagination-num">
                {filteredAndSortedItems.length}
              </span>{" "}
              items
            </div>
            <div className="combo-pagination-controls">
              <button
                type="button"
                className="combo-page-nav-btn combo-page-prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Prev</span>
              </button>

              <div className="combo-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`combo-page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}
                    aria-label={`Page ${pageNum}`}
                  >
                    {String(pageNum).padStart(2, "0")}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="combo-page-nav-btn combo-page-next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                <span>Next</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}



        {/* Image Preview Lightbox */}
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
                aria-label="Close preview"
              >
                ✕
              </button>
              <img
                src={activePreview.image}
                alt={activePreview.name}
                className="combo-lightbox-img"
              />
              <div className="combo-lightbox-info">
                <h3>{activePreview.name}</h3>
                <p>Price: {formatPrice(activePreview.price)} • {activePreview.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
