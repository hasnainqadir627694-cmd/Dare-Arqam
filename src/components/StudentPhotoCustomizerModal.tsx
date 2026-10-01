import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  FlipHorizontal, 
  Sun, 
  Contrast, 
  Check, 
  RefreshCw, 
  Move, 
  Circle, 
  Square, 
  Upload, 
  Sparkles,
  ShieldCheck,
  Camera
} from 'lucide-react';

interface StudentPhotoCustomizerModalProps {
  isOpen: boolean;
  imageFile: File | null;
  currentImageUrl?: string;
  studentName: string;
  studentClass?: string;
  studentRoll?: string;
  onClose: () => void;
  onSave: (processedFile: File) => Promise<void> | void;
  isSaving?: boolean;
}

const CROP_BOX_SIZE = 260; // Exact on-screen crop window dimension in pixels

export const StudentPhotoCustomizerModal: React.FC<StudentPhotoCustomizerModalProps> = ({
  isOpen,
  imageFile,
  currentImageUrl,
  studentName,
  studentClass = 'Class 1',
  studentRoll = '—',
  onClose,
  onSave,
  isSaving = false,
}) => {
  // Image source & natural dimensions
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  // Transform controls
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);

  // Enhancement controls
  const [brightness, setBrightness] = useState<number>(100); // 70 to 140
  const [contrast, setContrast] = useState<number>(100); // 70 to 140

  // Mask shape preview: 'circle' | 'square'
  const [maskShape, setMaskShape] = useState<'circle' | 'square'>('circle');

  // Dragging state for panning
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image source whenever file or currentImageUrl changes
  useEffect(() => {
    if (!isOpen) return;

    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImageSrc(objectUrl);
      resetAdjustments();

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else if (currentImageUrl) {
      setImageSrc(currentImageUrl);
      resetAdjustments();
    } else {
      setImageSrc(null);
      setNaturalSize(null);
    }
  }, [imageFile, currentImageUrl, isOpen]);

  // Load natural dimensions when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      setNaturalSize(null);
      return;
    }

    const testImg = new Image();
    testImg.onload = () => {
      setNaturalSize({
        width: testImg.naturalWidth || 600,
        height: testImg.naturalHeight || 600,
      });
    };
    testImg.src = imageSrc;
  }, [imageSrc]);

  const resetAdjustments = () => {
    setZoom(1.2);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setIsFlippedH(false);
    setBrightness(100);
    setContrast(100);
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: Math.round(panStartRef.current.x + dx),
      y: Math.round(panStartRef.current.y + dy),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = { x: touch.clientX, y: touch.clientY };
      panStartRef.current = { ...pan };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPan({
      x: Math.round(panStartRef.current.x + dx),
      y: Math.round(panStartRef.current.y + dy),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom inside viewport
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((z) => Math.min(3.5, Math.max(0.6, Math.round((z + delta) * 100) / 100)));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle changing to a different local file
  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageSrc(objectUrl);
      resetAdjustments();
    }
  };

  // Calculate display dimensions inside viewport
  const imgW = naturalSize?.width || 600;
  const imgH = naturalSize?.height || 600;
  const baseScale = Math.max(CROP_BOX_SIZE / imgW, CROP_BOX_SIZE / imgH);
  const currentW = Math.round(imgW * baseScale * zoom);
  const currentH = Math.round(imgH * baseScale * zoom);

  // Generate cropped high-res image and trigger onSave
  const handleApplyAndSave = async () => {
    if (!imageSrc || !naturalSize) return;

    try {
      const outputSize = 600; // 600x600 high-res crisp avatar
      const scaleFactor = outputSize / CROP_BOX_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      if (!ctx) return;

      // 1. Clip to the exact selected shape!
      ctx.save();
      if (maskShape === 'circle') {
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else {
        const cornerR = 36;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(0, 0, outputSize, outputSize, cornerR);
        } else {
          ctx.rect(0, 0, outputSize, outputSize);
        }
        ctx.closePath();
        ctx.clip();
      }

      // 2. Clear canvas with full alpha transparency (NO sharp background corners!)
      ctx.clearRect(0, 0, outputSize, outputSize);

      // 3. Apply brightness & contrast filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // 4. Translate to center of canvas
      ctx.translate(outputSize / 2, outputSize / 2);

      // 5. Apply pan offset scaled to canvas coordinates
      ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

      // 6. Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // 7. Apply horizontal flip
      if (isFlippedH) {
        ctx.scale(-1, 1);
      }

      // 8. Draw image scaled to canvas
      const exportW = currentW * scaleFactor;
      const exportH = currentH * scaleFactor;

      const imgToDraw = imgRef.current || new Image();
      if (!imgRef.current) {
        imgToDraw.crossOrigin = 'anonymous';
        await new Promise<void>((res, rej) => {
          imgToDraw.onload = () => res();
          imgToDraw.onerror = rej;
          imgToDraw.src = imageSrc;
        });
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(imgToDraw, -exportW / 2, -exportH / 2, exportW, exportH);

      ctx.restore();

      // 9. Convert to Blob & File (WebP with alpha channel, PNG fallback)
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            // PNG fallback for transparent preservation
            canvas.toBlob(async (pngBlob) => {
              if (!pngBlob) {
                alert('Could not export cropped image blob.');
                return;
              }
              const fileName = `student-profile-${Date.now()}.png`;
              const processedFile = new File([pngBlob], fileName, { type: 'image/png' });
              await onSave(processedFile);
            }, 'image/png');
            return;
          }
          const fileName = `student-profile-${Date.now()}.webp`;
          const processedFile = new File([blob], fileName, { type: 'image/webp' });
          await onSave(processedFile);
        },
        'image/webp',
        0.95
      );
    } catch (err) {
      console.error('Error processing student photo crop:', err);
      alert('Could not process photo crop. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0D1120] border-2 border-[#D4AF37]/60 rounded-2xl w-full max-w-2xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#14192D] border-b border-[#263352] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#20216B] border border-[#D4AF37] flex items-center justify-center text-[#FFF000]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-base sm:text-lg font-bold text-white leading-tight">
                Crop & Perfect Student Profile Photo
              </h2>
              <p className="text-[11px] text-stone-400 font-mono">
                Only the exact framed area will be uploaded with smooth circular or square edges
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#20216B] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {imageSrc ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              
              {/* Interactive Viewport Area (Col 7) */}
              <div className="md:col-span-7 flex flex-col items-center">
                <div
                  ref={viewportRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  className={`relative w-[280px] h-[280px] bg-[#090C15] rounded-2xl overflow-hidden border-2 border-[#334168] shadow-inner select-none cursor-move flex items-center justify-center ${
                    isDragging ? 'cursor-grabbing' : ''
                  }`}
                >
                  {/* Positioned Image with Transforms */}
                  <div
                    className="absolute pointer-events-none transition-transform duration-75 ease-out select-none"
                    style={{
                      width: `${currentW}px`,
                      height: `${currentH}px`,
                      left: '50%',
                      top: '50%',
                      transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1})`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Student Crop Target"
                      crossOrigin="anonymous"
                      className="w-full h-full object-fill pointer-events-none select-none block"
                      draggable={false}
                    />
                  </div>

                  {/* Mask Overlay (Circle or Square) */}
                  <div
                    className="absolute pointer-events-none flex items-center justify-center transition-all duration-200"
                    style={{
                      left: '50%',
                      top: '50%',
                      width: `${CROP_BOX_SIZE}px`,
                      height: `${CROP_BOX_SIZE}px`,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: maskShape === 'circle' ? '9999px' : '20px',
                      boxShadow: '0 0 0 9999px rgba(9, 12, 21, 0.72)',
                      border: maskShape === 'circle' ? '2.5px solid #FFF000' : '2.5px solid #22D3EE',
                    }}
                  >
                    {/* Center guide crosshair */}
                    <div className={`absolute w-5 h-0.5 ${maskShape === 'circle' ? 'bg-[#FFF000]/70' : 'bg-cyan-400/70'}`} />
                    <div className={`absolute h-5 w-0.5 ${maskShape === 'circle' ? 'bg-[#FFF000]/70' : 'bg-cyan-400/70'}`} />
                    
                    {/* Circular concentric guide ring */}
                    {maskShape === 'circle' && (
                      <div className="absolute inset-4 rounded-full border border-dashed border-[#FFF000]/30 pointer-events-none" />
                    )}
                  </div>

                  {/* Interaction Hint Overlay */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black/65 backdrop-blur-xs text-[10px] font-mono text-stone-300 py-1 px-2.5 rounded-lg flex items-center justify-center gap-1.5 pointer-events-none">
                    <Move className="w-3.5 h-3.5 text-[#FFF000]" />
                    <span>Drag to position face · Scroll to zoom</span>
                  </div>
                </div>

                {/* Shape Selector & Upload New */}
                <div className="flex items-center justify-between w-full max-w-[280px] mt-3 text-xs">
                  <div className="flex items-center gap-1 bg-[#14192D] p-1 rounded-xl border border-[#263352]">
                    <button
                      type="button"
                      onClick={() => setMaskShape('circle')}
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                        maskShape === 'circle'
                          ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 shadow-xs'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Circle className="w-3 h-3" />
                      <span>Circle Crop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaskShape('square')}
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                        maskShape === 'square'
                          ? 'bg-[#20216B] text-cyan-300 border border-cyan-400/50 shadow-xs'
                          : 'text-stone-400 hover:text-white'
                      }`}
                    >
                      <Square className="w-3 h-3" />
                      <span>Square Crop</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-stone-300 hover:text-white flex items-center gap-1 text-[11px] font-mono hover:underline cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#FFF000]" />
                    <span>Choose other</span>
                  </button>
                </div>
              </div>

              {/* Adjustments & Live ID Card Badge Preview (Col 5) */}
              <div className="md:col-span-5 space-y-3.5">
                
                {/* 1. Zoom Slider */}
                <div className="bg-[#14192D] p-3 rounded-xl border border-[#263352] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#FFF000]" />
                      <span>Zoom Level</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#FFF000] font-bold">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10))}
                      className="p-1 rounded bg-[#0A0D18] hover:bg-[#20216B] text-stone-300 border border-[#263352] cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.6"
                      max="3.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value) || 1)}
                      className="flex-1 accent-[#FFF000] cursor-pointer h-2 bg-[#0A0D18] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3.5, Math.round((z + 0.1) * 10) / 10))}
                      className="p-1 rounded bg-[#0A0D18] hover:bg-[#20216B] text-stone-300 border border-[#263352] cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Orientation & Rotation Controls */}
                <div className="bg-[#14192D] p-3 rounded-xl border border-[#263352] space-y-2">
                  <span className="text-xs font-semibold text-stone-200 block">
                    Rotate & Flip
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="py-1.5 px-2 bg-[#0A0D18] hover:bg-[#20216B] text-stone-300 hover:text-white border border-[#263352] rounded-lg text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>-90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 px-2 bg-[#0A0D18] hover:bg-[#20216B] text-stone-300 hover:text-white border border-[#263352] rounded-lg text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>+90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlippedH((f) => !f)}
                      className={`py-1.5 px-2 border rounded-lg text-xs font-mono flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 ${
                        isFlippedH
                          ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]'
                          : 'bg-[#0A0D18] hover:bg-[#20216B] text-stone-300 border-[#263352]'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip</span>
                    </button>
                  </div>
                </div>

                {/* 3. Lighting Enhancement (Brightness & Contrast) */}
                <div className="bg-[#14192D] p-3 rounded-xl border border-[#263352] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-200 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-[#FFF000]" />
                      <span>Brightness & Contrast</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                      }}
                      className="text-[10px] font-mono text-cyan-300 hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                      <span className="w-14">Bright: {brightness}%</span>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        step="5"
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value, 10) || 100)}
                        className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-[#0A0D18] rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
                      <span className="w-14">Contrast: {contrast}%</span>
                      <input
                        type="range"
                        min="70"
                        max="140"
                        step="5"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value, 10) || 100)}
                        className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-[#0A0D18] rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Live ID Badge Preview */}
                <div className="bg-[#14192D] p-3 rounded-xl border border-[#D4AF37]/40 flex items-center gap-3 shadow-xs">
                  <div 
                    className={`relative w-14 h-14 overflow-hidden bg-[#0A0D18] border-2 border-[#FFF000] shrink-0 flex items-center justify-center shadow-inner ${
                      maskShape === 'circle' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  >
                    {naturalSize && (
                      <div
                        className="absolute flex items-center justify-center pointer-events-none"
                        style={{
                          width: `${currentW * (56 / CROP_BOX_SIZE)}px`,
                          height: `${currentH * (56 / CROP_BOX_SIZE)}px`,
                          transform: `translate(${pan.x * (56 / CROP_BOX_SIZE)}px, ${pan.y * (56 / CROP_BOX_SIZE)}px) rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1})`,
                          filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                          transformOrigin: 'center center',
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt="Mini Card Preview"
                          className="w-full h-full object-fill pointer-events-none"
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#FFF000]" />
                      <span>Live ID Card Result</span>
                    </span>
                    <p className="text-xs font-bold text-white truncate font-editorial">{studentName}</p>
                    <p className="text-[10px] text-stone-400 font-mono truncate">
                      {studentClass} · Roll #{studentRoll}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Empty state: prompt to select photo */
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#14192D] border-2 border-dashed border-[#D4AF37] flex items-center justify-center mx-auto text-[#FFF000]">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Select a Photo to Begin</h3>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                  Upload a portrait photo from your mobile device or computer to customize it for your ID card.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-bold text-xs rounded-xl shadow-md cursor-pointer border border-[#D4AF37]/50 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select Photo from Device</span>
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleLocalFileChange}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-[#14192D] border-t border-[#263352] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAdjustments}
            disabled={!imageSrc || isSaving}
            className="text-xs text-stone-400 hover:text-stone-200 disabled:opacity-50 font-mono cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Position</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-[#0A0D18] hover:bg-[#1E2540] border border-[#263352] rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyAndSave}
              disabled={!imageSrc || isSaving}
              className="px-5 py-2 text-xs font-bold bg-[#20216B] hover:bg-[#171852] text-[#FFF000] border border-[#D4AF37] rounded-xl shadow-lg cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFF000]" />
                  <span>Saving & Uploading...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save & Apply to ID Card</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

