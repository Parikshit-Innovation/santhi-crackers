import React, { useState, useEffect } from "react";
import "./WelcomeModal.css";
import { useLanguage } from "../context/LanguageContext";

interface WelcomeModalProps {
  onStartBooking?: () => void;
}

const STORAGE_KEY = "santhi_welcome_seen_session_v2";

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStartBooking }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show after slight delay on load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStart = () => {
    handleClose();
    if (onStartBooking) {
      onStartBooking();
    } else {
      const table = document.querySelector(".combo-table-wrapper");
      if (table) {
        table.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  if (!isOpen) return null;

  const isTa = language === "ta";

  return (
    <div className="welcome-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="welcome-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* Close round button */}
        <button
          type="button"
          className="welcome-close-btn"
          onClick={handleClose}
          aria-label={isTa ? "மூடு" : "Close"}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </svg>
        </button>

        {/* Top Tag */}
        <div className="welcome-pill">
          <span>{isTa ? "நல்வரவு · தீபாவளி 2026" : "WELCOME · DIWALI 2026"}</span>
        </div>

        {/* Main Heading */}
        <h2 className="welcome-title">
          {isTa ? "சாந்தி பட்டாசுகளுக்கு நல்வரவு!" : "Welcome to Shanthi Crackers!"}
        </h2>

        {/* Subtitle brand */}
        <p className="welcome-subtitle">
          {isTa
            ? "சிவகாசி நேரடி பட்டாசுகள் · தள்ளுபடி விலையில்"
            : "Direct Sivakasi Crackers · Best Festive Discounts"}
        </p>

        {/* Language Selection Selector Bar */}
        <div className="welcome-lang-selector">
          <span className="welcome-lang-label">
            {isTa ? "மொழியைத் தேர்ந்தெடுக்கவும் / Choose Language:" : "Choose Language / மொழியைத் தேர்ந்தெடுக்கவும்:"}
          </span>
          <div className="welcome-lang-toggle">
            <button
              type="button"
              className={`welcome-lang-btn ${isTa ? "active" : ""}`}
              onClick={() => setLanguage("ta")}
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              className={`welcome-lang-btn ${!isTa ? "active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              English
            </button>
          </div>
        </div>

        {/* Body content */}
        <p className="welcome-body-text">
          {isTa ? (
            <>
              உங்கள் தீபாவளிக் கொண்டாட்டங்களை வண்ணமயமாக்க <strong className="welcome-highlight">சாந்தி பட்டாசுகள்</strong> உங்களை அன்புடன் வரவேற்கிறது. எங்களின் தரமான சிவகாசி பட்டாசுகளின் பட்டியலைப் பார்த்து, உங்களுக்கு விருப்பமானவற்றைத் தேர்வு செய்யுங்கள்.
            </>
          ) : (
            <>
              <strong className="welcome-highlight">Shanthi Crackers</strong> warmly welcomes you to make your Diwali celebrations brighter! Explore our wide range of premium Sivakasi crackers and discover exclusive festive discounts.
            </>
          )}
        </p>

        {/* Action Button */}
        <button
          type="button"
          className="welcome-action-btn"
          onClick={handleStart}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
          <span>
            {isTa ? "பட்டாசுகளைப் பார்வையிடவும்" : "Explore Crackers"}
          </span>
        </button>

        {/* Text dismiss link */}
        <button
          type="button"
          className="welcome-dismiss-link"
          onClick={handleClose}
        >
          {isTa ? "தொடர்க (Continue)" : "Continue to Store"}
        </button>
      </div>
    </div>
  );
};
