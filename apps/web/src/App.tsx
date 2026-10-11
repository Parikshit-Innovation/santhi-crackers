import { useEffect, useState } from "react";
import {
    BackendCart,
    fetchBackendCart,
    loadCachedCart,
    mapBackendCartItemToCartEntry,
    saveCachedCart,
} from "./api/cart";
import { AboutSection } from "./components/AboutSection";
import { ComboItem, ComboPackTable } from "./components/ComboPackTable";
import { ContactSection } from "./components/ContactSection";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { MarqueeBanner } from "./components/MarqueeBanner";
import { CartEntry, StoreCartDrawer } from "./components/StoreCartDrawer";
import { StoreFooter } from "./components/StoreFooter";
import { StoreHero } from "./components/StoreHero";
import { StoreNavbar } from "./components/StoreNavbar";
import { DiwaliFestiveBackground } from "./components/DiwaliFestiveBackground";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "about" | "contact">("home");
  const [cartItems, setCartItems] = useState<CartEntry[]>(() => loadCachedCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [backendCart, setBackendCart] = useState<BackendCart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Initialize and synchronize backend cart from GET /api/cart
  useEffect(() => {
    let isMounted = true;
    setIsCartLoading(true);

    fetchBackendCart()
      .then((cart) => {
        if (!isMounted || !cart) return;
        setBackendCart(cart);

        // If backend session cart has existing items, synchronize into cart state
        if (cart.items && cart.items.length > 0) {
          const mapped = cart.items.map((it) => mapBackendCartItemToCartEntry(it));
          setCartItems(mapped);
          saveCachedCart(mapped);
        }
      })
      .catch((err) => {
        console.warn("Unable to fetch backend cart session:", err);
      })
      .finally(() => {
        if (isMounted) setIsCartLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist updated cart items locally
  useEffect(() => {
    saveCachedCart(cartItems);
  }, [cartItems]);

  const cartCount = cartItems.reduce((acc, entry) => acc + entry.quantity, 0);

  const handleAddToCart = (qty: number, item: ComboItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + qty } : entry,
        );
      }
      return [...prev, { item, quantity: qty }];
    });
    // Item added smoothly to cart state without opening drawer automatically
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((entry) => entry.item.id !== id);
      }
      return prev.map((entry) => (entry.item.id === id ? { ...entry, quantity: newQty } : entry));
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((entry) => entry.item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleGoToProducts = () => {
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gradient-blue, linear-gradient(135deg, #0e1a47 0%, #0a2abf 35%, #0036f5 65%, #101e54 100%)) fixed",
        backgroundColor: "#0e1a47",
        fontFamily: "var(--font-geist, 'Geist', 'Geist Sans', 'Noto Sans Tamil', sans-serif)",
        fontWeight: 400,
        width: "100%",
        maxWidth: "100vw",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* Mild Diwali festive ambient backdrop (responsive, pointer-events: none, no hover effects) */}
      <DiwaliFestiveBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <StoreNavbar
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          activePage={currentPage}
          onNavigate={(page) => setCurrentPage(page as "home" | "about" | "contact")}
        />
        <main>
          {currentPage === "about" ? (
            <AboutSection onExploreProducts={handleGoToProducts} />
          ) : currentPage === "contact" ? (
            <ContactSection onNavigateHome={handleGoToProducts} />
          ) : (
            <>
              <StoreHero />
              <MarqueeBanner />
              <ComboPackTable onAddToCart={handleAddToCart} />
              <StoreFooter
                onNavigate={(page) => setCurrentPage(page as "home" | "about" | "contact")}
              />
            </>
          )}
        </main>

        <FloatingWhatsApp />

        <StoreCartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          backendCartId={backendCart?.id}
          isLoading={isCartLoading}
        />
      </div>
    </div>
  );
}
