import React from 'react';
import { useWebsiteLogo } from '../services/brandingManager';

interface EmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customSrc?: string | null;
  neonGlow?: boolean;
}

export const Emblem: React.FC<EmblemProps> = ({ className = '', size = 'md', customSrc, neonGlow = false }) => {
  const websiteLogo = useWebsiteLogo();
  const [imgError, setImgError] = React.useState(false);
  const activeLogo = customSrc !== undefined ? customSrc : websiteLogo;

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12 sm:w-13 sm:h-13',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const currentSize = sizeMap[size];
  const glowClass = neonGlow ? 'ring-2 ring-[#FFF000] shadow-[0_0_8px_rgba(255,240,0,0.65)]' : 'ring-1 ring-[#FFF000]/60';

  // Render official custom or permanent project logo
  if (activeLogo && !imgError) {
    return (
      <div 
        className={`relative shrink-0 flex items-center justify-center rounded-full overflow-hidden select-none transition-all shadow-md bg-[#171852] ${glowClass} ${currentSize} ${className}`}
        title="DAR - E - ARQAM Institutional Emblem"
      >
        <img
          src={activeLogo}
          alt="DAR - E - ARQAM Official Logo"
          className="w-full h-full object-contain select-none max-w-full max-h-full"
          loading="eager"
          decoding="async"
          onError={() => setImgError(true)}
          style={{ imageRendering: 'auto' }}
        />
      </div>
    );
  }

  // Default Vector Emblem matching Dar-e-Arqam Identity with sleek, smart styling
  return (
    <div className={`relative shrink-0 flex items-center justify-center rounded-full bg-[#20216B] ring-1 ring-[#FFF000]/40 shadow-sm ${currentSize} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5 text-white"
        aria-hidden="true"
      >
        {/* Outer Subtle Rims */}
        <circle cx="50" cy="50" r="48" stroke="#292A86" strokeWidth="1.5" fill="#20216B" />
        <circle cx="50" cy="50" r="44" stroke="#FFF000" strokeWidth="0.75" strokeDasharray="1.5 2" />
        <circle cx="50" cy="50" r="39" stroke="#3B3EB0" strokeWidth="0.75" />

        {/* Crescent and Star in upper zone */}
        <path
          d="M 50 18 A 12 12 0 1 0 58 37 A 9.5 9.5 0 1 1 50 18 Z"
          fill="#FFFFFF"
        />
        <polygon
          points="58,23 60,27 64,27 61,30 62,34 58,31 54,34 55,30 52,27 56,27"
          fill="#FFF000"
        />

        {/* Open Academic Book */}
        <path
          d="M 32 54 C 40 50, 48 51, 50 56 C 52 51, 60 50, 68 54 L 68 70 C 60 66, 52 67, 50 72 C 48 67, 40 66, 32 70 Z"
          fill="#FFFFFF"
          stroke="#20216B"
          strokeWidth="1.2"
        />
        {/* Book spine line */}
        <line x1="50" y1="56" x2="50" y2="72" stroke="#20216B" strokeWidth="1.2" />

        {/* Laurel / Golden Wreath on sides */}
        <path
          d="M 22 55 C 20 64, 25 76, 35 81"
          stroke="#F5D900"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 78 55 C 80 64, 75 76, 65 81"
          stroke="#F5D900"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Foundation Year Accent */}
        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill="#FFF000"
          fontSize="5.5"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          EST. 1998
        </text>
      </svg>
    </div>
  );
};
