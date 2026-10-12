import React, { useState, useEffect } from "react";
import "./StoreNavbar.css";
import { useLanguage } from "../context/LanguageContext";

interface StoreNavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
  activePage?: string;
  onNavigate?: (page: string) => void;
  hideBottomNav?: boolean;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  cartCount = 0,
  onCartClick,
  activePage = "home",
  onNavigate,
  hideBottomNav = false,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState(
    activePage === "about" ? "About" : activePage === "contact" ? "Contact us" : "Home",
  );
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    if (activePage === "about") {
      setActiveTab("About");
    } else if (activePage === "contact") {
      setActiveTab("Contact us");
    } else {
      setActiveTab("Home");
    }
  }, [activePage]);

  const links = ["Home", "About", "Contact us"];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === "About" || tab === "about") {
      if (onNavigate) onNavigate("about");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (tab === "Contact us" || tab === "contact" || tab === "location") {
      if (onNavigate) onNavigate("contact");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (tab === "Home" || tab === "home" || tab === "All products" || tab === "products") {
      if (onNavigate) onNavigate("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    switch (tab) {
      case "search": {
        if (onNavigate) onNavigate("home");
        setTimeout(() => {
          const searchInput = document.querySelector<HTMLInputElement>(".combo-search-field");
          if (searchInput) {
            searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
            searchInput.focus();
          }
        }, 150);
        break;
      }
      case "cart": {
        if (onCartClick) {
          onCartClick();
        }
        break;
      }
      case "menu": {
        if (onNavigate) onNavigate("home");
        setTimeout(() => {
          const table = document.querySelector(".combo-table-wrapper");
          if (table) {
            table.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
        break;
      }
      default:
        break;
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="store-nav-header">
        <div className="store-nav-container">
          {/* Brand Logo & Name */}
          <div
            className="store-brand"
            onClick={() => handleTabClick("Home")}
            role="button"
            tabIndex={0}
            aria-label="Shanthi Crackers | சாந்தி பட்டாசுகள்"
          >
            <img
              src="/home/logo-santhi.png"
              alt="Shanthi Crackers | சாந்தி பட்டாசுகள்"
              className="store-brand-logo"
            />
            <div className="store-brand-text-wrap">
              <span className="store-brand-text">Shanthi Crackers</span>
              <span className="store-brand-tamil">சாந்தி பட்டாசுகள்</span>
            </div>
            <span className="store-diwali-pill">
              <span aria-hidden="true">🪔</span>
              <span>{language === "ta" ? "தீபாவளி 2026" : "Diwali 2026"}</span>
            </span>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="store-nav-menu">
            {links.map((link) => (
              <button
                key={link}
                className={`store-nav-item ${activeTab === link ? "active" : ""}`}
                onClick={() => handleTabClick(link)}
              >
                {t(link)}
              </button>
            ))}
          </nav>

          {/* Right: Search & Cart */}
          <div className="store-nav-actions">
            {/* Search Pill (desktop) */}
            <div className="store-search-wrap">
              <svg
                className="store-search-icon"
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
                placeholder={t("Search products")}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="store-search-input"
              />
            </div>

            {/* Language Switch Button */}
            <button
              type="button"
              id="header-lang-btn"
              className="store-icon-btn store-lang-btn"
              aria-label={t("Language selection")}
              title={language === "en" ? "Switch to தமிழ்" : "Switch to English"}
              onClick={toggleLanguage}
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="store-lang-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="store-lang-badge">{language === "ta" ? "தமிழ்" : "EN"}</span>
            </button>

            {/* Cart Icon (desktop & mobile header) */}
            <button
              id="header-cart-btn"
              className="store-icon-btn store-cart-btn"
              aria-label={t("Cart")}
              onClick={() => handleTabClick("cart")}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path
                  d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {cartCount > 0 && <span className="store-cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar: Home, Cart, About, Location */}
      {!hideBottomNav && (
        <nav className="store-bottom-nav" aria-label={t("Mobile navigation")}>
          {/* 1. Home Icon */}
          <button
            type="button"
            className={`store-bottom-btn ${activeTab === "home" || activeTab === "Home" || activeTab === "products" || activeTab === "All products" ? "active" : ""}`}
            onClick={() => handleTabClick("Home")}
            aria-label={t("Home")}
            title={t("Home")}
          >
            <div className="store-bottom-item-inner">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="store-bottom-label">{t("Home")}</span>
            </div>
          </button>

          {/* 2. Cart Icon (with badge) */}
          <button
            type="button"
            id="mobile-footer-cart-btn"
            className={`store-bottom-btn ${activeTab === "cart" ? "active" : ""}`}
            onClick={() => handleTabClick("cart")}
            aria-label={t("Cart")}
            title={t("Cart")}
          >
            <div className="store-bottom-item-inner">
              <div className="store-bottom-icon-wrap">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && <span className="store-bottom-cart-badge">{cartCount}</span>}
              </div>
              <span className="store-bottom-label">{t("Cart")}</span>
            </div>
          </button>

          {/* 3. About Icon */}
          <button
            type="button"
            className={`store-bottom-btn ${activeTab === "about" || activeTab === "About" ? "active" : ""}`}
            onClick={() => handleTabClick("About")}
            aria-label={t("About")}
            title={t("About")}
          >
            <div className="store-bottom-item-inner">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="store-bottom-label">{t("About")}</span>
            </div>
          </button>

          {/* 4. Location Icon */}
          <button
            type="button"
            className={`store-bottom-btn ${activeTab === "location" || activeTab === "Contact us" || activeTab === "contact" ? "active" : ""}`}
            onClick={() => handleTabClick("location")}
            aria-label={t("Location")}
            title={t("Location")}
          >
            <div className="store-bottom-item-inner">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="store-bottom-label">{t("Location")}</span>
            </div>
          </button>
        </nav>
      )}
    </>
  );
};

