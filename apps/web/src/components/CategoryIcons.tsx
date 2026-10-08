import React from "react";

export const SparklersIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    {/* Tilted bundle of sparkler rods */}
    <g transform="translate(10, 10) rotate(-35 50 50)">
      {/* Grey sparkler chemical coating */}
      <line
        x1="30"
        y1="15"
        x2="30"
        y2="65"
        stroke="#4b5563"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="12"
        x2="36"
        y2="68"
        stroke="#374151"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="10"
        x2="42"
        y2="70"
        stroke="#4b5563"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="14"
        x2="48"
        y2="66"
        stroke="#374151"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <line
        x1="54"
        y1="18"
        x2="54"
        y2="62"
        stroke="#4b5563"
        strokeWidth="5.5"
        strokeLinecap="round"
      />

      {/* Wire handles */}
      <line
        x1="30"
        y1="65"
        x2="30"
        y2="105"
        stroke="#9ca3af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="36"
        y1="68"
        x2="36"
        y2="108"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="42"
        y1="70"
        x2="42"
        y2="110"
        stroke="#9ca3af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="66"
        x2="48"
        y2="108"
        stroke="#cbd5e1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="54"
        y1="62"
        x2="54"
        y2="105"
        stroke="#9ca3af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Jute string wrap */}
      <rect x="26" y="58" width="32" height="10" rx="3" fill="#d97706" />
      <line
        x1="26"
        y1="61"
        x2="58"
        y2="61"
        stroke="#b45309"
        strokeWidth="1.5"
      />
      <line
        x1="26"
        y1="65"
        x2="58"
        y2="65"
        stroke="#b45309"
        strokeWidth="1.5"
      />

      {/* Sparks */}
      <circle cx="42" cy="6" r="2.5" fill="#f59e0b" />
      <circle cx="34" cy="4" r="1.5" fill="#fbbf24" />
      <circle cx="50" cy="5" r="2" fill="#f59e0b" />
    </g>
  </svg>
);

export const FlowerPotsIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    {/* Pot 1 - Left */}
    <g transform="translate(15, 20)">
      {/* Wick */}
      <path
        d="M 28 8 Q 24 0 28 -6"
        stroke="#d97706"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cone Body */}
      <polygon points="28,8 10,75 46,75" fill="#dc2626" />
      {/* Decorative Foil Patterns */}
      <polygon points="28,16 16,68 40,68" fill="#16a34a" />
      <polygon points="28,26 21,58 35,58" fill="#eab308" />
      <polygon points="28,34 24,50 32,50" fill="#dc2626" />
      <rect x="10" y="72" width="36" height="5" rx="1.5" fill="#991b1b" />
    </g>

    {/* Pot 2 - Right */}
    <g transform="translate(55, 20)">
      {/* Wick */}
      <path
        d="M 28 8 Q 32 0 28 -6"
        stroke="#d97706"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cone Body */}
      <polygon points="28,8 10,75 46,75" fill="#16a34a" />
      {/* Decorative Foil Patterns */}
      <polygon points="28,16 16,68 40,68" fill="#dc2626" />
      <polygon points="28,26 21,58 35,58" fill="#eab308" />
      <polygon points="28,34 24,50 32,50" fill="#16a34a" />
      <rect x="10" y="72" width="36" height="5" rx="1.5" fill="#166534" />
    </g>
  </svg>
);

export const CrackersIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    <g transform="translate(15, 25)">
      {/* Central Thread */}
      <line
        x1="10"
        y1="35"
        x2="80"
        y2="35"
        stroke="#fef08a"
        strokeWidth="3.5"
        strokeDasharray="3 3"
      />

      {/* Red Cracker Tubes Bundle */}
      {[-24, -16, -8, 0, 8, 16, 24].map((offset, idx) => (
        <g key={idx} transform={`translate(${45 + offset}, 35)`}>
          {/* Top Tube */}
          <rect
            x="-4"
            y="-30"
            width="8"
            height="26"
            rx="2"
            fill="#ef4444"
            stroke="#b91c1c"
            strokeWidth="1"
          />
          <line
            x1="-4"
            y1="-22"
            x2="4"
            y2="-22"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
          {/* Bottom Tube */}
          <rect
            x="-4"
            y="4"
            width="8"
            height="26"
            rx="2"
            fill="#dc2626"
            stroke="#991b1b"
            strokeWidth="1"
          />
          <line
            x1="-4"
            y1="12"
            x2="4"
            y2="12"
            stroke="#fef08a"
            strokeWidth="1.5"
          />
        </g>
      ))}

      {/* Tie String */}
      <rect x="36" y="28" width="18" height="14" rx="2" fill="#f59e0b" />
      <circle cx="45" cy="35" r="4" fill="#b45309" />
    </g>
  </svg>
);

export const GroundChakkarIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    <g transform="translate(60, 60)">
      {/* Outer Ring */}
      <circle
        cx="0"
        cy="0"
        r="42"
        fill="#fef08a"
        stroke="#d97706"
        strokeWidth="2.5"
      />
      <circle cx="0" cy="0" r="38" fill="#ef4444" />
      <circle cx="0" cy="0" r="30" fill="#3b82f6" />
      <circle cx="0" cy="0" r="22" fill="#eab308" />
      <circle cx="0" cy="0" r="14" fill="#16a34a" />
      <circle cx="0" cy="0" r="8" fill="#7c3aed" />

      {/* Spiral Star Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2={Math.cos((angle * Math.PI) / 180) * 36}
          y2={Math.sin((angle * Math.PI) / 180) * 36}
          stroke="#ffffff"
          strokeWidth="1.5"
          opacity="0.8"
        />
      ))}

      {/* Center Fuse Point */}
      <circle
        cx="0"
        cy="0"
        r="4"
        fill="#ffffff"
        stroke="#b91c1c"
        strokeWidth="2"
      />
    </g>
  </svg>
);

export const RocketsIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    {/* Rocket 1 (Red) */}
    <g transform="translate(35, 25) rotate(-30)">
      <polygon points="12,0 3,20 21,20" fill="#dc2626" />
      <rect
        x="5"
        y="20"
        width="14"
        height="34"
        rx="2"
        fill="#ef4444"
        stroke="#b91c1c"
        strokeWidth="1"
      />
      <rect x="5" y="26" width="14" height="6" fill="#fef08a" />
      <line
        x1="12"
        y1="54"
        x2="12"
        y2="105"
        stroke="#d97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="54"
        x2="10"
        y2="60"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
    </g>

    {/* Rocket 2 (Blue) */}
    <g transform="translate(60, 25) rotate(-30)">
      <polygon points="12,0 3,20 21,20" fill="#2563eb" />
      <rect
        x="5"
        y="20"
        width="14"
        height="34"
        rx="2"
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth="1"
      />
      <rect x="5" y="26" width="14" height="6" fill="#fef08a" />
      <line
        x1="12"
        y1="54"
        x2="12"
        y2="105"
        stroke="#d97706"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="54"
        x2="10"
        y2="60"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
    </g>
  </svg>
);

export const SkyShotsIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg viewBox="0 0 120 120" className={className} fill="none">
    {/* Cylinder 1 (Gold/Red) */}
    <g transform="translate(26, 26)">
      <rect
        x="0"
        y="8"
        width="28"
        height="64"
        rx="4"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1"
      />
      <rect x="0" y="22" width="28" height="34" fill="#dc2626" />
      <circle cx="14" cy="39" r="6" fill="#fef08a" />
      <ellipse
        cx="14"
        cy="8"
        rx="14"
        ry="4"
        fill="#fbbf24"
        stroke="#b45309"
        strokeWidth="1"
      />
      {/* Fuse */}
      <path
        d="M 14 4 Q 18 -4 20 -8"
        stroke="#1f2937"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Cylinder 2 (Blue/Green) */}
    <g transform="translate(62, 26)">
      <rect
        x="0"
        y="8"
        width="28"
        height="64"
        rx="4"
        fill="#2563eb"
        stroke="#1d4ed8"
        strokeWidth="1"
      />
      <rect x="0" y="22" width="28" height="34" fill="#16a34a" />
      <circle cx="14" cy="39" r="6" fill="#fef08a" />
      <ellipse
        cx="14"
        cy="8"
        rx="14"
        ry="4"
        fill="#60a5fa"
        stroke="#1d4ed8"
        strokeWidth="1"
      />
      {/* Fuse */}
      <path
        d="M 14 4 Q 10 -4 12 -8"
        stroke="#1f2937"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </g>
  </svg>
);
