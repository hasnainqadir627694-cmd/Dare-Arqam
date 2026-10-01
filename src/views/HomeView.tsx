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
  ShieldCheck
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: PageId) => void;
  onSelectNotice?: (notice: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { 
    logoUrl, 
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
      {/* 1. HERO / BANNER SECTION WITH CENTER ROUND LOGO */}
      <section className="relative overflow-hidden bg-[#171852] border-b-2 border-[#F5D900]/40 shadow-xl">
        {/* Background Cover Banner */}
        <div className="relative w-full h-28 sm:h-48 md:h-64 lg:h-80 bg-[#0F1035] overflow-hidden">
          <img
            src={bannerUrl || DEFAULT_CAMPUS_BANNER}
            alt="DAR - E - ARQAM Campus Hero Banner"
            className="w-full h-full object-cover object-center filter brightness-95"
            referrerPolicy="no-referrer"
          />
          {/* Smooth Bottom Blue Color Fading Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#171852] via-[#171852]/40 to-transparent" />
        </div>

        {/* Hero Content Block Overlapping the Banner */}
        <div className="relative max-w-5xl mx-auto px-3 sm:px-6 pb-6 sm:pb-10 md:pb-14 text-center">
          {/* CENTER ROUND LOGO FLANKED BY URDU CALLIGRAPHY MOTTO */}
          <div className="-mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-2.5 sm:mb-3.5 relative z-20 px-1 sm:px-4">
            {/* Left Box (Green highlight): بہترین آخرت */}
            <div className="flex-1 flex justify-end items-center pr-1 sm:pr-3 overflow-visible">
              <span 
                className="font-jameel-kasheeda text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFF000] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] whitespace-nowrap select-none transition-transform hover:scale-105 py-1"
                dir="rtl"
              >
                بہترین آخرت
              </span>
            </div>

            {/* Central Round Logo (Radiant Neon Glow & Classic Heritage Aura) */}
            <div className="rounded-full neon-glow-gold-pulse ring-2 ring-[#FFF000] transition-all hover:scale-105 shrink-0 z-10 overflow-hidden bg-[#171852] shadow-2xl">
              <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden flex items-center justify-center select-none p-0.5">
                <Emblem size="xl" className="!w-full !h-full" neonGlow />
              </div>
            </div>

            {/* Right Box (Red highlight): خوبصورت دنیا */}
            <div className="flex-1 flex justify-start items-center pl-1 sm:pl-3 overflow-visible">
              <span 
                className="font-jameel-kasheeda text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#FFF000] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] whitespace-nowrap select-none transition-transform hover:scale-105 py-1"
                dir="rtl"
              >
                خوبصورت دنیا
              </span>
            </div>
          </div>

          {/* Underneath Logo: DAR - E - ARQAM Title, Subtitle, & Description */}
          <div className="space-y-2.5 sm:space-y-3.5 max-w-3xl mx-auto">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-mono tracking-wider uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/40 font-bold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFF000] animate-pulse" />
              <span>Registered Institution · Est. 1998</span>
            </div>

            {/* Main Title */}
            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              {institutionName}
            </h1>

            {/* Campus Tagline */}
            <div className="text-xs sm:text-base md:text-lg font-bold text-[#FFF000] tracking-wider uppercase [word-spacing:0.14em]">
              {tagline}
            </div>

            {/* Institutional Summary */}
            <p className="text-xs sm:text-sm text-[#EEF0FF]/90 font-prose-serif leading-relaxed max-w-2xl mx-auto font-normal px-2">
              A premier Pakistani educational institution committed to rigorous academic discipline, scientific inquiry, and the moral foundation of students from primary grades through matriculation and higher secondary levels.
            </p>

            {/* Primary & Secondary Call to Actions - One-Word Icon-Rich Language with Radiant Neon Glow */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('admission-info')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-extrabold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] neon-glow-gold rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 border-2 border-[#F5D900]"
              >
                <GraduationCap className="w-4 h-4 text-[#171852]" />
                <span>Admissions</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#171852]" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('student-login')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#2A2C8A] border-2 border-[#FFF000]/70 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-[#FFF000]" />
                <span>Portal</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('results')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-[#EEF0FF] hover:text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-[#FFF000]" />
                <span>Results</span>
              </button>
            </div>

            {/* Social Media Strip (Single Row on Mobile & Desktop) */}
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
                <div className="pt-3.5 sm:pt-4 border-t border-white/20 flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4 overflow-x-auto max-w-full">
                  {items.map(item => (
                    <a
                      key={item.key}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.ariaLabel}
                      title={item.name}
                      className="px-2.5 sm:px-3.5 py-1.5 bg-[#20216B]/90 hover:bg-[#2A2C8A] border border-[#F5D900]/40 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-[#EEF0FF] hover:text-white transition-all shadow-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer shrink-0"
                    >
                      {item.icon}
                      <span className="group-hover:underline font-bold">
                        {item.name}
                      </span>
                    </a>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* 2. PRINCIPAL'S MESSAGE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#171852] via-[#20216B] to-[#292A86] text-white border-2 border-[#F5D900]/40 rounded-2xl p-4 sm:p-8 shadow-2xl">
          <div className="flex flex-row gap-4 sm:gap-8 items-center">
            {/* Principal Photo & Identity (Left) */}
            <div className="w-32 sm:w-48 md:w-56 shrink-0 space-y-2 text-left">
              <div className="relative w-full h-36 sm:h-52 md:h-60 rounded-xl overflow-hidden border-2 border-[#F5D900] shadow-lg bg-[#EEF0FF]">
                <img
                  src={principalPhotoUrl || DEFAULT_PRINCIPAL_PHOTO}
                  alt={principalName}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <div className="font-editorial text-xs sm:text-sm md:text-base font-bold text-white leading-tight">
                  {principalName}
                </div>
                <div>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-[#FFF000]/20 border border-[#FFF000]/40 text-[10px] sm:text-xs text-[#FFF000] font-extrabold uppercase tracking-wider">
                    {principalTitle || 'Principal'}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-[#FFF9B8] font-prose-serif font-medium leading-relaxed line-clamp-2">
                  {principalQualification}
                </div>
              </div>
            </div>

            {/* Message Body (Right Side) */}
            <div className="flex-1 space-y-2.5 sm:space-y-3">
              <div className="text-[10px] sm:text-xs font-bold text-[#FFF000] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFF000]" />
                <span>Executive Leadership & Communique</span>
              </div>
              <h2 className="font-editorial text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                Message from the Principal
              </h2>

              <blockquote className="border-l-2 sm:border-l-4 border-[#F5D900] pl-2.5 sm:pl-4 text-[#FFF9B8] text-xs sm:text-sm md:text-base font-prose-serif italic leading-relaxed bg-black/20 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-r-xl">
                “{principalMessage || 'In an age of rapid technological transition, true education is not merely the accumulation of facts, but the disciplined training of the intellect and the nurturing of a conscience anchored in timeless moral virtues. At DAR - E - ARQAM, our educators strive tirelessly to ensure every young mind that walks through our gates emerges equipped to excel globally while holding firm to their national and spiritual roots.'}”
              </blockquote>

              <p className="text-xs sm:text-sm text-[#EEF0FF] font-prose-serif leading-relaxed line-clamp-3 sm:line-clamp-none">
                We invite parents to partner actively with our faculty in shaping the future trajectory of their children, creating an academic journey marked by curiosity, perseverance, and mutual respect.
              </p>

              <div>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] text-[10px] sm:text-xs font-extrabold rounded-lg inline-flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <span>Read Full Address</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#171852]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AT DARE ARQAM, WE FOCUS ON (CORE INSTITUTIONAL FOCUS - 5 GRADIENT CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 pb-3 border-b-2 border-[#CBD5E1]">
          <div className="text-xs font-extrabold text-[#20216B] tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D900]" />
            <span>Institutional Priorities</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
            At DARE ARQAM, We Focus On
          </h2>
        </div>

        {/* 5 Cards Grid: 2 cards on row 1, 2 cards on row 2, 1 card centered on row 3 (consistent on mobile & laptop) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {/* 1. Quality Education */}
          <div 
            style={{ animationDelay: '80ms' }}
            className="animate-fade-in-up bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 hover:border-[#FFF000] rounded-xl sm:rounded-2xl p-3.5 sm:p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-start group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-2.5 sm:mb-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-editorial text-xs sm:text-base md:text-lg font-bold text-[#FFF000] uppercase tracking-wide leading-snug group-hover:text-[#FFF9B8] transition-colors">
                Quality Education
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-white leading-relaxed font-prose-serif font-normal">
              Providing students with a strong academic foundation and encouraging them to develop a lifelong love for learning.
            </p>
          </div>

          {/* 2. Islamic & Moral Values */}
          <div 
            style={{ animationDelay: '160ms' }}
            className="animate-fade-in-up bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 hover:border-[#FFF000] rounded-xl sm:rounded-2xl p-3.5 sm:p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-start group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-2.5 sm:mb-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-editorial text-xs sm:text-base md:text-lg font-bold text-[#FFF000] uppercase tracking-wide leading-snug group-hover:text-[#FFF9B8] transition-colors">
                Islamic & Moral Values
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-white leading-relaxed font-prose-serif font-normal">
              Education should build not only intelligent minds but also good human beings. We emphasize character building, honesty, respect, discipline, and Islamic values.
            </p>
          </div>

          {/* 3. Dedicated Teachers */}
          <div 
            style={{ animationDelay: '240ms' }}
            className="animate-fade-in-up bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 hover:border-[#FFF000] rounded-xl sm:rounded-2xl p-3.5 sm:p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-start group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-2.5 sm:mb-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-editorial text-xs sm:text-base md:text-lg font-bold text-[#FFF000] uppercase tracking-wide leading-snug group-hover:text-[#FFF9B8] transition-colors">
                Dedicated Teachers
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-white leading-relaxed font-prose-serif font-normal">
              Teachers are the backbone of any educational institution. We strive to provide our students with dedicated and responsible teachers who can guide them academically and morally.
            </p>
          </div>

          {/* 4. Discipline & Character Building */}
          <div 
            style={{ animationDelay: '320ms' }}
            className="animate-fade-in-up bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 hover:border-[#FFF000] rounded-xl sm:rounded-2xl p-3.5 sm:p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-start group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-2.5 sm:mb-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-editorial text-xs sm:text-base md:text-lg font-bold text-[#FFF000] uppercase tracking-wide leading-snug group-hover:text-[#FFF9B8] transition-colors">
                Discipline & Character Building
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-white leading-relaxed font-prose-serif font-normal">
              We believe that discipline is essential for success. Students are encouraged to become responsible, respectful, confident, and disciplined members of society.
            </p>
          </div>

          {/* 5. Parents & School Partnership (Centered on Row 3 for both mobile and laptop) */}
          <div 
            style={{ animationDelay: '400ms' }}
            className="animate-fade-in-up col-span-2 w-full max-w-2xl mx-auto bg-gradient-to-r from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#D4AF37]/50 hover:border-[#FFF000] rounded-xl sm:rounded-2xl p-3.5 sm:p-7 shadow-md hover:shadow-xl transition-all flex flex-col justify-start group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mb-2.5 sm:mb-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#FFF000]/15 text-[#FFF000] border border-[#FFF000]/40 flex items-center justify-center shrink-0 group-hover:bg-[#FFF000] group-hover:text-[#171852] transition-colors shadow-sm">
                <Handshake className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-editorial text-xs sm:text-base md:text-lg font-bold text-[#FFF000] uppercase tracking-wide leading-snug group-hover:text-[#FFF9B8] transition-colors">
                Parents & School Partnership
              </h3>
            </div>
            <p className="text-[11px] sm:text-sm text-white leading-relaxed font-prose-serif font-normal">
              The education of a child is a shared responsibility. We value the cooperation and trust of parents and believe that strong communication between parents and teachers leads to better student development.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PREMIUM HORIZONTAL IMAGE SLIDER / GALLERY SECTION */}
      <HomepageGallery />
    </div>
  );
};
