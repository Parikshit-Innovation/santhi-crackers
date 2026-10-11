import React from "react";
import "./StoreHero.css";
import { useLanguage } from "../context/LanguageContext";

interface StoreHeroProps {
  onAction?: () => void;
}

export const StoreHero: React.FC<StoreHeroProps> = ({ onAction }) => {
  const { t } = useLanguage();

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
      <div
        className="store-hero-card"
        onClick={handleScrollToProducts}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleScrollToProducts();
          }
        }}
        aria-label={t("Shanthi Sivakasi Crackers - Shop Now")}
      >
        <img
          src="/home/image.png"
          alt={t("Shanthi Sivakasi Crackers Kalingiam 2026 - Direct Wholesale Depot")}
          className="store-hero-img"
          loading="eager"
          fetchPriority="high"
          width="1584"
          height="672"
        />
      </div>
    </section>
  );
};

