import React, { useState, useMemo, useEffect } from "react";
import "./ComboPackTable.css";
import {
  fetchBackendProducts,
  fetchBackendCategories,
  mapBackendProductToComboItem,
} from "../api/products";

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

const COMBO_DATA: ComboItem[] = [
  {
    id: "1",
    code: "251",
    name: "3000 COMBO PACK (kids pack)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 3000,
    price: 300,
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    code: "252",
    name: "15000 COMBO PACK (family combo pack)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 15000,
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    code: "253",
    name: "Vinayagar chaturthi (15000 COMBO PACK )",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 15000,
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    code: "0001.1",
    name: "1999 combo pack -1",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 2000,
    price: 200,
    image:
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "5",
    code: "0001.2",
    name: "3000 combo pack -1",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 3000,
    price: 300,
    image:
      "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "6",
    code: "0001.3",
    name: "5000 combo pack -1",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 5000,
    price: 500,
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "7",
    code: "0001.5",
    name: "10,000 combo pack -1",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 10000,
    price: 1000,
    image:
      "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "8",
    code: "0002.1",
    name: "Diwali Mega Gift Box (25 Items)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 6000,
    price: 600,
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "9",
    code: "0002.2",
    name: "Sivakasi Royal Family Pack (35 Items)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 12000,
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "10",
    code: "0002.3",
    name: "Grand Festival Fireworks Hamper",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 18000,
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "11",
    code: "0002.4",
    name: "Chakkar & Flowerpot Special Combo",
    category: "Ground Chakkars",
    content: "box",
    actualPrice: 2500,
    price: 250,
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "12",
    code: "0002.5",
    name: "Night Sky Shot Special Pack (12 Pcs)",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 4500,
    price: 450,
    image:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "13",
    code: "0003.1",
    name: "Golden Sparklers Assorted Box",
    category: "Sparklers",
    content: "box",
    actualPrice: 1500,
    price: 150,
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "14",
    code: "0003.2",
    name: "Children Delight Sparkler Pack",
    category: "Sparklers",
    content: "box",
    actualPrice: 1200,
    price: 120,
    image:
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "15",
    code: "0003.3",
    name: "Thunder Flash Sound Crackers Combo",
    category: "Sound Crackers",
    content: "box",
    actualPrice: 3500,
    price: 350,
    image:
      "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "16",
    code: "0003.4",
    name: "Multi-Color Fountain Mega Box",
    category: "Flower Pots & Fountains",
    content: "box",
    actualPrice: 4000,
    price: 400,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "17",
    code: "0003.5",
    name: "Sky Rocket Spectacular Pack",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 3800,
    price: 380,
    image:
      "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "18",
    code: "0004.1",
    name: "Prestige VIP Celebration Hamper",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 22000,
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "19",
    code: "0004.2",
    name: "Classic 50 Items Festival Box",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 14000,
    price: 1400,
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "20",
    code: "0004.3",
    name: "Eco Green Crackers Family Pack",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 8000,
    price: 800,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "21",
    code: "0004.4",
    name: "Twin Sparkler & Chakkars Wonder",
    category: "Ground Chakkars",
    content: "box",
    actualPrice: 2200,
    price: 220,
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "22",
    code: "0004.5",
    name: "7 Shot Aerial Repeater Combo",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 5500,
    price: 550,
    image:
      "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "23",
    code: "0005.1",
    name: "Peacock Feather Fountain Pack",
    category: "Flower Pots & Fountains",
    content: "box",
    actualPrice: 3200,
    price: 320,
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "24",
    code: "0005.2",
    name: "Deluxe Wedding Celebration Box",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 25000,
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "25",
    code: "0005.3",
    name: "Deepavali Special Silver Pack",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 4800,
    price: 480,
    image:
      "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "26",
    code: "0005.4",
    name: "Deepavali Special Gold Pack",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 9500,
    price: 950,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "27",
    code: "0005.5",
    name: "Deepavali Special Platinum Pack",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 16500,
    price: 1650,
    image:
      "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "28",
    code: "0006.1",
    name: "Mini Rockets & Whistling Bomb Pack",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 2800,
    price: 280,
    image:
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "29",
    code: "0006.2",
    name: "Twinkling Star Sparkler Assortment",
    category: "Sparklers",
    content: "box",
    actualPrice: 1800,
    price: 180,
    image:
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "30",
    code: "0006.3",
    name: "Super Giant Wheel Chakkar Pack",
    category: "Ground Chakkars",
    content: "box",
    actualPrice: 3600,
    price: 360,
    image:
      "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "31",
    code: "0006.4",
    name: "Colourful Aerial Drone Shots Box",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 6200,
    price: 620,
    image:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "32",
    code: "0006.5",
    name: "Royal Sound & Light Fusion Combo",
    category: "Sound Crackers",
    content: "box",
    actualPrice: 11000,
    price: 1100,
    image:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "33",
    code: "0007.1",
    name: "Diwali Budget Savings Box (15 Items)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 2400,
    price: 240,
    image:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "34",
    code: "0007.2",
    name: "Kids Safe Ground Sparkler Box",
    category: "Sparklers",
    content: "box",
    actualPrice: 1600,
    price: 160,
    image:
      "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "35",
    code: "0007.3",
    name: "Flowerpots Deluxe Trio (Tri-Color)",
    category: "Flower Pots & Fountains",
    content: "box",
    actualPrice: 2900,
    price: 290,
    image:
      "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "36",
    code: "0007.4",
    name: "Galaxy Star Aerial Symphony Hamper",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 13500,
    price: 1350,
    image:
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "37",
    code: "0007.5",
    name: "Carnival Parachute Special Pack",
    category: "Rockets & Aerial Skyshots",
    content: "box",
    actualPrice: 4200,
    price: 420,
    image:
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "38",
    code: "0008.1",
    name: "Heritage Sivakasi Classic Cracker Pack",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 7500,
    price: 750,
    image:
      "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "39",
    code: "0008.2",
    name: "Celebration Super Saver Box (40 Items)",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 15500,
    price: 1550,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "40",
    code: "0008.3",
    name: "Ultimate Grand Finale Fireworks Mega Hamper",
    category: "Combo Packs & Gift Boxes",
    content: "box",
    actualPrice: 30000,
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=400&q=80",
  },
];

interface ComboPackTableProps {
  onAddToCart?: (count: number, item: ComboItem) => void;
}

export const ComboPackTable: React.FC<ComboPackTableProps> = ({ onAddToCart }) => {
  const [items, setItems] = useState<ComboItem[]>(COMBO_DATA);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);
  const [activePreview, setActivePreview] = useState<ComboItem | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
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
          setCategoriesList(
            Array.from(new Set(COMBO_DATA.map((it) => it.category))),
          );
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch backend products:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

    setAddedItemNotice("Item added to cart");
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
            <h2 className="combo-heading">Explore Crackers</h2>
            <div className="combo-discount-badge">COMBO PACK (90% DISCOUNT)</div>
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
                }}
                className="combo-sort-select"
                aria-label="Category"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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
                {groupedCategories.map(({ category, items }) => (
                  <React.Fragment key={category}>
                    <tr className="combo-category-header-row">
                      <td colSpan={8} className="combo-category-header-td">
                        <div className="combo-category-header">
                          <span className="combo-category-title">{category}</span>
                          <span className="combo-category-badge">
                            {items.length} {items.length === 1 ? "Product" : "Products"}
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
                                  <span>Added</span>
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
                                  <span>Add</span>
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
                  <span className="combo-category-title">{category}</span>
                  <span className="combo-category-badge">
                    {items.length} {items.length === 1 ? "Product" : "Products"}
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
                          title="Click to view packaging"
                        >
                          <img src={item.image} alt={item.name} loading="lazy" />
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
                              <span>Added</span>
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
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {displayedItems.length === 0 && (
              <div className="combo-empty-state">No crackers match your query "{searchQuery}".</div>
            )}
          </div>
        </div>

        {/* Image Preview Lightbox */}
        {activePreview && (
          <div className="combo-lightbox-backdrop" onClick={() => setActivePreview(null)}>
            <div className="combo-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
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
                <p>
                  Price: {formatPrice(activePreview.price)} • {activePreview.content}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
