import React from 'react';
import { Notice } from '../types';
import { Calendar, ChevronRight, Bookmark } from 'lucide-react';

interface NoticeCardProps {
  notice: Notice;
  onSelect: (notice: Notice) => void;
  featured?: boolean;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onSelect, featured = false }) => {
  return (
    <div
      className={`group relative bg-white border-2 rounded-xl p-5 transition-all hover:border-[#20216B] hover:shadow-lg ${
        featured || notice.isImportant
          ? 'border-[#F5D900] bg-gradient-to-b from-[#FFF9B8]/20 via-white to-white shadow-md'
          : 'border-[#CBD5E1] shadow-xs'
      }`}
    >
      {/* Top Metadata Strip */}
      <div className="flex items-center justify-between gap-2 text-xs mb-2.5">
        <div className="flex items-center gap-2 text-[#20216B] font-semibold">
          <span className="font-extrabold text-[#20216B] tracking-wide bg-[#EEF0FF] px-2.5 py-0.5 rounded border border-[#292A86]/20">
            {notice.category}
          </span>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <span className="flex items-center gap-1 text-slate-700 font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#20216B]" />
            <span>{notice.date}</span>
          </span>
        </div>

        {notice.isImportant && (
          <span className="text-[11px] font-bold text-[#9A3412] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#F5D900] flex items-center gap-1">
            <Bookmark className="w-3 h-3 fill-[#9A3412] text-[#9A3412]" />
            Important
          </span>
        )}
      </div>

      {/* Notice Title - High Contrast Bold */}
      <h3 className="font-editorial text-base sm:text-lg font-bold text-[#0F1035] group-hover:text-[#20216B] transition-colors leading-snug">
        <button
          onClick={() => onSelect(notice)}
          className="text-left hover:underline underline-offset-2 focus:outline-hidden cursor-pointer"
        >
          {notice.title}
        </button>
      </h3>

      {/* Summary - Deep readable slate/navy */}
      <p className="mt-2.5 text-xs sm:text-sm text-[#1E293B] line-clamp-2 leading-relaxed font-prose-serif font-normal">
        {notice.summary}
      </p>

      {/* Card Action Row */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[#334155] font-medium text-[11px] truncate max-w-[200px] sm:max-w-none">
          Issued by: <strong className="text-[#0F1035]">{notice.issuedBy}</strong>
        </span>

        <button
          type="button"
          onClick={() => onSelect(notice)}
          className="font-bold text-[#20216B] group-hover:text-[#161748] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>View Circular</span>
          <ChevronRight className="w-4 h-4 text-[#D97706] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
