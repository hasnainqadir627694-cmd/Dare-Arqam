import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GallerySlide, 
  GallerySettings 
} from '../types';
import { 
  fetchHomepageGallery, 
  subscribeHomepageGallery,
  DEFAULT_GALLERY_SETTINGS,
  DEFAULT_GALLERY_SLIDES
} from '../services/firebaseService';
import { 
  preloadGalleryImage, 
  preloadNextSlides 
} from '../services/imageOptimizationService';
import { LazyImage } from './LazyImage';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  Building,
  RefreshCw
} from 'lucide-react';

export const HomepageGallery: React.FC = () => {
  const [slides, setSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Slide tracking & touch handling refs
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Filter active enabled slides and sort by order
  const activeSlides = slides
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  const totalActive = activeSlides.length;

  // Realtime subscription to Firebase
  useEffect(() => {
    fetchHomepageGallery().then(data => {
      if (data.slides && data.slides.length > 0) setSlides(data.slides);
      if (data.settings) setSettings(data.settings);
    });

    const unsubscribe = subscribeHomepageGallery((data) => {
      if (data.slides && data.slides.length > 0) setSlides(data.slides);
      if (data.settings) setSettings(data.settings);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Performance: Preload active and upcoming slides in the background
  useEffect(() => {
    if (totalActive > 0) {
      const currentUrl = activeSlides[currentIndex]?.url;
      if (currentUrl) {
        preloadGalleryImage(currentUrl);
      }
      preloadNextSlides(activeSlides, currentIndex, 3);
    }
  }, [currentIndex, totalActive, activeSlides]);

  // Safe Index Bounds
  const safeIndex = totalActive > 0 ? (currentIndex % totalActive + totalActive) % totalActive : 0;

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (totalActive <= 1) return;
    setCurrentIndex(prev => (prev + 1) % totalActive);
  }, [totalActive]);

  const handlePrev = useCallback(() => {
    if (totalActive <= 1) return;
    setCurrentIndex(prev => (prev - 1 + totalActive) % totalActive);
  }, [totalActive]);

  const handleGoTo = useCallback((index: number) => {
    if (totalActive <= 1) return;
    setCurrentIndex(index % totalActive);
  }, [totalActive]);

  // Seamless Automatic Slide Rotation (Simple, clean, no progress bar)
  useEffect(() => {
    if (totalActive <= 1) return;

    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }

    // Do not auto slide if user is actively touching or inspecting
    if (isUserInteracting) return;

    const intervalTime = Math.max(2000, settings.autoSlideInterval || 4000);

    autoSlideTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalActive);
    }, intervalTime);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [totalActive, settings.autoSlideInterval, isUserInteracting, safeIndex]);

  // Interaction handlers to pause during active touch/hover and resume smoothly
  const triggerUserInteractionPause = useCallback(() => {
    setIsUserInteracting(true);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    // Resume auto-sliding after 3.5s of no interaction
    resumeTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 3500);
  }, []);

  // Touch Swipe Handlers (Non-locking, robust)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      triggerUserInteractionPause();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // If deltaX is noticeable, signal interaction
    if (touchStartXRef.current !== null && e.touches.length === 1) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartXRef.current);
      if (deltaX > 10) {
        triggerUserInteractionPause();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - (touchStartYRef.current || 0);

      // Horizontal swipe threshold: 35px horizontal and more horizontal than vertical
      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    triggerUserInteractionPause();
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setIsUserInteracting(false);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') setLightboxIndex(null);
        if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null ? (prev + 1) % totalActive : 0);
        if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null ? (prev - 1 + totalActive) % totalActive : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, totalActive]);

  if (totalActive === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10">
        <div className="bg-[#0E1222] border-2 border-[#D4AF37]/30 rounded-2xl p-8 text-center space-y-3 shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#1A223E] border border-[#D4AF37]/40 flex items-center justify-center text-[#FFF000]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-xl font-bold text-white">Institutional Visual Archive</h3>
          <p className="text-sm text-stone-300 max-w-md mx-auto">
            Visual gallery exhibits are currently being curated by the Directorate. Please check back shortly.
          </p>
        </div>
      </section>
    );
  }

  const currentSlide = activeSlides[safeIndex] || activeSlides[0];
  const isImageFailed = failedImages[currentSlide.id];

  return (
    <section 
      aria-label="Campus Visual Showcase" 
      className="max-w-7xl mx-auto px-4 sm:px-6 my-10 sm:my-14 select-none"
    >
      {/* 1. Header with futuristic badge */}
      <div className="mb-6 pb-4 border-b border-[#CBD5E1]/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-[#171852] text-[#FFF000] border border-[#FFF000]/40 font-bold shadow-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFF000] animate-pulse" />
            <span>CAMPUS LIFE & INFRASTRUCTURE</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F1035] tracking-tight flex items-center gap-3">
            <span>Visual Architectural Showcase</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] font-prose-serif mt-1 max-w-2xl">
            Explore our state-of-the-art campus facilities, academic research labs, and vibrant student learning environments.
          </p>
        </div>
      </div>

      {/* 2. Main Horizontal Showcase Card with Futuristic Backdrop */}
      <div 
        onMouseEnter={triggerUserInteractionPause}
        onMouseLeave={() => setIsUserInteracting(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        className="relative bg-gradient-to-br from-[#0B0F1F] via-[#141A35] to-[#1C244B] border-2 border-[#D4AF37]/40 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden group transition-all duration-300"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#FFF000]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#20216B]/40 blur-3xl pointer-events-none" />

        {/* Image Track Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] sm:min-h-[440px] md:min-h-[480px]">
          {/* Main Visual Display (7-8 Columns on large screens) */}
          <div className="lg:col-span-8 relative h-64 sm:h-80 md:h-[420px] lg:h-full bg-[#0D1120] overflow-hidden flex items-center justify-center">
            {/* Lazy Loaded Main Image with IntersectionObserver */}
            <LazyImage
              key={currentSlide.id}
              src={currentSlide.url}
              alt={currentSlide.title || "Campus showcase photograph"}
              thumbnailUrl={currentSlide.thumbnailUrl}
              rootMargin="300px 0px"
              className="relative z-10 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              containerClassName="w-full h-full"
            />

            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#0B0F1F] via-black/15 to-transparent pointer-events-none" />
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-transparent to-[#0B0F1F]/70 hidden lg:block pointer-events-none" />

            {/* Expand / Lightbox Trigger Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(safeIndex);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute bottom-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-[#FFF000]/60 text-[#FFF000] text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
              aria-label="View full screen high-resolution image"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen</span>
            </button>

            {/* Category tag over image */}
            {currentSlide.category && (
              <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-lg bg-[#171852]/90 backdrop-blur-md border border-[#D4AF37]/60 text-[#FFF000] text-[11px] font-mono font-bold uppercase tracking-wider shadow-md">
                {currentSlide.category}
              </div>
            )}

            {/* In-Image Large Chevrons for Immediate Manual Navigation */}
            {totalActive > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerUserInteractionPause();
                    handlePrev();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/65 hover:bg-black/90 active:scale-90 text-white hover:text-[#FFF000] border border-white/30 backdrop-blur-md transition-all shadow-xl cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerUserInteractionPause();
                    handleNext();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/65 hover:bg-black/90 active:scale-90 text-white hover:text-[#FFF000] border border-white/30 backdrop-blur-md transition-all shadow-xl cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Description & Narrative Chamber (4 Columns on large screens) */}
          <div className="lg:col-span-4 p-5 sm:p-7 md:p-8 flex flex-col justify-center space-y-4 bg-[#0F1428]/95 border-t lg:border-t-0 lg:border-l border-[#263352]">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs text-[#D4AF37] font-mono uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Verified Infrastructure</span>
                </span>
                <span className="text-[11px] text-stone-400">DAR - E - ARQAM</span>
              </div>

              {/* Slide Title */}
              <h3 className="font-editorial text-lg sm:text-xl md:text-2xl font-bold text-white leading-snug drop-shadow-sm">
                {currentSlide.title || "Institutional Facility & Learning Environment"}
              </h3>

              {/* Golden accent divider */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#FFF000] to-transparent" />

              {/* Slide Caption */}
              <p className="text-xs sm:text-sm text-stone-300 font-prose-serif leading-relaxed">
                {currentSlide.caption || "Empowering students through high-standard educational resources, state-of-the-art laboratory workshops, and spacious campus grounds."}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Indicator Dots */}
        {totalActive > 1 && settings.showIndicators && (
          <div className="py-3 bg-[#0B0E1C] border-t border-[#1E293B] flex items-center justify-center gap-2 relative z-30">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerUserInteractionPause();
                  handleGoTo(idx);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  safeIndex === idx 
                    ? 'w-8 bg-[#FFF000] shadow-[0_0_10px_rgba(255,240,0,0.7)]' 
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image Fullscreen Lightbox"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 text-xs font-mono font-bold">
                {String(lightboxIndex + 1).padStart(2, '0')} / {String(totalActive).padStart(2, '0')}
              </span>
              <div className="font-editorial text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                {activeSlides[lightboxIndex]?.title || "Campus Gallery Inspection"}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-[#FFF000] transition-colors cursor-pointer"
              aria-label="Close fullscreen modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Image Center */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={activeSlides[lightboxIndex]?.url}
              alt={activeSlides[lightboxIndex]?.title || "Inspection view"}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              decoding="async"
            />

            {/* Prev & Next in Lightbox */}
            {totalActive > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + totalActive) % totalActive)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % totalActive)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Caption */}
          {activeSlides[lightboxIndex]?.caption && (
            <div className="max-w-3xl mx-auto text-center text-xs sm:text-sm text-stone-300 font-prose-serif pt-2 pb-1">
              {activeSlides[lightboxIndex].caption}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
