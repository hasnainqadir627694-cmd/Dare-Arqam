import React from 'react';
import { PageId } from '../types';
import { Emblem } from './Emblem';
import { INSTITUTION_INFO } from '../data/mockData';
import { Phone, Mail, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#20216B] text-white/90 border-t border-[#292A86] mt-16 text-sm">
      {/* Decorative Blue -> Yellow brand gradient top bar */}
      <div className="brand-gradient-line" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Institution Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Emblem size="md" />
              <div>
                <div className="font-editorial text-xl font-bold tracking-tight text-white">
                  DAR - E - ARQAM
                </div>
                <div className="text-xs text-[#FFF000] font-semibold tracking-wide">
                  Established 1998
                </div>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed font-prose-serif">
              DAR - E - ARQAM is a recognized institutional school system dedicated to academic rigor, moral character development, and scientific excellence in Pakistan.
            </p>

            <div className="pt-2 text-xs text-white/80 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000] shrink-0" />
                <span>Affiliation: {INSTITUTION_INFO.affiliation}</span>
              </div>
              <div className="text-[#EEF0FF]/80 font-mono text-[11px]">
                Registration: {INSTITUTION_INFO.registrationNo}
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-editorial text-sm font-bold text-white tracking-wider uppercase mb-4 pb-2 border-b border-[#F5D900]/30 flex items-center justify-between">
              <span>Institution Navigation</span>
              <span className="w-2 h-2 rounded-full bg-[#FFF000]" />
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  About DAR - E - ARQAM
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('principal-message')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Principal's Message
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vision-mission')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Vision, Mission & Core Values
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('administration')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Administration & Governance
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faculty')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Faculty & Academic Heads
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('academic-calendar')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Annual Academic Calendar
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Student & Parent Services */}
          <div>
            <h3 className="font-editorial text-sm font-bold text-white tracking-wider uppercase mb-4 pb-2 border-b border-[#F5D900]/30 flex items-center justify-between">
              <span>Academic & Admissions</span>
              <span className="w-2 h-2 rounded-full bg-[#FFF000]" />
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('admission-info')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Admissions Guidelines (2026–27)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fee-structure')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Official Fee Structure
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-white transition-colors text-left text-[#FFF000] font-bold"
                >
                  Online Examination Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('notices')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Latest Notices & Circulars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('downloads')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Download Forms & Documents
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('student-login')}
                  className="hover:text-[#FFF000] transition-colors text-left text-white/85"
                >
                  Student Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Contact & Timings */}
          <div>
            <h3 className="font-editorial text-sm font-bold text-white tracking-wider uppercase mb-4 pb-2 border-b border-[#F5D900]/30 flex items-center justify-between">
              <span>Official Contact</span>
              <span className="w-2 h-2 rounded-full bg-[#FFF000]" />
            </h3>
            <div className="space-y-2.5 text-xs text-white/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFF000] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{INSTITUTION_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FFF000] shrink-0" />
                <span>{INSTITUTION_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FFF000] shrink-0" />
                <span>{INSTITUTION_INFO.email}</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1 text-white/80">
                <Clock className="w-4 h-4 text-[#FFF000] shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <div className="font-semibold text-white">Office Timings:</div>
                  <div className="text-[11px] mt-0.5 text-white/70">{INSTITUTION_INFO.officeHours}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Disclaimer & Legal Links */}
        <div className="mt-12 pt-6 border-t border-[#292A86] text-xs text-white/75 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="text-white font-medium">© {new Date().getFullYear()} DAR - E - ARQAM School System.</span> All Official Rights Reserved.
            <div className="text-[11px] text-white/60 mt-0.5">
              Approved educational institution portal. Content governed under institutional academic regulations.
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs text-white/80">
            <button
              onClick={() => onNavigate('contact')}
              className="hover:text-[#FFF000] underline underline-offset-4"
            >
              Contact Support
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('downloads')}
              className="hover:text-[#FFF000] underline underline-offset-4"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('downloads')}
              className="hover:text-[#FFF000] underline underline-offset-4"
            >
              Terms of Website Usage
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
