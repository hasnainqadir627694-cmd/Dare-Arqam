import React, { useState } from 'react';
import { Emblem } from '../Emblem';
import { AdminUser } from '../../services/adminService';
import { 
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  UserPlus,
  FileCheck2,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Bell,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Download,
  BookOpen,
  Home,
  UserCheck,
  Building2,
  PhoneCall,
  Share2,
  Youtube,
  Facebook,
  MessageCircle,
  Video,
  Layers,
  FileText,
  MessageSquare,
  Shield,
  KeyRound,
  History,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  IdCard
} from 'lucide-react';

export type AdminSectionKey =
  | 'dashboard'
  // Student Management
  | 'classes'
  | 'id-card-template'
  | 'students'
  | 'student-profiles'
  | 'attendance'
  | 'academic-records'
  | 'results'
  // Admissions
  | 'admissions'
  | 'admissions-pending'
  | 'admissions-approved'
  | 'admissions-rejected'
  // Website Management
  | 'notices'
  | 'news'
  | 'events'
  | 'gallery'
  | 'downloads'
  | 'academic-info'
  | 'branding' // Homepage Content
  | 'leadership' // Principal's Message
  | 'about-info'
  | 'contact-info'
  // Social Media
  | 'social'
  | 'social-youtube'
  | 'social-facebook'
  | 'social-tiktok'
  | 'social-whatsapp'
  // Academics
  | 'classes'
  | 'sections'
  | 'subjects'
  | 'academic-calendar'
  | 'examination-schedule'
  | 'syllabus'
  // Documents
  | 'documents'
  | 'forms'
  | 'circulars'
  | 'prospectus'
  | 'fee-structure'
  // Administration
  | 'admin-profile'
  | 'settings'
  | 'security'
  | 'audit-log';

interface AdminNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: AdminSectionKey;
  onSelectSection: (section: AdminSectionKey) => void;
  adminUser: AdminUser | null;
  onLogout: () => void;
  badgeCounts?: {
    pendingAdmissions?: number;
    unreadInquiries?: number;
    totalNotices?: number;
  };
}

export const AdminNavigationDrawer: React.FC<AdminNavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeSection,
  onSelectSection,
  adminUser,
  onLogout,
  badgeCounts = { pendingAdmissions: 2, unreadInquiries: 1, totalNotices: 4 }
}) => {
  // Collapsible category state: all open or user toggleable
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    students: true,
    admissions: true,
    website: true,
    social: false,
    academics: false,
    documents: false,
    admin: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleItemClick = (section: AdminSectionKey) => {
    onSelectSection(section);
    // On mobile devices, close the drawer automatically for convenience
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div 
        className="relative z-10 w-full max-w-xs sm:max-w-sm bg-[#0F1424] border-r border-[#1E293B] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Administration Directory"
      >
        {/* 1. Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#161B30] border-b border-[#263352] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Emblem size="sm" className="!w-10 !h-10 shrink-0 ring-1 ring-[#D4AF37]/50" />
            <div>
              <div className="font-editorial text-base font-bold text-white tracking-wide">
                DAR - E - ARQAM
              </div>
              <div className="text-[11px] font-mono text-[#D4AF37] tracking-wider uppercase font-semibold">
                Administration Panel
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-[#1E2540] rounded-lg transition-colors cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Admin Profile Summary */}
        <div className="px-4 py-3 bg-[#111628] border-b border-[#1E293B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-white truncate text-xs">
                {adminUser?.email || 'darearqam@mardan.com'}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                {adminUser?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Executive Admin'}
              </div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" title="Active Session" />
        </div>

        {/* 3. Categorized Navigation Drawer Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3 divide-y divide-[#1E293B]/60 text-xs">
          {/* DASHBOARD (Overview) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleItemClick('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'bg-gradient-to-r from-[#20216B] to-[#292A86] text-[#FFF000] border-l-3 border-[#D4AF37] shadow-sm font-bold'
                  : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${activeSection === 'dashboard' ? 'text-[#FFF000]' : 'text-stone-400'}`} />
                <span className="tracking-wide">DASHBOARD</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#161B30] text-[#FFF000] border border-[#D4AF37]/40">
                Overview
              </span>
            </button>
          </div>

          {/* 1. MANAGEMENT (Website Customization & Content Control) */}
          <div className="pt-3 space-y-1">
            <button
              type="button"
              onClick={() => toggleCategory('website')}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#D4AF37] hover:text-[#FFF000] uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>MANAGEMENT</span>
              </span>
              {openCategories.website ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            {openCategories.website && (
              <div className="space-y-0.5 pl-2">
                {/* Customize Logo */}
                <button
                  type="button"
                  onClick={() => handleItemClick('branding')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'branding'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <ImageIcon className={`w-3.5 h-3.5 ${activeSection === 'branding' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                  <span>Customize Logo</span>
                </button>

                {/* Update Principal Message */}
                <button
                  type="button"
                  onClick={() => handleItemClick('leadership')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'leadership'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 ${activeSection === 'leadership' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                  <span>Update Principal Message</span>
                </button>

                {/* Social Media Management */}
                <button
                  type="button"
                  onClick={() => handleItemClick('social')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'social'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Globe className={`w-3.5 h-3.5 ${activeSection === 'social' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                  <span>Social Media Management</span>
                </button>

                {/* Homepage Gallery */}
                <button
                  type="button"
                  onClick={() => handleItemClick('gallery')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'gallery'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <ImageIcon className={`w-3.5 h-3.5 ${activeSection === 'gallery' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                  <span>Homepage Gallery</span>
                </button>

                {/* Notices & Circulars */}
                <button
                  type="button"
                  onClick={() => handleItemClick('notices')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'notices'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className={`w-3.5 h-3.5 ${activeSection === 'notices' ? 'text-[#FFF000]' : 'text-stone-400'}`} />
                    <span>Notices & Circulars</span>
                  </span>
                  {badgeCounts.totalNotices ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
                      {badgeCounts.totalNotices}
                    </span>
                  ) : null}
                </button>

                {/* News */}
                <button
                  type="button"
                  onClick={() => handleItemClick('news')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'news'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 text-stone-400" />
                  <span>News & Press Releases</span>
                </button>

                {/* Events */}
                <button
                  type="button"
                  onClick={() => handleItemClick('events')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'events'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Events & Academic Calendar</span>
                </button>

                {/* Media Gallery */}
                <button
                  type="button"
                  onClick={() => handleItemClick('gallery')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'gallery'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                  <span>Photo & Media Gallery</span>
                </button>

                {/* Downloads */}
                <button
                  type="button"
                  onClick={() => handleItemClick('downloads')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'downloads'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                  <span>Downloads & Circular PDFs</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. EXAMINATION & STUDENT RECORDS */}
          <div className="pt-3 space-y-1">
            <button
              type="button"
              onClick={() => toggleCategory('students')}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>EXAMINATIONS & STUDENTS</span>
              </span>
              {openCategories.students ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openCategories.students && (
              <div className="space-y-0.5 pl-2">
                {/* Classes & Student Management */}
                <button
                  type="button"
                  onClick={() => handleItemClick('classes')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'classes'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <GraduationCap className={`w-3.5 h-3.5 ${activeSection === 'classes' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                    <span>Classes & Enrolled Students</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-1.5 py-0.2 rounded border border-[#D4AF37]/40 font-bold">
                    13 Classes
                  </span>
                </button>

                {/* ID Card Template Studio */}
                <button
                  type="button"
                  onClick={() => handleItemClick('id-card-template')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'id-card-template'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IdCard className={`w-3.5 h-3.5 ${activeSection === 'id-card-template' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                    <span>ID Card Template</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-1.5 py-0.2 rounded border border-[#D4AF37]/40 font-bold">
                    Design
                  </span>
                </button>

                {/* Examination Results */}
                <button
                  type="button"
                  onClick={() => handleItemClick('results')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'results'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37] shadow-xs'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Award className={`w-3.5 h-3.5 ${activeSection === 'results' ? 'text-[#FFF000]' : 'text-[#D4AF37]'}`} />
                    <span>Examination Results</span>
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">Database</span>
                </button>

                {/* Students Management */}
                <button
                  type="button"
                  onClick={() => handleItemClick('students')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'students'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>Student Directory</span>
                </button>

                {/* Attendance */}
                <button
                  type="button"
                  onClick={() => handleItemClick('attendance')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'attendance'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>Attendance & Records</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. ADMISSIONS */}
          <div className="pt-3 space-y-1">
            <button
              type="button"
              onClick={() => toggleCategory('admissions')}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ADMISSIONS</span>
              </span>
              <div className="flex items-center gap-1.5">
                {badgeCounts.pendingAdmissions && badgeCounts.pendingAdmissions > 0 ? (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40 font-bold">
                    {badgeCounts.pendingAdmissions} new
                  </span>
                ) : null}
                {openCategories.admissions ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
            </button>

            {openCategories.admissions && (
              <div className="space-y-0.5 pl-2">
                <button
                  type="button"
                  onClick={() => handleItemClick('admissions')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'admissions'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Applications (All)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('admissions-pending')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'admissions-pending'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pending Applications</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    {badgeCounts.pendingAdmissions || 2}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('admissions-approved')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'admissions-approved'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approved Applications</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('admissions-rejected')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'admissions-rejected'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Rejected Applications</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. PUBLIC INQUIRIES & CONTACT */}
          <div className="pt-3 space-y-1">
            <button
              type="button"
              onClick={() => handleItemClick('contact-info')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeSection === 'contact-info'
                  ? 'bg-[#20216B] text-[#FFF000] border-l-3 border-[#D4AF37] shadow-xs'
                  : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquare className={`w-3.5 h-3.5 ${activeSection === 'contact-info' ? 'text-[#FFF000]' : 'text-blue-400'}`} />
                <span>Public Inquiries & Contact</span>
              </span>
              {badgeCounts.unreadInquiries ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {badgeCounts.unreadInquiries} new
                </span>
              ) : null}
            </button>
          </div>

          {/* 5. ADMINISTRATION & SECURITY */}
          <div className="pt-3 space-y-1">
            <button
              type="button"
              onClick={() => toggleCategory('admin')}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>ADMINISTRATION & SECURITY</span>
              </span>
              {openCategories.admin ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openCategories.admin && (
              <div className="space-y-0.5 pl-2">
                <button
                  type="button"
                  onClick={() => handleItemClick('security')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'security'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Security & Password Credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('settings')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'settings'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-stone-400" />
                  <span>Directorate Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleItemClick('audit-log')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                    activeSection === 'audit-log'
                      ? 'bg-[#20216B] text-[#FFF000] font-semibold border-l-2 border-[#D4AF37]'
                      : 'text-stone-300 hover:bg-[#161B30] hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-stone-400" />
                  <span>Activity / Audit Log</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* 4. Bottom Logout Row */}
        <div className="p-3.5 bg-[#111628] border-t border-[#1E293B]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-red-300 hover:text-red-100 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>LOGOUT FROM DIRECTORATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
