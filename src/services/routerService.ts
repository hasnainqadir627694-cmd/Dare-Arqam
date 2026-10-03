/**
 * DARE ARQAM Production-Ready Deep Linking & URL Routing Service
 * Provides clean canonical URLs, HTML5 History API state management,
 * browser Back/Forward (popstate) handling, and direct deep-link resolution.
 */

import { PageId } from '../types';

export interface RouteState {
  page: PageId;
  authMode?: 'choice' | 'login';
  noticeId?: string;
  token?: string;
  tab?: string;
}

// Canonical URL path mapping for each PageId
export const PAGE_TO_CANONICAL_PATH: Record<PageId, string> = {
  home: '/',
  about: '/about',
  'principal-message': '/principal-message',
  'vision-mission': '/vision-mission',
  administration: '/administration',
  faculty: '/faculty',
  departments: '/departments',
  'academic-programs': '/academics',
  classes: '/classes',
  'academic-calendar': '/academic-calendar',
  examination: '/examination',
  results: '/results',
  syllabus: '/syllabus',
  'admission-info': '/admissions',
  eligibility: '/eligibility',
  'admission-process': '/admission-process',
  'required-documents': '/required-documents',
  'fee-structure': '/fee-structure',
  'apply-admission': '/apply-admission',
  'student-portal': '/student-portal',
  'student-login': '/login',
  'student-register': '/register',
  'admin-login': '/admin-login',
  'admin-dashboard': '/admin-dashboard',
  'super-admin-dashboard': '/super-admin-dashboard',
  notices: '/notices',
  'notice-detail': '/notice-detail',
  events: '/events',
  news: '/news',
  gallery: '/gallery',
  downloads: '/downloads',
  contact: '/contact',
  'verify-student': '/verify-student',
};

// Aliases mapping alternative or legacy paths to canonical PageIds
const PATH_ALIASES: Record<string, { page: PageId; defaultAuthMode?: 'choice' | 'login' }> = {
  '/': { page: 'home' },
  '/home': { page: 'home' },
  '/about': { page: 'about' },
  '/principal-message': { page: 'principal-message' },
  '/principal': { page: 'principal-message' },
  '/message': { page: 'principal-message' },
  '/vision-mission': { page: 'vision-mission' },
  '/vision': { page: 'vision-mission' },
  '/mission': { page: 'vision-mission' },
  '/administration': { page: 'administration' },
  '/governance': { page: 'administration' },
  '/faculty': { page: 'faculty' },
  '/teachers': { page: 'faculty' },
  '/departments': { page: 'departments' },
  '/academics': { page: 'academic-programs' },
  '/academic-programs': { page: 'academic-programs' },
  '/curriculum': { page: 'academic-programs' },
  '/classes': { page: 'classes' },
  '/academic-calendar': { page: 'academic-calendar' },
  '/calendar': { page: 'academic-calendar' },
  '/examination': { page: 'examination' },
  '/exams': { page: 'examination' },
  '/results': { page: 'results' },
  '/result': { page: 'results' },
  '/gazette': { page: 'results' },
  '/syllabus': { page: 'syllabus' },
  '/admissions': { page: 'admission-info' },
  '/admission': { page: 'admission-info' },
  '/admission-info': { page: 'admission-info' },
  '/eligibility': { page: 'eligibility' },
  '/admission-process': { page: 'admission-process' },
  '/required-documents': { page: 'required-documents' },
  '/documents': { page: 'required-documents' },
  '/fee-structure': { page: 'fee-structure' },
  '/fees': { page: 'fee-structure' },
  '/fee': { page: 'fee-structure' },
  '/apply-admission': { page: 'apply-admission' },
  '/apply': { page: 'apply-admission' },
  '/student-portal': { page: 'student-portal' },
  '/portal': { page: 'student-portal' },
  '/student-login': { page: 'student-login', defaultAuthMode: 'login' },
  '/login': { page: 'student-login', defaultAuthMode: 'login' },
  '/signin': { page: 'student-login', defaultAuthMode: 'login' },
  '/student-register': { page: 'student-register' },
  '/register': { page: 'student-register' },
  '/signup': { page: 'student-register' },
  '/admin-login': { page: 'admin-login' },
  '/admin': { page: 'admin-dashboard' },
  '/admin-dashboard': { page: 'admin-dashboard' },
  '/super-admin-dashboard': { page: 'super-admin-dashboard' },
  '/notices': { page: 'notices' },
  '/notice': { page: 'notices' },
  '/circulars': { page: 'notices' },
  '/circular': { page: 'notices' },
  '/notice-detail': { page: 'notice-detail' },
  '/events': { page: 'events' },
  '/event': { page: 'events' },
  '/news': { page: 'news' },
  '/gallery': { page: 'gallery' },
  '/photos': { page: 'gallery' },
  '/downloads': { page: 'downloads' },
  '/prospectus': { page: 'downloads' },
  '/forms': { page: 'downloads' },
  '/contact': { page: 'contact' },
  '/contact-us': { page: 'contact' },
  '/verify-student': { page: 'verify-student' },
  '/verify': { page: 'verify-student' },
  '/verification': { page: 'verify-student' },
};

/**
 * Parses a pathname and search query string into a canonical RouteState
 */
export function parseCurrentLocation(
  pathname: string = typeof window !== 'undefined' ? window.location.pathname : '/',
  search: string = typeof window !== 'undefined' ? window.location.search : ''
): RouteState {
  // Normalize pathname (strip trailing slash except for root)
  let normalized = pathname.trim().toLowerCase();
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  const params = new URLSearchParams(search);
  const tokenParam = params.get('token') || undefined;
  const noticeIdParam = params.get('id') || params.get('noticeId') || undefined;
  const authModeParam = (params.get('auth') as 'choice' | 'login') || undefined;
  const tabParam = params.get('tab') || undefined;

  // 1. Direct match in aliases
  if (PATH_ALIASES[normalized]) {
    const match = PATH_ALIASES[normalized];
    return {
      page: match.page,
      authMode: authModeParam || match.defaultAuthMode || (match.page === 'student-login' ? 'login' : 'choice'),
      noticeId: noticeIdParam,
      token: tokenParam,
      tab: tabParam,
    };
  }

  // 2. Parametric route: /verify-student/:token or /verify/:token
  if (normalized.startsWith('/verify-student/') || normalized.startsWith('/verify/')) {
    const parts = normalized.split('/').filter(Boolean);
    const token = parts[1] || tokenParam;
    return {
      page: 'verify-student',
      token,
      tab: tabParam,
    };
  }

  // 3. Parametric route: /notices/:id or /notice/:id
  if (normalized.startsWith('/notices/') || normalized.startsWith('/notice/')) {
    const parts = normalized.split('/').filter(Boolean);
    const noticeId = parts[1] || noticeIdParam;
    return {
      page: 'notices',
      noticeId,
      tab: tabParam,
    };
  }

  // 4. Default fallback: Home
  return {
    page: 'home',
    token: tokenParam,
    noticeId: noticeIdParam,
    tab: tabParam,
  };
}

/**
 * Builds the canonical URL path for a given PageId and optional parameters
 */
export function buildCanonicalUrl(
  page: PageId,
  options?: {
    authMode?: 'choice' | 'login';
    noticeId?: string;
    token?: string;
    tab?: string;
    extraParams?: Record<string, string>;
  }
): string {
  let path = PAGE_TO_CANONICAL_PATH[page] || '/';

  const params = new URLSearchParams();

  if (options?.token) {
    params.set('token', options.token);
  }

  if (options?.noticeId) {
    params.set('id', options.noticeId);
  }

  if (options?.authMode && page === 'student-login' && options.authMode !== 'login') {
    params.set('auth', options.authMode);
  }

  if (options?.tab) {
    params.set('tab', options.tab);
  }

  if (options?.extraParams) {
    Object.entries(options.extraParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

type NavigationListener = (route: RouteState) => void;
const listeners = new Set<NavigationListener>();

/**
 * Subscribes a listener to browser history navigation changes (e.g. popstate / Back / Forward)
 */
export function subscribeToRoute(callback: NavigationListener): () => void {
  listeners.add(callback);

  if (typeof window !== 'undefined' && listeners.size === 1) {
    window.addEventListener('popstate', handlePopState);
  }

  return () => {
    listeners.delete(callback);
    if (typeof window !== 'undefined' && listeners.size === 0) {
      window.removeEventListener('popstate', handlePopState);
    }
  };
}

function handlePopState() {
  const currentRoute = parseCurrentLocation();
  listeners.forEach((listener) => {
    try {
      listener(currentRoute);
    } catch (err) {
      console.error('Route listener error:', err);
    }
  });
}

/**
 * Navigates to a new page using HTML5 History API without reloading the page.
 * Updates browser URL cleanly and notifies all active route listeners.
 */
export function navigateTo(
  page: PageId,
  options?: {
    replace?: boolean;
    authMode?: 'choice' | 'login';
    noticeId?: string;
    token?: string;
    tab?: string;
    extraParams?: Record<string, string>;
  }
): void {
  const targetUrl = buildCanonicalUrl(page, options);

  if (typeof window !== 'undefined') {
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== targetUrl) {
      if (options?.replace) {
        window.history.replaceState({ page, ...options }, '', targetUrl);
      } else {
        window.history.pushState({ page, ...options }, '', targetUrl);
      }
    }
  }

  const newRoute: RouteState = {
    page,
    authMode: options?.authMode || (page === 'student-login' ? 'login' : 'choice'),
    noticeId: options?.noticeId,
    token: options?.token,
    tab: options?.tab,
  };

  listeners.forEach((listener) => {
    try {
      listener(newRoute);
    } catch (err) {
      console.error('Route listener error:', err);
    }
  });
}
