import React, { useState, useEffect } from "react";
import "./StoreNavbar.css";

interface StoreNavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  cartCount = 0,
  onCartClick,
  activePage = "home",
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState(
    activePage === "about" ? "About" : activePage === "contact" ? "Contact us" : "Home"
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

  const links = ["Home", "About", "Apparel", "Contact us", "Blog"];

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
          {/* Brand Name */}
          <div className="store-brand" onClick={() => handleTabClick("Home")}>
            <span className="store-brand-text">Your Next Store</span>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="store-nav-menu">
            {links.map((link) => (
              <button
                key={link}
                className={`store-nav-item ${activeTab === link ? "active" : ""}`}
                onClick={() => handleTabClick(link)}
              >
                {link}
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
                placeholder="Search products"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="store-search-input"
              />
            </div>

            {/* Cart Icon (desktop & mobile header) */}
            <button
              className="store-icon-btn store-cart-btn"
              aria-label="Cart"
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
              {cartCount > 0 && (
                <span className="store-cart-badge">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Amazon-style Mobile Bottom Navigation Bar (Icons Alone) */}
      <nav className="store-bottom-nav" aria-label="Mobile Navigation">
        {/* 1. Home Icon */}
        <button
          type="button"
          className={`store-bottom-btn ${activeTab === "home" || activeTab === "Home" || activeTab === "products" || activeTab === "All products" ? "active" : ""}`}
          onClick={() => handleTabClick("Home")}
          aria-label="Home"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>

        {/* 2. Search Icon */}
        <button
          type="button"
          className={`store-bottom-btn ${activeTab === "search" ? "active" : ""}`}
          onClick={() => handleTabClick("search")}
          aria-label="Search"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* 3. About Icon (Middle Item) */}
        <button
          type="button"
          className={`store-bottom-btn ${activeTab === "about" || activeTab === "About" ? "active" : ""}`}
          onClick={() => handleTabClick("About")}
          aria-label="About"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>

        {/* 4. Cart Icon (with badge) */}
        <button
          type="button"
          className={`store-bottom-btn ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => handleTabClick("cart")}
          aria-label="Cart"
        >
          <div className="store-bottom-icon-wrap">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="store-bottom-cart-badge">{cartCount}</span>
            )}
          </div>
        </button>

        {/* 5. Location Icon */}
        <button
          type="button"
          className={`store-bottom-btn ${activeTab === "location" || activeTab === "Contact us" ? "active" : ""}`}
          onClick={() => handleTabClick("location")}
          aria-label="Location"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </button>
      </nav>
    </>
  );
};

