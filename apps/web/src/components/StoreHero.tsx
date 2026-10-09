import React from "react";
import "./StoreHero.css";

interface StoreHeroProps {
  onAction?: () => void;
}

export const StoreHero: React.FC<StoreHeroProps> = ({ onAction }) => {
  const handleScrollToProducts = () => {
    if (onAction) {
      onAction();
    } else {
      const table = document.querySelector(".combo-table-wrapper");
      if (table) {
        table.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="store-hero-wrapper">
      {/* 1. Desktop / Laptop Web View Banner (Wide Landscape) */}
      <div
        className="store-hero-desktop"
        onClick={handleScrollToProducts}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleScrollToProducts();
          }
        }}
        aria-label="Shanthi Sivakasi Crackers - Shop Now"
      >
        <div className="store-hero-desktop-card">
          <img
            src="/home/home-web.png"
            alt="Shanthi Sivakasi Crackers Kalingiam 2026 - Direct Wholesale Depot"
            className="store-hero-desktop-img"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* 2. Mobile Responsive Hero Placeholder (Empty) */}
      <div className="store-hero-mobile">
        <div className="store-hero-mobile-placeholder" aria-hidden="true" />
      </div>
    </section>
  );
};
