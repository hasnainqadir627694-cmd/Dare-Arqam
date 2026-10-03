import React from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { HomepageGallery } from '../components/HomepageGallery';
import { 
  useBranding, 
  DEFAULT_CAMPUS_BANNER, 
  DEFAULT_PRINCIPAL_PHOTO 
} from '../context/BrandingContext';
import { 
  ArrowRight, 
  ChevronRight, 
  BookOpen, 
  Moon, 
  Users, 
  Target, 
  Handshake,
  GraduationCap,
  User,
  Award,
  ShieldCheck,
  Bell,
  Calendar,
  PhoneCall,
  FileText,
  Compass,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  onSelectNotice?: (notice: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { 
    bannerUrl, 
    institutionName, 
    tagline,
    principalPhotoUrl,
    principalName,
    principalTitle,
    principalQualification,
    principalMessage,
    socialMedia
  } = useBranding();

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      {/* 1. HERO / BANNER SECTION WITH CENTER ROUND LOGO & NEON RADIANCE */}
      <section className="relative overflow-hidden bg-[#171852] border-b-2 border-[#F5D900]/50 shadow-2xl">
        {/* Background Cover Banner */}
        <div className="relative w-full h-32 sm:h-52 md:h-64 lg:h-80 bg-[#0F1035] overflow-hidden">
          <img
            src={bannerUrl || DEFAULT_CAMPUS_BANNER}
            alt="DAR - E - ARQAM Campus Hero Banner"
            className="w-full h-full object-cover object-center filter brightness-95"
            referrerPolicy="no-referrer"
          />
          {/* Smooth Bottom Blue Color Fading Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171852] via-[#171852]/60 to-transparent" />
        </div>

        {/* Hero Content Block Overlapping the Banner */}
        <div className="relative max-w-5xl mx-auto px-3 sm:px-6 pb-6 sm:pb-10 md:pb-12 text-center">
          {/* CENTER ROUND LOGO FLANKED BY URDU CALLIGRAPHY MOTTO WITH ATTRACTIVE NEON GLOW */}
          <div className="-mt-10 sm:-mt-14 md:-mt-18 lg:-mt-22 flex items-center justify-center gap-2 sm:gap-4 md:gap-8 mb-3 sm:mb-4 relative z-20 px-1 sm:px-4">
            {/* Left Box: بہترین آخرت (No text glow) */}
            <div className="flex-1 flex justify-end items-center pr-1 sm:pr-3 overflow-visible">
              <span 
                className="font-jameel-kasheeda text-base xs:text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFF000] whitespace-nowrap select-none transition-transform hover:scale-105 py-1"
                dir="rtl"
              >
                بہترین آخرت
              </span>
            </div>

            {/* Central Round Logo with Constant Non-Animated Small Glow on Border Only */}
            <div className="relative group shrink-0 z-10">
              <div className="relative rounded-full ring-2 ring-[#FFF000] shadow-[0_0_8px_rgba(255,240,0,0.65)] transition-all overflow-hidden bg-[#171852]">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden flex items-center justify-center select-none p-1">
                  <Emblem size="xl" className="!w-full !h-full" />
                </div>
              </div>
            </div>

            {/* Right Box: خوبصورت دنیا (No text glow) */}
            <div className="flex-1 flex justify-start items-center pl-1 sm:pl-3 overflow-visible">
              <span 
                className="font-jameel-kasheeda text-base xs:text-lg sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFF000] whitespace-nowrap select-none transition-transform hover:scale-105 py-1"
                dir="rtl"
              >
                خوبصورت دنیا
              </span>
            </div>
          </div>

          {/* Underneath Logo: Title, Tagline & Minimal Heritage Description */}
          <div className="space-y-2 sm:space-y-3 max-w-3xl mx-auto">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono tracking-wider uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/40 font-bold shadow-md">
              <Sparkles className="w-3 h-3 text-[#FFF000] animate-pulse" />
              <span>Registered · Est. 1998 · Katlang</span>
            </div>

            {/* Main Title */}
            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {institutionName}
            </h1>

            {/* Campus Tagline */}
            <div className="text-xs sm:text-base md:text-lg font-bold text-[#FFF000] tracking-wider uppercase [word-spacing:0.14em]">
              {tagline}
            </div>

            {/* Concise Classic Epithet */}
            <p className="text-xs sm:text-sm text-[#EEF0FF]/90 font-prose-serif leading-relaxed max-w-xl mx-auto font-normal px-2">
              Synthesizing Islamic ethical character, modern scientific inquiry, and board academic excellence.
            </p>

            {/* One-Word Icon-Centric Primary Action Tiles */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('admission-info')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 border-2 border-[#F5D900]"
              >
                <GraduationCap className="w-4 h-4 text-[#171852]" />
                <span>Admissions</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#171852]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('student-login')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#2A2C8A] border-2 border-[#FFF000] rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#FFF000]" />
                <span>Portal</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#EEF0FF] hover:text-white bg-[#292A86]/70 hover:bg-[#292A86] border border-[#F5D900]/60 hover:border-[#FFF000] rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(255,240,0,0.35)]"
              >
                <Award className="w-4 h-4 text-[#FFF000]" />
                <span>Results</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('notices')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#EEF0FF] hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-[#FFF000]/60 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(255,240,0,0.3)]"
              >
                <Bell className="w-4 h-4 text-[#FFF000]" />
                <span>Notices</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#EEF0FF] hover:text-white bg-white/10 hover:bg-white/20 border border-white/25 hover:border-[#FFF000]/60 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#FFF000]" />
                <span>Contact</span>
              </button>
            </div>

            {/* Social Media Strip (Clean Icon Row) */}
            {(() => {
              const items = [
                {
                  key: 'youtube',
                  platform: 'YouTube',
                  name: socialMedia.youtube.profileName || 'YouTube',
                  url: socialMedia.youtube.url,
                  enabled: socialMedia.youtube.enabled,
                  order: socialMedia.youtube.displayOrder ?? 1,
                  ariaLabel: 'Visit DARE ARQAM on YouTube',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  )
                },
                {
                  key: 'facebook',
                  platform: 'Facebook',
                  name: socialMedia.facebook.profileName || 'Facebook',
                  url: socialMedia.facebook.url,
                  enabled: socialMedia.facebook.enabled,
                  order: socialMedia.facebook.displayOrder ?? 2,
                  ariaLabel: 'Visit DARE ARQAM on Facebook',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )
                },
                {
                  key: 'tiktok',
                  platform: 'TikTok',
                  name: socialMedia.tiktok.profileName || 'TikTok',
                  url: socialMedia.tiktok.url,
                  enabled: socialMedia.tiktok.enabled,
                  order: socialMedia.tiktok.displayOrder ?? 3,
                  ariaLabel: 'Visit DARE ARQAM on TikTok',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002-.001a2.895 2.895 0 0 1 3.144-4.53v-3.47a6.342 6.342 0 0 0-5.645 5.842.634.634 0 0 0-.014.137v.005a6.344 6.344 0 0 0 10.835 4.485 6.35 6.35 0 0 0 1.848-4.485V8.808a8.196 8.196 0 0 0 4.697 1.458v-3.48a4.776 4.776 0 0 1-1.205-.1z"/>
                    </svg>
                  )
                },
                {
                  key: 'whatsapp',
                  platform: 'WhatsApp',
                  name: socialMedia.whatsapp?.profileName || 'WhatsApp',
                  url: socialMedia.whatsapp?.url || (socialMedia.whatsapp?.phoneNumber ? `https://wa.me/${socialMedia.whatsapp.phoneNumber.replace(/[^0-9]/g, '')}` : ''),
                  enabled: socialMedia.whatsapp?.enabled ?? false,
                  order: socialMedia.whatsapp?.displayOrder ?? 4,
                  ariaLabel: 'Contact DARE ARQAM on WhatsApp',
                  icon: (
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  )
                }
              ].filter(item => item.enabled && item.url && item.url.trim() !== '')
               .sort((a, b) => a.order - b.order);

              if (items.length === 0) return null;

              return (
                <div className="pt-3 border-t border-white/20 flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto max-w-full">
                  {items.map(item => (
                    <a
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.ariaLabel}
                      title={item.name}
                      className="px-2.5 py-1 bg-[#20216B]/90 hover:bg-[#2A2C8A] border border-[#F5D900]/40 rounded-lg text-[11px] sm:text-xs font-semibold text-[#EEF0FF] hover:text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 hover:border-[#FFF000]"
                    >
                      {item.icon}
                      <span className="font-bold">{item.name}</span>
                    </a>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 2. CLASSIC INSTITUTIONAL STATS (ONE-WORD & ICON CENTRIC) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { metric: '100%', label: 'Merit', icon: Award },
            { metric: '25+', label: 'Years', icon: ShieldCheck },
            { metric: '100%', label: 'Tarbiya', icon: Moon },
            { metric: '30+', label: 'Scholars', icon: Users },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-[#171852] to-[#20216B] border border-[#F5D900]/40 hover:border-[#FFF000] p-3 sm:p-4 rounded-xl text-center text-white shadow-md flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_15px_rgba(255,240,0,0.25)]"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[#FFF000]/15 text-[#FFF000] flex items-center justify-center shrink-0 border border-[#FFF000]/30">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-editorial text-lg sm:text-2xl font-black text-[#FFF000] leading-none">
                    {stat.metric}
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#EEF0FF] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CLASSIC ICONIC QUICK DIRECTORY (ONE-WORD & ICON CENTRIC) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
          {[
            { id: 'academics' as PageId, label: 'Curriculum', icon: BookOpen },
            { id: 'faculty' as PageId, label: 'Faculty', icon: Users },
            { id: 'results' as PageId, label: 'Results', icon: Award },
            { id: 'events' as PageId, label: 'Calendar', icon: Calendar },
            { id: 'downloads' as PageId, label: 'Prospectus', icon: FileText },
            { id: 'contact' as PageId, label: 'Contact', icon: PhoneCall },
          ].map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => onNavigate(tile.id)}
                className="neon-card-interactive p-3 sm:p-4 bg-white rounded-xl border border-[#CBD5E1] shadow-xs flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#EEF0FF] text-[#20216B] group-hover:bg-[#171852] group-hover:text-[#FFF000] flex items-center justify-center transition-colors shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-editorial text-xs sm:text-sm font-bold text-[#0F1035] group-hover:text-[#20216B] transition-colors">
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. PRINCIPAL'S ADDRESS (CLASSIC PRESTIGE WITH GOLD NEON BORDER) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#171852] via-[#20216B] to-[#292A86] text-white border-2 border-[#F5D900] neon-border-gold rounded-2xl p-4 sm:p-8 shadow-2xl">
          <div className="flex flex-row gap-4 sm:gap-8 items-center">
            {/* Principal Photo & Identity (Left) */}
            <div className="w-28 sm:w-44 md:w-52 shrink-0 space-y-2 text-left">
              <div className="relative w-full h-32 sm:h-48 md:h-56 rounded-xl overflow-hidden border-2 border-[#F5D900] shadow-lg bg-[#EEF0FF]">
                <img
                  src={principalPhotoUrl || DEFAULT_PRINCIPAL_PHOTO}
                  alt={principalName}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-0.5">
                <div className="font-editorial text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                  {principalName}
                </div>
                <div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-[#FFF000]/20 border border-[#FFF000]/40 text-[10px] text-[#FFF000] font-extrabold uppercase tracking-wider">
                    {principalTitle || 'Principal'}
                  </span>
                </div>
                <div className="text-[10px] text-[#FFF9B8] font-prose-serif font-medium leading-tight line-clamp-1">
                  {principalQualification}
                </div>
              </div>
            </div>

            {/* Message Body (Right Side) */}
            <div className="flex-1 space-y-2 sm:space-y-2.5">
              <div className="text-[10px] sm:text-xs font-bold text-[#FFF000] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFF000] animate-pulse" />
                <span>Executive Leadership</span>
              </div>
              <h2 className="font-editorial text-lg sm:text-2xl font-bold text-white leading-tight">
                Principal's Address
              </h2>

              <blockquote className="border-l-2 sm:border-l-4 border-[#F5D900] pl-2.5 sm:pl-3 text-[#FFF9B8] text-xs sm:text-sm font-prose-serif italic leading-relaxed bg-black/20 py-2 px-2.5 rounded-r-xl">
                “{principalMessage || 'True education is not merely the accumulation of facts, but the disciplined training of the intellect and the nurturing of a conscience anchored in timeless moral virtues.'}”
              </blockquote>

              <p className="text-xs text-[#EEF0FF] font-prose-serif leading-relaxed hidden sm:block">
                We invite parents to partner actively with our faculty in shaping minds marked by curiosity, perseverance, and civic honor.
              </p>

              <div>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="px-3.5 py-1.5 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] text-xs font-extrabold rounded-lg inline-flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 neon-glow-gold"
                >
                  <span>Address</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#171852]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE PILLARS (LESSER TEXT, ICON-LANGUAGE & NEON GLOW CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-5 pb-2.5 border-b-2 border-[#CBD5E1] flex items-center justify-between">
          <div>
            <div className="text-xs font-extrabold text-[#20216B] tracking-wider uppercase mb-0.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5D900]" />
              <span>Priorities</span>
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
              Core Pillars
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-[#20216B] uppercase tracking-wider hidden sm:inline">
            5 Foundational Virtues
          </span>
        </div>

        {/* 5 Classic Heraldic Icon Cards with Neon-glow hover */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {[
            {
              title: 'Academics',
              motto: 'Rigorous standards & STEM curiosity',
              icon: BookOpen,
              badge: 'Excellence',
            },
            {
              title: 'Ethics',
              motto: 'Islamic virtues & moral character',
              icon: Moon,
              badge: 'Values',
            },
            {
              title: 'Faculty',
              motto: 'Dedicated mentors & master scholars',
              icon: Users,
              badge: 'Scholars',
            },
            {
              title: 'Discipline',
              motto: 'Honor, civic respect & self-mastery',
              icon: Target,
              badge: 'Honor',
            },
            {
              title: 'Partnership',
              motto: 'Collaborative parent-educator trust',
              icon: Handshake,
              badge: 'Trust',
            },
          ].map((pillar, idx) => {
            const Icon = pillar.icon;
            const isLast = idx === 4;
            return (
              <div
                key={pillar.title}
                className={`neon-card-interactive bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md flex flex-col justify-between group ${
                  isLast ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-[#FFF9B8] border border-white/20">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="font-editorial text-sm sm:text-lg font-bold text-[#FFF000] tracking-wide mb-1 group-hover:text-white transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#EEF0FF]/90 font-prose-serif">
                    {pillar.motto}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-[#FFF9B8] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFF000]" />
                  <span>Institutional Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CAMPUS GALLERY */}
      <HomepageGallery />
    </div>
  );
};
