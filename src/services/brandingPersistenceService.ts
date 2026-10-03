/**
 * DARE ARQAM Central Branding Persistence Service
 * Single Source of Truth for Branding Assets:
 * - Logo and brand imagery stored permanently in Cloudinary CDN
 * - Metadata and URL references stored in Firestore (pages/branding_settings)
 * - Browser identity tags (favicon, apple-touch-icon, OpenGraph) updated dynamically
 */

import { fetchSingleAppState, saveSingleAppState } from './firebaseService';
import { uploadImageToCloudinary } from './cloudinaryService';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const LOCAL_STORAGE_LOGO_KEY = 'dare_arqam_custom_logo';
export const DEFAULT_OFFICIAL_LOGO = '/branding/logo.png';

/**
 * Updates favicon, apple-touch-icon, and OpenGraph images in the browser DOM dynamically.
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

    // 4. Twitter Image
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
 * Saves the official institutional logo permanently across:
 * 1. Cloudinary CDN (dare_arqam_logo)
 * 2. Firestore Single App State (pages/branding_settings & settings/single_app_state)
 * 3. Browser DOM Identity (Favicon, Apple-Touch-Icon, Tab icon)
 */
export async function saveOfficialBrandingLogo(
  imageSource: string | Blob | File
): Promise<{ success: boolean; url: string; publicId?: string; error?: string }> {
  try {
    let permanentUrl = DEFAULT_OFFICIAL_LOGO;
    let publicId = '';

    // Step 1: Upload directly to Cloudinary CDN
    const cloudRes = await uploadImageToCloudinary(imageSource, 'logo', {
      customFolder: 'dare_arqam_logo',
    });
    if (!cloudRes.success || !cloudRes.url) {
      throw new Error(cloudRes.error || 'Failed to upload logo to Cloudinary CDN');
    }
    permanentUrl = cloudRes.url;
    publicId = cloudRes.publicId || '';

    // Step 2: Also notify backend /api/branding/logo to update local server icons if possible
    try {
      if (typeof imageSource === 'string' && imageSource.startsWith('data:')) {
        let idToken = '';
        try {
          idToken = (await auth.currentUser?.getIdToken()) || '';
        } catch {}

        await fetch('/api/branding/logo', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            logoDataUrl: imageSource,
            imageBase64: imageSource,
            metadata: { publicId, cdnUrl: permanentUrl },
          }),
        }).catch(() => {});
      }
    } catch {}

    const now = new Date().toISOString();

    // Step 3: Save to Firestore (Single Source of Truth)
    await setDoc(
      doc(db, 'pages', 'branding_settings'),
      {
        logoUrl: permanentUrl,
        logoPublicId: publicId,
        updatedAt: now,
      },
      { merge: true }
    );

    await setDoc(
      doc(db, 'settings', 'branding'),
      {
        logoUrl: permanentUrl,
        logoPublicId: publicId,
        updatedAt: now,
      },
      { merge: true }
    );

    const currentState = (await fetchSingleAppState()) || {};
    await saveSingleAppState({
      ...currentState,
      branding: {
        ...(currentState.branding || {}),
        logoUrl: permanentUrl,
      },
    });

    // Step 4: Update Browser Tab & Favicons immediately
    updateBrowserIdentityTags(permanentUrl);

    return { success: true, url: permanentUrl, publicId };
  } catch (err: any) {
    console.error('Failed to permanently save official branding logo:', err);
    return {
      success: false,
      url: DEFAULT_OFFICIAL_LOGO,
      error: err?.message || 'Failed to save logo',
    };
  }
}
