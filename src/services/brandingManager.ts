import { useState, useEffect } from 'react';
import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { uploadImageToCloudinary } from './cloudinaryService';

export const LOCAL_STORAGE_LOGO_KEY = 'app_custom_website_logo';
export const LEGACY_STORAGE_LOGO_KEY = 'dare_arqam_custom_logo';
export const LOGO_UPDATED_EVENT = 'website_logo_updated';
export const DEFAULT_OFFICIAL_LOGO = '/branding/logo.png';

/**
 * Dynamically updates browser DOM <link rel="icon">, <link rel="apple-touch-icon">,
 * OpenGraph og:image, and Twitter cards.
 */
export function updateBrowserIdentityTags(logoUrl: string) {
  if (typeof document === 'undefined' || !logoUrl) return;

  try {
    // 1. Favicon links
    let favPng = document.querySelector("link[rel='icon'][type='image/png']") as HTMLLinkElement | null;
    if (!favPng) {
      favPng = document.createElement('link');
      favPng.rel = 'icon';
      favPng.type = 'image/png';
      document.head.appendChild(favPng);
    }
    favPng.href = logoUrl;

    let shortcut = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement | null;
    if (!shortcut) {
      shortcut = document.createElement('link');
      shortcut.rel = 'shortcut icon';
      document.head.appendChild(shortcut);
    }
    shortcut.href = logoUrl;

    // 2. Apple Touch Icon
    let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = logoUrl;

    // 3. Open Graph Image
    let ogImg = document.querySelector("meta[property='og:image']") as HTMLMetaElement | null;
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.content = logoUrl;

    // 4. Twitter Card Image
    let twImg = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement | null;
    if (!twImg) {
      twImg = document.createElement('meta');
      twImg.name = 'twitter:image';
      document.head.appendChild(twImg);
    }
    twImg.content = logoUrl;
  } catch (err) {
    console.debug('Dynamic identity tags update notice:', err);
  }
}

/**
 * Center-crops any uploaded image source to an ultra-sharp 1:1 512x512 PNG square.
 */
export async function processSquareLogoFromSrc(
  src: string,
  targetDimension: number = 512,
  zoomFactor: number = 1.0,
  offsetX: number = 0,
  offsetY: number = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!src) {
      return reject(new Error('No image source provided to processSquareLogoFromSrc'));
    }

    const img = new Image();
    const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
    if (!isDataOrBlob && !src.startsWith('/')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetDimension;
        canvas.height = targetDimension;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to create canvas 2d context'));
        }

        ctx.clearRect(0, 0, targetDimension, targetDimension);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const imgWidth = img.naturalWidth || img.width || 1;
        const imgHeight = img.naturalHeight || img.height || 1;

        // Calculate aspect fill scale
        const baseScale = targetDimension / Math.min(imgWidth, imgHeight);
        const finalScale = baseScale * Math.max(0.2, zoomFactor);

        const drawW = imgWidth * finalScale;
        const drawH = imgHeight * finalScale;
        const drawX = (targetDimension - drawW) / 2 + offsetX;
        const drawY = (targetDimension - drawH) / 2 + offsetY;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      // Retry without CORS if tainted
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetDimension;
          canvas.height = targetDimension;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(src);
          ctx.drawImage(fallbackImg, 0, 0, targetDimension, targetDimension);
          resolve(canvas.toDataURL('image/png', 1.0));
        } catch {
          resolve(src);
        }
      };
      fallbackImg.onerror = () => reject(new Error('Could not load image source for square logo processing'));
      fallbackImg.src = src;
    };

    img.src = src;
  });
}

/**
 * Saves the website logo across:
 * a) LocalStorage (app_custom_website_logo)
 * b) Broadcast CustomEvent (website_logo_updated)
 * c) Dynamic DOM identity tags (<link rel="icon">, <link rel="apple-touch-icon">, og:image, twitter:image)
 * d) Backend POST /api/branding/logo (writes to disk in public/ and dist/)
 * e) Firestore collection 'pages' document 'branding_settings'
 */
export async function saveWebsiteLogo(
  logoDataUrl: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    if (!logoDataUrl) {
      throw new Error('Valid logo data URL is required');
    }

    // 1. LocalStorage caching
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, logoDataUrl);
      localStorage.setItem(LEGACY_STORAGE_LOGO_KEY, logoDataUrl);
    } catch {}

    // 2. Broadcast CustomEvent for zero-latency component update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(LOGO_UPDATED_EVENT, {
          detail: { logoUrl: logoDataUrl, metadata, timestamp: Date.now() },
        })
      );
    }

    // 3. Dynamically update browser DOM
    updateBrowserIdentityTags(logoDataUrl);

    let permanentLogoUrl = '';
    let publicId = '';

    // 4. Primary: Upload directly to Cloudinary CDN
    try {
      const cloudRes = await uploadImageToCloudinary(logoDataUrl, 'logo', { customFolder: 'dare_arqam_logo' });
      if (cloudRes.success && cloudRes.url) {
        permanentLogoUrl = cloudRes.url;
        publicId = cloudRes.publicId || '';
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload notice:', cloudErr);
    }

    let serverUrl = `/branding/logo.png?v=${Date.now()}`;

    // 5. Send to Express backend API to write local static assets for favicon generation
    try {
      let idToken = '';
      try {
        idToken = (await auth.currentUser?.getIdToken()) || '';
      } catch {}

      const response = await fetch('/api/branding/logo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          logoDataUrl,
          imageBase64: logoDataUrl,
          metadata,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.localUrl) {
          serverUrl = result.localUrl;
        } else if (result.cdnUrl && result.cdnUrl.startsWith('http')) {
          serverUrl = result.cdnUrl;
        }
      }
    } catch (backendErr) {
      console.warn('Backend /api/branding/logo write notice:', backendErr);
    }

    const finalUrl = permanentLogoUrl || serverUrl;

    // 6. Persist to Firestore: collection 'pages' document 'branding_settings' (Single Source of Truth)
    try {
      await setDoc(
        doc(db, 'pages', 'branding_settings'),
        {
          logoUrl: finalUrl,
          updatedAt: new Date().toISOString(),
          dimensions: { width: 512, height: 512 },
          ...metadata,
        },
        { merge: true }
      );

      // Also mirror in settings/single_app_state for system compatibility
      await setDoc(
        doc(db, 'settings', 'single_app_state'),
        {
          branding: {
            logoUrl: finalUrl,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      console.warn('Firestore branding_settings save notice:', firestoreErr);
    }

    return { success: true, url: finalUrl };
  } catch (err: any) {
    console.error('saveWebsiteLogo error:', err);
    return { success: false, url: DEFAULT_OFFICIAL_LOGO, error: err?.message || 'Failed to save logo' };
  }
}

/**
 * Reverts the website logo back to institutional default.
 */
export async function revertWebsiteLogoToDefault(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_LOGO_KEY);
    localStorage.removeItem(LEGACY_STORAGE_LOGO_KEY);
  } catch {}

  const defaultUrl = DEFAULT_OFFICIAL_LOGO;

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(LOGO_UPDATED_EVENT, {
        detail: { logoUrl: defaultUrl, isDefault: true, timestamp: Date.now() },
      })
    );
  }

  updateBrowserIdentityTags(defaultUrl);

  try {
    await setDoc(
      doc(db, 'pages', 'branding_settings'),
      {
        logoUrl: defaultUrl,
        updatedAt: new Date().toISOString(),
        isDefault: true,
      },
      { merge: true }
    );

    await setDoc(
      doc(db, 'settings', 'single_app_state'),
      {
        branding: {
          logoUrl: defaultUrl,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch {}
}

/**
 * Custom React Hook providing the real-time active website logo URL.
 * Automatically synchronizes via:
 * 1. Synchronous localStorage initialization for zero layout shifts.
 * 2. Real-time window CustomEvent listener ('website_logo_updated') for instant UI updates.
 * 3. Real-time Firestore snapshot listener on `pages/branding_settings` for cross-device & published site updates.
 */
export function useWebsiteLogo(): string {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_LOGO_KEY) || localStorage.getItem(LEGACY_STORAGE_LOGO_KEY);
        if (cached && cached.trim().length > 0) {
          return cached;
        }
      } catch {}
    }
    return DEFAULT_OFFICIAL_LOGO;
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Initial DOM tag update on mount
    updateBrowserIdentityTags(logoUrl || DEFAULT_OFFICIAL_LOGO);

    // 2. Window event listener for immediate same-tab component reactivity
    const handleLogoUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ logoUrl?: string }>;
      if (customEvent.detail?.logoUrl && isMounted) {
        setLogoUrl(customEvent.detail.logoUrl);
        updateBrowserIdentityTags(customEvent.detail.logoUrl);
      }
    };

    window.addEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);

    // 3. Real-time Firestore listener on `pages/branding_settings`
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      unsubscribeFirestore = onSnapshot(
        doc(db, 'pages', 'branding_settings'),
        (snap) => {
          if (!isMounted) return;
          if (snap.exists()) {
            const data = snap.data();
            const remoteLogo = data?.logoUrl || data?.logoDataUrl;
            if (remoteLogo && typeof remoteLogo === 'string' && remoteLogo.trim().length > 0) {
              setLogoUrl(remoteLogo);
              try {
                localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, remoteLogo);
              } catch {}
              updateBrowserIdentityTags(remoteLogo);
              return;
            }
          }
        },
        (error) => {
          console.debug('pages/branding_settings onSnapshot notice:', error);
        }
      );
    } catch (err) {
      console.debug('Failed to initialize Firestore logo onSnapshot listener:', err);
    }

    // 4. Secondary fallback listener on `settings/single_app_state`
    let unsubscribeSingleApp: (() => void) | null = null;
    try {
      unsubscribeSingleApp = onSnapshot(
        doc(db, 'settings', 'single_app_state'),
        (snap) => {
          if (!isMounted) return;
          if (snap.exists()) {
            const state = snap.data();
            const fallbackLogo = state?.branding?.logoUrl;
            if (fallbackLogo && typeof fallbackLogo === 'string' && fallbackLogo.trim().length > 0) {
              setLogoUrl((current) => {
                if (current === DEFAULT_OFFICIAL_LOGO) {
                  updateBrowserIdentityTags(fallbackLogo);
                  return fallbackLogo;
                }
                return current;
              });
            }
          }
        },
        (error) => {
          console.debug('settings/single_app_state onSnapshot notice:', error);
        }
      );
    } catch {}

    return () => {
      isMounted = false;
      window.removeEventListener(LOGO_UPDATED_EVENT, handleLogoUpdated);
      if (unsubscribeFirestore) unsubscribeFirestore();
      if (unsubscribeSingleApp) unsubscribeSingleApp();
    };
  }, []);

  return logoUrl || DEFAULT_OFFICIAL_LOGO;
}
