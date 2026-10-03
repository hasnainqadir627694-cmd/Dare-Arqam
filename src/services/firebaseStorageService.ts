/**
 * Cloud Media Storage Adapter (Cloudinary CDN)
 * Completely replaces legacy Firebase Storage with Cloudinary CDN.
 * Guarantees zero Firebase Storage calls while preserving full API compatibility.
 */

import { uploadToCloudinary, deleteFromCloudinary, CloudinaryUploadResult } from './cloudinaryService';

export interface StorageUploadResult {
  success: boolean;
  url: string;
  storagePath: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileSizeBytes: number;
  contentType: string;
  error?: string;
}

export interface StorageUploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
  maxDimension?: number;
  onProgress?: (stage: 'validating' | 'optimizing' | 'uploading' | 'completed' | 'error') => void;
}

/**
 * Converts a data URL or Base64 string to a standard Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Reads natural image dimensions and aspect ratio from a File, Blob, or URL
 */
export async function getImageDimensions(
  source: File | Blob | string
): Promise<{ width: number; height: number; aspectRatio: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    let objectUrl = '';

    if (typeof source === 'string') {
      img.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width || 1200;
      const height = img.naturalHeight || img.height || 800;
      resolve({
        width,
        height,
        aspectRatio: Number((width / height).toFixed(4)),
      });
    };

    img.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve({ width: 1200, height: 800, aspectRatio: 1.5 });
    };
  });
}

/**
 * Redirects all uploads directly to Cloudinary CDN with zero Firebase Storage usage.
 */
export async function uploadToFirebaseStorage(
  source: File | Blob | string,
  folder: string,
  suggestedFileName?: string,
  options?: StorageUploadOptions
): Promise<StorageUploadResult> {
  if (options?.onProgress) options.onProgress('uploading');

  const cloudFolder = `dare_arqam_${folder.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const cloudRes: CloudinaryUploadResult = await uploadToCloudinary(source, {
    folder: cloudFolder,
    resourceType: 'image',
  });

  if (!cloudRes.success || !cloudRes.url) {
    if (options?.onProgress) options.onProgress('error');
    return {
      success: false,
      url: '',
      storagePath: '',
      fileSizeBytes: 0,
      contentType: 'image/jpeg',
      error: cloudRes.error || 'Upload to Cloudinary CDN failed',
    };
  }

  if (options?.onProgress) options.onProgress('completed');

  return {
    success: true,
    url: cloudRes.url,
    storagePath: cloudRes.publicId || `${cloudFolder}/${suggestedFileName || Date.now()}`,
    width: cloudRes.width || 1200,
    height: cloudRes.height || 800,
    aspectRatio: cloudRes.width && cloudRes.height ? Number((cloudRes.width / cloudRes.height).toFixed(4)) : 1.5,
    fileSizeBytes: cloudRes.bytes || 0,
    contentType: cloudRes.format ? `image/${cloudRes.format}` : 'image/jpeg',
  };
}

/**
 * Deletes asset from Cloudinary CDN.
 */
export async function deleteFromFirebaseStorage(urlOrStoragePath: string): Promise<boolean> {
  if (!urlOrStoragePath) return true;
  // If publicId was passed or extracted from URL
  let publicId = urlOrStoragePath;
  if (urlOrStoragePath.includes('res.cloudinary.com')) {
    const parts = urlOrStoragePath.split('/upload/');
    if (parts[1]) {
      const pathWithExt = parts[1].replace(/^v\d+\//, '');
      publicId = pathWithExt.replace(/\.[^/.]+$/, '');
    }
  }
  return deleteFromCloudinary(publicId);
}
