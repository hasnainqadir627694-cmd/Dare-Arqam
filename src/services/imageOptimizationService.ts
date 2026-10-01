/**
 * Advanced Image Optimization Service
 * Resizes, compresses, and converts uploaded images to modern WebP format
 * Generates low-resolution micro-thumbnails to eliminate layout shift and black loading screens
 * Uploads to Firebase Storage with robust offline/sandboxed fallback and timeout safety.
 */

import { uploadToCloudinary } from './cloudinaryService';

export interface OptimizedImageResult {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  originalSizeKB: number;
  fileSizeKB: number;
  format: string;
  savedPercent: number;
  publicId?: string;
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  thumbnailSize?: number;
  onStageChange?: (stage: 'processing' | 'uploading' | 'completed') => void;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.84,
  thumbnailSize: 28,
};

/**
 * Checks if the browser supports canvas WebP export
 */
function isWebPSupported(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Converts an ArrayBuffer to a Base64 string in chunks to prevent stack overflow on large images
 */
function arrayBufferToBase64(buffer: ArrayBuffer, mimeType = 'image/jpeg'): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  const chunkSize = 16384;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

/**
 * Loads an image from a File, Blob, or URL into an HTMLImageElement with multi-tier fallback architecture
 * (createObjectURL -> ArrayBuffer Base64 -> FileReader -> direct URL)
 */
export async function loadImage(source: File | Blob | string, timeoutMs = 15000): Promise<HTMLImageElement> {
  // If it's a File or Blob, try native Object URL first (fastest, lowest memory, universally supported on mobile)
  if (source instanceof File || source instanceof Blob) {
    // 1. Try createObjectURL
    try {
      const objUrl = URL.createObjectURL(source);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const timer = setTimeout(() => {
          URL.revokeObjectURL(objUrl);
          reject(new Error('Object URL load timed out'));
        }, 6000);

        const image = new Image();
        image.onload = () => {
          clearTimeout(timer);
          URL.revokeObjectURL(objUrl);
          resolve(image);
        };
        image.onerror = (e) => {
          clearTimeout(timer);
          URL.revokeObjectURL(objUrl);
          reject(e);
        };
        image.src = objUrl;
      });
      return img;
    } catch {
      // Fallback to ArrayBuffer
    }

    // 2. Try ArrayBuffer conversion
    try {
      const buffer = await source.arrayBuffer();
      const mime = source.type || 'image/jpeg';
      const dataUrl = arrayBufferToBase64(buffer, mime);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('ArrayBuffer image load timed out')), 6000);
        const image = new Image();
        image.onload = () => {
          clearTimeout(timer);
          resolve(image);
        };
        image.onerror = (e) => {
          clearTimeout(timer);
          reject(e);
        };
        image.src = dataUrl;
      });
      return img;
    } catch {
      // Fallback to FileReader
    }

    // 3. Try FileReader
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader();
      const timer = setTimeout(() => reject(new Error('FileReader timed out')), timeoutMs);

      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          clearTimeout(timer);
          resolve(image);
        };
        image.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Could not render image from FileReader data'));
        };
        image.src = reader.result as string;
      };
      reader.onerror = () => {
        clearTimeout(timer);
        reject(new Error('FileReader read error'));
      };
      reader.readAsDataURL(source);
    });
  }

  // If it's a URL string
  const url = String(source);
  const isDataOrBlob = url.startsWith('data:') || url.startsWith('blob:');

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Image URL loading timed out')), timeoutMs);
    const img = new Image();

    if (!isDataOrBlob && !url.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };

    img.onerror = () => {
      if (img.crossOrigin) {
        // Retry without crossOrigin
        const retryImg = new Image();
        retryImg.onload = () => {
          clearTimeout(timer);
          resolve(retryImg);
        };
        retryImg.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Failed to load image from URL'));
        };
        retryImg.src = url;
      } else {
        clearTimeout(timer);
        reject(new Error('Failed to load image from source URL'));
      }
    };

    img.src = url;
  });
}

/**
 * Computes scaled dimensions fitting inside maxWidth/maxHeight while preserving aspect ratio
 */
export function calculateAspectPreservingDimensions(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = srcWidth;
  let height = srcHeight;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width: Math.max(width, 1), height: Math.max(height, 1) };
}

/**
 * Generates an ultra-low-resolution micro-thumbnail data URL for blur-up placeholders
 */
export function generateMicroThumbnail(
  img: HTMLImageElement,
  srcWidth: number,
  srcHeight: number,
  thumbWidth = 28
): string {
  try {
    const canvas = document.createElement('canvas');
    const thumbHeight = Math.max(Math.round((srcHeight * thumbWidth) / srcWidth), 1);
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

    const format = isWebPSupported() ? 'image/webp' : 'image/jpeg';
    return canvas.toDataURL(format, 0.4);
  } catch {
    return '';
  }
}

/**
 * Client-side optimization:
 * 1. Resizes to max bounds (1920x1080)
 * 2. Compresses to WebP (quality 0.84)
 * 3. Generates micro placeholder
 */
export async function optimizeImage(
  fileOrUrl: File | Blob | string,
  customOptions?: OptimizationOptions
): Promise<{
  blob: Blob;
  dataUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  originalSizeKB: number;
  fileSizeKB: number;
  format: string;
  savedPercent: number;
}> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  const img = await loadImage(fileOrUrl, 15000);

  const naturalWidth = img.naturalWidth || img.width || 800;
  const naturalHeight = img.naturalHeight || img.height || 600;
  const aspectRatio = Number((naturalWidth / naturalHeight).toFixed(4));

  // Determine original byte size if available
  let originalBytes = 0;
  if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
    originalBytes = fileOrUrl.size;
  } else if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:')) {
    originalBytes = Math.round((fileOrUrl.length * 3) / 4);
  } else {
    originalBytes = 1024 * 500;
  }
  const originalSizeKB = Math.round(originalBytes / 1024);

  // Compute targeted dimensions
  const { width: targetWidth, height: targetHeight } = calculateAspectPreservingDimensions(
    naturalWidth,
    naturalHeight,
    options.maxWidth || 1920,
    options.maxHeight || 1080
  );

  // Draw into canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain Canvas 2D rendering context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Determine export format
  const mimeType = isWebPSupported() ? 'image/webp' : 'image/jpeg';
  const formatName = mimeType === 'image/webp' ? 'webp' : 'jpg';

  // Export to Blob with fallback
  let blob: Blob;
  try {
    blob = await new Promise<Blob>((resolve, reject) => {
      const blobTimeout = setTimeout(() => {
        reject(new Error('Canvas blob export timed out'));
      }, 5000);

      canvas.toBlob(
        (b) => {
          clearTimeout(blobTimeout);
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob returned null'));
        },
        mimeType,
        options.quality || 0.84
      );
    });
  } catch {
    // Fallback: convert dataURL to Blob directly
    const dataUrlFallback = canvas.toDataURL(mimeType, options.quality || 0.84);
    const byteString = atob(dataUrlFallback.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    blob = new Blob([ab], { type: mimeType });
  }

  const dataUrl = canvas.toDataURL(mimeType, options.quality || 0.84);
  const fileSizeKB = Math.max(1, Math.round(blob.size / 1024));
  const savedPercent = originalSizeKB > fileSizeKB 
    ? Math.round(((originalSizeKB - fileSizeKB) / originalSizeKB) * 100)
    : 0;

  // Generate micro thumbnail placeholder
  const thumbnailUrl = generateMicroThumbnail(img, naturalWidth, naturalHeight, options.thumbnailSize || 28);

  return {
    blob,
    dataUrl,
    thumbnailUrl,
    width: targetWidth,
    height: targetHeight,
    aspectRatio,
    originalSizeKB,
    fileSizeKB,
    format: formatName,
    savedPercent,
  };
}

/**
 * Optimizes an image and uploads to Cloudinary CDN with timeout safety.
 * Falls back to optimized WebP data URL if network/offline issues occur.
 */
export async function processAndUploadGalleryImage(
  fileOrUrl: File | Blob | string,
  options?: OptimizationOptions
): Promise<OptimizedImageResult> {
  if (options?.onStageChange) options.onStageChange('processing');
  
  let optimized: Awaited<ReturnType<typeof optimizeImage>>;
  try {
    optimized = await optimizeImage(fileOrUrl, options);
  } catch (optError) {
    // If canvas optimization fails on any unusual format, build a safe fallback
    if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      const buffer = await fileOrUrl.arrayBuffer();
      const mime = fileOrUrl.type || 'image/jpeg';
      const rawDataUrl = arrayBufferToBase64(buffer, mime);
      optimized = {
        blob: fileOrUrl,
        dataUrl: rawDataUrl,
        thumbnailUrl: '',
        width: 1280,
        height: 720,
        aspectRatio: 1.7778,
        originalSizeKB: Math.round(fileOrUrl.size / 1024),
        fileSizeKB: Math.round(fileOrUrl.size / 1024),
        format: mime.split('/')[1] || 'jpg',
        savedPercent: 0
      };
    } else {
      throw optError;
    }
  }
  
  if (options?.onStageChange) options.onStageChange('uploading');
  let finalUrl = optimized.dataUrl;
  let publicId: string | undefined;

  try {
    // Direct Cloudinary Upload via Server Proxy
    const cloudinaryRes = await uploadToCloudinary(optimized.dataUrl || optimized.blob, {
      folder: 'dare_arqam_gallery',
      resourceType: 'image',
      timeoutMs: 25000,
    });

    if (cloudinaryRes.success && cloudinaryRes.url) {
      finalUrl = cloudinaryRes.url;
      publicId = cloudinaryRes.publicId;
    }
  } catch (storageError) {
    console.warn('Cloudinary upload fallback to optimized WebP data URL:', storageError);
  }

  if (options?.onStageChange) options.onStageChange('completed');

  return {
    url: finalUrl,
    thumbnailUrl: optimized.thumbnailUrl,
    width: optimized.width,
    height: optimized.height,
    aspectRatio: optimized.aspectRatio,
    originalSizeKB: optimized.originalSizeKB,
    fileSizeKB: optimized.fileSizeKB,
    format: optimized.format,
    savedPercent: optimized.savedPercent,
    publicId,
  };
}

/**
 * In-memory cache of preloaded image URLs to ensure 0ms latency on slide changes
 */
const preloadedImageUrls = new Set<string>();

/**
 * Preloads an image into browser memory
 */
export function preloadGalleryImage(url: string): Promise<boolean> {
  if (!url || preloadedImageUrls.has(url)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedImageUrls.add(url);
      resolve(true);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Preloads a batch of URLs with priority
 */
export function preloadNextSlides(slides: { url: string }[], currentIndex: number, lookahead = 2): void {
  if (!slides || slides.length === 0) return;
  const total = slides.length;

  for (let i = 1; i <= lookahead; i++) {
    const nextIndex = (currentIndex + i) % total;
    const prevIndex = (currentIndex - i + total) % total;

    if (slides[nextIndex]?.url) {
      preloadGalleryImage(slides[nextIndex].url);
    }
    if (slides[prevIndex]?.url) {
      preloadGalleryImage(slides[prevIndex].url);
    }
  }
}
