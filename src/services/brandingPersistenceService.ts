import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { fetchSingleAppState, saveSingleAppState } from './firebaseService';

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
 * Converts a Blob or File to a Base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves the official institutional logo permanently across:
 * 1. Project Static Assets (/public/branding/logo.png, favicons, site icons)
 * 2. Firebase Storage (branding/official_logo.png)
 * 3. Firestore Single App State (settings/single_app_state)
 * 4. Browser DOM Identity (Favicon, Apple-Touch-Icon, Tab icon)
 * 5. Local Storage (Instant Zero-Flash Render)
 */
export async function saveOfficialBrandingLogo(
  imageSource: string | Blob | File
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    let base64Data = '';
    let blobData: Blob | null = null;

    if (typeof imageSource === 'string') {
      base64Data = imageSource;
      if (imageSource.startsWith('data:')) {
        const res = await fetch(imageSource);
        blobData = await res.blob();
      }
    } else {
      blobData = imageSource;
      base64Data = await blobToBase64(imageSource);
    }

    let permanentUrl = DEFAULT_OFFICIAL_LOGO;

    // Step 1: Save to project public static assets via Server API
    try {
      const serverRes = await fetch('/api/branding/save-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data }),
      });
      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.localUrl) {
          permanentUrl = data.localUrl;
        }
        if (data.cdnUrl && data.cdnUrl.startsWith('http')) {
          permanentUrl = data.cdnUrl;
        }
      }
    } catch (serverErr) {
      console.warn('Backend static assets write notice:', serverErr);
    }

    // Step 2: Save to Firebase Storage as redundant cloud asset
    if (blobData) {
      try {
        const storageRef = ref(storage, 'branding/official_logo.png');
        const uploadRes = await uploadBytes(storageRef, blobData, {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000, immutable',
        });
        const firestoreStorageUrl = await getDownloadURL(uploadRes.ref);
        if (firestoreStorageUrl) {
          permanentUrl = firestoreStorageUrl;
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload notice (using permanent project asset):', storageErr);
      }
    }

    // If permanentUrl is somehow still a giant base64 string, replace with local static URL
    // so Firestore 1MB document limit is NEVER exceeded
    if (permanentUrl.startsWith('data:')) {
      permanentUrl = `/branding/logo.png?v=${Date.now()}`;
    }

    // Step 3: Save to Firestore Single Document State
    try {
      const currentState = (await fetchSingleAppState()) || {};
      await saveSingleAppState({
        ...currentState,
        branding: {
          ...(currentState.branding || {}),
          logoUrl: permanentUrl,
        },
      });
    } catch (firestoreErr) {
      console.warn('Firestore branding state save notice:', firestoreErr);
    }

    // Step 4: Cache in localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, permanentUrl);
    } catch {}

    // Step 5: Update Browser Tab & Favicons immediately
    updateBrowserIdentityTags(permanentUrl);

    return { success: true, url: permanentUrl };
  } catch (err: any) {
    console.error('Failed to permanently save official branding logo:', err);
    return {
      success: false,
      url: DEFAULT_OFFICIAL_LOGO,
      error: err?.message || 'Failed to save logo',
    };
  }
}
