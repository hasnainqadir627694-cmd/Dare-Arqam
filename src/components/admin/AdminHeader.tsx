import React, { useState, useRef, useEffect } from 'react';
import { Emblem } from '../Emblem';
import { AdminUser } from '../../services/adminService';
import { 
  Menu, 
  X, 
  Bell, 
  Globe, 
  ShieldCheck, 
  LogOut, 
  KeyRound, 
  UserCheck, 
  Clock, 
  ChevronDown,
  Sparkles,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { PageId } from '../../types';

interface AdminHeaderProps {
  currentSectionTitle: string;
  adminUser: AdminUser | null;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onNavigatePublic: (page: PageId) => void;
  onLogout: () => void;
  onOpenSecurity: () => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentSectionTitle,
  adminUser,
  isDrawerOpen,
  onToggleDrawer,
  onNavigatePublic,
  onLogout,
  onOpenSecurity,
  unreadCount = 3,
  canGoBack = false,
  onGoBack,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#0F1424] border-b border-[#1E293B] shadow-md px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT: Hamburger Button + DARE ARQAM branding/logo + Current page title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-label={isDrawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="p-2 text-stone-300 hover:text-[#FFF000] bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer shadow-2xs active:scale-95"
          >
            {isDrawerOpen ? (
              <X className="w-5 h-5 text-[#FFF000]" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Quick Back Button when in a sub-section */}
          {canGoBack && onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              aria-label="Go back to previous section"
              title="Go back to previous section"
              className="px-2.5 py-1.5 text-xs font-semibold text-stone-200 hover:text-[#FFF000] bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] hover:border-[#D4AF37]/60 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#FFF000]" />
              <span className="hidden xs:inline sm:inline">Back</span>
            </button>
          )}

          {/* DARE ARQAM Branding / Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Emblem 
              size="sm" 
              className="!w-9 !h-9 sm:!w-10 sm:!h-10 ring-1 ring-[#D4AF37]/50 drop-shadow-sm select-none" 
            />
            <div className="hidden md:flex flex-col justify-center">
              <span className="font-editorial text-sm font-bold tracking-wide text-white leading-tight">
                DAR - E - ARQAM
              </span>
              <span className="text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase font-semibold leading-none">
                Administration
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-stone-700/60 hidden sm:block shrink-0" />

          {/* Current Page / Section Title */}
          <div className="min-w-0">
            <h1 className="font-editorial text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate">
              {currentSectionTitle}
            </h1>
          </div>
        </div>

        {/* RIGHT: Notifications + Public View + Admin Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick link: View Public Website */}
          <button
            type="button"
            onClick={() => onNavigatePublic('home')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] rounded-lg transition-colors cursor-pointer"
            title="Open Public Website in Preview"
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Public Site</span>
          </button>

          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-stone-300 hover:text-[#FFF000] bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] rounded-lg transition-colors cursor-pointer"
              aria-label="View Administrative Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#0F1424] text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#161B30] border border-[#263352] rounded-xl shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#263352]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>System Alerts & Notifications</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                    Live
                  </span>
                </div>

                <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto divide-y divide-[#263352]/40">
                  <div className="pt-1.5 pb-1">
                    <p className="font-semibold text-stone-200">New Admission Application</p>
                    <p className="text-[11px] text-stone-400 font-prose-serif">Candidate Muhammad Bilal submitted for Class IX.</p>
                    <span className="text-[10px] text-stone-500 font-mono">12m ago</span>
                  </div>
                  <div className="pt-1.5 pb-1">
                    <p className="font-semibold text-stone-200">Admissions Merit Verification</p>
                    <p className="text-[11px] text-stone-400 font-prose-serif">Entry assessment scores ready for review.</p>
                    <span className="text-[10px] text-stone-500 font-mono">1h ago</span>
                  </div>
                  <div className="pt-1.5 pb-1">
                    <p className="font-semibold text-stone-200">Cloud CDN Synchronized</p>
                    <p className="text-[11px] text-stone-400 font-prose-serif">Hero banner & circular assets active.</p>
                    <span className="text-[10px] text-stone-500 font-mono">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile / Account Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] rounded-lg transition-colors cursor-pointer text-left"
              aria-label="Open Administrator Profile Menu"
            >
              <div className="w-6 h-6 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                  {adminUser?.email.split('@')[0] || 'Administrator'}
                </div>
                <div className="text-[10px] font-mono text-[#D4AF37] leading-none">
                  {adminUser?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Directorate'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#161B30] border border-[#263352] rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95">
                {/* Admin info header */}
                <div className="pb-2.5 border-b border-[#263352]">
                  <div className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
                    Authenticated Session
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5 truncate">
                    {adminUser?.email || 'darearqam@mardan.com'}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-1 mt-1">
                    <ShieldCheck className="w-3 h-3 text-[#16A34A]" />
                    <span>Role: {adminUser?.role || 'SUPER_ADMIN'}</span>
                  </div>
                </div>

                {/* Quick actions inside menu */}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenSecurity();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-stone-200 hover:text-[#FFF000] hover:bg-[#1E2540] rounded-md transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Security & Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onNavigatePublic('home');
                    }}
                    className="w-full px-2.5 py-1.5 text-xs text-stone-200 hover:text-white hover:bg-[#1E2540] rounded-md transition-colors flex items-center gap-2 cursor-pointer text-left sm:hidden"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>View Public Website</span>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-2 border-t border-[#263352]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold text-red-300 hover:text-red-100 hover:bg-red-950/60 rounded-md transition-colors flex items-center gap-2 cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span>Sign Out of Admin Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
