import React, { useState, useEffect } from 'react';
import { Notice, PageId } from '../types';
import { NOTICES_DATA, INSTITUTION_INFO } from '../data/mockData';
import { NoticeCard } from '../components/NoticeCard';
import { Emblem } from '../components/Emblem';
import { Search, Filter, Calendar, Building, Printer, ArrowLeft, Download, Bookmark } from 'lucide-react';
import { fetchNotices, subscribeNotices } from '../services/firebaseService';

interface NoticeBoardViewProps {
  selectedNotice: Notice | null;
  onSelectNotice: (notice: Notice | null) => void;
  onNavigate: (page: PageId) => void;
}

export const NoticeBoardView: React.FC<NoticeBoardViewProps> = ({
  selectedNotice,
  onSelectNotice,
  onNavigate,
}) => {
  const [notices, setNotices] = useState<Notice[]>(NOTICES_DATA);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchNotices()
      .then((data) => {
        if (data && data.length > 0) {
          setNotices(data);
        }
      })
      .catch(() => {});

    const unsubscribe = subscribeNotices((data) => {
      if (data && data.length > 0) {
        setNotices(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Admissions', 'Examination', 'Academic', 'Administrative', 'General'];

  const filteredNotices = notices.filter((notice) => {
    const matchesCat = filterCategory === 'All' || notice.category === filterCategory;
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // If a notice is selected, render the official full circular view
  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Navigation Breadcrumb / Back Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onSelectNotice(null)}
            className="text-xs font-semibold text-[#20216B] hover:text-[#292A86] flex items-center gap-1.5 py-1.5 px-3 bg-[#EEF2F8] hover:bg-[#E2E8F0] rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Circulars</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-xs font-medium text-[#1E293B] hover:text-[#20216B] py-1.5 px-3 bg-[#EEF2F8] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Circular</span>
            </button>
          </div>
        </div>

        {/* Official Document Sheet */}
        <div className="bg-white border border-[#94A3B8] rounded-lg p-6 sm:p-10 shadow-sm space-y-6 print-area">
          {/* Official Letterhead */}
          <div className="text-center pb-6 border-b-2 border-stone-800 space-y-2">
            <div className="flex items-center justify-center gap-3">
              <Emblem size="lg" />
              <div className="text-left">
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#20216B]">
                  DAR - E - ARQAM
                </h1>
                <div className="text-xs text-[#334155] font-medium">
                  {INSTITUTION_INFO.fullName}
                </div>
                <div className="text-[11px] text-[#475569]">
                  Office of the Registrar & Controller of Examinations · Islamabad Campus
                </div>
              </div>
            </div>
          </div>

          {/* Reference & Date Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono border-b border-[#CBD5E1] pb-3 gap-1">
            <span className="font-bold text-[#0F1035]">
              REFERENCE NO: {selectedNotice.refNo}
            </span>
            <span className="text-[#334155]">
              NOTIFICATION DATE: {selectedNotice.date}
            </span>
          </div>

          {/* Circular Title */}
          <div>
            <div className="text-xs font-semibold text-[#20216B] uppercase tracking-widest mb-1">
              CATEGORY: {selectedNotice.category}
            </div>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#0F1035] leading-snug">
              {selectedNotice.title}
            </h2>
          </div>

          {/* Notice Text Content */}
          <div className="font-prose-serif text-sm sm:text-base text-[#0F1035] leading-relaxed whitespace-pre-line py-2 border-y border-stone-100">
            {selectedNotice.fullText}
          </div>

          {/* Institutional Signature & Stamp Block */}
          <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6 border-t border-[#CBD5E1]">
            <div className="text-xs text-[#475569] space-y-1">
              <div>Copy forwarded for information to:</div>
              <ul className="list-disc list-inside text-[11px] text-[#334155] pl-1 space-y-0.5">
                <li>Office of the Principal, DAR - E - ARQAM</li>
                <li>All Wing Heads & Section Coordinators</li>
                <li>Accounts & Finance Directorate</li>
                <li>Notice Board (Campus & Official Portal)</li>
              </ul>
            </div>

            <div className="text-right text-xs">
              <div className="w-36 h-12 border-b border-dashed border-stone-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center text-[10px] text-stone-400 italic">
                (Verified Digital Signature)
              </div>
              <div className="font-bold text-[#0F1035]">{selectedNotice.issuedBy}</div>
              <div className="text-[11px] text-[#334155]">DAR - E - ARQAM School System</div>
              <div className="text-[10px] text-stone-400 font-mono mt-1">
                DISPATCH ID: {selectedNotice.id.toUpperCase()}-VERIFIED
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Notice Board Listing View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Official Institutional Repository
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Official Notice Board & Circulars
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          All administrative directives, examination notifications, admission schedules, and official notices issued under the authority of DAR - E - ARQAM.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Category Filter Tabs (Zero-Pill compliant button group) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EEF2F8] rounded-md">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#20216B] text-white shadow-xs font-semibold'
                  : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, reference #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#94A3B8] rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-[#F8FAFC]"
          />
        </div>
      </div>

      {/* Notice List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#CBD5E1] rounded-md p-6">
            <Bookmark className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-editorial text-base font-semibold text-[#0F1035]">
              No Notices Match Your Criteria
            </h3>
            <p className="text-xs text-[#475569] mt-1">
              Please adjust your search keyword or selected category tab.
            </p>
            <button
              onClick={() => {
                setFilterCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold text-[#20216B] underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onSelect={onSelectNotice}
              featured={notice.isImportant}
            />
          ))
        )}
      </div>

      {/* Institutional Legal Disclaimer */}
      <div className="p-4 bg-[#EEF2F8] border border-[#CBD5E1] rounded-md text-[11px] text-[#334155] leading-relaxed">
        <strong>Notice Dissemination Rule:</strong> Official circulars published on this electronic portal carry equal regulatory weight as hardcopy physical dispatches displayed upon institutional notice boards. For verification of document authenticity, contact the Registrar’s Secretariat.
      </div>
    </div>
  );
};
