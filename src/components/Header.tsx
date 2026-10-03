import React from 'react';
import { PageId } from '../types';
import { Menu, Phone, User, Award, Bell, GraduationCap, ShieldCheck } from 'lucide-react';
import { Emblem } from './Emblem';
import { INSTITUTION_INFO } from '../data/mockData';
import { useBranding } from '../context/BrandingContext';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenMenu,
}) => {
  const { institutionName, tagline } = useBranding();

  return (
    <header className="sticky top-0 z-40 bg-[#171852] border-b border-[#292A86] shadow-lg">
      {/* Top Institutional Trust Bar (Desktop & Tablet) */}
      <div className="bg-[#10113D] text-[#EEF0FF] text-xs py-1 px-4 sm:px-6 hidden sm:block border-b border-[#292A86]/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000]" />
            <span className="font-semibold text-white/90 text-[11px] tracking-wide">
              Verified · BISE Registered
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a href={`tel:${INSTITUTION_INFO.phone}`} className="flex items-center gap-1.5 text-white/90 hover:text-[#FFF000] transition-colors" title="Emergency Helpdesk">
              <Phone className="w-3 h-3 text-[#FFF000]" />
              <span className="font-medium">{INSTITUTION_INFO.phone}</span>
            </a>
            <span className="text-[#292A86]">|</span>
            <button
              onClick={() => onNavigate('results')}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentPage === 'results' ? 'text-[#FFF000] font-bold' : 'text-white/80 hover:text-[#FFF000]'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#FFF000]" />
              <span>Results</span>
            </button>
            <span className="text-[#292A86]">|</span>
            <button
              onClick={() => onNavigate('student-login')}
              className={`font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentPage === 'student-login' || currentPage === 'student-portal'
                  ? 'text-[#FFF000]'
                  : 'text-white/90 hover:text-[#FFF000]'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#FFF000]" />
              <span>Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Row - Classic Royal Header with Radiant Neon Logo */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Emblem + Institution Name + Subtitle */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left group focus:outline-hidden focus:ring-2 focus:ring-[#FFF000] rounded-xl p-1 min-w-0 cursor-pointer"
          aria-label="Go to DAR - E - ARQAM Home"
        >
          <Emblem 
            size="md" 
            neonGlow
            className="!w-11 !h-11 sm:!w-13 sm:!h-13 group-hover:scale-105 transition-all drop-shadow-md shrink-0 ring-2 ring-[#FFF000]" 
          />
          
          <div className="flex flex-col min-w-0 justify-center">
            <div className="flex items-baseline gap-2 leading-tight">
              <span className="font-editorial text-[17px] sm:text-2xl md:text-[25px] font-extrabold tracking-tight text-white group-hover:text-[#FFF9B8] transition-colors truncate">
                {institutionName}
              </span>
              <span className="hidden md:inline-block text-[10.5px] font-mono text-[#F5D900] font-bold">
                (EST. 1998)
              </span>
            </div>
            <span className="text-[11.5px] sm:text-[13px] md:text-[14px] font-bold text-[#FFF000] tracking-[0.05em] sm:tracking-[0.08em] [word-spacing:0.12em] sm:[word-spacing:0.18em] leading-tight mt-0.5 select-none truncate">
              {tagline}
            </span>
          </div>
        </button>

        {/* Right: Clean One-Word Icon Controls & Hamburger Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Quick 1-word Action Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => onNavigate('apply-admission')}
              className="px-3.5 py-1.5 text-xs font-extrabold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] neon-glow-gold rounded-lg transition-all shadow-md cursor-pointer active:scale-95 border border-[#F5D900] flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-[#171852]" />
              <span>Admissions</span>
            </button>
            <button
              onClick={() => onNavigate('results')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                currentPage === 'results'
                  ? 'bg-[#292A86] text-[#FFF000] border-[#FFF000] shadow-xs'
                  : 'text-white/90 hover:text-[#FFF000] bg-[#20216B]/80 hover:bg-[#292A86] border-[#F5D900]/30'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#FFF000]" />
              <span>Results</span>
            </button>
            <button
              onClick={() => onNavigate('notices')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'notices'
                  ? 'bg-[#292A86] text-[#FFF000] border border-[#F5D900]/50 shadow-xs'
                  : 'text-white/90 hover:text-[#FFF000] hover:bg-[#292A86]/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#FFF000]" />
              <span>Notices</span>
            </button>
          </div>

          {/* Clean Non-Blinking Portal Button (One-Word & Icon Focus) */}
          <button
            onClick={() => onNavigate('student-portal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer border-2 active:scale-95 shadow-md ${
              currentPage === 'student-portal' || currentPage === 'student-login'
                ? 'bg-[#FFF000] text-[#171852] border-[#FFF000]'
                : 'text-[#FFF000] bg-gradient-to-r from-[#20216B] to-[#171852] hover:bg-[#292A86] border-[#FFF000]'
            }`}
            aria-label="Student Portal"
          >
            <User className="w-4 h-4 text-[#FFF000] group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-extrabold tracking-wide">Portal</span>
          </button>

          {/* Primary Hamburger Trigger (One-word & Icon-focused) */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-[#FFF000]/60 hover:border-[#FFF000] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FFF000] transition-all cursor-pointer shadow-md active:scale-95 hover:shadow-[0_0_12px_rgba(255,240,0,0.3)]"
            aria-label="Open navigation menu"
            aria-haspopup="dialog"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFF000]" />
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Subtle Blue -> Yellow decorative line */}
      <div className="brand-gradient-line" />
    </header>
  );
};
