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
          <span>{isTa ? "முன்பதிவு விற்பனை" : "PRE-BOOKING SALE"}</span>
        </div>

        {/* Main Heading */}
        <h2 className="welcome-title">
          {isTa ? "ஆன்லைன் முன்பதிவு தொடங்கியது" : "Online Pre-Booking Is Open"}
        </h2>

        {/* Subtitle brand */}
        <p className="welcome-subtitle">
          {isTa
            ? "சாந்தி பட்டாசுகள் · தீபாவளி 2026"
            : "Shanthi Crackers · Diwali 2026"}
        </p>

        {/* Language Selection Selector Bar */}
        <div className="welcome-lang-selector">
          <span className="welcome-lang-label">
            {isTa ? "மொழியைத் தேர்ந்தெடுக்கவும்:" : "Choose Language:"}
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
              எங்கள் இணையதளத்தில் இப்போது உங்கள் <strong className="welcome-highlight">ஆன்லைன் முன்பதிவை</strong> பதிவு செய்யுங்கள். முன்பதிவுச் சலுகை <strong className="welcome-highlight">அக்டோபர் 25</strong> வரை மட்டுமே கிடைக்கும். பட்டாசுகளைக் கூடையில் சேர்த்து உங்கள் ஆர்டரை நிறைவு செய்யுங்கள்.
            </>
          ) : (
            <>
              Place your <strong className="welcome-highlight">online pre-booking</strong> on our website now. Pre-booking offer is available only before <strong className="welcome-highlight">October 25</strong>. Add items to cart and complete your order when you are ready.
            </>
          )}
        </p>

        {/* Action Button */}
        <button
          type="button"
          className="welcome-action-btn"
          onClick={handleStart}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
          </svg>
          <span>
            {isTa ? "ஆன்லைன் முன்பதிவைத் தொடங்குங்கள்" : "Start online pre-booking"}
          </span>
        </button>

        {/* Text dismiss link */}
        <button
          type="button"
          className="welcome-dismiss-link"
          onClick={handleClose}
        >
          {isTa ? "மூடு (Close)" : "Close"}
        </button>
      </div>
    </div>
  );
};
