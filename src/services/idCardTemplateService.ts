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
import { db } from '../lib/firebase';
import { IdCardTemplate, TemplateFieldConfig } from '../types';
import { uploadImageToCloudinary, uploadToCloudinary } from './cloudinaryService';

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
 * Recursively removes keys with `undefined` values from an object
 * to prevent Firestore setDoc/updateDoc errors ("Unsupported field value: undefined").
 */
export function cleanUndefinedForFirestore<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedForFirestore) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = typeof value === 'object' && value !== null ? cleanUndefinedForFirestore(value) : value;
    }
  }
  return cleaned as T;
}

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

  const norm: IdCardTemplate = {
    id: t.id || `tpl_${Date.now()}`,
    name: t.name || 'Custom ID Card Template',
    templateUrl: frontUrl,
    frontTemplateUrl: frontUrl,
    backTemplateUrl: backUrl,
    ...(t.storagePath ? { storagePath: t.storagePath } : {}),
    ...(t.backStoragePath ? { backStoragePath: t.backStoragePath } : {}),
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

  return cleanUndefinedForFirestore(norm);
}

/**
 * Retrieves the currently active ID Card Template from Firestore settings and idCardTemplates collection.
 * Falls back to localStorage and finally to DEFAULT_TEMPLATE.
 */
export async function getActiveTemplate(): Promise<IdCardTemplate> {
  // 1. Try single app config pointer in settings/id_card_config
  try {
    const configSnap = await getDoc(doc(db, 'settings', 'id_card_config'));
    if (configSnap.exists()) {
      const data = configSnap.data();
      if (data?.activeTemplate) {
        const active = normalizeTemplate(data.activeTemplate);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
          } catch {}
        }
        return active;
      }
    }
  } catch (err) {
    console.debug('Firestore id_card_config getActiveTemplate notice:', err);
  }

  // 2. Try collection query where isActive == true
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

  // 3. Fallback to local storage
  return getCachedActiveTemplateSync();
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
 * Synchronously retrieves cached template list from localStorage.
 */
export function getCachedAllTemplatesSync(): IdCardTemplate[] {
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
 * Subscribes to real-time changes of the active template.
 * Monitors both settings/id_card_config and idCardTemplates collection.
 */
export function subscribeActiveTemplate(callback: (template: IdCardTemplate) => void): () => void {
  // Fire immediate callback with cached/default
  callback(getCachedActiveTemplateSync());

  let isUnsubscribed = false;

  // Listener 1: Watch settings/id_card_config for instant single-document resolution
  const unsubConfig = onSnapshot(
    doc(db, 'settings', 'id_card_config'),
    (snap) => {
      if (isUnsubscribed) return;
      if (snap.exists()) {
        const data = snap.data();
        if (data?.activeTemplate) {
          const active = normalizeTemplate(data.activeTemplate);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
            } catch {}
          }
          callback(active);
        }
      }
    },
    (err) => {
      console.debug('id_card_config onSnapshot notice:', err);
    }
  );

  // Listener 2: Watch idCardTemplates collection where isActive == true
  const qActive = query(collection(db, TEMPLATES_COLLECTION), where('isActive', '==', true));
  const unsubCollection = onSnapshot(
    qActive,
    (snap) => {
      if (isUnsubscribed) return;
      if (!snap.empty) {
        const docData = snap.docs[0].data() as IdCardTemplate;
        const active = normalizeTemplate({ ...docData, id: snap.docs[0].id });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(active));
          } catch {}
        }
        callback(active);
      }
    },
    (err) => {
      console.debug('subscribeActiveTemplate error:', err);
    }
  );

  return () => {
    isUnsubscribed = true;
    unsubConfig();
    unsubCollection();
  };
}

/**
 * Helper that strictly enforces EXACTLY ONE active template in any list of templates.
 */
export function resolveSingleActiveInList(list: IdCardTemplate[], activeId?: string): IdCardTemplate[] {
  let targetId = activeId;

  if (!targetId) {
    const activeItem = list.find((t) => t.isActive);
    targetId = activeItem ? activeItem.id : list[0]?.id || DEFAULT_TEMPLATE.id;
  }

  return list.map((t) => ({
    ...t,
    isActive: t.id === targetId,
  }));
}

/**
 * Subscribes to real-time changes of all ID card templates for the Admin Panel.
 */
export function subscribeAllTemplates(callback: (templates: IdCardTemplate[]) => void): () => void {
  let currentActiveId = '';

  // Initial fetch
  getAllTemplates().then(callback);

  try {
    // Listener 1: Watch settings/id_card_config for the active template ID pointer
    const unsubConfig = onSnapshot(
      doc(db, 'settings', 'id_card_config'),
      (cfgSnap) => {
        if (cfgSnap.exists()) {
          const data = cfgSnap.data();
          currentActiveId = data?.activeTemplateId || data?.activeTemplate?.id || '';
          const cachedAll = getCachedAllTemplatesSync();
          if (cachedAll.length > 0 && currentActiveId) {
            callback(resolveSingleActiveInList(cachedAll, currentActiveId));
          }
        }
      },
      (err) => console.debug('id_card_config subscriber notice:', err)
    );

    // Listener 2: Watch idCardTemplates collection
    const unsubCollection = onSnapshot(
      collection(db, TEMPLATES_COLLECTION),
      (snap) => {
        const list: IdCardTemplate[] = [];
        if (!snap.empty) {
          snap.forEach((d) => {
            list.push(normalizeTemplate({ ...(d.data() as IdCardTemplate), id: d.id }));
          });
        }
        if (!list.some((t) => t.id === DEFAULT_TEMPLATE.id)) {
          list.unshift(normalizeTemplate({ ...DEFAULT_TEMPLATE, isActive: false }));
        }

        const resolved = resolveSingleActiveInList(list, currentActiveId);

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(resolved));
          } catch {}
        }
        callback(resolved);
      },
      (err) => {
        console.debug('subscribeAllTemplates onSnapshot notice:', err);
      }
    );

    return () => {
      unsubConfig();
      unsubCollection();
    };
  } catch {
    return () => {};
  }
}

/**
 * Fetches all templates from Firestore.
 */
export async function getAllTemplates(): Promise<IdCardTemplate[]> {
  let activeId = '';
  try {
    const cfgSnap = await getDoc(doc(db, 'settings', 'id_card_config'));
    if (cfgSnap.exists()) {
      const data = cfgSnap.data();
      activeId = data?.activeTemplateId || data?.activeTemplate?.id || '';
    }
  } catch {}

  try {
    const snap = await getDocs(collection(db, TEMPLATES_COLLECTION));
    const templates: IdCardTemplate[] = [];
    if (!snap.empty) {
      snap.forEach((d) => {
        templates.push(normalizeTemplate({ ...(d.data() as IdCardTemplate), id: d.id }));
      });
    }
    if (!templates.some((t) => t.id === DEFAULT_TEMPLATE.id)) {
      templates.unshift(normalizeTemplate({ ...DEFAULT_TEMPLATE, isActive: false }));
    }

    const resolved = resolveSingleActiveInList(templates, activeId);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(resolved));
      } catch {}
    }
    return resolved;
  } catch (err) {
    console.debug('getAllTemplates fallback:', err);
  }

  return resolveSingleActiveInList(getCachedAllTemplatesSync(), activeId);
}

/**
 * Sets a template as the single active template across Firestore and local cache.
 * Accepts either a template ID string or a full IdCardTemplate object.
 */
export async function publishTemplate(target: string | IdCardTemplate): Promise<void> {
  const now = new Date().toISOString();
  let templateId: string;
  let targetTemplate: IdCardTemplate | null = null;

  if (typeof target === 'object' && target !== null) {
    templateId = target.id || `tpl_${Date.now()}`;
    targetTemplate = normalizeTemplate({ ...target, id: templateId, isActive: true, updatedAt: now });
  } else {
    templateId = target;
  }

  const allExistingMap = new Map<string, IdCardTemplate>();

  try {
    const snap = await getDocs(collection(db, TEMPLATES_COLLECTION));
    snap.forEach((d) => {
      const norm = normalizeTemplate({ ...(d.data() as IdCardTemplate), id: d.id });
      allExistingMap.set(d.id, norm);
      if (!targetTemplate && d.id === templateId) {
        targetTemplate = norm;
      }
    });
  } catch (err) {
    console.debug('publishTemplate read notice:', err);
  }

  if (!targetTemplate && templateId === DEFAULT_TEMPLATE.id) {
    targetTemplate = normalizeTemplate(DEFAULT_TEMPLATE);
  } else if (!targetTemplate) {
    const cachedAll = getCachedAllTemplatesSync();
    targetTemplate = cachedAll.find((t) => t.id === templateId) || DEFAULT_TEMPLATE;
  }

  const activeNormalized = cleanUndefinedForFirestore(
    normalizeTemplate({
      ...targetTemplate,
      id: templateId,
      isActive: true,
      updatedAt: now,
    })
  );

  // 1. Save target active template to Firestore idCardTemplates
  await setDoc(doc(db, TEMPLATES_COLLECTION, templateId), activeNormalized, { merge: true });

  // 2. Mark all other existing template documents as inactive
  const deactivations: Promise<void>[] = [];
  allExistingMap.forEach((_, id) => {
    if (id !== templateId) {
      deactivations.push(
        updateDoc(doc(db, TEMPLATES_COLLECTION, id), {
          isActive: false,
          updatedAt: now,
        }).catch((e) => console.debug('Template deactivation notice:', e))
      );
    }
  });
  await Promise.all(deactivations);

  // 3. Save authoritative pointer in settings/id_card_config
  await setDoc(
    doc(db, 'settings', 'id_card_config'),
    {
      activeTemplateId: templateId,
      activeTemplate: activeNormalized,
      updatedAt: now,
    },
    { merge: true }
  );

  // 4. Update local cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(activeNormalized));
      const cachedAll = getCachedAllTemplatesSync();
      const updatedAll = cachedAll.map((t) => ({
        ...t,
        isActive: t.id === templateId,
        updatedAt: t.id === templateId ? now : t.updatedAt,
      }));
      if (!updatedAll.some((t) => t.id === templateId)) {
        updatedAll.push(activeNormalized);
      }
      localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(updatedAll));
    } catch {}
  }
}

/**
 * Saves a template to Firestore. If marked active, it deactivates any existing templates.
 */
export async function saveTemplate(template: IdCardTemplate, publish = false): Promise<string> {
  const templateId = template.id || `tpl_${Date.now()}`;
  const now = new Date().toISOString();

  const normalized = normalizeTemplate({ ...template, id: templateId });
  const finalTemplate: IdCardTemplate = {
    ...normalized,
    id: templateId,
    isActive: publish ? true : !!template.isActive,
    updatedAt: now,
    createdAt: template.createdAt || now,
  };

  // Always write document to idCardTemplates collection first
  const cleaned = cleanUndefinedForFirestore(finalTemplate);
  await setDoc(doc(db, TEMPLATES_COLLECTION, templateId), cleaned, { merge: true });

  if (finalTemplate.isActive) {
    await publishTemplate(finalTemplate);
  }

  // Cache locally
  if (typeof window !== 'undefined') {
    try {
      if (finalTemplate.isActive) {
        localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(finalTemplate));
      }
      const existingAll = getCachedAllTemplatesSync();
      let list = [...existingAll];
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
 * Deletes a template from Firestore and local cache.
 * If the deleted template was active, automatically sets the default institutional template as active fallback.
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  if (templateId === DEFAULT_TEMPLATE.id) {
    throw new Error('The default system template cannot be deleted.');
  }

  let wasActive = false;
  try {
    const docSnap = await getDoc(doc(db, TEMPLATES_COLLECTION, templateId));
    if (docSnap.exists() && docSnap.data()?.isActive) {
      wasActive = true;
    }
  } catch (err: any) {
    console.debug('deleteTemplate active check notice:', err);
  }

  // Also check if settings/id_card_config points to this templateId
  try {
    const cfgSnap = await getDoc(doc(db, 'settings', 'id_card_config'));
    if (cfgSnap.exists()) {
      const activeId = cfgSnap.data()?.activeTemplateId || cfgSnap.data()?.activeTemplate?.id;
      if (activeId === templateId) {
        wasActive = true;
      }
    }
  } catch {}

  // Delete from Firestore idCardTemplates collection
  await deleteDoc(doc(db, TEMPLATES_COLLECTION, templateId));

  // If deleted template was active, fallback active pointer to DEFAULT_TEMPLATE
  if (wasActive) {
    await publishTemplate(DEFAULT_TEMPLATE.id);
  }

  if (typeof window !== 'undefined') {
    try {
      const existingAll = localStorage.getItem(ALL_TEMPLATES_CACHE_KEY);
      if (existingAll) {
        const list: IdCardTemplate[] = JSON.parse(existingAll);
        const filtered = list.filter((t) => t.id !== templateId);
        localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(filtered));
      }
      if (wasActive) {
        localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(DEFAULT_TEMPLATE));
      }
    } catch {}
  }
}

export interface TemplateSaveResult {
  success: boolean;
  templateId: string;
  templateName: string;
  readBackVerified: boolean;
  isActive: boolean;
  updatedAt: string;
  frontUrl: string;
  backUrl: string;
}

/**
 * Saves a template to Firestore with mandatory Read-Back Persistence Verification.
 */
export async function saveTemplateAndVerify(template: IdCardTemplate, publish = false): Promise<TemplateSaveResult> {
  const templateId = template.id || `tpl_${Date.now()}`;
  const now = new Date().toISOString();

  const normalized = normalizeTemplate({ ...template, id: templateId });
  const finalTemplate: IdCardTemplate = {
    ...normalized,
    id: templateId,
    isActive: publish ? true : !!template.isActive,
    updatedAt: now,
    createdAt: template.createdAt || now,
  };

  // 1. Always execute direct Firestore Write first
  const cleaned = cleanUndefinedForFirestore(finalTemplate);
  await setDoc(doc(db, TEMPLATES_COLLECTION, templateId), cleaned, { merge: true });

  // 2. If active, publish to update active pointers and deactivate others
  if (finalTemplate.isActive) {
    await publishTemplate(finalTemplate);
  }

  // 3. Execute Mandatory Read-Back Persistence Verification from Firestore
  const verifySnap = await getDoc(doc(db, TEMPLATES_COLLECTION, templateId));
  if (!verifySnap.exists()) {
    throw new Error(`Firestore persistence verification failed: Document idCardTemplates/${templateId} was not found after write operation.`);
  }

  const savedData = verifySnap.data() as IdCardTemplate;
  const verifiedNorm = normalizeTemplate({ ...savedData, id: verifySnap.id });

  // 3. Update local cache after Firestore read-back succeeds
  if (typeof window !== 'undefined') {
    try {
      if (verifiedNorm.isActive) {
        localStorage.setItem(ACTIVE_TEMPLATE_CACHE_KEY, JSON.stringify(verifiedNorm));
      }
      const existingAll = getCachedAllTemplatesSync();
      let list = [...existingAll];
      if (verifiedNorm.isActive) {
        list = list.map((t) => ({ ...t, isActive: false }));
      }
      const idx = list.findIndex((t) => t.id === templateId);
      if (idx >= 0) {
        list[idx] = verifiedNorm;
      } else {
        list.push(verifiedNorm);
      }
      localStorage.setItem(ALL_TEMPLATES_CACHE_KEY, JSON.stringify(list));
    } catch {}
  }

  return {
    success: true,
    templateId,
    templateName: verifiedNorm.name,
    readBackVerified: true,
    isActive: verifiedNorm.isActive,
    updatedAt: verifiedNorm.updatedAt,
    frontUrl: verifiedNorm.frontTemplateUrl || verifiedNorm.templateUrl,
    backUrl: verifiedNorm.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL,
  };
}

/**
 * Sets a template active and verifies read-back persistence.
 */
export async function publishTemplateAndVerify(templateId: string): Promise<{ success: boolean; templateId: string; activeName: string; verifiedActive: boolean }> {
  await publishTemplate(templateId);

  // Read-back verification
  const snap = await getDoc(doc(db, TEMPLATES_COLLECTION, templateId));
  if (!snap.exists()) {
    throw new Error(`Verification failed: Template ${templateId} does not exist in Firestore.`);
  }

  const data = snap.data();
  if (!data?.isActive) {
    throw new Error(`Verification failed: Template ${templateId} in Firestore is not marked active.`);
  }

  const norm = normalizeTemplate({ ...data, id: snap.id });

  return {
    success: true,
    templateId,
    activeName: norm.name,
    verifiedActive: true,
  };
}

export interface IdCardSystemDiagnostic {
  firebaseInitialized: boolean;
  firestoreConnected: boolean;
  allTemplatesCount: number;
  activeTemplateId: string | null;
  activeTemplateName: string | null;
  activeTemplateVerified: boolean;
  frontImageValid: boolean;
  backImageValid: boolean;
  timestamp: string;
  details: string[];
}

/**
 * Diagnostic test function for the ID Card Template System.
 * Verifies Firebase, Firestore reads, active template pointer, and template media URLs.
 */
export async function verifyIdCardSystemHealth(): Promise<IdCardSystemDiagnostic> {
  const details: string[] = [];
  let firebaseInitialized = false;
  let firestoreConnected = false;
  let allTemplatesCount = 0;
  let activeTemplateId: string | null = null;
  let activeTemplateName: string | null = null;
  let activeTemplateVerified = false;
  let frontImageValid = false;
  let backImageValid = false;

  if (db) {
    firebaseInitialized = true;
    details.push('Firebase SDK initialized successfully.');
  } else {
    details.push('Firebase SDK initialization failed.');
  }

  try {
    const snap = await getDocs(collection(db, TEMPLATES_COLLECTION));
    firestoreConnected = true;
    allTemplatesCount = snap.size;
    details.push(`Firestore connected. Total templates found in collection: ${snap.size}`);
  } catch (err: any) {
    details.push(`Firestore connection read error: ${err?.message || err}`);
  }

  try {
    const active = await getActiveTemplate();
    if (active) {
      activeTemplateId = active.id;
      activeTemplateName = active.name;
      activeTemplateVerified = true;
      frontImageValid = !!(active.frontTemplateUrl || active.templateUrl);
      backImageValid = !!active.backTemplateUrl;
      details.push(`Active template resolved: "${active.name}" (ID: ${active.id})`);
    } else {
      details.push('No active template resolved.');
    }
  } catch (err: any) {
    details.push(`Active template resolution error: ${err?.message || err}`);
  }

  return {
    firebaseInitialized,
    firestoreConnected,
    allTemplatesCount,
    activeTemplateId,
    activeTemplateName,
    activeTemplateVerified,
    frontImageValid,
    backImageValid,
    timestamp: new Date().toISOString(),
    details,
  };
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

  // 2. Upload directly to Cloudinary CDN
  const cloudRes = await uploadImageToCloudinary(file, 'id-card-template', {
    customFolder: 'dare_arqam_id_templates',
  });

  if (!cloudRes.success || !cloudRes.url) {
    throw new Error(cloudRes.error || 'Failed to upload template background to Cloudinary CDN.');
  }

  if (onProgress) onProgress('completed');

  return {
    url: cloudRes.url,
    width: cloudRes.width || width,
    height: cloudRes.height || height,
    aspectRatio,
  };
}
