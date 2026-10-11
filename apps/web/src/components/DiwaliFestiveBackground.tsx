import React, { memo } from "react";
import "./DiwaliFestiveBackground.css";

/**
 * Traditional Clay Deepam (Diya) with Glowing Flickering Flame
 */
const SimpleDiya: React.FC<{ size?: number; altFlicker?: boolean }> = ({
  size = 44,
  altFlicker = false,
}) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Diya Clay Base */}
    <path
      d="M6 38 C6 52 20 56 32 56 C44 56 58 52 58 38 C44 43 20 43 6 38 Z"
      fill="url(#diyaTerracottaGradSimple)"
      stroke="#78350f"
      strokeWidth="1.5"
    />
    
    {/* Golden Rim Highlight */}
    <path
      d="M8 38 C20 42 44 42 56 38 C44 40 20 40 8 38 Z"
      fill="#fde047"
    />

    {/* Oil Well */}
    <ellipse cx="32" cy="38" rx="15" ry="4" fill="#b45309" />

    {/* Flickering Sacred Flame */}
    <g className={altFlicker ? "diya-flame-flicker-alt" : "diya-flame-flicker"}>
      <path
        d="M32 10 C25 21 21 28 26 36 C28 39 36 39 38 36 C43 28 39 21 32 10 Z"
        fill="url(#diyaFlameGradSimple)"
        filter="drop-shadow(0 0 8px rgba(251, 191, 36, 0.9))"
      />
      <path
        d="M32 18 C28 25 25 29 28 34 C29 36 35 36 36 34 C39 29 36 25 32 18 Z"
        fill="#fef08a"
      />
    </g>

    <defs>
      <linearGradient id="diyaTerracottaGradSimple" x1="6" y1="38" x2="58" y2="56" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c2410c" />
        <stop offset="0.6" stopColor="#9a3412" />
        <stop offset="1" stopColor="#431407" />
      </linearGradient>
      <linearGradient id="diyaFlameGradSimple" x1="32" y1="10" x2="32" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.4" stopColor="#fbbf24" />
        <stop offset="0.8" stopColor="#ea580c" />
        <stop offset="1" stopColor="#dc2626" />
      </linearGradient>
    </defs>
  </svg>
);

/**
 * 4-Pointed Sparkle Star
 */
const SimpleSparkleStar: React.FC<{
  top: string;
  left?: string;
  right?: string;
  size: number;
  delay: number;
}> = ({ top, left, right, size, delay }) => (
  <div
    className="diwali-gutter-star"
    style={{
      top,
      left,
      right,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
    }}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2L12 0Z" />
    </svg>
  </div>
);

/**
 * DiwaliFestiveBackground Component (Simplified, Clean & Non-Intrusive)
 * 
 * - Mobile: 100% clean and unobtrusive. No buttons or text are ever covered or hidden.
 * - Desktop: Soft corner golden ambiance and 2 tasteful outer gutter deepams.
 * - Strictly pointer-events: none; (zero hover or click interference).
 */
export const DiwaliFestiveBackground: React.FC = memo(() => {
  return (
    <div className="diwali-festive-overlay" aria-hidden="true">
      {/* 1. Ambient Warm Golden Light Halos (Present on all screens in background) */}
      <div className="diwali-aura-glow diwali-aura-top-left" />
      <div className="diwali-aura-glow diwali-aura-top-right" />
      <div className="diwali-aura-glow diwali-aura-bottom-left" />
      <div className="diwali-aura-glow diwali-aura-bottom-right" />

      {/* 2. Desktop-Only Gutter Elements (Completely hidden on tablets & mobile screens <1280px) */}
      <div className="diwali-gutter-container">
        {/* Left Outer Gutter Diya */}
        <div className="diwali-gutter-diya diya-gutter-left">
          <SimpleDiya size={44} altFlicker={false} />
        </div>

        {/* Right Outer Gutter Diya */}
        <div className="diwali-gutter-diya diya-gutter-right">
          <SimpleDiya size={44} altFlicker={true} />
        </div>

        {/* Subtle Gutter Sparkle Stars */}
        <SimpleSparkleStar top="220px" left="26px" size={14} delay={0.4} />
        <SimpleSparkleStar top="55%" left="22px" size={13} delay={1.8} />
        <SimpleSparkleStar top="220px" right="26px" size={14} delay={1.2} />
        <SimpleSparkleStar top="55%" right="22px" size={13} delay={2.6} />
      </div>
    </div>
  );
});

DiwaliFestiveBackground.displayName = "DiwaliFestiveBackground";
export default DiwaliFestiveBackground;
