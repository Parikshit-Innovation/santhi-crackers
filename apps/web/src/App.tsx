import { useState } from "react";
import { StoreNavbar } from "./components/StoreNavbar";
import { StoreHero } from "./components/StoreHero";
import { MarqueeBanner } from "./components/MarqueeBanner";
import { ComboPackTable, ComboItem } from "./components/ComboPackTable";
import { StoreCartDrawer, CartEntry } from "./components/StoreCartDrawer";
import { AboutSection } from "./components/AboutSection";
import { ContactSection } from "./components/ContactSection";
import { StoreFooter } from "./components/StoreFooter";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "about" | "contact">("home");
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, entry) => acc + entry.quantity, 0);

  const handleAddToCart = (qty: number, item: ComboItem) => {
    setCartItems((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id
            ? { ...entry, quantity: entry.quantity + qty }
            : entry
        );
      }
      return [...prev, { item, quantity: qty }];
    });
    // Trigger slide-over cart drawer from right to left
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCartItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((entry) => entry.item.id !== id);
      }
      return prev.map((entry) =>
        entry.item.id === id ? { ...entry, quantity: newQty } : entry
      );
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
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
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
            <StoreFooter onNavigate={(page) => setCurrentPage(page as "home" | "about" | "contact")} />
          </>
        )}
      </main>

      <StoreCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}

