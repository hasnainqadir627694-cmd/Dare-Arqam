/**
 * DARE ARQAM Central Cloudinary Media & Firestore Persistence System
 * Single Source of Truth:
 * - Actual image and media assets stored in Cloudinary CDN
 * - Metadata and references stored in Firestore (`media/{mediaId}`)
 * - Real-time synchronization across all devices (Desktop, Mobile, Student Portal, Admin Panel)
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  uploadImageToCloudinary, 
  deleteFromCloudinary,
  MediaCategory,
  CloudinaryUploadResult
} from './cloudinaryService';

export type MediaType = 
  | 'image' 
  | 'video' 
  | 'document' 
  | 'template' 
  | 'logo' 
  | 'banner' 
  | 'portrait';

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  category: MediaCategory;
  cloudinaryURL: string;
  cloudinaryPublicId?: string;
  downloadURL: string; // compatibility alias for cloudinaryURL
  storagePath?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  sortOrder: number;
  metadata?: {
    width?: number;
    height?: number;
    aspectRatio?: number;
    fileSizeBytes?: number;
    mimeType?: string;
    caption?: string;
    targetClass?: string;
    section?: string;
    [key: string]: any;
  };
}

export interface UploadMediaOptions {
  name: string;
  category: MediaCategory;
  type?: MediaType;
  uploadedBy?: string;
  isActive?: boolean;
  sortOrder?: number;
  caption?: string;
  customMetadata?: Record<string, any>;
  onProgress?: (progressPercent: number) => void;
}

/**
 * 1. UPLOAD GLOBAL MEDIA TO CLOUDINARY
 * Pure cloud flow: Validates -> Uploads directly to Cloudinary -> Saves Firestore Document in `media/{mediaId}`
 */
export async function uploadGlobalMedia(
  source: File | Blob | string,
  options: UploadMediaOptions
): Promise<MediaItem> {
  const mediaId = `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Upload directly to Cloudinary
  const cloudRes: CloudinaryUploadResult = await uploadImageToCloudinary(
    source,
    options.category,
    {
      onProgress: options.onProgress,
      customFolder: `dare_arqam_${options.category}`,
    }
  );

  if (!cloudRes.success || !cloudRes.url) {
    throw new Error(cloudRes.error || 'Failed to upload asset to Cloudinary CDN.');
  }

  const now = new Date().toISOString();
  const width = cloudRes.width || 1200;
  const height = cloudRes.height || 800;
  const aspectRatio = Number((width / height).toFixed(4));

  // 2. Create authoritative Media Record
  const mediaItem: MediaItem = {
    id: mediaId,
    name: options.name || `${options.category}_${Date.now()}`,
    type: options.type || 'image',
    category: options.category,
    cloudinaryURL: cloudRes.url,
    cloudinaryPublicId: cloudRes.publicId,
    downloadURL: cloudRes.url,
    uploadedBy: options.uploadedBy || 'admin',
    createdAt: now,
    updatedAt: now,
    isActive: options.isActive !== undefined ? options.isActive : true,
    sortOrder: options.sortOrder || 0,
    metadata: {
      width,
      height,
      aspectRatio,
      fileSizeBytes: cloudRes.bytes,
      mimeType: cloudRes.format ? `image/${cloudRes.format}` : 'image/jpeg',
      caption: options.caption,
      ...options.customMetadata,
    },
  };

  // 3. Save metadata record to Firestore: collection 'media' doc '{mediaId}'
  try {
    await setDoc(doc(db, 'media', mediaId), mediaItem);
  } catch (firestoreErr: any) {
    console.error('Firestore media write error:', firestoreErr);
    // Cleanup Cloudinary file to avoid orphaned storage objects
    if (cloudRes.publicId) {
      try {
        await deleteFromCloudinary(cloudRes.publicId);
      } catch {}
    }
    throw new Error(`Cloud metadata save failed: ${firestoreErr?.message || 'Firestore write error'}`);
  }

  // 4. If this is a branding asset (logo, banner, principal photo), sync to central branding document
  if (options.category === 'logo') {
    await setDoc(doc(db, 'pages', 'branding_settings'), {
      logoUrl: cloudRes.url,
      logoPublicId: cloudRes.publicId,
      updatedAt: now,
    }, { merge: true });
    await setDoc(doc(db, 'settings', 'branding'), {
      logoUrl: cloudRes.url,
      updatedAt: now,
    }, { merge: true });
  } else if (options.category === 'banner') {
    await setDoc(doc(db, 'pages', 'branding_settings'), {
      bannerUrl: cloudRes.url,
      bannerPublicId: cloudRes.publicId,
      updatedAt: now,
    }, { merge: true });
  } else if (options.category === 'principal') {
    await setDoc(doc(db, 'pages', 'branding_settings'), {
      principalPhotoUrl: cloudRes.url,
      principalPhotoPublicId: cloudRes.publicId,
      updatedAt: now,
    }, { merge: true });
  }

  return mediaItem;
}

/**
 * 2. DELETE GLOBAL MEDIA FROM CLOUDINARY & FIRESTORE
 */
export async function deleteGlobalMedia(mediaId: string): Promise<boolean> {
  if (!mediaId) return false;

  try {
    const docRef = doc(db, 'media', mediaId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as MediaItem;
      // 1. Delete from Cloudinary if publicId exists
      if (data.cloudinaryPublicId) {
        try {
          await deleteFromCloudinary(data.cloudinaryPublicId);
        } catch (cloudErr) {
          console.debug('Cloudinary file deletion notice:', cloudErr);
        }
      }
      // 2. Delete Firestore doc
      await deleteDoc(docRef);
      return true;
    }
    return false;
  } catch (err) {
    console.error('deleteGlobalMedia error:', err);
    throw err;
  }
}

/**
 * 3. REALTIME SUBSCRIPTION FOR GLOBAL MEDIA
 */
export function subscribeGlobalMedia(
  category: MediaCategory | 'all',
  callback: (items: MediaItem[]) => void
): () => void {
  try {
    let q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));

    if (category !== 'all') {
      q = query(
        collection(db, 'media'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: MediaItem[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as MediaItem);
        });
        callback(items);
      },
      (error) => {
        console.warn('subscribeGlobalMedia listener error:', error);
        fetchGlobalMedia(category).then(callback);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.debug('Failed to establish subscribeGlobalMedia realtime listener:', err);
    fetchGlobalMedia(category).then(callback);
    return () => {};
  }
}

/**
 * 4. FETCH GLOBAL MEDIA FROM FIRESTORE
 */
export async function fetchGlobalMedia(
  category: MediaCategory | 'all' = 'all'
): Promise<MediaItem[]> {
  try {
    let q = query(collection(db, 'media'), orderBy('createdAt', 'desc'));

    if (category !== 'all') {
      q = query(
        collection(db, 'media'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const items: MediaItem[] = [];
    snapshot.forEach((d) => {
      items.push(d.data() as MediaItem);
    });
    return items;
  } catch (err) {
    console.warn('fetchGlobalMedia error:', err);
    return [];
  }
}

/**
 * 5. SET MEDIA ACTIVE / INACTIVE STATUS
 */
export async function setMediaActiveStatus(
  mediaId: string,
  isActive: boolean
): Promise<void> {
  await setDoc(
    doc(db, 'media', mediaId),
    {
      isActive,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * 6. REORDER MEDIA ITEMS
 */
export async function reorderMediaItems(
  orderedItems: { id: string; sortOrder: number }[]
): Promise<void> {
  const promises = orderedItems.map((item) =>
    setDoc(
      doc(db, 'media', item.id),
      {
        sortOrder: item.sortOrder,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )
  );
  await Promise.all(promises);
}
