import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  thumbnailUrl?: string;
  aspectRatio?: number | string;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  containerClassName?: string;
  showFallbackOnFailure?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  thumbnailUrl,
  aspectRatio,
  rootMargin = '250px 0px',
  threshold = 0.01,
  className = '',
  containerClassName = '',
  showFallbackOnFailure = true,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset state on src change
    setIsLoaded(false);
    setHasError(false);

    // If IntersectionObserver is not supported, load immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const currentEl = containerRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentEl);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(currentEl);

    return () => {
      observer.disconnect();
    };
  }, [src, rootMargin, threshold]);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasError(false);
    setIsLoaded(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#0D1120] ${containerClassName}`}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      {/* 1. Micro-Thumbnail / Shimmer Blur-Up Placeholder */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover filter blur-md scale-105 pointer-events-none transition-opacity duration-700 ${
            isLoaded ? 'opacity-0' : 'opacity-70'
          }`}
        />
      ) : (
        <div
          className={`absolute inset-0 bg-gradient-to-br from-[#131932] via-[#0E1326] to-[#0A0D1A] transition-opacity duration-700 ${
            isLoaded ? 'opacity-0' : 'opacity-100 animate-pulse'
          }`}
        />
      )}

      {/* 2. Main Lazy Loaded High-Res Image */}
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(false);
          }}
          loading="lazy"
          decoding="async"
          className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}

      {/* 3. Error Fallback Frame */}
      {hasError && showFallbackOnFailure && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-[#0F1426] text-stone-300 text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-[#FFF000]/60 mx-auto" />
          <span className="text-[11px] font-medium text-stone-400">Photo temporarily unavailable</span>
          <button
            type="button"
            onClick={handleRetry}
            className="px-2.5 py-1 rounded bg-[#20216B] hover:bg-[#2A2C8A] text-[#FFF000] text-[10px] font-mono font-semibold border border-[#D4AF37]/40 inline-flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
};
