import React from 'react';
import { Notice, PageId } from '../types';
import { X, AlertCircle, FileText, Calendar, Building } from 'lucide-react';
import { Emblem } from './Emblem';

interface NoticeModalProps {
  notice: Notice | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: (notice: Notice) => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({
  notice,
  isOpen,
  onClose,
  onViewDetails,
}) => {
  if (!isOpen || !notice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#292A86]/20 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-notice-title"
      >
        {/* Official Header Strip */}
        <div className="bg-[#20216B] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#292A86]">
          <div className="flex items-center gap-2.5">
            <Emblem size="sm" />
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#FFF000] block">
                OFFICIAL INSTITUTIONAL NOTICE
              </span>
              <span className="text-xs font-mono text-[#FFF000]">
                Ref No: {notice.refNo}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white p-1 rounded-sm focus:outline-hidden focus:ring-2 focus:ring-[#FFF000]"
            aria-label="Close Notice Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Metadata Row (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#475569] font-medium">
            <span className="text-[#20216B] font-semibold">{notice.category}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{notice.date}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#334155]">
              <Building className="w-3.5 h-3.5" />
              <span>{notice.issuedBy}</span>
            </span>
          </div>

          {/* Notice Title */}
          <h3
            id="modal-notice-title"
            className="font-editorial text-lg sm:text-xl font-bold text-[#0F1035] leading-snug"
          >
            {notice.title}
          </h3>

          {/* Short Message / Excerpt */}
          <div className="p-3.5 bg-[#F8FAFC] border-l-3 border-[#292A86] rounded-r-md text-xs sm:text-sm text-[#1E293B] leading-relaxed font-prose-serif">
            {notice.summary}
          </div>

          <div className="text-[11px] text-[#475569] italic">
            This notice is officially issued by the administrative directorate of DAR - E - ARQAM School System.
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#EEF2F8] px-5 py-3.5 border-t border-[#CBD5E1] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#1E293B] hover:bg-[#E2E8F0] rounded-md transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onViewDetails(notice);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
