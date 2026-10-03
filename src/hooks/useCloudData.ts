/**
 * Central Reusable Real-Time Firestore Cloud Hooks
 * Single Source of Truth for dynamic website items:
 * - Real-time synchronization via Firestore onSnapshot()
 * - Clean unsubscription on component unmount (no memory leaks)
 * - Cloud-first data resolution with graceful fallbacks
 */

import { useState, useEffect } from 'react';
import { 
  doc, 
  collection, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Notice, 
  AcademicEvent, 
  GallerySlide, 
  GallerySettings, 
  StudentProfile,
  IdCardTemplate 
} from '../types';
import { 
  DEFAULT_GALLERY_SETTINGS, 
  DEFAULT_GALLERY_SLIDES,
  SingleAppState 
} from '../services/firebaseService';
import {
  NOTICES_DATA,
  EVENTS_DATA
} from '../data/mockData';
import { DEFAULT_TEMPLATE, subscribeActiveTemplate } from '../services/idCardTemplateService';

/**
 * Hook 1: Real-time Website Settings
 */
export function useWebsiteSettings() {
  const [settings, setSettings] = useState<SingleAppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      doc(db, 'settings', 'single_app_state'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          setSettings(snap.data() as SingleAppState);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useWebsiteSettings listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { settings, loading, error };
}

/**
 * Hook 2: Real-time Campus Banners
 */
export function useBanners() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      doc(db, 'pages', 'branding_settings'),
      (snap) => {
        if (!isMounted) return;
        if (snap.exists()) {
          const data = snap.data();
          if (data?.bannerUrl) {
            setBannerUrl(data.bannerUrl);
          }
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useBanners listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { bannerUrl, loading, error };
}

/**
 * Hook 3: Real-time Homepage Gallery
 */
export function useGallery() {
  const [slides, setSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      collection(db, 'gallery_slides'),
      (snap) => {
        if (!isMounted) return;
        if (!snap.empty) {
          const list: GallerySlide[] = [];
          snap.forEach((d) => {
            list.push({ ...(d.data() as GallerySlide), id: d.id });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSlides(list);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useGallery listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { slides, settings, loading, error };
}

/**
 * Hook 4: Real-time Notices & Circulars
 */
export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>(NOTICES_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      collection(db, 'notices'),
      (snap) => {
        if (!isMounted) return;
        if (!snap.empty) {
          const list: Notice[] = [];
          snap.forEach((d) => {
            list.push({ ...(d.data() as Notice), id: d.id });
          });
          list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
          setNotices(list);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useNotices listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { notices, loading, error };
}

/**
 * Hook 5: Real-time Academic Events & Calendar
 */
export function useEvents() {
  const [events, setEvents] = useState<AcademicEvent[]>(EVENTS_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      collection(db, 'events'),
      (snap) => {
        if (!isMounted) return;
        if (!snap.empty) {
          const list: AcademicEvent[] = [];
          snap.forEach((d) => {
            list.push({ ...(d.data() as AcademicEvent), id: d.id });
          });
          list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
          setEvents(list);
        }
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useEvents listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { events, loading, error };
}

/**
 * Hook 6: Real-time Enrolled Students List (Admin & Roster Sync)
 */
export function useStudents() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        if (!isMounted) return;
        const list: StudentProfile[] = [];
        snap.forEach((d) => {
          list.push({ ...(d.data() as StudentProfile), uid: d.id });
        });
        setStudents(list);
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.debug('useStudents listener notice:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { students, loading, error };
}

/**
 * Hook 7: Real-time Active Student ID Card Template
 */
export function useActiveIdCardTemplate() {
  const [template, setTemplate] = useState<IdCardTemplate>(DEFAULT_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const unsub = subscribeActiveTemplate((activeTpl) => {
      if (!isMounted) return;
      if (activeTpl) {
        setTemplate(activeTpl);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  return { template, loading, error };
}
