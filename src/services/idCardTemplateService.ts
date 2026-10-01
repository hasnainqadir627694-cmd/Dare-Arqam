/**
 * Dynamic Student ID Card Template Service
 * Manages ID Card template definitions, field mapping coordinates,
 * Firebase Storage image uploads, and Firestore real-time synchronization.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { IdCardTemplate, TemplateFieldConfig } from '../types';
import { uploadToCloudinary } from './cloudinaryService';

const TEMPLATES_COLLECTION = 'idCardTemplates';
const ACTIVE_TEMPLATE_CACHE_KEY = 'dare_arqam_active_id_template';
const ALL_TEMPLATES_CACHE_KEY = 'dare_arqam_all_id_templates';

// Institutional Default Vertical Blank ID Card Template SVG (Back Side)
// Dimensions: 600 x 960 (Aspect ratio 0.625)
export const DEFAULT_BACK_TEMPLATE_SVG_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 960" width="600" height="960">
  <defs>
    <linearGradient id="backBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F1426"/>
      <stop offset="50%" stop-color="#141B34"/>
      <stop offset="100%" stop-color="#0A0D18"/>
    </linearGradient>
    <linearGradient id="goldBarBack" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF000"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
    <pattern id="backGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#FFF000" stroke-width="0.3" stroke-opacity="0.06"/>
    </pattern>
  </defs>

  <!-- Card Background -->
  <rect width="600" height="960" rx="32" fill="url(#backBg)"/>
  <rect width="600" height="960" rx="32" fill="url(#backGrid)"/>

  <!-- Outer Borders -->
  <rect x="3" y="3" width="594" height="954" rx="30" fill="none" stroke="#20216B" stroke-width="6"/>
  <rect x="10" y="10" width="580" height="940" rx="24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-opacity="0.7"/>

  <!-- Top Decorative Gold Accent Line -->
  <rect x="6" y="24" width="588" height="4" fill="url(#goldBarBack)"/>

  <!-- Header Section -->
  <text x="300" y="70" font-family="'Cinzel', 'Times New Roman', serif" font-weight="900" font-size="24" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">DAR - E - ARQAM SCHOOL</text>
  <text x="300" y="95" font-family="monospace" font-weight="700" font-size="12" fill="#FFF000" text-anchor="middle" letter-spacing="3">KATLANG CAMPUS · DIRECTORATE</text>
  <text x="300" y="118" font-family="sans-serif" font-weight="600" font-size="10" fill="#94A3B8" text-anchor="middle" letter-spacing="2">PERMANENT DIGITAL IDENTITY CARD · BACK SIDE</text>
  
  <line x1="60" y1="135" x2="540" y2="135" stroke="#263352" stroke-width="1.5"/>

  <!-- Instructions & Guidelines Section -->
  <rect x="40" y="620" width="520" height="190" rx="16" fill="#141B32" stroke="#263352" stroke-width="1.5"/>
  <text x="60" y="650" font-family="monospace" font-weight="700" font-size="11" fill="#FFF000" letter-spacing="1">INSTITUTIONAL TERMS & CONDITIONS:</text>
  
  <text x="60" y="680" font-family="sans-serif" font-size="10.5" fill="#E2E8F0">1. This card is non-transferable and remains property of Dar-e-Arqam.</text>
  <text x="60" y="705" font-family="sans-serif" font-size="10.5" fill="#E2E8F0">2. Present this card for campus entry, library, examinations & attendance.</text>
  <text x="60" y="730" font-family="sans-serif" font-size="10.5" fill="#E2E8F0">3. In case of loss, report immediately to the Directorate Office.</text>
  <text x="60" y="755" font-family="sans-serif" font-size="10.5" fill="#E2E8F0">4. Misuse or tampering with this identity card is strictly prohibited.</text>
  <text x="60" y="785" font-family="monospace" font-weight="700" font-size="10" fill="#38BDF8">HELPLINE: +92 345 8899221 · EMAIL: darearqamkatlang@gmail.com</text>

  <!-- Bottom Authority Bar -->
  <rect x="6" y="850" width="588" height="4" fill="url(#goldBarBack)"/>
  <text x="300" y="890" font-family="'Times New Roman', serif" font-weight="800" font-size="13" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">AUTHENTICATED DIGITAL QR VERIFICATION SYSTEM</text>
  <text x="300" y="915" font-family="monospace" font-weight="700" font-size="10" fill="#FFF000" text-anchor="middle" letter-spacing="3">ACADEMIC SESSION 2026–2027 · ALL RIGHTS RESERVED</text>
</svg>
`)}`;

// Institutional Default Vertical Blank ID Card Template SVG
// Dimensions: 600 x 960 (Aspect ratio 0.625, standard vertical card)
export const DEFAULT_TEMPLATE_SVG_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 960" width="600" height="960">
  <defs>
    <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141544"/>
      <stop offset="50%" stop-color="#20216B"/>
      <stop offset="100%" stop-color="#2A2C85"/>
    </linearGradient>
    <linearGradient id="goldBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#FFF000"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="70%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#EEF2F6"/>
    </linearGradient>
    <pattern id="microGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#20216B" stroke-width="0.3" stroke-opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Card Background -->
  <rect width="600" height="960" rx="32" fill="url(#cardBg)"/>
  <rect width="600" height="960" rx="32" fill="url(#microGrid)"/>
  
  <!-- Outer Border -->
  <rect x="3" y="3" width="594" height="954" rx="30" fill="none" stroke="#20216B" stroke-width="6"/>
  <rect x="10" y="10" width="580" height="940" rx="24" fill="none" stroke="#D4AF37" stroke-width="2" stroke-opacity="0.6"/>

  <!-- Top Institutional Header -->
  <path d="M 6 32 C 6 18 18 6 32 6 L 568 6 C 582 6 594 18 594 32 L 594 190 L 6 190 Z" fill="url(#headerGrad)"/>
  <rect x="6" y="190" width="588" height="8" fill="url(#goldBar)"/>

  <!-- School Crest Motif in Header -->
  <circle cx="85" cy="98" r="48" fill="#FFFFFF" stroke="#FFF000" stroke-width="4"/>
  <circle cx="85" cy="98" r="40" fill="#20216B"/>
  <text x="85" y="93" font-family="'Times New Roman', serif" font-weight="900" font-size="22" fill="#FFF000" text-anchor="middle">DA</text>
  <text x="85" y="112" font-family="sans-serif" font-weight="700" font-size="9" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">1998</text>

  <!-- School Header Typography -->
  <text x="150" y="75" font-family="'Cinzel', 'Times New Roman', serif" font-weight="900" font-size="28" fill="#FFFFFF" letter-spacing="1.5">DAR - E - ARQAM</text>
  <text x="150" y="105" font-family="'Cinzel', 'Times New Roman', serif" font-weight="800" font-size="19" fill="#FFF000" letter-spacing="2">SCHOOL SYSTEM</text>
  <text x="150" y="132" font-family="monospace" font-weight="700" font-size="12" fill="#E2E8F0" letter-spacing="3">KATLANG CAMPUS · OFFICIAL ID</text>
  <text x="150" y="156" font-family="sans-serif" font-weight="600" font-size="10" fill="#94A3B8" letter-spacing="1.5">ACADEMIC DIRECTORATE REGISTRATION</text>

  <!-- Photo Box Frame Backdrop Placeholder -->
  <rect x="190" y="230" width="220" height="250" rx="18" fill="#E2E8F0" stroke="#20216B" stroke-width="4"/>
  <rect x="194" y="234" width="212" height="242" rx="14" fill="none" stroke="#D4AF37" stroke-width="1.5"/>

  <!-- Watermark in card center -->
  <circle cx="300" cy="620" r="180" fill="none" stroke="#20216B" stroke-width="1" stroke-opacity="0.05"/>
  <circle cx="300" cy="620" r="140" fill="none" stroke="#20216B" stroke-width="0.8" stroke-opacity="0.04"/>

  <!-- Subtle Field Label Guidelines for Blank Card Look -->
  <line x1="80" y1="580" x2="520" y2="580" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="80" y1="670" x2="520" y2="670" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="80" y1="765" x2="280" y2="765" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="320" y1="765" x2="520" y2="765" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- Bottom Authority Band -->
  <rect x="6" y="850" width="588" height="6" fill="url(#goldBar)"/>
  <path d="M 6 856 L 594 856 L 594 928 C 594 942 582 954 568 954 L 32 954 C 18 954 6 942 6 928 Z" fill="#141544"/>
  
  <text x="300" y="888" font-family="'Times New Roman', serif" font-weight="800" font-size="14" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">ISSUED BY DARE ARQAM KATLANG CAMPUS</text>
  <text x="300" y="910" font-family="monospace" font-weight="700" font-size="10" fill="#FFF000" text-anchor="middle" letter-spacing="3">ACADEMIC SESSION 2026–2027 · VALID STUDENT ID</text>
  <text x="300" y="932" font-family="sans-serif" font-weight="600" font-size="9" fill="#94A3B8" text-anchor="middle">IF FOUND PLEASE RETURN TO INSTITUTION CAMPUS</text>
</svg>
`)}`;

/**
 * Default Template Configuration:
 * Coordinates are expressed as percentages (0 to 100%) so that the card
 * scales seamlessly to any screen size (mobile, tablet, desktop, or print).
 */
/**
 * Formats a class string according to the template setting.
 * When 'number-only' is selected, strips 'Class ' prefix (e.g. 'Class 6' -> '6').
 */
export function formatClassValue(className?: string, format?: 'number-only' | 'full-name'): string {
  if (!className) return '—';
  if (format === 'number-only') {
    return className.replace(/^(Class|Grade)[\s-]*/i, '').trim() || className;
  }
  return className;
}

/**
 * Dynamically computes a font size so that the given text always fits inside
 * the bounding width percentage of the card without hiding characters or showing ellipsis ('...').
 */
export function calculateAutoFitFontSize(
  text: string,
  widthPercent: number,
  configuredFontSize: number,
  cardBaseWidthPx = 360
): number {
  if (!text || text.length === 0) return configuredFontSize;
  const availableWidthPx = Math.max(20, (cardBaseWidthPx * widthPercent) / 100 - 6);
  // Average glyph ratio in proportional fonts is roughly 0.54 * fontSize
  const maxFitting = Math.floor(availableWidthPx / (text.length * 0.54));
  return Math.max(7, Math.min(configuredFontSize, maxFitting));
}

export const DEFAULT_TEMPLATE: IdCardTemplate = {
  id: 'default-institutional-template',
  name: 'DARE ARQAM Institutional Portrait Card',
  templateUrl: DEFAULT_TEMPLATE_SVG_DATA_URL,
  frontTemplateUrl: DEFAULT_TEMPLATE_SVG_DATA_URL,
  backTemplateUrl: DEFAULT_BACK_TEMPLATE_SVG_DATA_URL,
  aspectRatio: 600 / 960, // 0.625
  originalWidth: 600,
  originalHeight: 960,
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
  fields: {
    profilePicture: {
      x: 32.5, // (600 - 210) / 2 / 600 * 100%
      y: 24.2, // 232 / 960 * 100%
      width: 35.0, // 210 / 600 * 100%
      height: 25.5, // 245 / 960 * 100%
      fontSize: 12,
      fontWeight: 'bold',
      color: '#20216B',
      textAlign: 'center',
      shape: 'rounded',
      borderRadius: 14,
      borderColor: '#20216B',
      borderWidth: 3,
      visible: true,
    },
    name: {
      x: 8.0,
      y: 52.0,
      width: 84.0,
      height: 6.5,
      fontSize: 22,
      fontWeight: 'extrabold',
      color: '#0F1035',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      visible: true,
    },
    fatherName: {
      x: 8.0,
      y: 60.5,
      width: 84.0,
      height: 5.5,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#334155',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Father Name',
      visible: true,
    },
    className: {
      x: 10.0,
      y: 70.0,
      width: 38.0,
      height: 7.0,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#20216B',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Class',
      classDisplayFormat: 'number-only',
      visible: true,
    },
    rollNumber: {
      x: 52.0,
      y: 70.0,
      width: 38.0,
      height: 7.0,
      fontSize: 18,
      fontWeight: 'extrabold',
      color: '#171852',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Roll Number',
      visible: true,
    },
  },
  frontFields: {
    profilePicture: {
      x: 32.5,
      y: 24.2,
      width: 35.0,
      height: 25.5,
      fontSize: 12,
      fontWeight: 'bold',
      color: '#20216B',
      textAlign: 'center',
      shape: 'rounded',
      borderRadius: 14,
      borderColor: '#20216B',
      borderWidth: 3,
      visible: true,
    },
    name: {
      x: 8.0,
      y: 52.0,
      width: 84.0,
      height: 6.5,
      fontSize: 22,
      fontWeight: 'extrabold',
      color: '#0F1035',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      visible: true,
    },
    fatherName: {
      x: 8.0,
      y: 60.5,
      width: 84.0,
      height: 5.5,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#334155',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Father Name',
      visible: true,
    },
    className: {
      x: 10.0,
      y: 70.0,
      width: 38.0,
      height: 7.0,
      fontSize: 18,
      fontWeight: 'bold',
      color: '#20216B',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Class',
      classDisplayFormat: 'number-only',
      visible: true,
    },
    rollNumber: {
      x: 52.0,
      y: 70.0,
      width: 38.0,
      height: 7.0,
      fontSize: 18,
      fontWeight: 'extrabold',
      color: '#171852',
      textAlign: 'center',
      prefix: '',
      showLabel: false,
      label: 'Roll Number',
      visible: true,
    },
  },
  backFields: {
    qrCode: {
      x: 22.5,
      y: 25.0,
      width: 55.0,
      height: 34.375,
      quietZone: 8,
      borderRadius: 16,
      borderColor: '#D4AF37',
      borderWidth: 2,
      showLabel: true,
      label: 'SCAN TO VERIFY STUDENT',
      visible: true,
    },
  },
};



/**
 * Normalizes any template document from Firestore or Cache to ensure full dual-sided fields exist.
 */
export function normalizeTemplate(t: Partial<IdCardTemplate>): IdCardTemplate {
  const frontUrl = t.frontTemplateUrl || t.templateUrl || DEFAULT_TEMPLATE_SVG_DATA_URL;
  const backUrl = t.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL;
  const aspect = t.aspectRatio && t.aspectRatio > 0 ? t.aspectRatio : 600 / 960;

  const defaultFields = DEFAULT_TEMPLATE.fields;
  const sourceFields = t.frontFields || t.fields || defaultFields;
  const sourceQr = t.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;

  return {
    id: t.id || `tpl_${Date.now()}`,
    name: t.name || 'Custom ID Card Template',
    templateUrl: frontUrl,
    frontTemplateUrl: frontUrl,
    backTemplateUrl: backUrl,
    storagePath: t.storagePath,
    backStoragePath: t.backStoragePath,
    aspectRatio: aspect,
    originalWidth: t.originalWidth || 600,
    originalHeight: t.originalHeight || 960,
    isActive: !!t.isActive,
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    fields: {
      profilePicture: { ...defaultFields.profilePicture, ...(sourceFields.profilePicture || {}) },
      name: { ...defaultFields.name, ...(sourceFields.name || {}) },
      fatherName: { ...defaultFields.fatherName, ...(sourceFields.fatherName || {}) },
      className: { ...defaultFields.className, ...(sourceFields.className || {}) },
      rollNumber: { ...defaultFields.rollNumber, ...(sourceFields.rollNumber || {}) },
    },
    frontFields: {
      profilePicture: { ...defaultFields.profilePicture, ...(sourceFields.profilePicture || {}) },
      name: { ...defaultFields.name, ...(sourceFields.name || {}) },
      fatherName: { ...defaultFields.fatherName, ...(sourceFields.fatherName || {}) },
      className: { ...defaultFields.className, ...(sourceFields.className || {}) },
      rollNumber: { ...defaultFields.rollNumber, ...(sourceFields.rollNumber || {}) },
    },
    backFields: {
      qrCode: {
        x: sourceQr.x ?? 22.5,
        y: sourceQr.y ?? 25.0,
        width: sourceQr.width ?? 55.0,
        height: sourceQr.height ?? 34.375,
        quietZone: sourceQr.quietZone ?? 8,
        borderRadius: sourceQr.borderRadius ?? 16,
        borderColor: sourceQr.borderColor ?? '#D4AF37',
        borderWidth: sourceQr.borderWidth ?? 2,
        showLabel: sourceQr.showLabel ?? true,
        label: sourceQr.label ?? 'SCAN TO VERIFY STUDENT',
        visible: sourceQr.visible ?? true,
      },
    },
  };
}

/**
 * Retrieves the currently active ID Card Template from Firestore.
 * Falls back to localStorage and finally to DEFAULT_TEMPLATE.
 */
export async function getActiveTemplate(): Promise<IdCardTemplate> {
  try {
    const q = query(collection(db, TEMPLATES_COLLECTION), where('isActive', '==', true));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const docData = snap.docs[0].data() as IdCardTemplate;
      const active = normalizeTemplate({ ...docData, id: snap.docs[0].id });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
        } catch {}
      }
      return active;
    }
  } catch (err) {
    console.debug('Firestore getActiveTemplate notice:', err);
  }

  // Fallback to local storage
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(ACTIVE_TEMPLATE_CACHE_KEY);
      if (cached) {
        return normalizeTemplate(JSON.parse(cached));
      }
    } catch {}
  }

  return DEFAULT_TEMPLATE;
}

/**
 * Synchronously retrieves the cached active template from localStorage,
 * eliminating any layout shift or flashing during initial render.
 */
export function getCachedActiveTemplateSync(): IdCardTemplate {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(ACTIVE_TEMPLATE_CACHE_KEY);
      if (cached) {
        return normalizeTemplate(JSON.parse(cached));
      }
    } catch {}
  }
  return DEFAULT_TEMPLATE;
}

/**
 * Subscribes to real-time changes of the active template.
 */
export function subscribeActiveTemplate(callback: (template: IdCardTemplate) => void): () => void {
  // Fire immediate callback with cached/default
  getActiveTemplate().then(callback);

  try {
    const q = query(collection(db, TEMPLATES_COLLECTION), where('isActive', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const docData = snap.docs[0].data() as IdCardTemplate;
          const active = normalizeTemplate({ ...docData, id: snap.docs[0].id });
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
            } catch {}
          }
          callback(active);
        } else {
          callback(DEFAULT_TEMPLATE);
        }
      },
      (err) => {
        console.debug('subscribeActiveTemplate error:', err);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Fetches all templates from Firestore.
 */
export async function getAllTemplates(): Promise<IdCardTemplate[]> {
  try {
    const snap = await getDocs(collection(db, TEMPLATES_COLLECTION));
    if (!snap.empty) {
      const templates: IdCardTemplate[] = [];
      snap.forEach((d) => {
        templates.push(normalizeTemplate({ ...(d.data() as IdCardTemplate), id: d.id }));
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(templates));
        } catch {}
      }
      return templates;
    }
  } catch (err) {
    console.debug('getAllTemplates fallback:', err);
  }

  // Fallback to local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(ALL_TEMPLATES_CACHE_KEY);
      if (cached) {
        const parsed: IdCardTemplate[] = JSON.parse(cached);
        return parsed.map(normalizeTemplate);
      }
    } catch {}
  }

  return [DEFAULT_TEMPLATE];
}

/**
 * Saves a template to Firestore. If marked active, it deactivates any existing templates.
 */
export async function saveTemplate(template: IdCardTemplate, publish = false): Promise<string> {
  const templateId = template.id || `tpl_${Date.now()}`;
  const now = new Date().toISOString();

  const normalized = normalizeTemplate(template);
  const finalTemplate: IdCardTemplate = {
    ...template,
    ...normalized,
    id: templateId,
    isActive: publish ? true : !!template.isActive,
    updatedAt: now,
    createdAt: template.createdAt || now,
    frontFields: template.frontFields || template.fields || normalized.frontFields,
    backFields: template.backFields || normalized.backFields,
  };

  try {
    // If publishing as active, mark other templates as inactive
    if (finalTemplate.isActive) {
      const allExisting = await getDocs(collection(db, TEMPLATES_COLLECTION));
      const deactivationPromises = allExisting.docs.map(async (docSnap) => {
        if (docSnap.id !== templateId && docSnap.data().isActive) {
          return updateDoc(doc(db, TEMPLATES_COLLECTION, docSnap.id), {
            isActive: false,
            updatedAt: now,
          });
        }
      });
      await Promise.all(deactivationPromises);
    }

    await setDoc(doc(db, TEMPLATES_COLLECTION, templateId), finalTemplate);
  } catch (err) {
    console.warn('Firestore saveTemplate notice, caching locally:', err);
  }

  // Cache locally
  if (typeof window !== 'undefined') {
    try {
      if (finalTemplate.isActive) {
        localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(finalTemplate));
      }
      const existingAll = localStorage.getItem(ALL_TEMPLATES_CACHE_KEY);
      let list: IdCardTemplate[] = existingAll ? JSON.parse(existingAll).map(normalizeTemplate) : [DEFAULT_TEMPLATE];
      if (finalTemplate.isActive) {
        list = list.map((t) => ({ ...t, isActive: false }));
      }
      const idx = list.findIndex((t) => t.id === templateId);
      if (idx >= 0) {
        list[idx] = finalTemplate;
      } else {
        list.push(finalTemplate);
      }
      localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(list));
    } catch {}
  }

  return templateId;
}

/**
 * Sets a template as the single active template.
 */
export async function publishTemplate(templateId: string): Promise<void> {
  const now = new Date().toISOString();
  try {
    const all = await getDocs(collection(db, TEMPLATES_COLLECTION));
    const updates = all.docs.map(async (d) => {
      const shouldBeActive = d.id === templateId;
      return updateDoc(doc(db, TEMPLATES_COLLECTION, d.id), {
        isActive: shouldBeActive,
        updatedAt: now,
      });
    });
    await Promise.all(updates);
  } catch (err) {
    console.warn('publishTemplate fallback:', err);
  }

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      const existingAll = localStorage.getItem(ALL_TEMPLATES_CACHE_KEY);
      if (existingAll) {
        const list: IdCardTemplate[] = JSON.parse(existingAll);
        const updated = list.map((t) => ({
          ...t,
          isActive: t.id === templateId,
          updatedAt: now,
        }));
        localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(updated));
        const active = updated.find((t) => t.id === templateId);
        if (active) {
          localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
        }
      }
    } catch {}
  }
}

/**
 * Deletes a template from Firestore and local cache.
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  if (templateId === DEFAULT_TEMPLATE.id) {
    throw new Error('The default system template cannot be deleted.');
  }

  try {
    await deleteDoc(doc(db, TEMPLATES_COLLECTION, templateId));
  } catch (err) {
    console.warn('deleteTemplate notice:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      const existingAll = localStorage.getItem(ALL_TEMPLATES_CACHE_KEY);
      if (existingAll) {
        const list: IdCardTemplate[] = JSON.parse(existingAll);
        const filtered = list.filter((t) => t.id !== templateId);
        localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(filtered));
      }
      const activeCached = localStorage.getItem(ACTIVE_TEMPLATE_CACHE_KEY);
      if (activeCached) {
        const currentActive = JSON.parse(activeCached);
        if (currentActive.id === templateId) {
          localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(DEFAULT_TEMPLATE));
        }
      }
    } catch {}
  }
}

/**
 * Uploads a blank ID Card template image:
 * 1. Measures native dimensions & aspect ratio.
 * 2. Uploads to Firebase Storage with Cloudinary & Data URL fallbacks.
 * 3. Returns download URL, natural dimensions, and aspect ratio.
 */
export async function uploadTemplateImage(
  file: File,
  onProgress?: (stage: 'processing' | 'uploading' | 'completed') => void
): Promise<{ url: string; width: number; height: number; aspectRatio: number }> {
  if (!file) throw new Error('No template image file provided.');

  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a valid image file (JPG, PNG, or WebP).');
  }

  if (onProgress) onProgress('processing');

  // 1. Load image to detect native dimensions and aspect ratio
  const { width, height, aspectRatio } = await new Promise<{ width: number; height: number; aspectRatio: number }>(
    (resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const w = img.naturalWidth || img.width || 600;
        const h = img.naturalHeight || img.height || 960;
        resolve({
          width: w,
          height: h,
          aspectRatio: w / h,
        });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to read image dimensions.'));
      };
      img.src = objectUrl;
    }
  );

  if (onProgress) onProgress('uploading');

  let downloadUrl = '';

  // 2. Try Firebase Storage with 10s timeout
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageRef = ref(storage, `idCardTemplates/template_${Date.now()}_${cleanFileName}`);
    const uploadTask = (async () => {
      const res = await uploadBytes(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000, immutable',
      });
      return await getDownloadURL(res.ref);
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage upload timed out after 10s')), 10000);
    });

    downloadUrl = await Promise.race([uploadTask, timeoutPromise]);
  } catch (storageErr) {
    console.warn('Firebase Storage upload timed out or failed, trying Cloudinary CDN:', storageErr);
    // 3. Fallback to Cloudinary CDN
    try {
      const cloudRes = await uploadToCloudinary(file, {
        folder: 'dare_arqam_id_templates',
        resourceType: 'image',
        timeoutMs: 15000,
      });
      if (cloudRes.success && cloudRes.url) {
        downloadUrl = cloudRes.url;
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload fallback failed:', cloudErr);
    }
  }

  // 4. Ultimate fallback to Data URL to ensure the administrator is NEVER stuck on "Processing..."
  if (!downloadUrl) {
    downloadUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  if (onProgress) onProgress('completed');

  return {
    url: downloadUrl,
    width,
    height,
    aspectRatio,
  };
}
