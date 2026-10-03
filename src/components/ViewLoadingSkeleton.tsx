import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const ViewLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="pb-4 border-b-2 border-[#CBD5E1] space-y-2.5">
        <div className="w-32 h-4 bg-[#20216B]/15 rounded-md" />
        <div className="w-64 sm:w-96 h-8 bg-[#20216B]/20 rounded-lg" />
        <div className="w-full max-w-xl h-4 bg-[#CBD5E1]/60 rounded-md" />
      </div>

      {/* Content Block Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-48 sm:h-64 bg-white border-2 border-[#CBD5E1] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-40 h-5 bg-[#20216B]/20 rounded-md" />
              <div className="w-full h-3.5 bg-slate-200 rounded-md" />
              <div className="w-5/6 h-3.5 bg-slate-200 rounded-md" />
              <div className="w-4/6 h-3.5 bg-slate-200 rounded-md" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#20216B]/50 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#F5D900]" />
              <span>DARE ARQAM Institutional Verification</span>
            </div>
          </div>

          <div className="h-32 bg-white border-2 border-[#CBD5E1] rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-48 h-5 bg-[#20216B]/20 rounded-md" />
            <div className="w-full h-3.5 bg-slate-200 rounded-md" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-72 bg-[#171852]/10 border-2 border-[#CBD5E1] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-28 h-4 bg-[#20216B]/30 rounded-md" />
            <div className="w-full h-12 bg-white rounded-xl" />
            <div className="w-full h-12 bg-white rounded-xl" />
            <div className="w-full h-12 bg-white rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
