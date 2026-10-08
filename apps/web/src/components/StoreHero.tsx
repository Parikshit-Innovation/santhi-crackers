import React from "react";
import "./StoreHero.css";

interface StoreHeroProps {
  onAction?: () => void;
}

export const StoreHero: React.FC<StoreHeroProps> = () => {
  return (
    <section className="store-hero-wrapper">
      <div className="store-hero-card">
        {/* Architectural Cream Tone Curves in Background */}
        <div className="store-hero-cream-bg">
          <svg
            className="store-cream-curves"
            viewBox="0 0 1400 600"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Base cream tone */}
            <rect width="1400" height="600" fill="#f8f5ee" />

            {/* Left warm sculpted cream arch/swoop matching reference */}
            <path
              d="M 0 0 L 320 0 C 440 220 540 380 900 480 L 1400 520 L 1400 600 L 0 600 Z"
              fill="#eee6da"
              opacity="0.85"
            />
            <path
              d="M 0 0 L 220 0 C 340 180 420 320 720 420 L 1400 480 L 1400 600 L 0 600 Z"
              fill="#e5dcce"
              opacity="0.5"
            />

            {/* Soft ambient light gradient */}
            <defs>
              <linearGradient
                id="creamGlow"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fffdf9" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f5efe5" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect width="1400" height="600" fill="url(#creamGlow)" />
          </svg>
        </div>
      </div>
    </section>
  );
};
