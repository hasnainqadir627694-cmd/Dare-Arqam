import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload,
  User,
  UserCredential 
} from 'firebase/auth';
import { auth, db, storage, handleFirestoreError, OperationType } from '../lib/firebase';
import { Notice, StudentResult, AcademicEvent, GallerySlide, GallerySettings, StudentProfile, StudentQrIdentity, AttendanceRecord, DARE_ARQAM_CLASSES } from '../types';
import { NOTICES_DATA, RESULTS_DATABASE, EVENTS_DATA } from '../data/mockData';
import { uploadToCloudinary } from './cloudinaryService';
import { createStudentQrIdentity, buildQrVerificationPayload, generateQrCodeDataUrl } from './qrIdentityService';

// ----------------------------------------------------
// SINGLE DOCUMENT STATE ARCHITECTURE (Reduces Firestore Read/Write Fees)
// All app state (notices, events, branding) is consolidated into 1 single Firestore document: settings/single_app_state
// ----------------------------------------------------

export interface LeadershipState {
  principalPhotoUrl?: string;
  principalName?: string;
  principalTitle?: string;
  principalQualification?: string;
  principalMessage?: string;
}

export interface SocialMediaPlatformConfig {
  enabled: boolean;
  profileName: string;
  url: string;
  displayOrder: number;
}

export interface SocialMediaState {
  youtube: SocialMediaPlatformConfig;
  facebook: SocialMediaPlatformConfig;
  tiktok: SocialMediaPlatformConfig;
}

export const DEFAULT_SOCIAL_MEDIA_STATE: SocialMediaState = {
  youtube: {
    enabled: true,
    profileName: 'YouTube',
    url: 'https://youtube.com',
    displayOrder: 1,
  },
  facebook: {
    enabled: true,
    profileName: 'Facebook',
    url: 'https://facebook.com',
    displayOrder: 2,
  },
  tiktok: {
    enabled: true,
    profileName: 'TikTok',
    url: 'https://tiktok.com',
    displayOrder: 3,
  },
};

export const DEFAULT_GALLERY_SETTINGS: GallerySettings = {
  autoSlideInterval: 4000, // 4 seconds default
  pauseOnHover: true,
  loop: true,
  showNavigation: true,
  showIndicators: true,
};

export const DEFAULT_GALLERY_SLIDES: GallerySlide[] = [
  {
    id: 'slide-campus-main',
    url: '/src/assets/images/campus_main_building_1790434904126.jpg',
    title: 'Main Academic Quadrangle & Administrative Directorate',
    caption: 'State-of-the-art educational infrastructure designed for scholastic discipline, character formation, and holistic student development.',
    category: 'Campus Infrastructure',
    order: 1,
    enabled: true,
    createdAt: '2026-03-01T08:00:00.000Z',
    width: 1920,
    height: 1080,
    aspectRatio: 1.7778,
    format: 'webp',
    fileSizeKB: 142
  },
  {
    id: 'slide-science-lab',
    url: '/src/assets/images/campus_science_lab_1790434931736.jpg',
    title: 'Advanced Science & Practical Research Laboratories',
    caption: 'Fully equipped physics, chemistry, and biological experimental facilities meeting international curricular benchmarks.',
    category: 'Academic Facilities',
    order: 2,
    enabled: true,
    createdAt: '2026-03-02T08:00:00.000Z',
    width: 1920,
    height: 1080,
    aspectRatio: 1.7778,
    format: 'webp',
    fileSizeKB: 165
  },
  {
    id: 'slide-library-hall',
    url: '/src/assets/images/campus_library_hall_1790434944628.jpg',
    title: 'Central Reference Library & Independent Research Hall',
    caption: 'Over 10,000 reference volumes, academic journals, and modern digital catalogs fostering critical inquiry.',
    category: 'Scholarly Resources',
    order: 3,
    enabled: true,
    createdAt: '2026-03-03T08:00:00.000Z',
    width: 1920,
    height: 1080,
    aspectRatio: 1.7778,
    format: 'webp',
    fileSizeKB: 158
  }
];

export interface HomepageGalleryState {
  slides: GallerySlide[];
  settings: GallerySettings;
}

export interface SingleAppState {
  notices?: Notice[];
  events?: AcademicEvent[];
  branding?: {
    logoUrl?: string;
    bannerUrl?: string;
    institutionName?: string;
    tagline?: string;
  };
  leadership?: LeadershipState;
  socialMedia?: SocialMediaState;
  homepageGallery?: HomepageGalleryState;
  sitemapXml?: string;
  sitemapGeneratedAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

const LOCAL_STORAGE_APP_STATE_KEY = 'dare_arqam_local_single_app_state';

export async function fetchSingleAppState(): Promise<SingleAppState | null> {
  let localData: SingleAppState | null = null;
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
      if (cached) {
        localData = JSON.parse(cached);
      }
    } catch {}
  }

  try {
    const snap = await getDoc(doc(db, 'settings', 'single_app_state'));
    if (snap.exists()) {
      const remoteData = snap.data() as SingleAppState;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(remoteData));
        } catch {}
      }
      return remoteData;
    }
    return localData;
  } catch {
    return localData;
  }
}

/**
 * Realtime listener for Firestore Single Document State
 * Automatically notifies subscribers whenever any website data updates in Firestore
 */
export function subscribeSingleAppState(callback: (state: SingleAppState | null) => void): () => void {
  try {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'single_app_state'),
      (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data() as SingleAppState;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(remoteData));
            } catch {}
          }
          callback(remoteData);
        } else {
          // If remote doesn't exist, read local
          fetchSingleAppState().then(callback);
        }
      },
      (error) => {
        console.debug('Firestore onSnapshot subscription fallback:', error);
        fetchSingleAppState().then(callback);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.debug('Failed to establish Firestore realtime snapshot listener:', err);
    fetchSingleAppState().then(callback);
    return () => {};
  }
}

export async function saveSingleAppState(partialState: Partial<SingleAppState>): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_APP_STATE_KEY);
      const current = cached ? JSON.parse(cached) : {};
      const merged = { ...current, ...partialState, updatedAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_STORAGE_APP_STATE_KEY, JSON.stringify(merged));
    } catch {}
  }

  try {
    await setDoc(doc(db, 'settings', 'single_app_state'), {
      ...partialState,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch {}
}

// ----------------------------------------------------
// HOMEPAGE GALLERY SERVICE
// ----------------------------------------------------

// ----------------------------------------------------
// HOMEPAGE GALLERY SERVICE (Multi-tier Collection + Document + Local Persistence)
// ----------------------------------------------------

const LOCAL_STORAGE_GALLERY_SLIDES_KEY = 'dare_arqam_gallery_slides_v2';
const LOCAL_STORAGE_GALLERY_SETTINGS_KEY = 'dare_arqam_gallery_settings_v2';

export async function fetchHomepageGallery(): Promise<HomepageGalleryState> {
  let localSlides: GallerySlide[] = DEFAULT_GALLERY_SLIDES;
  let localSettings: GallerySettings = DEFAULT_GALLERY_SETTINGS;

  if (typeof window !== 'undefined') {
    try {
      const cachedSlides = localStorage.getItem(LOCAL_STORAGE_GALLERY_SLIDES_KEY);
      const cachedSettings = localStorage.getItem(LOCAL_STORAGE_GALLERY_SETTINGS_KEY);
      if (cachedSlides) {
        const parsed = JSON.parse(cachedSlides);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localSlides = parsed;
        }
      }
      if (cachedSettings) {
        localSettings = { ...DEFAULT_GALLERY_SETTINGS, ...JSON.parse(cachedSettings) };
      }
    } catch {}
  }

  try {
    // 1. Try fetching from dedicated 'gallery_slides' collection (No 1MB doc limit)
    const slidesSnap = await getDocs(collection(db, 'gallery_slides'));
    if (!slidesSnap.empty) {
      const remoteSlides: GallerySlide[] = [];
      slidesSnap.forEach((docSnap) => {
        const data = docSnap.data() as GallerySlide;
        remoteSlides.push({ ...data, id: docSnap.id });
      });

      remoteSlides.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Fetch settings
      let remoteSettings = localSettings;
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'homepage_gallery'));
        if (settingsSnap.exists()) {
          remoteSettings = { ...DEFAULT_GALLERY_SETTINGS, ...settingsSnap.data() as GallerySettings };
        }
      } catch {}

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_GALLERY_SLIDES_KEY, JSON.stringify(remoteSlides));
          localStorage.setItem(LOCAL_STORAGE_GALLERY_SETTINGS_KEY, JSON.stringify(remoteSettings));
        } catch {}
      }

      return {
        slides: remoteSlides,
        settings: remoteSettings,
      };
    }

    // 2. Fallback to settings/homepage_gallery or settings/single_app_state
    const galleryDocSnap = await getDoc(doc(db, 'settings', 'homepage_gallery'));
    if (galleryDocSnap.exists()) {
      const data = galleryDocSnap.data() as HomepageGalleryState;
      if (Array.isArray(data.slides) && data.slides.length > 0) {
        return {
          slides: data.slides,
          settings: { ...DEFAULT_GALLERY_SETTINGS, ...(data.settings || {}) },
        };
      }
    }

    const state = await fetchSingleAppState();
    if (state?.homepageGallery && Array.isArray(state.homepageGallery.slides) && state.homepageGallery.slides.length > 0) {
      return {
        slides: state.homepageGallery.slides,
        settings: {
          ...DEFAULT_GALLERY_SETTINGS,
          ...(state.homepageGallery.settings || {}),
        },
      };
    }
  } catch (err) {
    console.debug('Firestore gallery fetch fallback (using local cache):', err);
  }

  return {
    slides: localSlides,
    settings: localSettings,
  };
}

export async function saveHomepageGallery(galleryState: HomepageGalleryState): Promise<void> {
  // 1. Immediately cache in localStorage so navigation/logout never loses data
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_GALLERY_SLIDES_KEY, JSON.stringify(galleryState.slides));
      localStorage.setItem(LOCAL_STORAGE_GALLERY_SETTINGS_KEY, JSON.stringify(galleryState.settings));
    } catch {}
  }

  // 2. Save settings doc to Firestore
  try {
    await setDoc(doc(db, 'settings', 'homepage_gallery'), {
      ...galleryState.settings,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch {}

  // 3. Save each slide document into 'gallery_slides' collection (avoids 1MB single document limits)
  try {
    const existingSnap = await getDocs(collection(db, 'gallery_slides'));
    const currentRemoteIds = new Set<string>();
    existingSnap.forEach((d) => currentRemoteIds.add(d.id));

    const newSlideIds = new Set(galleryState.slides.map((s) => s.id));

    // Delete slides that were removed
    for (const oldId of currentRemoteIds) {
      if (!newSlideIds.has(oldId)) {
        try {
          await deleteDoc(doc(db, 'gallery_slides', oldId));
        } catch {}
      }
    }

    // Upsert current slides
    for (const slide of galleryState.slides) {
      try {
        await setDoc(doc(db, 'gallery_slides', slide.id), {
          ...slide,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn(`Error writing slide ${slide.id} to gallery_slides:`, err);
      }
    }
  } catch (err) {
    console.warn('Error synchronizing gallery_slides collection:', err);
  }

  // 4. Also update single_app_state metadata
  try {
    const currentState = await fetchSingleAppState() || {};
    await saveSingleAppState({
      ...currentState,
      homepageGallery: {
        slides: galleryState.slides,
        settings: galleryState.settings,
      },
    });
  } catch {}
}

export function subscribeHomepageGallery(callback: (gallery: HomepageGalleryState) => void): () => void {
  let isUnsubscribed = false;

  // Initial immediate callback from local cache/fetch
  fetchHomepageGallery().then((initial) => {
    if (!isUnsubscribed) callback(initial);
  });

  try {
    // 1. Listen to real-time changes on the 'gallery_slides' collection
    const unsubCollection = onSnapshot(
      collection(db, 'gallery_slides'),
      (snapshot) => {
        if (!snapshot.empty) {
          const slides: GallerySlide[] = [];
          snapshot.forEach((d) => {
            slides.push({ ...d.data() as GallerySlide, id: d.id });
          });
          slides.sort((a, b) => (a.order || 0) - (b.order || 0));

          fetchHomepageGallery().then((g) => {
            const result: HomepageGalleryState = {
              slides,
              settings: g.settings || DEFAULT_GALLERY_SETTINGS,
            };
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem(LOCAL_STORAGE_GALLERY_SLIDES_KEY, JSON.stringify(slides));
              } catch {}
            }
            if (!isUnsubscribed) callback(result);
          });
        }
      },
      () => {
        // Fallback to single_app_state subscription
      }
    );

    // 2. Also listen to single_app_state for settings updates
    const unsubSingle = subscribeSingleAppState((state) => {
      if (state?.homepageGallery && Array.isArray(state.homepageGallery.slides) && state.homepageGallery.slides.length > 0) {
        if (!isUnsubscribed) {
          callback({
            slides: state.homepageGallery.slides,
            settings: {
              ...DEFAULT_GALLERY_SETTINGS,
              ...(state.homepageGallery.settings || {}),
            },
          });
        }
      }
    });

    return () => {
      isUnsubscribed = true;
      unsubCollection();
      unsubSingle();
    };
  } catch {
    return () => {
      isUnsubscribed = true;
    };
  }
}


// ----------------------------------------------------
// 1. NOTICES SERVICE (Using Single Document)
// ----------------------------------------------------

export async function fetchNotices(): Promise<Notice[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && state.notices && state.notices.length > 0) {
      return state.notices;
    }
    return NOTICES_DATA;
  } catch (error) {
    return NOTICES_DATA;
  }
}

export async function saveNotices(notices: Notice[]): Promise<void> {
  await saveSingleAppState({ notices });
}

export async function seedInitialDataIfEmpty(): Promise<void> {
  // No-op for single document optimization
}

// ----------------------------------------------------
// 2. EVENTS SERVICE (Using Single Document)
// ----------------------------------------------------

export async function fetchEvents(): Promise<AcademicEvent[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && state.events && state.events.length > 0) {
      return state.events;
    }
    return EVENTS_DATA;
  } catch (error) {
    return EVENTS_DATA;
  }
}

export async function saveEvents(events: AcademicEvent[]): Promise<void> {
  await saveSingleAppState({ events });
}

// ----------------------------------------------------
// 3. EXAMINATION RESULTS SERVICE
// ----------------------------------------------------

export async function searchStudentResult(rollOrId: string): Promise<StudentResult | null> {
  const cleaned = rollOrId.trim();
  if (!cleaned) return null;

  try {
    const localMatch = RESULTS_DATABASE.find(
      r => r.rollNumber.toLowerCase() === cleaned.toLowerCase() ||
           r.studentId.toLowerCase() === cleaned.toLowerCase()
    );
    return localMatch || null;
  } catch (error) {
    console.warn('Results fetch error:', error);
    return null;
  }
}

export async function fetchResultByRollOrId(rollOrId: string): Promise<StudentResult | null> {
  return searchStudentResult(rollOrId);
}

// ----------------------------------------------------
// 4. ADMISSION APPLICATION SERVICE
// ----------------------------------------------------

export interface AdmissionApplicationPayload {
  candidateName: string;
  fatherName: string;
  bForm: string;
  gender: string;
  dob: string;
  targetClass: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  previousSchool?: string;
  [key: string]: any;
}

export async function submitAdmissionToFirebase(data: AdmissionApplicationPayload): Promise<{ referenceNumber: string }> {
  const referenceNumber = `ADM-DA-${Math.floor(10000 + Math.random() * 90000)}`;

  try {
    const state = await fetchSingleAppState();
    const existingAdmissions = (state as any)?.admissions || [];
    const newAdmission = {
      ...data,
      referenceNumber,
      submittedAt: new Date().toISOString(),
      status: 'Pending Verification'
    };

    await saveSingleAppState({
      ...state,
      admissions: [newAdmission, ...existingAdmissions]
    } as any);

    return { referenceNumber };
  } catch (error: any) {
    console.warn('Admission submission stored locally:', error);
    return { referenceNumber };
  }
}

export async function submitAdmissionApplication(data: AdmissionApplicationPayload): Promise<{ referenceNumber: string }> {
  return submitAdmissionToFirebase(data);
}

// ----------------------------------------------------
// 5. INQUIRIES SERVICE
// ----------------------------------------------------

export interface InquiryPayload {
  fullName?: string;
  name?: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  [key: string]: any;
}

export async function submitInquiryToFirebase(data: InquiryPayload): Promise<{ inquiryId: string }> {
  const inquiryId = `INQ-DA-${Math.floor(10000 + Math.random() * 90000)}`;
  try {
    const state = await fetchSingleAppState();
    const existingInquiries = (state as any)?.inquiries || [];
    const newInquiry = {
      ...data,
      inquiryId,
      submittedAt: new Date().toISOString(),
      status: 'Unread'
    };

    await saveSingleAppState({
      ...state,
      inquiries: [newInquiry, ...existingInquiries]
    } as any);
    return { inquiryId };
  } catch (error) {
    console.warn('Inquiry submission error:', error);
    return { inquiryId };
  }
}

export async function submitInquiry(data: InquiryPayload): Promise<{ inquiryId: string }> {
  return submitInquiryToFirebase(data);
}

// ----------------------------------------------------
// 6. STUDENT AUTHENTICATION & PROFILE SERVICES
// ----------------------------------------------------

const LOCAL_STORAGE_CURRENT_STUDENT_KEY = 'dare_arqam_current_student';

export interface RegisterStudentInput {
  fullName: string;
  fatherName: string;
  className: string;
  rollNumber: string;
  whatsappNumber: string;
  email: string;
  password: string;
}

/**
 * Checks if a roll number is already registered in the specified class.
 */
export async function checkDuplicateRollNumber(className: string, rollNumber: string): Promise<boolean> {
  const cleanRoll = rollNumber.trim();
  const cleanClass = className.trim();
  if (!cleanRoll || !cleanClass) return false;

  try {
    const q = query(
      collection(db, 'students'),
      where('className', '==', cleanClass),
      where('rollNumber', '==', cleanRoll)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (err) {
    console.debug('Duplicate check skipped due to rule/query context:', err);
    return false;
  }
}

/**
 * Creates Firebase Auth account and stores structured student record in Firestore `students/{uid}`.
 * Passwords are NEVER written to Firestore.
 */
export async function registerStudentWithFirebase(data: RegisterStudentInput): Promise<{ student: StudentProfile; user: User }> {
  // Validate class belongs to the official DARE ARQAM classes list
  if (!DARE_ARQAM_CLASSES.includes(data.className as any)) {
    throw new Error('Please select a valid class from the institutional dropdown.');
  }

  // Pre-check for duplicate roll number in class
  const isDuplicate = await checkDuplicateRollNumber(data.className, data.rollNumber);
  if (isDuplicate) {
    throw new Error(`Roll Number "${data.rollNumber.trim()}" is already registered in ${data.className}. Please check and enter your correct roll number.`);
  }

  // 1. Create account using Firebase Authentication
  const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  const user = cred.user;

  // 2. Generate structured profile without password
  const currentYear = new Date().getFullYear();
  const studentId = `DA-${currentYear}-${data.rollNumber.trim()}`;
  
  // Generate permanent personal QR identity
  const qrIdentity = await createStudentQrIdentity(0);

  const studentProfile: StudentProfile = {
    uid: user.uid,
    fullName: data.fullName.trim(),
    fatherName: data.fatherName.trim(),
    className: data.className,
    rollNumber: data.rollNumber.trim(),
    whatsappNumber: data.whatsappNumber.trim(),
    email: user.email || data.email.trim(),
    profileImageUrl: '',
    studentId,
    qrIdentity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    section: 'Section A',
    session: `${currentYear}–${currentYear + 1}`,
  };

  // 3. Write structured student document to Firestore (doc ID = user.uid)
  try {
    await setDoc(doc(db, 'students', user.uid), studentProfile);
    // Write lookup index in qr_tokens for direct O(1) resolution
    await setDoc(doc(db, 'qr_tokens', qrIdentity.tokenId), {
      uid: user.uid,
      tokenId: qrIdentity.tokenId,
      status: 'active',
      createdAt: qrIdentity.createdAt,
    });
  } catch (err) {
    console.warn('Direct Firestore student write fallback:', err);
  }

  // 4. Cache in localStorage for immediate rendering
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(studentProfile));
    } catch {}
  }

  return { student: studentProfile, user };
}

/**
 * Authenticate student via Firebase Authentication and retrieve their Firestore profile.
 */
export async function loginStudentWithFirebase(email: string, pass: string): Promise<{ user: User; profile: StudentProfile | null }> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await getStudentProfile(cred.user.uid);
  return { user: cred.user, profile };
}

/**
 * Retrieves student profile from Firestore `students/{uid}` with localStorage fallback.
 */
export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
  if (!uid) return null;

  try {
    const snap = await getDoc(doc(db, 'students', uid));
    if (snap.exists()) {
      const data = { ...(snap.data() as StudentProfile), uid: snap.id };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(data));
        } catch {}
      }
      return data;
    }
  } catch (err) {
    console.debug('Firestore getStudentProfile fallback:', err);
  }

  // Fallback: query collection by uid field
  try {
    const q = query(collection(db, 'students'), where('uid', '==', uid));
    const qSnap = await getDocs(q);
    if (!qSnap.empty) {
      const docSnap = qSnap.docs[0];
      const data = { ...(docSnap.data() as StudentProfile), uid: docSnap.id };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(data));
        } catch {}
      }
      return data;
    }
  } catch {}

  // Fallback to local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.uid === uid || parsed.email === uid) return parsed;
      }
    } catch {}
  }

  return null;
}

/**
 * Real-time listener for a student's personal profile document.
 */
export function subscribeStudentProfile(uid: string, callback: (profile: StudentProfile | null) => void): () => void {
  if (!uid) {
    callback(null);
    return () => {};
  }

  // Initial immediate callback from cache/read
  getStudentProfile(uid).then(callback);

  try {
    const unsubscribe = onSnapshot(
      doc(db, 'students', uid),
      (snap) => {
        if (snap.exists()) {
          const profile = snap.data() as StudentProfile;
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(profile));
            } catch {}
          }
          callback(profile);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.debug('Student profile onSnapshot error:', error);
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
}

/**
 * Updates allowed student profile fields in Firestore.
 * Does NOT allow changing protected fields: `rollNumber`, `className`, `uid`.
 */
export async function updateStudentProfile(uid: string, updates: Partial<StudentProfile>): Promise<void> {
  if (!uid) throw new Error('Student UID is required');

  // Strip protected fields from being overwritten by student
  const sanitizedUpdates: Partial<StudentProfile> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  delete sanitizedUpdates.uid;
  delete sanitizedUpdates.rollNumber;
  delete sanitizedUpdates.className;

  try {
    await updateDoc(doc(db, 'students', uid), sanitizedUpdates);
  } catch {
    try {
      // If updateDoc fails (e.g. document not yet created), use setDoc with merge
      await setDoc(doc(db, 'students', uid), { ...sanitizedUpdates, uid }, { merge: true });
    } catch (setErr) {
      console.warn('Firestore updateStudentProfile fallback notice:', setErr);
    }
  }

  // Update local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
      const current = cached ? JSON.parse(cached) : {};
      const merged = { ...current, ...sanitizedUpdates };
      localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(merged));
    } catch {}
  }
}

/**
 * Resizes and compresses an image file to a 400x400 square avatar WebP / JPEG Blob.
 */
export async function compressProfileImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const targetSize = 400;
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }

      // Clear canvas so alpha / transparency is preserved (no opaque sharp corners)
      ctx.clearRect(0, 0, targetSize, targetSize);

      // Crop to center square
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate image blob'));
        },
        'image/webp',
        0.90
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file for compression'));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a student profile picture to Firebase Storage (with Cloudinary fallback),
 * updates the student's Firestore profile, and returns the new image URL.
 */
export async function uploadStudentProfilePicture(
  uid: string,
  file: File,
  onProgress?: (stage: 'processing' | 'uploading' | 'completed') => void
): Promise<string> {
  if (!uid) throw new Error('Student UID required');
  if (!file) throw new Error('No image file selected');

  // Validate file format
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, or WebP).');
  }

  // Validate file size (max 10MB before compression)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB. Please choose a smaller photo.');
  }

  if (onProgress) onProgress('processing');

  // 1. If file is already a pre-cropped perfected avatar (WebP or PNG under 2MB), use directly!
  let compressedBlob: Blob;
  if ((file.type === 'image/webp' || file.type === 'image/png') && file.size < 2 * 1024 * 1024) {
    compressedBlob = file;
  } else {
    compressedBlob = await compressProfileImage(file);
  }

  if (onProgress) onProgress('uploading');

  let downloadUrl = '';
  const ext = compressedBlob.type.includes('png') ? 'png' : 'webp';
  const contentType = compressedBlob.type || 'image/webp';

  // 2. Try Firebase Storage with 10s timeout
  try {
    const storageRef = ref(storage, `students/${uid}/profile_${Date.now()}.${ext}`);
    const uploadTask = (async () => {
      const uploadRes = await uploadBytes(storageRef, compressedBlob, {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
      });
      return await getDownloadURL(uploadRes.ref);
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage upload timed out after 10s')), 10000);
    });

    downloadUrl = await Promise.race([uploadTask, timeoutPromise]);
  } catch (storageErr) {
    console.warn('Firebase Storage upload notice, falling back to Cloudinary CDN:', storageErr);
    // 3. Fallback to Cloudinary CDN
    try {
      const cloudRes = await uploadToCloudinary(compressedBlob, {
        folder: 'dare_arqam_students',
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

  // 4. If cloud uploads both fail, convert blob to data URL so interface is NEVER stuck
  if (!downloadUrl) {
    downloadUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedBlob);
    });
  }

  // 5. Update Firestore `students/{uid}` with the new picture URL
  const updatePayload = {
    uid,
    profileImageUrl: downloadUrl,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'students', uid), updatePayload);
  } catch {
    try {
      await setDoc(doc(db, 'students', uid), updatePayload, { merge: true });
    } catch (setErr) {
      console.warn('Firestore student profile photo save notice:', setErr);
    }
  }

  // 6. Update local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
      const current = cached ? JSON.parse(cached) : {};
      current.profileImageUrl = downloadUrl;
      current.updatedAt = new Date().toISOString();
      localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(current));
    } catch {}
  }

  if (onProgress) onProgress('completed');

  return downloadUrl;
}

/**
 * Fetches all registered students from Firestore `students` collection.
 */
export async function fetchAllStudents(): Promise<StudentProfile[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    if (!snap.empty) {
      const students: StudentProfile[] = [];
      snap.forEach((d) => {
        students.push({ ...(d.data() as StudentProfile), uid: d.id });
      });
      return students;
    }
  } catch (err) {
    console.debug('fetchAllStudents error (using empty):', err);
  }
  return [];
}

/**
 * Real-time listener for all student records in the `students` collection.
 * Keeps the Admin Panel's Classes & Students view in instant synchronization!
 */
export function subscribeAllStudents(callback: (students: StudentProfile[]) => void): () => void {
  try {
    const unsubscribe = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const students: StudentProfile[] = [];
        snap.forEach((d) => {
          students.push({ ...(d.data() as StudentProfile), uid: d.id });
        });
        callback(students);
      },
      (error) => {
        console.debug('subscribeAllStudents onSnapshot notice:', error);
        fetchAllStudents().then(callback);
      }
    );
    return unsubscribe;
  } catch {
    fetchAllStudents().then(callback);
    return () => {};
  }
}

export async function logoutStudentFromFirebase(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
    } catch {}
  }
  return signOut(auth);
}

export async function sendStudentVerificationEmail(user: User): Promise<void> {
  return sendEmailVerification(user);
}

export async function checkStudentEmailVerified(user: User): Promise<boolean> {
  await reload(user);
  return user.emailVerified;
}

export async function resetStudentPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

// ----------------------------------------------------
// 7. AUTHENTICATION & ADMIN SERVICE
// ----------------------------------------------------

export { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  reload
};

export type { User, UserCredential };

export async function getActiveAdminCredentials() {
  return {
    email: 'Darearqam@mardan.com',
    role: 'Super Administrator',
    lastLogin: new Date().toISOString()
  };
}

export async function updateAdminCredentials(email: string, pass: string) {
  try {
    await saveSingleAppState({
      adminMeta: { email, updatedAt: new Date().toISOString() }
    } as any);
  } catch (error) {
    console.warn('Admin credentials update note:', error);
  }
}

// ----------------------------------------------------
// 8. PERMANENT STUDENT QR IDENTITY & ATTENDANCE INFRASTRUCTURE
// ----------------------------------------------------

/**
 * Ensures a student has a permanent, persistent QR identity.
 * Generates once if missing, stores in Firestore, and never regenerates repeatedly.
 */
export async function ensureStudentQrIdentity(studentOrUid: StudentProfile | string): Promise<StudentQrIdentity> {
  let student: StudentProfile | null = null;
  let uid = '';

  if (typeof studentOrUid === 'string') {
    uid = studentOrUid;
    student = await getStudentProfile(uid);
  } else {
    student = studentOrUid;
    uid = student.uid;
  }

  if (!uid) {
    throw new Error('Valid student UID is required to ensure QR identity');
  }

  // If student already has an active or revoked QR identity with cached image, return it
  if (student?.qrIdentity?.tokenId && student?.qrIdentity?.qrDataUrl) {
    return student.qrIdentity;
  }

  // If student has tokenId but missing cached QR image, regenerate cached data URL only
  if (student?.qrIdentity?.tokenId && !student.qrIdentity.qrDataUrl) {
    const payload = buildQrVerificationPayload(student.qrIdentity.tokenId);
    const qrDataUrl = await generateQrCodeDataUrl(payload);
    const updatedQr: StudentQrIdentity = {
      ...student.qrIdentity,
      qrDataUrl,
    };

    try {
      await updateDoc(doc(db, 'students', uid), {
        qrIdentity: updatedQr,
        updatedAt: new Date().toISOString(),
      });
    } catch {}

    return updatedQr;
  }

  // First time generation: create brand new permanent QR identity
  const existingVersion = student?.qrIdentity?.version || 0;
  const newQr = await createStudentQrIdentity(existingVersion);

  try {
    // 1. Update student document
    await setDoc(
      doc(db, 'students', uid),
      {
        qrIdentity: newQr,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. Write direct token lookup index in `qr_tokens/{tokenId}` for O(1) resolution
    await setDoc(doc(db, 'qr_tokens', newQr.tokenId), {
      uid,
      tokenId: newQr.tokenId,
      status: newQr.status,
      createdAt: newQr.createdAt,
    });

    // 3. Update local cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid) {
            parsed.qrIdentity = newQr;
            localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.warn('ensureStudentQrIdentity Firestore write note:', err);
  }

  return newQr;
}

/**
 * Resolves a scanned QR token to its corresponding student record.
 * Handles both raw token IDs ('dast_...') and full verification URLs.
 */
export async function lookupStudentByQrToken(rawTokenOrUrl: string): Promise<{
  student: StudentProfile | null;
  isValid: boolean;
  status: 'active' | 'revoked' | 'not_found';
  message: string;
}> {
  if (!rawTokenOrUrl) {
    return { student: null, isValid: false, status: 'not_found', message: 'No QR token provided' };
  }

  // Extract clean token ID
  const cleaned = rawTokenOrUrl.trim();
  let tokenId = cleaned;
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const url = new URL(cleaned);
      const param = url.searchParams.get('token');
      if (param) tokenId = param.trim();
    }
  } catch {}

  const match = tokenId.match(/dast_[a-zA-Z0-9_-]+/);
  if (match) {
    tokenId = match[0];
  }

  // 1. Check direct token index in `qr_tokens/{tokenId}`
  try {
    const tokenSnap = await getDoc(doc(db, 'qr_tokens', tokenId));
    if (tokenSnap.exists()) {
      const tokenData = tokenSnap.data();
      const studentUid = tokenData.uid;
      const student = await getStudentProfile(studentUid);

      if (!student) {
        return { student: null, isValid: false, status: 'not_found', message: 'Student record could not be found' };
      }

      // Check current status in student record
      const isRevoked = student.qrIdentity?.status === 'revoked' || tokenData.status === 'revoked';
      if (isRevoked) {
        return {
          student,
          isValid: false,
          status: 'revoked',
          message: 'This Student QR Identity has been revoked by administration.',
        };
      }

      return {
        student,
        isValid: true,
        status: 'active',
        message: 'Student verified successfully with active permanent QR identity.',
      };
    }
  } catch (err) {
    console.debug('Token lookup index error, falling back to student query:', err);
  }

  // 2. Query students collection by `qrIdentity.tokenId`
  try {
    const q = query(collection(db, 'students'), where('qrIdentity.tokenId', '==', tokenId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const student = { ...(docSnap.data() as StudentProfile), uid: docSnap.id };

      if (student.qrIdentity?.status === 'revoked') {
        return {
          student,
          isValid: false,
          status: 'revoked',
          message: 'This Student QR Identity has been revoked by administration.',
        };
      }

      return {
        student,
        isValid: true,
        status: 'active',
        message: 'Student verified successfully with active permanent QR identity.',
      };
    }
  } catch (err) {
    console.debug('Student query by qrIdentity error:', err);
  }

  return {
    student: null,
    isValid: false,
    status: 'not_found',
    message: 'Invalid or unrecognized student QR token.',
  };
}

/**
 * Revokes a student's QR identity (e.g. if ID card is lost or stolen).
 * Does NOT delete the student account; invalidates the QR token immediately.
 */
export async function revokeStudentQrIdentity(uid: string, reason = 'Card Reported Lost / Revoked by Administration'): Promise<void> {
  if (!uid) return;
  const student = await getStudentProfile(uid);
  if (!student || !student.qrIdentity) return;

  const currentQr = student.qrIdentity;
  const revokedQr: StudentQrIdentity = {
    ...currentQr,
    status: 'revoked',
    revokedAt: new Date().toISOString(),
    revokedReason: reason,
  };

  try {
    // 1. Update student document
    await updateDoc(doc(db, 'students', uid), {
      qrIdentity: revokedQr,
      updatedAt: new Date().toISOString(),
    });

    // 2. Mark token index as revoked
    if (currentQr.tokenId) {
      await setDoc(
        doc(db, 'qr_tokens', currentQr.tokenId),
        {
          status: 'revoked',
          revokedAt: new Date().toISOString(),
          revokedReason: reason,
        },
        { merge: true }
      );
    }

    // 3. Update local cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid) {
            parsed.qrIdentity = revokedQr;
            localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.error('revokeStudentQrIdentity error:', err);
    throw err;
  }
}

/**
 * Restores / Reactivates a previously revoked QR identity if found again.
 */
export async function restoreStudentQrIdentity(uid: string): Promise<void> {
  if (!uid) return;
  const student = await getStudentProfile(uid);
  if (!student || !student.qrIdentity) return;

  const currentQr = student.qrIdentity;
  const activeQr: StudentQrIdentity = {
    ...currentQr,
    status: 'active',
    revokedAt: undefined,
    revokedReason: undefined,
  };

  try {
    await updateDoc(doc(db, 'students', uid), {
      qrIdentity: activeQr,
      updatedAt: new Date().toISOString(),
    });

    if (currentQr.tokenId) {
      await setDoc(
        doc(db, 'qr_tokens', currentQr.tokenId),
        {
          status: 'active',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid) {
            parsed.qrIdentity = activeQr;
            localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.error('restoreStudentQrIdentity error:', err);
    throw err;
  }
}

/**
 * Explicitly regenerates a student's permanent QR identity (Protected Admin Action).
 * Permanently invalidates the old token so printed cards with the old QR will not resolve.
 */
export async function regenerateStudentQrIdentity(uid: string): Promise<StudentQrIdentity> {
  if (!uid) throw new Error('Student UID required for regeneration');
  const student = await getStudentProfile(uid);
  const oldTokenId = student?.qrIdentity?.tokenId;
  const existingVersion = student?.qrIdentity?.version || 1;

  // 1. Invalidate old token in index
  if (oldTokenId) {
    try {
      await setDoc(
        doc(db, 'qr_tokens', oldTokenId),
        {
          status: 'revoked',
          revokedAt: new Date().toISOString(),
          revokedReason: 'Superseded by newly regenerated QR code',
        },
        { merge: true }
      );
    } catch {}
  }

  // 2. Create fresh identity with incremented version
  const newQr = await createStudentQrIdentity(existingVersion);

  try {
    // 3. Save to student doc
    await updateDoc(doc(db, 'students', uid), {
      qrIdentity: newQr,
      updatedAt: new Date().toISOString(),
    });

    // 4. Save new token in index
    await setDoc(doc(db, 'qr_tokens', newQr.tokenId), {
      uid,
      tokenId: newQr.tokenId,
      status: 'active',
      createdAt: newQr.createdAt,
    });

    // 5. Update local cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.uid === uid) {
            parsed.qrIdentity = newQr;
            localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(parsed));
          }
        }
      } catch {}
    }
  } catch (err) {
    console.error('regenerateStudentQrIdentity error:', err);
    throw err;
  }

  return newQr;
}

/**
 * Prepares and records an E-Attendance scan event into `attendance/{attendanceId}`.
 * Validates the student's QR token and records the timestamp and gate location.
 */
export async function recordAttendanceScan(
  rawTokenOrUrl: string,
  meta?: { gateId?: string; recordedBy?: string }
): Promise<{
  success: boolean;
  student?: StudentProfile;
  attendanceId?: string;
  message: string;
}> {
  const result = await lookupStudentByQrToken(rawTokenOrUrl);

  if (!result.isValid || !result.student) {
    return {
      success: false,
      message: result.message || 'Cannot record attendance: Invalid or revoked QR code.',
    };
  }

  const student = result.student;
  const todayDate = new Date().toISOString().split('T')[0];
  const attendanceId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const record: AttendanceRecord = {
    id: attendanceId,
    studentUid: student.uid,
    studentName: student.fullName,
    fatherName: student.fatherName,
    className: student.className,
    rollNumber: student.rollNumber,
    date: todayDate,
    timestamp: new Date().toISOString(),
    status: 'present',
    gateId: meta?.gateId || 'Katlang Campus Main Gate',
    recordedBy: meta?.recordedBy || 'Directorate Scanner System',
    qrTokenId: student.qrIdentity?.tokenId || '',
  };

  try {
    await setDoc(doc(db, 'attendance', attendanceId), record);
    return {
      success: true,
      student,
      attendanceId,
      message: `Attendance marked present for ${student.fullName} (${student.className} · Roll #${student.rollNumber}).`,
    };
  } catch (err: any) {
    console.error('recordAttendanceScan error:', err);
    return {
      success: false,
      student,
      message: err?.message || 'Failed to record attendance in Firestore.',
    };
  }
}

/**
 * Fetches historical attendance scan logs for a student.
 */
export async function fetchStudentAttendance(studentUid: string): Promise<AttendanceRecord[]> {
  if (!studentUid) return [];
  try {
    const q = query(collection(db, 'attendance'), where('studentUid', '==', studentUid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const records: AttendanceRecord[] = [];
      snap.forEach((d) => {
        records.push({ ...(d.data() as AttendanceRecord), id: d.id });
      });
      // Sort newest first
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (err) {
    console.debug('fetchStudentAttendance notice:', err);
  }
  return [];
}

/**
 * Changes a student's class (e.g. 9th -> 10th) from the admin panel.
 */
export async function adminUpdateStudentClass(uid: string, newClassName: string): Promise<void> {
  if (!uid || !newClassName) throw new Error('Student UID and new class name required');
  try {
    await updateDoc(doc(db, 'students', uid), {
      className: newClassName,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    await setDoc(doc(db, 'students', uid), {
      className: newClassName,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}

/**
 * Deletes a student record permanently from the admin panel.
 */
export async function adminDeleteStudent(uid: string): Promise<void> {
  if (!uid) throw new Error('Student UID required');
  try {
    await deleteDoc(doc(db, 'students', uid));
  } catch (err) {
    console.warn('Admin student delete notice:', err);
  }
}

/**
 * Manually adds a student directly to a specific class from the admin panel.
 */
export async function adminAddStudentManual(data: {
  fullName: string;
  fatherName: string;
  className: string;
  rollNumber: string;
  whatsappNumber: string;
  email: string;
  section?: string;
}): Promise<StudentProfile> {
  const uid = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const qrIdentity = await createStudentQrIdentity(1);
  const now = new Date().toISOString();

  const profile: StudentProfile = {
    uid,
    fullName: data.fullName.trim(),
    fatherName: data.fatherName.trim(),
    className: data.className,
    rollNumber: data.rollNumber.trim(),
    whatsappNumber: data.whatsappNumber.trim(),
    email: data.email.trim() || `${uid}@darearqam.edu.pk`,
    section: data.section || 'Section A',
    session: `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
    studentId: `DA-${new Date().getFullYear()}-${data.rollNumber.trim()}`,
    createdAt: now,
    updatedAt: now,
    qrIdentity,
  };

  await setDoc(doc(db, 'students', uid), profile);
  await setDoc(doc(db, 'qr_tokens', qrIdentity.tokenId), {
    uid,
    tokenId: qrIdentity.tokenId,
    status: 'active',
    createdAt: now,
  });

  return profile;
}


