import React, { useState } from "react";
import "./Navbar.css";

interface NavbarProps {
  topAddress?: string;
  storeName?: string;
  brandTagline?: string;
  locationTitle?: string;
  addressLines?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  phone?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  topAddress = "3/1322/3/1, Opposite to SNM Matriculation School, Checkpost, Parapatti, Sivakasi, Tamil Nadu 626 189",
  storeName = "S.R.TRADERS",
  brandTagline = "ELEPHANT CRACKERS",
  locationTitle = "Location",
  addressLines = [
    "3/1322/3/1 , Opposite to SNM Matriculation School, Checkpost,",
    "Parapatti, Sivakasi, Tamil Nadu 626 189",
  ],
  activeTab = "Home",
  onTabChange,
  phone = "919443123456",
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = ["Home", "About", "Pricelist", "Contact Us"];

  const handleSelect = (item: string) => {
    setCurrentTab(item);
    onTabChange?.(item);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sr-navbar">
      {/* 1. TOP PURPLE STRIP */}
      <div className="sr-top-strip">
        <div className="sr-top-container">
          <div className="sr-top-address">
            <span className="sr-top-address-text">{topAddress}</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE WHITE HEADER */}
      <div className="sr-middle-header">
        <div className="sr-middle-container">
          {/* Left: Location */}
          <div className="sr-location-box">
            <div className="sr-maps-pin">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#4285F4"
                />
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.43 5.47 3.5 8.75l3.5 4.25s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EA4335"
                />
                <path
                  d="M12 2C10.5 2 9.1 2.5 8 3.35l7.5 9.15c2.1-3.28 3.5-6.37 3.5-8.75 0-3.87-3.13-7-7-7z"
                  fill="#FBBC05"
                />
                <path
                  d="M8.5 12.5L5 9c0 5.25 7 13 7 13l-3.5-9.5z"
                  fill="#34A853"
                />
                <circle cx="12" cy="9" r="3" fill="#ffffff" />
              </svg>
            </div>
            <div className="sr-location-details">
              <span className="sr-location-title">{locationTitle}</span>
              <div className="sr-location-lines">
                {addressLines.map((line, idx) => (
                  <span key={idx} className="sr-address-line">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Brand Crest Logo */}
          <div className="sr-brand-logo-center">
            <div className="sr-brand-name-top">{storeName}</div>

            {/* Stars & Shield Crest */}
            <div className="sr-shield-wrapper">
              <div className="sr-stars-arc">
                {[0, 1, 2, 3, 4].map((i) => (
                  <svg
                    key={i}
                    className="sr-star-icon"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                  >
                    <polygon
                      points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
                      fill="#f59e0b"
                    />
                  </svg>
                ))}
              </div>

              {/* Shield Mascot */}
              <div className="sr-shield-crest">
                <svg viewBox="0 0 100 115" className="sr-shield-svg">
                  <defs>
                    <linearGradient
                      id="shieldBg"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <linearGradient
                      id="shieldBorder"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>

                  {/* Shield Path */}
                  <path
                    d="M 50 5 L 90 20 L 90 60 C 90 90 50 110 50 110 C 50 110 10 90 10 60 L 10 20 Z"
                    fill="url(#shieldBg)"
                    stroke="url(#shieldBorder)"
                    strokeWidth="5"
                  />
                  <path
                    d="M 50 12 L 84 25 L 84 58 C 84 83 50 101 50 101 C 50 101 16 83 16 58 L 16 25 Z"
                    fill="#ffffff"
                  />

                  {/* Cute Elephant Mascot Graphic */}
                  <g transform="translate(20, 26) scale(0.6)">
                    {/* Ears */}
                    <circle
                      cx="15"
                      cy="40"
                      r="24"
                      fill="#fed7aa"
                      stroke="#ea580c"
                      strokeWidth="3"
                    />
                    <circle
                      cx="15"
                      cy="40"
                      r="14"
                      fill="#f43f5e"
                      opacity="0.5"
                    />
                    <circle
                      cx="85"
                      cy="40"
                      r="24"
                      fill="#fed7aa"
                      stroke="#ea580c"
                      strokeWidth="3"
                    />
                    <circle
                      cx="85"
                      cy="40"
                      r="14"
                      fill="#f43f5e"
                      opacity="0.5"
                    />

                    {/* Head */}
                    <circle
                      cx="50"
                      cy="45"
                      r="28"
                      fill="#e2e8f0"
                      stroke="#475569"
                      strokeWidth="3"
                    />

                    {/* Crown / Cap */}
                    <polygon
                      points="50,10 40,25 60,25"
                      fill="#f59e0b"
                      stroke="#b45309"
                      strokeWidth="2"
                    />
                    <circle cx="50" cy="8" r="4" fill="#ef4444" />

                    {/* Eyes */}
                    <ellipse cx="40" cy="40" rx="4" ry="6" fill="#0f172a" />
                    <circle cx="42" cy="38" r="2" fill="#ffffff" />
                    <ellipse cx="60" cy="40" rx="4" ry="6" fill="#0f172a" />
                    <circle cx="62" cy="38" r="2" fill="#ffffff" />

                    {/* Rosy Cheeks */}
                    <ellipse
                      cx="32"
                      cy="50"
                      rx="5"
                      ry="3"
                      fill="#f43f5e"
                      opacity="0.4"
                    />
                    <ellipse
                      cx="68"
                      cy="50"
                      rx="5"
                      ry="3"
                      fill="#f43f5e"
                      opacity="0.4"
                    />

                    {/* Trunk */}
                    <path
                      d="M 45 48 C 45 68 56 68 56 78 C 56 82 50 82 48 78"
                      fill="none"
                      stroke="#475569"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />

                    {/* Tusks */}
                    <path
                      d="M 38 56 C 36 62 33 60 35 55"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    />
                    <path
                      d="M 62 56 C 64 62 67 60 65 55"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                    />

                    {/* Feet */}
                    <ellipse
                      cx="36"
                      cy="88"
                      rx="10"
                      ry="7"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                    <ellipse
                      cx="64"
                      cy="88"
                      rx="10"
                      ry="7"
                      fill="#cbd5e1"
                      stroke="#475569"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>
            </div>

            <div className="sr-brand-tagline-bottom">{brandTagline}</div>
          </div>

          {/* Right: Follow on */}
          <div className="sr-follow-box">
            <span className="sr-follow-title">Follow on</span>
            <div className="sr-social-row">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="sr-social-btn sr-social-whatsapp"
                title="WhatsApp"
              >
                <svg viewBox="0 0 32 32" width="42" height="42" fill="none">
                  <circle cx="16" cy="16" r="15" fill="#25D366" />
                  <path
                    d="M22.5 18.2c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.9 8.9 0 0 1-2.6-1.6 9.8 9.8 0 0 1-1.8-2.2c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.4 1.4 3.6 2.4 3.7 5.8 5.2c.8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.6.2-1.7-.1-.2-.3-.3-.6-.5z"
                    fill="#ffffff"
                  />
                </svg>
              </a>

              {/* Google Maps */}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="sr-social-btn sr-social-gmaps"
                title="Google Maps"
              >
                <svg viewBox="0 0 32 32" width="42" height="42" fill="none">
                  <rect width="32" height="32" rx="6" fill="#f8fafc" />
                  <path
                    d="M16 5c-4.4 0-8 3.6-8 8 0 6 8 15 8 15s8-9 8-15c0-4.4-3.6-8-8-8z"
                    fill="#EA4335"
                  />
                  <path
                    d="M16 5c-1.7 0-3.3.5-4.6 1.5l7.5 9c2.4-3.3 3.9-6.4 3.9-8.8 0-4.4-3.6-8.7-6.8-1.7z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M11.4 6.5C9.3 8.1 8 10.4 8 13c0 2.4 1.4 5.5 3.5 8.8l4.5-5.3-4.6-10z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.5 18.5L8 13c0 6 8 15 8 15l-3.5-9.5z"
                    fill="#34A853"
                  />
                  <circle cx="16" cy="13" r="3.2" fill="#ffffff" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="sr-social-btn sr-social-youtube"
                title="YouTube"
              >
                <svg viewBox="0 0 32 32" width="42" height="42" fill="none">
                  <rect width="32" height="32" rx="7" fill="#FF0000" />
                  <path d="M13 10.5L21.5 16L13 21.5V10.5Z" fill="#ffffff" />
                </svg>
              </a>
            </div>
          </div>

          {/* Mobile Hamburger toggle */}
          <button
            className="sr-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span
              className={`sr-hamburger-bar ${mobileMenuOpen ? "open" : ""}`}
            />
            <span
              className={`sr-hamburger-bar ${mobileMenuOpen ? "open" : ""}`}
            />
            <span
              className={`sr-hamburger-bar ${mobileMenuOpen ? "open" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* 3. BOTTOM RED NAVIGATION BAR (With diagonal slant cut) */}
      <div className="sr-bottom-nav-track">
        <div
          className={`sr-bottom-nav-slant ${mobileMenuOpen ? "mobile-expanded" : ""}`}
        >
          <div className="sr-nav-links-wrap">
            {navItems.map((item) => {
              const isActive = currentTab === item;
              return (
                <button
                  key={item}
                  className={`sr-nav-link-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleSelect(item)}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
