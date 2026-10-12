import React from "react";
import "./MarqueeBanner.css";
import { useLanguage } from "../context/LanguageContext";

interface MarqueeItem {
  id: string;
  title: string;
  text: string;
}

const MARQUEE_ITEMS: MarqueeItem[] = [
  {
    id: "diwali-festive",
    title: "Diwali 2026 Special",
    text: "Direct Sivakasi factory crackers & gift boxes",
  },
  {
    id: "1",
    title: "PESO Certified",
    text: "100% genuine green crackers",
  },
  {
    id: "2",
    title: "Tamil Nadu Safe Transport",
    text: "Delivering till Oct 25 only",
  },
  {
    id: "3",
    title: "Wholesale Factory Pricing",
    text: "Direct Sivakasi depot discounts",
  },
  {
    id: "4",
    title: "Customer Care",
    text: "Call & instant WhatsApp support",
  },
];

export const MarqueeBanner: React.FC = () => {
  const { t } = useLanguage();
  // Duplicate array to ensure seamless infinite looping
  const duplicatedItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="marquee-bar" role="region" aria-label={t("Announcements ticker")}>
      <div className="marquee-track">
        {duplicatedItems.map((item, index) => (
          <div key={`${item.id}-${index}`} className="marquee-item">
            <span className="marquee-title">{t(item.title)}</span>
            <span className="marquee-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
              </svg>
            </span>
            <span className="marquee-text">{t(item.text)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

