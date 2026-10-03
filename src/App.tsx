/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { PageId, Notice } from './types';
import { NOTICES_DATA } from './data/mockData';
import { Header } from './components/Header';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { ViewLoadingSkeleton } from './components/ViewLoadingSkeleton';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { seedInitialDataIfEmpty } from './services/firebaseService';
import { getCurrentAdminSession } from './services/adminService';
import { runFirestoreBackendHealthTest } from './services/backendHealthTest';
import { 
  parseCurrentLocation, 
  navigateTo, 
  subscribeToRoute,
  PAGE_TO_CANONICAL_PATH 
} from './services/routerService';

// Eagerly loaded primary landing view for instant first paint
import { HomeView } from './views/HomeView';

// Route-Level Code Splitting: Lazy-load subpages & heavy administrative consoles on demand
const InstitutionView = lazy(() => import('./views/InstitutionView').then(m => ({ default: m.InstitutionView })));
const AcademicsView = lazy(() => import('./views/AcademicsView').then(m => ({ default: m.AcademicsView })));
const AdmissionsView = lazy(() => import('./views/AdmissionsView').then(m => ({ default: m.AdmissionsView })));
const ResultsView = lazy(() => import('./views/ResultsView').then(m => ({ default: m.ResultsView })));
const NoticeBoardView = lazy(() => import('./views/NoticeBoardView').then(m => ({ default: m.NoticeBoardView })));
const EventsView = lazy(() => import('./views/EventsView').then(m => ({ default: m.EventsView })));
const MediaView = lazy(() => import('./views/MediaView').then(m => ({ default: m.MediaView })));
const ContactView = lazy(() => import('./views/ContactView').then(m => ({ default: m.ContactView })));
const LoginView = lazy(() => import('./views/LoginView').then(m => ({ default: m.LoginView })));
const RegisterView = lazy(() => import('./views/RegisterView').then(m => ({ default: m.RegisterView })));
const StudentPortalView = lazy(() => import('./views/StudentPortalView').then(m => ({ default: m.StudentPortalView })));
const AdminLoginView = lazy(() => import('./views/AdminLoginView').then(m => ({ default: m.AdminLoginView })));
const AdminDashboardView = lazy(() => import('./views/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const VerifyStudentView = lazy(() => import('./views/VerifyStudentView').then(m => ({ default: m.VerifyStudentView })));

import { AdminRouteGuard } from './components/AdminRouteGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Lock } from 'lucide-react';

function AppContent() {
  // Parse initial route from browser URL directly
  const initialRoute = parseCurrentLocation();
  const [currentPage, setCurrentPage] = useState<PageId>(initialRoute.page);
  const [studentAuthMode, setStudentAuthMode] = useState<'choice' | 'login'>(initialRoute.authMode || 'choice');
  const [activeToken, setActiveToken] = useState<string>(initialRoute.token || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Notice Modal State
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [selectedNoticeForReader, setSelectedNoticeForReader] = useState<Notice | null>(() => {
    if (initialRoute.noticeId) {
      return NOTICES_DATA.find((n) => n.id === initialRoute.noticeId) || null;
    }
    return null;
  });

  // Firebase Auth Context
  const { user, studentProfile, logout } = useAuth();

  // Listen to browser Back / Forward buttons (popstate)
  useEffect(() => {
    const unsubscribe = subscribeToRoute((route) => {
      setCurrentPage(route.page);
      if (route.authMode) {
        setStudentAuthMode(route.authMode);
      }
      if (route.token !== undefined) {
        setActiveToken(route.token);
      }
      if (route.noticeId) {
        const found = NOTICES_DATA.find((n) => n.id === route.noticeId);
        if (found) setSelectedNoticeForReader(found);
      }
    });

    return unsubscribe;
  }, []);

  // Intercept relative <a> anchor clicks globally for instant SPA client-side routing
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
        return;
      }

      if (target.target === '_blank' || target.getAttribute('rel')?.includes('external')) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin && !url.pathname.startsWith('/api/')) {
          e.preventDefault();
          const parsed = parseCurrentLocation(url.pathname, url.search);
          handleNavigate(parsed.page, parsed.authMode, {
            token: parsed.token,
            noticeId: parsed.noticeId,
          });
        }
      } catch {
        // Fallback to default browser behavior for non-standard URLs
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Real Firestore Backend Health Verification (writes system/backendHealth to cloud Firestore)
  useEffect(() => {
    runFirestoreBackendHealthTest().then((res) => {
      if (res.success) {
        console.log('✅ [Firestore Backend Health]: Successfully wrote and verified system/backendHealth in cloud database!', res.data);
      } else {
        console.warn('ℹ️ [Firestore Backend Health Status]:', res.errorCode, res.error);
      }
    });
  }, []);

  // Seed Firestore data if the project is brand new
  useEffect(() => {
    seedInitialDataIfEmpty().catch(() => {});
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Dynamic SEO & Meta Tags Injector for Search Engine Indexing (per applet-seo guidelines)
  useEffect(() => {
    const seoMap: Record<PageId, { title: string; description: string }> = {
      home: {
        title: 'DAR - E - ARQAM School Katlang Campus – Official Portal & Admissions',
        description: 'Official website of DAR - E - ARQAM School Katlang Campus. Admissions 2026-2027, academic programs, student portal login, exam results, and circulars.',
      },
      about: {
        title: 'About Institution – DAR - E - ARQAM School Katlang Campus',
        description: 'Discover the rich heritage, vision, mission, and expert faculty of DAR - E - ARQAM School Katlang Campus.',
      },
      'principal-message': {
        title: "Principal's Address – DAR - E - ARQAM School Katlang Campus",
        description: 'Read the official address from the Principal of DAR - E - ARQAM School Katlang Campus on academic discipline and moral education.',
      },
      'vision-mission': {
        title: 'Vision & Core Values – DAR - E - ARQAM School Katlang Campus',
        description: 'Explore the founding vision, mission statement, and core moral values of DAR - E - ARQAM Educational System.',
      },
      administration: {
        title: 'Administration & Directorate – DAR - E - ARQAM School Katlang Campus',
        description: 'Meet the executive administration, campus managers, and academic coordinators of DAR - E - ARQAM Katlang Campus.',
      },
      faculty: {
        title: 'Faculty & Educators – DAR - E - ARQAM School Katlang Campus',
        description: 'Meet our qualified and dedicated faculty members across junior, middle, matriculation, and higher secondary wings.',
      },
      departments: {
        title: 'Academic Departments – DAR - E - ARQAM School Katlang Campus',
        description: 'Explore science laboratories, computer IT labs, Hifz wing, and sports departments at DAR - E - ARQAM.',
      },
      'academic-programs': {
        title: 'Academic Programs & Streams – DAR - E - ARQAM School Katlang Campus',
        description: 'Comprehensive academic programs from primary grades through Matric and HSSC Pre-Medical, Pre-Engineering, and ICS.',
      },
      classes: {
        title: 'Classes & Curriculum – DAR - E - ARQAM School Katlang Campus',
        description: 'Class-wise breakdown of curriculum, subjects, and learning milestones from Junior to Higher Secondary wings.',
      },
      'academic-calendar': {
        title: 'Academic Calendar & Term Dates – DAR - E - ARQAM School Katlang Campus',
        description: 'View term schedules, examination dates, sports weeks, and public holidays for the 2026-2027 academic year.',
      },
      examination: {
        title: 'Examination Rules & Board Standards – DAR - E - ARQAM School Katlang Campus',
        description: 'Board examination guidelines, term test policies, grading criteria, and promotion rules.',
      },
      syllabus: {
        title: 'Syllabus & Study Guides – DAR - E - ARQAM School Katlang Campus',
        description: 'Download class-wise curriculum syllabus, term outlines, and reading material.',
      },
      results: {
        title: 'Examination Results & Gazette – DAR - E - ARQAM School Katlang Campus',
        description: 'Verify student term and board examination results, term grades, and academic performance online securely.',
      },
      'admission-info': {
        title: 'Admissions 2026-2027 Information – DAR - E - ARQAM School Katlang Campus',
        description: 'Information regarding admissions for session 2026-2027, entry test dates, and seat availability.',
      },
      eligibility: {
        title: 'Admission Eligibility Criteria – DAR - E - ARQAM School Katlang Campus',
        description: 'Review age limits, previous class grade requirements, and admission test criteria for prospective students.',
      },
      'admission-process': {
        title: 'Admission Process & Steps – DAR - E - ARQAM School Katlang Campus',
        description: 'Step-by-step admission procedure from registration and entry test to merit list and enrollment.',
      },
      'required-documents': {
        title: 'Required Admission Documents – DAR - E - ARQAM School Katlang Campus',
        description: 'List of documents required for admission enrollment including B-Form, previous school leaving certificate, and passport photos.',
      },
      'fee-structure': {
        title: 'Fee Structure 2026-2027 – DAR - E - ARQAM School Katlang Campus',
        description: 'Transparent tuition fee structure, admission charges, lab fees, and scholarship concessions.',
      },
      'apply-admission': {
        title: 'Apply Online for Admission – DAR - E - ARQAM School Katlang Campus',
        description: 'Submit your online admission application form for session 2026-2027 at DAR - E - ARQAM School Katlang Campus.',
      },
      notices: {
        title: 'Official Circulars & Notice Board – DAR - E - ARQAM School Katlang Campus',
        description: 'Read official directorate circulars, exam dates, holiday notifications, and important school announcements.',
      },
      'notice-detail': {
        title: 'Notice Details – DAR - E - ARQAM School Katlang Campus',
        description: 'View full notice details, circular attachments, and instructions from the school directorate.',
      },
      events: {
        title: 'Upcoming Events & Calendar – DAR - E - ARQAM School Katlang Campus',
        description: 'Stay updated with upcoming school events, sports galas, science fairs, and parent-teacher meetings.',
      },
      news: {
        title: 'Latest Institutional News – DAR - E - ARQAM School Katlang Campus',
        description: 'Read the latest news, student achievements, campus updates, and co-curricular highlights.',
      },
      gallery: {
        title: 'Campus Photo Gallery – DAR - E - ARQAM School Katlang Campus',
        description: 'Browse campus photo gallery featuring campus buildings, science labs, library, and student activities.',
      },
      downloads: {
        title: 'Downloads & Forms – DAR - E - ARQAM School Katlang Campus',
        description: 'Download fee challans, leave application forms, syllabus outlines, and official school circular PDFs.',
      },
      contact: {
        title: 'Contact Secretariat – DAR - E - ARQAM School Katlang Campus',
        description: 'Get in touch with DAR - E - ARQAM School Katlang Campus administration, office hours, helpline phone, and campus location.',
      },
      'student-login': {
        title: 'Student Portal Login – DAR - E - ARQAM School Katlang Campus',
        description: 'Secure student portal login for students and parents to check attendance, assignments, fee status, and report cards.',
      },
      'student-register': {
        title: 'Student Portal Registration – DAR - E - ARQAM School Katlang Campus',
        description: 'Register for student portal access to track academic progress and school notifications.',
      },
      'student-portal': {
        title: 'Student Portal Dashboard – DAR - E - ARQAM School Katlang Campus',
        description: 'Access your student dashboard for attendance records, grades, fee receipts, and notices.',
      },
      'admin-login': {
        title: 'Directorate Admin Login – DAR - E - ARQAM School Katlang Campus',
        description: 'Authorized login for school administrators and directorate staff.',
      },
      'admin-dashboard': {
        title: 'Directorate Admin Console – DAR - E - ARQAM School Katlang Campus',
        description: 'Authorized executive admin dashboard for managing campus branding, notices, results, and admissions.',
      },
      'super-admin-dashboard': {
        title: 'Super Admin Master Control – DAR - E - ARQAM School Katlang Campus',
        description: 'Authorized website owner master control console for global branding, logos, and cover banners.',
      },
      'verify-student': {
        title: 'Student Identity Verification – DAR - E - ARQAM School Katlang Campus',
        description: 'Official student QR code identity verification system by Dar-e-Arqam School Katlang Campus.',
      },
    };

    const currentSeo = seoMap[currentPage] || seoMap.home;
    document.title = currentSeo.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', currentSeo.description);

    // Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', currentSeo.title);
    if (!ogTitle.parentNode) document.head.appendChild(ogTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    ogDesc.setAttribute('content', currentSeo.description);
    if (!ogDesc.parentNode) document.head.appendChild(ogDesc);

    const ogUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    ogUrl.setAttribute('content', window.location.href);
    if (!ogUrl.parentNode) document.head.appendChild(ogUrl);

    // Update Twitter Cards
    const twTitle = document.querySelector('meta[name="twitter:title"]') || document.createElement('meta');
    twTitle.setAttribute('name', 'twitter:title');
    twTitle.setAttribute('content', currentSeo.title);
    if (!twTitle.parentNode) document.head.appendChild(twTitle);

    const twDesc = document.querySelector('meta[name="twitter:description"]') || document.createElement('meta');
    twDesc.setAttribute('name', 'twitter:description');
    twDesc.setAttribute('content', currentSeo.description);
    if (!twDesc.parentNode) document.head.appendChild(twDesc);

    // Schema.org JSON-LD
    let ldScript = document.getElementById('schema-json-ld');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'schema-json-ld';
      ldScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'School',
      'name': 'DAR - E - ARQAM School Katlang Campus',
      'description': currentSeo.description,
      'url': window.location.origin,
      'telephone': '+92-937-567890',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Katlang Road, Mardan',
        'addressLocality': 'Katlang',
        'addressRegion': 'Khyber Pakhtunkhwa',
        'addressCountry': 'PK',
      },
    });
  }, [currentPage]);

  const handleNavigate = (
    page: PageId, 
    authMode?: 'choice' | 'login',
    options?: { token?: string; noticeId?: string; replace?: boolean }
  ) => {
    const chosenAuthMode = authMode || (page === 'student-login' ? 'login' : 'choice');
    if (authMode) {
      setStudentAuthMode(authMode);
    } else if (page === 'student-login' || page === 'student-portal') {
      setStudentAuthMode(chosenAuthMode);
    }

    if (options?.token) {
      setActiveToken(options.token);
    }

    setCurrentPage(page);

    // If navigating to notice board without a specific noticeId, reset individual reader
    if (page === 'notices' && !options?.noticeId) {
      setSelectedNoticeForReader(null);
    }

    // Update browser URL cleanly via HTML5 History API
    navigateTo(page, {
      authMode: chosenAuthMode,
      token: options?.token || (page === 'verify-student' ? activeToken : undefined),
      noticeId: options?.noticeId,
      replace: options?.replace,
    });
  };

  const handleSelectNoticeFromList = (notice: Notice) => {
    setSelectedNoticeForReader(notice);
    handleNavigate('notices', undefined, { noticeId: notice.id });
  };

  const handleOpenNoticeModal = (notice: Notice) => {
    setActiveNoticeModal(notice);
    setIsNoticeModalOpen(true);
  };

  const handleModalViewDetails = (notice: Notice) => {
    setSelectedNoticeForReader(notice);
    handleNavigate('notices', undefined, { noticeId: notice.id });
  };

  // Determine subview tab mapping
  const renderCurrentView = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeView
            onNavigate={handleNavigate}
            onSelectNotice={handleOpenNoticeModal}
          />
        );

      // Institution Subpages
      case 'about':
        return <InstitutionView initialTab="about" onNavigate={handleNavigate} />;
      case 'principal-message':
        return <InstitutionView initialTab="principal" onNavigate={handleNavigate} />;
      case 'vision-mission':
        return <InstitutionView initialTab="vision" onNavigate={handleNavigate} />;
      case 'administration':
        return <InstitutionView initialTab="admin" onNavigate={handleNavigate} />;
      case 'faculty':
        return <InstitutionView initialTab="faculty" onNavigate={handleNavigate} />;
      case 'departments':
        return <InstitutionView initialTab="departments" onNavigate={handleNavigate} />;

      // Academics Subpages
      case 'academic-programs':
        return <AcademicsView initialTab="programs" onNavigate={handleNavigate} />;
      case 'classes':
        return <AcademicsView initialTab="classes" onNavigate={handleNavigate} />;
      case 'academic-calendar':
        return <AcademicsView initialTab="calendar" onNavigate={handleNavigate} />;
      case 'examination':
        return <AcademicsView initialTab="examination" onNavigate={handleNavigate} />;
      case 'syllabus':
        return <AcademicsView initialTab="syllabus" onNavigate={handleNavigate} />;

      // Results
      case 'results':
        return <ResultsView onNavigate={handleNavigate} />;

      // Admissions Subpages
      case 'admission-info':
        return <AdmissionsView initialTab="info" onNavigate={handleNavigate} />;
      case 'eligibility':
        return <AdmissionsView initialTab="eligibility" onNavigate={handleNavigate} />;
      case 'admission-process':
        return <AdmissionsView initialTab="process" onNavigate={handleNavigate} />;
      case 'required-documents':
        return <AdmissionsView initialTab="documents" onNavigate={handleNavigate} />;
      case 'fee-structure':
        return <AdmissionsView initialTab="fees" onNavigate={handleNavigate} />;
      case 'apply-admission':
        return <AdmissionsView initialTab="apply" onNavigate={handleNavigate} />;

      // Notices
      case 'notices':
      case 'notice-detail':
        return (
          <NoticeBoardView
            selectedNotice={selectedNoticeForReader}
            onSelectNotice={setSelectedNoticeForReader}
            onNavigate={handleNavigate}
          />
        );

      // Events
      case 'events':
        return <EventsView onNavigate={handleNavigate} />;

      // Media Subpages
      case 'news':
        return <MediaView initialTab="news" onNavigate={handleNavigate} />;
      case 'gallery':
        return <MediaView initialTab="gallery" onNavigate={handleNavigate} />;
      case 'downloads':
        return <MediaView initialTab="downloads" onNavigate={handleNavigate} />;

      // Contact
      case 'contact':
        return <ContactView onNavigate={handleNavigate} />;

      // Student QR Identity Verification
      case 'verify-student':
        return (
          <VerifyStudentView
            initialToken={activeToken}
            onNavigate={handleNavigate}
          />
        );

      // Authentication & Student Portal
      case 'student-login':
        // If already logged in, take directly to student portal
        if (user) {
          return (
            <StudentPortalView
              onNavigate={handleNavigate}
              onSelectNotice={handleSelectNoticeFromList}
              studentProfile={studentProfile}
              onLogout={async () => {
                await logout();
                handleNavigate('home');
              }}
            />
          );
        }
        return (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('student-portal')}
            initialMode={studentAuthMode}
          />
        );
      case 'student-register':
        return <RegisterView onNavigate={handleNavigate} />;
      case 'student-portal':
        // Unauthenticated users are presented with the authentication screen
        if (!user) {
          return (
            <LoginView
              onNavigate={handleNavigate}
              onLoginSuccess={() => handleNavigate('student-portal')}
              initialMode="choice"
            />
          );
        }
        // Authenticated users view their student dashboard and official ID Card
        return (
          <StudentPortalView
            onNavigate={handleNavigate}
            onSelectNotice={handleSelectNoticeFromList}
            studentProfile={studentProfile}
            onLogout={async () => {
              await logout();
              handleNavigate('home');
            }}
          />
        );

      // Directorate Administration (Admin Console)
      case 'admin-login':
        return (
          <AdminLoginView
            onNavigate={handleNavigate}
            onLoginSuccess={() => {
              handleNavigate('admin-dashboard');
            }}
          />
        );

      case 'admin-dashboard':
      case 'super-admin-dashboard': {
        return (
          <AdminRouteGuard onNavigate={handleNavigate}>
            <AdminDashboardView
              onNavigate={handleNavigate}
              onLogout={() => handleNavigate('home')}
            />
          </AdminRouteGuard>
        );
      }

      default:
        return (
          <HomeView
            onNavigate={handleNavigate}
            onSelectNotice={handleOpenNoticeModal}
          />
        );
    }
  };

  // If viewing the standalone Directorate Admin Dashboard, render protected via AdminRouteGuard
  if (currentPage === 'admin-dashboard' || currentPage === 'super-admin-dashboard') {
    return (
      <Suspense fallback={<ViewLoadingSkeleton />}>
        <AdminRouteGuard onNavigate={handleNavigate}>
          <AdminDashboardView
            onNavigate={handleNavigate}
            onLogout={() => handleNavigate('home')}
          />
        </AdminRouteGuard>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF2F8] text-[#0F1035] selection:bg-[#20216B] selection:text-[#FFF000]">
      {/* 1. Official Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* 2. Slide-out Hamburger Menu Drawer */}
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* 3. Reusable Notice Modal Dialog */}
      <NoticeModal
        notice={activeNoticeModal}
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onViewDetails={handleModalViewDetails}
      />

      {/* 4. Active Page Content with Route Suspense */}
      <main className="flex-1">
        <Suspense fallback={<ViewLoadingSkeleton />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      {/* 5. Official Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrandingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrandingProvider>
    </ErrorBoundary>
  );
}

