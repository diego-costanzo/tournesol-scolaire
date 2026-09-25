import React from 'react';

interface SunflowerGraphicProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
}

export const SunflowerGraphic: React.FC<SunflowerGraphicProps> = ({
  className = "w-20 h-20",
  size,
  animate = false
}) => {
  // 16 petals in the outer layer, 16 petals in the inner offset layer
  const petalCount = 16;
  const outerPetals = Array.from({ length: petalCount }, (_, i) => (360 / petalCount) * i);
  const innerPetals = Array.from({ length: petalCount }, (_, i) => (360 / petalCount) * i + (180 / petalCount));

  // Natural seed dots in the central disk arranged in concentric florets
  const innerSeeds = [
    { cx: 50, cy: 50, r: 1.2 },
    { cx: 48, cy: 46, r: 1.0 },
    { cx: 52, cy: 46, r: 1.0 },
    { cx: 54, cy: 50, r: 1.0 },
    { cx: 52, cy: 54, r: 1.0 },
    { cx: 48, cy: 54, r: 1.0 },
    { cx: 46, cy: 50, r: 1.0 },
    // Outer floret ring
    { cx: 45, cy: 43, r: 1.1 },
    { cx: 50, cy: 42, r: 1.1 },
    { cx: 55, cy: 43, r: 1.1 },
    { cx: 57, cy: 47, r: 1.1 },
    { cx: 57, cy: 53, r: 1.1 },
    { cx: 55, cy: 57, r: 1.1 },
    { cx: 50, cy: 58, r: 1.1 },
    { cx: 45, cy: 57, r: 1.1 },
    { cx: 43, cy: 53, r: 1.1 },
    { cx: 43, cy: 47, r: 1.1 },
    // Ring 3
    { cx: 42, cy: 40, r: 1.1 },
    { cx: 50, cy: 38, r: 1.1 },
    { cx: 58, cy: 40, r: 1.1 },
    { cx: 61, cy: 46, r: 1.1 },
    { cx: 62, cy: 52, r: 1.1 },
    { cx: 59, cy: 59, r: 1.1 },
    { cx: 50, cy: 62, r: 1.1 },
    { cx: 41, cy: 59, r: 1.1 },
    { cx: 38, cy: 52, r: 1.1 },
    { cx: 39, cy: 45, r: 1.1 }
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} ${animate ? 'hover:rotate-12 transition-transform duration-500' : ''}`}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tournesol Girasole"
      role="img"
    >
      <defs>
        {/* Outer petals gradient: brilliant sunlight amber */}
        <linearGradient id="tournesolPetalOuter" x1="50" y1="5" x2="50" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Inner petals gradient: warm rich honey amber with subtle depth */}
        <linearGradient id="tournesolPetalInner" x1="50" y1="10" x2="50" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Center seed disc: deep warm chocolate and roasted caramel */}
        <radialGradient id="tournesolCenterDisc" cx="50" cy="50" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#854D0E" />
          <stop offset="55%" stopColor="#713F12" />
          <stop offset="88%" stopColor="#451A03" />
          <stop offset="100%" stopColor="#301302" />
        </radialGradient>

        {/* Subtle drop glow for petals */}
        <filter id="petalGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="0.6" floodColor="#B45309" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Layer 1: Background Petals (slightly darker for 3D realism, fine amber outline) */}
      <g filter="url(#petalGlow)">
        {innerPetals.map((angle, idx) => (
          <path
            key={`inner-${idx}`}
            d="M 50 10 C 45 22 44.5 35 50 42 C 55.5 35 55 22 50 10 Z"
            transform={`rotate(${angle} 50 50)`}
            fill="url(#tournesolPetalInner)"
            stroke="#92400E"
            strokeWidth="0.65"
            strokeLinejoin="round"
            strokeOpacity="0.6"
          />
        ))}
      </g>

      {/* Layer 2: Foreground Main Petals (bright golden sunshine, ultra-delicate outline) */}
      <g>
        {outerPetals.map((angle, idx) => (
          <path
            key={`outer-${idx}`}
            d="M 50 5 C 44 19 43.5 34 50 41 C 56.5 34 56 19 50 5 Z"
            transform={`rotate(${angle} 50 50)`}
            fill="url(#tournesolPetalOuter)"
            stroke="#92400E"
            strokeWidth="0.65"
            strokeLinejoin="round"
            strokeOpacity="0.55"
          />
        ))}
      </g>

      {/* Layer 3: Disc Rim Collar */}
      <circle
        cx="50"
        cy="50"
        r="18.5"
        fill="#92400E"
        fillOpacity="0.3"
      />

      {/* Layer 4: Central Seed Core */}
      <circle
        cx="50"
        cy="50"
        r="17"
        fill="url(#tournesolCenterDisc)"
        stroke="#A16207"
        strokeWidth="0.8"
        strokeOpacity="0.8"
      />

      {/* Layer 5: Concentric Seed Florets with delicate shimmer */}
      <g>
        {innerSeeds.map((seed, idx) => (
          <circle
            key={`seed-${idx}`}
            cx={seed.cx}
            cy={seed.cy}
            r={seed.r}
            fill="#FDE68A"
            fillOpacity={idx < 7 ? "0.85" : "0.5"}
          />
        ))}
      </g>

      {/* Central Highlight Sheen */}
      <circle
        cx="47"
        cy="47"
        r="7"
        fill="#FEF08A"
        fillOpacity="0.08"
      />
    </svg>
  );
};
