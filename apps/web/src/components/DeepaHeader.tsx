import React, { useState } from "react";
import "./DeepaHeader.css";

interface DeepaHeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

export const DeepaHeader: React.FC<DeepaHeaderProps> = ({
  cartCount = 0,
  onOpenCart,
  selectedLocation = "Salem",
  onSelectLocation,
}) => {
  const [activeNav, setActiveNav] = useState("Home");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = ["Home", "Shop", "About", "Locations", "Contact"];
  const locations = [
    "Salem",
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Sivakasi",
    "Bangalore",
  ];

  return (
    <header className="deepa-header">
      <div className="deepa-header-inner">
        {/* Brand Logo: Gold Sunburst + DeepaKart */}
        <div className="deepa-logo-group">
          <svg className="deepa-spark-icon" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="1.5" fill="#c38b55" />
            <line
              x1="18"
              y1="4"
              x2="18"
              y2="10"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="26"
              x2="18"
              y2="32"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="4"
              y1="18"
              x2="10"
              y2="18"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="26"
              y1="18"
              x2="32"
              y2="18"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8.1"
              y1="8.1"
              x2="12.3"
              y2="12.3"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="23.7"
              y1="23.7"
              x2="27.9"
              y2="27.9"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="27.9"
              y1="8.1"
              x2="23.7"
              y2="12.3"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="12.3"
              y1="23.7"
              x2="8.1"
              y2="27.9"
              stroke="#c38b55"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="12"
              x2="18"
              y2="14"
              stroke="#dcb17a"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="22"
              x2="18"
              y2="24"
              stroke="#dcb17a"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="18"
              x2="14"
              y2="18"
              stroke="#dcb17a"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="18"
              x2="24"
              y2="18"
              stroke="#dcb17a"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
          <span className="deepa-brand-name">DeepaKart</span>
        </div>

        {/* Navigation items with active gold indicator */}
        <nav className="deepa-nav-links">
          {navLinks.map((item) => (
            <button
              key={item}
              className={`deepa-nav-link ${activeNav === item ? "active" : ""}`}
              onClick={() => setActiveNav(item)}
            >
              {item}
              {activeNav === item && <span className="deepa-nav-indicator" />}
            </button>
          ))}
        </nav>

        {/* Right utility controls */}
        <div className="deepa-header-actions">
          {/* Search Pill */}
          <div className="deepa-search-pill">
            <input
              type="text"
              placeholder="Search crackers, brands, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="deepa-search-input"
            />
            <svg
              className="deepa-search-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </div>

          {/* Location Dropdown (Salem ˅) */}
          <div className="deepa-location-picker">
            <button
              className="deepa-location-btn"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              <span className="deepa-location-text">{selectedLocation}</span>
              <svg
                className="deepa-chevron"
                viewBox="0 0 24 24"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showLocationDropdown && (
              <div className="deepa-dropdown-menu">
                {locations.map((loc) => (
                  <button
                    key={loc}
                    className={`deepa-dropdown-item ${selectedLocation === loc ? "selected" : ""}`}
                    onClick={() => {
                      onSelectLocation?.(loc);
                      setShowLocationDropdown(false);
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account Silhouette */}
          <button className="deepa-icon-btn" aria-label="User account">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="7" r="4" strokeLinecap="round" />
            </svg>
          </button>

          {/* Cart Icon with Gold Badge */}
          <button
            className="deepa-icon-btn deepa-cart-btn"
            onClick={onOpenCart}
            aria-label="Shopping Cart"
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
            <span className="deepa-cart-badge">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
