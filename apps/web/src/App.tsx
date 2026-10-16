import { useEffect, useState } from "react";
import {
    BackendCart,
    fetchBackendCart,
    loadCachedCart,
    mapBackendCartItemToCartEntry,
    saveCachedCart,
} from "./api/cart";
import { AboutSection } from "./components/AboutSection";
import { CheckoutConfirmation, PlacedOrderData } from "./components/CheckoutConfirmation";
import { ComboItem, ComboPackTable } from "./components/ComboPackTable";
import { ContactSection } from "./components/ContactSection";
import { DiwaliFestiveBackground } from "./components/DiwaliFestiveBackground";
import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { MarqueeBanner } from "./components/MarqueeBanner";
import { OrderReceipt } from "./components/OrderReceipt";
import { CartEntry, StoreCartDrawer } from "./components/StoreCartDrawer";
import { StoreFooter } from "./components/StoreFooter";
import { StoreHero } from "./components/StoreHero";
import { StoreNavbar } from "./components/StoreNavbar";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "about" | "contact" | "checkout" | "receipt">("home");
  const [cartItems, setCartItems] = useState<CartEntry[]>(() => loadCachedCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [backendCart, setBackendCart] = useState<BackendCart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<PlacedOrderData | null>(null);

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

  // Check URL params for checkout
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "checkout") {
        setCurrentPage("checkout");
      }
    } catch {
      // ignore
    }
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
  };

  const handleSetItemQuantity = (item: ComboItem, qty: number) => {
    setCartItems((prev) => {
      if (qty <= 0) {
        return prev.filter((entry) => entry.item.id !== item.id);
      }
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: qty } : entry,
        );
      }
      return [...prev, { item, quantity: qty }];
    });
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
        background: "#FFFFFF",
        backgroundColor: "#FFFFFF",
        color: "var(--text-main, #150A06)",
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
              <ComboPackTable
                cartItems={cartItems}
                onSetQuantity={handleSetItemQuantity}
                onAddToCart={handleAddToCart}
                onCartClick={() => setIsCartOpen(true)}
              />
              <StoreFooter
                onNavigate={(page) => setCurrentPage(page as "home" | "about" | "contact")}
              />
              {currentPage === "checkout" && (
                <CheckoutConfirmation
                  isOpen={true}
                  cartItems={cartItems}
                  onBack={() => {
                    setCurrentPage("home");
                    setIsCartOpen(true);
                  }}
                  onNavigateHome={handleGoToProducts}
                  onOrderPlaced={(order) => {
                    setCurrentOrder(order);
                  }}
                  onViewReceipt={(order) => {
                    setCurrentOrder(order);
                    setCurrentPage("receipt");
                  }}
                />
              )}
              {currentPage === "receipt" && currentOrder && (
                <OrderReceipt
                  isOpen={true}
                  order={currentOrder}
                  onNavigateHome={handleGoToProducts}
                />
              )}
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
          onProceedToCheckout={() => {
            setCurrentPage("checkout");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
