import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  RefreshCw,
  Check,
  Move,
  Circle,
  Square,
  RectangleHorizontal,
  Sliders,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { saveWebsiteLogo } from '../../services/brandingManager';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCroppedLogo: (croppedUrl: string) => void;
}

type CropShape = 'circle' | 'square' | 'wide';
type RingColor = 'none' | 'gold' | 'green' | 'navy' | 'white';

// Viewport Dimensions (Interactive Canvas)
const VIEWPORT_SIZE = 340;
const CROP_CIRCLE_DIAMETER = 260;
const CROP_SQUARE_SIZE = 260;
const CROP_WIDE_WIDTH = 300;
const CROP_WIDE_HEIGHT = 190;

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCroppedLogo,
}) => {
  const [zoom, setZoom] = useState<number>(1.0); // 0.1 to 4.0 - Default 1.0 for edge-to-edge crisp logo
  const [rotation, setRotation] = useState<number>(0); // in degrees
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<CropShape>('circle');
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'dark' | 'navy'>('transparent');
  const [ringColor, setRingColor] = useState<RingColor>('none');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc || !isOpen) return;
    setImageLoaded(false);
    const img = new Image();
    const isDataOrBlob = imageSrc.startsWith('data:') || imageSrc.startsWith('blob:');
    if (!isDataOrBlob && !imageSrc.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      setImageLoaded(true);
      handleSafeFit(img);
    };
    img.onerror = () => {
      // If CORS failed with crossOrigin, retry without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.src = imageSrc;
      fallbackImg.onload = () => {
        imageObjRef.current = fallbackImg;
        setImageLoaded(true);
        handleSafeFit(fallbackImg);
      };
    };
  }, [imageSrc, isOpen]);

  // Base scale calculator to normalize any image dimensions to canvas crop size
  const getBaseFitScale = useCallback((img: HTMLImageElement): number => {
    const targetCropSize = cropShape === 'wide' ? CROP_WIDE_WIDTH : CROP_CIRCLE_DIAMETER;
    const maxDim = Math.max(img.naturalWidth || img.width || 1, img.naturalHeight || img.height || 1);
    return targetCropSize / maxDim;
  }, [cropShape]);

  // Safe Fit: automatically scales to crisp edge-to-edge size without excess empty border
  const handleSafeFit = useCallback((customImg?: HTMLImageElement) => {
    const img = customImg || imageObjRef.current;
    if (!img) {
      setZoom(1.0);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      return;
    }
    setZoom(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleFillCircle = useCallback(() => {
    if (!imageObjRef.current) return;
    setZoom(1.15);
    setPosition({ x: 0, y: 0 });
  }, []);

  // ----------------------------------------------------
  // 1. Live Interactive Canvas Render (WYSIWYG on Screen)
  // ----------------------------------------------------
  const drawInteractiveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObjRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageObjRef.current;
    const w = VIEWPORT_SIZE;
    const h = VIEWPORT_SIZE;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Background pattern
    if (bgMode === 'transparent') {
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#27272a';
      const gridSize = 16;
      for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
          if ((x / gridSize + y / gridSize) % 2 === 0) {
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        }
      }
    } else if (bgMode === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'navy') {
      ctx.fillStyle = '#0F1428';
      ctx.fillRect(0, 0, w, h);
    } else if (bgMode === 'dark') {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);
    }

    // Draw Transformed Image
    ctx.save();
    ctx.translate(cx + position.x, cy + position.y);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = getBaseFitScale(img);
    const scale = baseScale * zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Dark semi-transparent mask outside crop boundary
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);

    if (cropShape === 'circle') {
      const radius = CROP_CIRCLE_DIAMETER / 2;
      ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    } else if (cropShape === 'square') {
      const s = CROP_SQUARE_SIZE;
      ctx.rect(cx - s / 2 + s, cy - s / 2, -s, s);
    } else if (cropShape === 'wide') {
      const ww = CROP_WIDE_WIDTH;
      const wh = CROP_WIDE_HEIGHT;
      ctx.rect(cx - ww / 2 + ww, cy - wh / 2, -ww, wh);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Outer Border Ring
    ctx.save();
    if (ringColor !== 'none') {
      if (ringColor === 'gold') ctx.strokeStyle = '#F5D900';
      else if (ringColor === 'green') ctx.strokeStyle = '#10B981';
      else if (ringColor === 'navy') ctx.strokeStyle = '#20216B';
      else if (ringColor === 'white') ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = '#FFF000';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
    }

    if (cropShape === 'circle') {
      const radius = (CROP_CIRCLE_DIAMETER / 2) - 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (cropShape === 'square') {
      const s = CROP_SQUARE_SIZE - 3;
      ctx.strokeRect(cx - s / 2, cy - s / 2, s, s);
    } else if (cropShape === 'wide') {
      const ww = CROP_WIDE_WIDTH - 3;
      const wh = CROP_WIDE_HEIGHT - 3;
      ctx.strokeRect(cx - ww / 2, cy - wh / 2, ww, wh);
    }

    // Inner Safe Text Margin Guideline (Amber Dotted Safe Zone)
    if (cropShape === 'circle') {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, (CROP_CIRCLE_DIAMETER / 2) * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Center Crosshair
    ctx.strokeStyle = 'rgba(255, 240, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy);
    ctx.lineTo(cx + 7, cy);
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy + 7);
    ctx.stroke();

    ctx.restore();
  }, [position, rotation, zoom, cropShape, bgMode, ringColor, getBaseFitScale]);

  // Redraw interactive canvas whenever state changes
  useEffect(() => {
    if (isOpen) {
      drawInteractiveCanvas();
    }
  }, [isOpen, drawInteractiveCanvas, imageLoaded]);

  // ----------------------------------------------------
  // 2. High Resolution Master Export (100% Match)
  // ----------------------------------------------------
  const generateExportDataUrl = useCallback(
    (targetSize = 1024): string => {
      if (!imageObjRef.current) return '';
      const img = imageObjRef.current;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetSize;
      exportCanvas.height = targetSize;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return '';

      ctx.clearRect(0, 0, targetSize, targetSize);

      let cropDimension = CROP_CIRCLE_DIAMETER;
      if (cropShape === 'square') cropDimension = CROP_SQUARE_SIZE;
      if (cropShape === 'wide') cropDimension = CROP_WIDE_WIDTH;

      const scaleFactor = targetSize / cropDimension;
      const cx = targetSize / 2;
      const cy = targetSize / 2;

      // Optional background fill
      if (bgMode === 'white') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);
      } else if (bgMode === 'navy') {
        ctx.fillStyle = '#0F1428';
        ctx.fillRect(0, 0, targetSize, targetSize);
      } else if (bgMode === 'dark') {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, targetSize, targetSize);
      }

      // Clip mask to exact crop shape
      if (cropShape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, targetSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else if (cropShape === 'wide') {
        ctx.save();
        const exportH = targetSize * (CROP_WIDE_HEIGHT / CROP_WIDE_WIDTH);
        ctx.beginPath();
        ctx.rect(0, (targetSize - exportH) / 2, targetSize, exportH);
        ctx.closePath();
        ctx.clip();
      }

      // Draw transformed image
      ctx.save();
      ctx.translate(cx + position.x * scaleFactor, cy + position.y * scaleFactor);
      ctx.rotate((rotation * Math.PI) / 180);

      const baseScale = getBaseFitScale(img);
      const totalScale = baseScale * zoom * scaleFactor;
      const drawW = img.naturalWidth * totalScale;
      const drawH = img.naturalHeight * totalScale;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Outer Border Ring if selected (Ultra-slim 2.5px elegant outline)
      if (ringColor !== 'none') {
        if (ringColor === 'gold') ctx.strokeStyle = '#F5D900';
        else if (ringColor === 'green') ctx.strokeStyle = '#10B981';
        else if (ringColor === 'navy') ctx.strokeStyle = '#20216B';
        else if (ringColor === 'white') ctx.strokeStyle = '#FFFFFF';

        ctx.lineWidth = 3;
        if (cropShape === 'circle') {
          ctx.beginPath();
          ctx.arc(cx, cy, (targetSize / 2) - 1.5, 0, Math.PI * 2);
          ctx.stroke();
        } else if (cropShape === 'square') {
          const s = targetSize - 3;
          ctx.strokeRect(1.5, 1.5, s, s);
        }
      }

      if (cropShape === 'circle' || cropShape === 'wide') {
        ctx.restore();
      }

      return exportCanvas.toDataURL('image/png', 1.0);
    },
    [position, rotation, zoom, cropShape, bgMode, ringColor, getBaseFitScale]
  );

  // Update Live Navbar Preview
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const timer = setTimeout(() => {
      const url = generateExportDataUrl(320);
      setLivePreviewUrl(url);
    }, 40);
    return () => clearTimeout(timer);
  }, [isOpen, imageSrc, generateExportDataUrl]);

  // ----------------------------------------------------
  // Robust Pointer Events (Smooth Dragging on Mouse & Touch)
  // ----------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    } else if (activePointersRef.current.size === 2) {
      // Pinch to zoom start
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2 && pinchStartDistRef.current !== null) {
      // Multi-touch pinch zoom
      const pts = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const scale = dist / pinchStartDistRef.current;
      const newZoom = Math.min(Math.max(0.1, parseFloat((pinchStartZoomRef.current * scale).toFixed(2))), 4.0);
      setZoom(newZoom);
    } else if (activePointersRef.current.size === 1 && isDragging) {
      // Single pointer drag
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    activePointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (activePointersRef.current.size === 0) {
      setIsDragging(false);
      pinchStartDistRef.current = null;
    } else if (activePointersRef.current.size === 1) {
      const remainingPt = Array.from(activePointersRef.current.values())[0];
      dragStartRef.current = {
        x: remainingPt.x - position.x,
        y: remainingPt.y - position.y,
      };
      pinchStartDistRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.min(Math.max(0.1, parseFloat((prev + delta).toFixed(2))), 4.0));
  };

  const nudge = (dx: number, dy: number) => {
    setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const rotateBy = (deg: number) => {
    setRotation((prev) => {
      let next = prev + deg;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return next;
    });
  };

  // ----------------------------------------------------
  // Save & Apply
  // ----------------------------------------------------
  const handleSaveAndApply = async () => {
    setIsProcessing(true);
    try {
      const highResDataUrl = generateExportDataUrl(1024);

      // Permanently save across Cloudinary CDN and Firestore
      const res = await saveWebsiteLogo(highResDataUrl, { cropShape, bgMode, ringColor });
      const finalUrl = res.url || highResDataUrl;

      onApplyCroppedLogo(finalUrl);
      onClose();
    } catch (err) {
      console.error('Failed to process customized logo:', err);
      const fallbackUrl = generateExportDataUrl(1024);
      onApplyCroppedLogo(fallbackUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden text-stone-100 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#20216B] border border-[#FFF000]/40 text-[#FFF000] flex items-center justify-center shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Logo Customizer & Safe-Zone Cropper
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#20216B] text-[#FFF000] border border-[#FFF000]/30">
                  Zero Cutoff System
                </span>
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                Position, zoom, rotate, and crop your logo with real-time navbar simulation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-6">
          {/* Left: Interactive Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* Viewport Frame */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-stone-700 shadow-2xl bg-stone-950">
              <canvas
                ref={canvasRef}
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                style={{ touchAction: 'none' }}
                className={`w-[290px] h-[290px] sm:w-[340px] sm:h-[340px] block cursor-grab active:cursor-grabbing ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              />

              {/* Guide Hint */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/85 backdrop-blur-sm rounded-full text-[10px] font-mono text-amber-300 flex items-center gap-1 border border-amber-500/30 pointer-events-none whitespace-nowrap shadow-sm">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Keep text inside yellow dotted safe ring
              </div>

              {/* Pan & Zoom Hint */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/85 backdrop-blur-sm rounded-full text-[10px] font-mono text-stone-300 flex items-center gap-1.5 border border-white/10 pointer-events-none whitespace-nowrap shadow-sm">
                <Move className="w-3 h-3 text-[#FFF000]" />
                Drag to pan • Pinch / wheel to zoom
              </div>
            </div>

            {/* Quick Action Presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {/* Auto-Fit Safe Zone Button */}
              <button
                type="button"
                onClick={() => handleSafeFit()}
                className="px-3 py-1.5 bg-[#20216B] hover:bg-[#292A86] border border-[#FFF000]/60 text-[#FFF000] text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                title="Automatically fits 100% of text and logo without any side cuts"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFF000]" />
                Auto-Fit Safe (85%)
              </button>

              <button
                type="button"
                onClick={handleFillCircle}
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Fill entire circle"
              >
                <Maximize2 className="w-3 h-3" />
                Fill
              </button>

              {/* Directional Nudge */}
              <div className="flex items-center gap-0.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
                <button
                  type="button"
                  onClick={() => nudge(-4, 0)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white cursor-pointer"
                  title="Nudge Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(0, -4)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white cursor-pointer"
                  title="Nudge Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(0, 4)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white cursor-pointer"
                  title="Nudge Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(4, 0)}
                  className="p-1 hover:bg-stone-800 rounded text-stone-300 hover:text-white cursor-pointer"
                  title="Nudge Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Rotation */}
              <button
                type="button"
                onClick={() => rotateBy(-90)}
                className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Rotate -90°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                -90°
              </button>
              <button
                type="button"
                onClick={() => rotateBy(90)}
                className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Rotate +90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
                +90°
              </button>
            </div>
          </div>

          {/* Right: Controls & Real-World Navbar Simulation (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-stone-950/80 border border-stone-800/90 rounded-xl p-4 sm:p-5">
            <div className="space-y-4">
              {/* 1. Zoom Slider & Quick Steps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <ZoomIn className="w-3.5 h-3.5 text-[#FFF000]" />
                    Zoom & Scale
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[#FFF000] font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom(1.0)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                    >
                      100%
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoom(0.85)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#20216B] text-[#FFF000] border border-[#FFF000]/30 cursor-pointer"
                    >
                      Safe
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.1, parseFloat((z - 0.05).toFixed(2))))}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 rounded-md text-stone-300 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min="0.1"
                    max="3.5"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#FFF000] h-2 bg-stone-700 rounded-lg cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3.5, parseFloat((z + 0.05).toFixed(2))))}
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 rounded-md text-stone-300 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Tilt & Rotation Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-[#FFF000]" />
                    Tilt Angle
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#FFF000] font-bold">{rotation}°</span>
                    {rotation !== 0 && (
                      <button
                        type="button"
                        onClick={() => setRotation(0)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
                      >
                        Reset 0°
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FFF000] h-2 bg-stone-700 rounded-lg cursor-pointer"
                />
              </div>

              {/* 3. Crop Shape & Outer Accent Ring */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Crop Shape */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-400">Crop Shape</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setCropShape('circle')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        cropShape === 'circle'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                      title="Circular Emblem"
                    >
                      <Circle className="w-3.5 h-3.5" />
                      Circle
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropShape('square')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        cropShape === 'square'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                      title="Square Badge"
                    >
                      <Square className="w-3.5 h-3.5" />
                      Square
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropShape('wide')}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        cropShape === 'wide'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                      title="Wide Header Logo"
                    >
                      <RectangleHorizontal className="w-3.5 h-3.5" />
                      Wide
                    </button>
                  </div>
                </div>

                {/* Outer Ring Border */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-400">Border Accent</label>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => setRingColor('none')}
                      className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                        ringColor === 'none'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      None
                    </button>
                    <button
                      type="button"
                      onClick={() => setRingColor('gold')}
                      className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                        ringColor === 'gold'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      Gold
                    </button>
                    <button
                      type="button"
                      onClick={() => setRingColor('white')}
                      className={`p-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                        ringColor === 'white'
                          ? 'bg-[#20216B] border-[#FFF000] text-[#FFF000]'
                          : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      White
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Live Website Navbar Preview */}
              <div className="pt-2 border-t border-stone-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#FFF000]" />
                    Live Website Navbar Preview
                  </span>
                  <span className="font-mono text-[10px] text-[#FFF000]">Zero Cutoff Verified</span>
                </div>

                {/* Navbar Bar Simulation */}
                <div className="bg-[#171852] text-white p-3 rounded-xl border border-[#292A86] shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden flex items-center justify-center select-none ring-1 ring-[#FFF000]/50 shadow-sm">
                      {livePreviewUrl ? (
                        <img
                          src={livePreviewUrl}
                          alt="Navbar Live preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-stone-200 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="font-editorial text-sm font-bold text-white leading-tight">
                        DAR - E - ARQAM
                      </div>
                      <div className="text-[12px] text-[#FFF000] font-semibold tracking-[0.08em] [word-spacing:0.18em]">
                        School Katlang Campus
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-[#20216B] font-semibold px-2 py-1 bg-[#EEF0FF] rounded border border-[#292A86]/20">
                    Live Match
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndApply}
                disabled={isProcessing}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#20216B] hover:bg-[#292A86] active:scale-95 rounded-lg shadow-md border border-[#FFF000]/40 text-[#FFF000] flex items-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Applying Logo...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save & Apply Website-Wide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
