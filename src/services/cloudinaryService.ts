/**
 * DARE ARQAM Central Cloudinary Media Storage Service
 * Single Source of Truth for all uploaded media assets:
 * - Direct Fast Browser Unsigned Uploads to Cloudinary CDN
 * - Real-time Progress Tracking (0 - 100%)
 * - Auto-fallback to backend proxy endpoint if browser direct upload is blocked
 * - Dynamic image transformation & delivery helpers
 */

import { auth } from '../lib/firebase';

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    }
  } catch {}
  return headers;
}

export const CLOUDINARY_DEFAULTS: CloudinaryConfig = {
  cloudName: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) || 'ehc1fewm',
  uploadPreset: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CLOUDINARY_UPLOAD_PRESET) || 'dare_arqam_uploads',
  apiKey: '222139937659655',
};

let runtimeCloudinaryConfig: CloudinaryConfig = { ...CLOUDINARY_DEFAULTS };

export function setCloudinaryCredentials(config: Partial<CloudinaryConfig>) {
  runtimeCloudinaryConfig = { ...runtimeCloudinaryConfig, ...config };
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return runtimeCloudinaryConfig;
}

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

export type MediaCategory =
  | 'logo'
  | 'favicon'
  | 'banner'
  | 'principal'
  | 'faculty'
  | 'gallery'
  | 'news'
  | 'event'
  | 'id-card-template'
  | 'student-profile'
  | 'document'
  | 'other';

/**
 * Uploads an image or file directly from the browser to Cloudinary via unsigned upload preset.
 * Supports real upload progress tracking (0-100%).
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  options: {
    folder?: string;
    category?: MediaCategory | string;
    resourceType?: 'image' | 'raw' | 'auto';
    timeoutMs?: number;
    onProgress?: (progressPercent: number) => void;
  } = {}
): Promise<CloudinaryUploadResult> {
  const { 
    folder = options.category ? `dare_arqam_${options.category}` : 'dare_arqam_media', 
    resourceType = 'image', 
    timeoutMs = 35000, 
    onProgress 
  } = options;

  const { cloudName, uploadPreset } = runtimeCloudinaryConfig;

  // 1. DIRECT BROWSER UNSIGNED UPLOAD VIA XHR (for accurate progress tracking)
  try {
    const formData = new FormData();

    if (typeof file === 'string') {
      formData.append('file', file);
    } else {
      formData.append('file', file);
    }

    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const directUploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      xhr.open('POST', endpoint, true);
      xhr.timeout = timeoutMs;

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url || data.url) {
              if (onProgress) onProgress(100);
              resolve({
                success: true,
                url: data.secure_url || data.url,
                publicId: data.public_id,
                format: data.format,
                width: data.width,
                height: data.height,
                bytes: data.bytes,
              });
              return;
            }
          } catch (e) {
            // parsing error, fallback
          }
        }
        reject(new Error(`Direct Cloudinary upload HTTP ${xhr.status}: ${xhr.responseText}`));
      };

      xhr.onerror = () => reject(new Error('Network error during direct Cloudinary upload'));
      xhr.ontimeout = () => reject(new Error('Direct Cloudinary upload timed out'));

      xhr.send(formData);
    });

    return directUploadResult;
  } catch (directErr) {
    console.warn('Direct browser Cloudinary upload notice, trying server-side proxy fallback:', directErr);
  }

  // 2. SERVER-SIDE PROXY FALLBACK (/api/cloudinary/upload)
  try {
    let filePayload: string;
    if (typeof file === 'string') {
      filePayload = file;
    } else {
      filePayload = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers = await getAuthHeaders();
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        file: filePayload,
        folder,
        resource_type: resourceType,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        if (onProgress) onProgress(100);
        return {
          success: true,
          url: data.url,
          publicId: data.publicId,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        };
      }
    }

    const errJson = await response.json().catch(() => null);
    throw new Error(errJson?.error || `Upload endpoint failed with HTTP ${response.status}`);
  } catch (serverErr: any) {
    console.error('All Cloudinary upload routes failed:', serverErr);
    return {
      success: false,
      url: '',
      error: serverErr?.message || 'Failed to upload image to Cloudinary CDN.',
    };
  }
}

/**
 * Standardized Central Helper for all image uploads
 */
export async function uploadImageToCloudinary(
  file: File | Blob | string,
  category: MediaCategory,
  options?: {
    onProgress?: (progressPercent: number) => void;
    customFolder?: string;
  }
): Promise<CloudinaryUploadResult> {
  const folder = options?.customFolder || `dare_arqam_${category}`;
  return uploadToCloudinary(file, {
    category,
    folder,
    resourceType: 'image',
    onProgress: options?.onProgress,
  });
}

/**
 * Delete asset from Cloudinary CDN via server proxy
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<boolean> {
  if (!publicId) return true;

  try {
    const headers = await getAuthHeaders();
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        publicId,
        resource_type: resourceType,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.success === true;
    }
  } catch (err) {
    console.warn('Failed to delete asset from Cloudinary:', err);
  }

  return true;
}

/**
 * Optimized image URL helper for Cloudinary CDN
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  if (!url) return '';
  // If it's a Cloudinary URL, apply dynamic transformations
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    const transforms: string[] = ['f_auto', 'q_auto'];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
  }
  return url;
}
