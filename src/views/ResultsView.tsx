import React, { useState } from 'react';
import { PageId, StudentResult } from '../types';
import { RESULTS_DATABASE, INSTITUTION_INFO } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { Search, Printer, CheckCircle2, AlertCircle, Award, ArrowLeft, ShieldCheck } from 'lucide-react';
import { fetchResultByRollOrId } from '../services/firebaseService';

interface ResultsViewProps {
  onNavigate: (page: PageId) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class X (Matriculation)');
  const [selectedExam, setSelectedExam] = useState('Annual Board Model Examination 2026');
  const [currentResult, setCurrentResult] = useState<StudentResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const query = searchQuery.trim();

    if (!query) {
      setErrorMessage('Please enter a Roll Number or Student ID.');
      setCurrentResult(null);
      return;
    }

    setIsSearching(true);
    try {
      const found = await fetchResultByRollOrId(query);
      if (found) {
        setCurrentResult(found);
        setHasSearched(true);
      } else {
        // Fallback to local
        const local = RESULTS_DATABASE.find(
          (r) =>
            r.rollNumber.toLowerCase() === query.toLowerCase() ||
            r.studentId.toLowerCase() === query.toLowerCase()
        );
        if (local) {
          setCurrentResult(local);
          setHasSearched(true);
        } else {
          setCurrentResult(null);
          setErrorMessage(
            `No examination record found for Roll Number / Student ID "${searchQuery}". Please verify the digits or contact the Controller of Examinations.`
          );
        }
      }
    } catch {
      const local = RESULTS_DATABASE.find(
        (r) =>
          r.rollNumber.toLowerCase() === query.toLowerCase() ||
          r.studentId.toLowerCase() === query.toLowerCase()
      );
      if (local) {
        setCurrentResult(local);
        setHasSearched(true);
      } else {
        setCurrentResult(null);
        setErrorMessage(
          `No examination record found for Roll Number / Student ID "${searchQuery}". Please verify the digits or contact the Controller of Examinations.`
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b-2 border-[#CBD5E1]">
        <div className="text-xs font-extrabold text-[#20216B] tracking-wider uppercase mb-1 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5D900]" />
          <span>Office of the Controller of Examinations</span>
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0F1035]">
          Official Examination Results Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#1E293B] mt-1 max-w-2xl font-prose-serif font-normal">
          Search, view, and print official institutional examination transcripts and gazette marksheets.
        </p>
      </div>

      {/* Formal Search Interface */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-md space-y-5">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student ID / Roll Number */}
            <div>
              <label 
                htmlFor="roll-number" 
                className="block text-xs font-extrabold text-[#0F1035] uppercase tracking-wider mb-1.5"
              >
                Student ID / Roll Number *
              </label>
              <input
                id="roll-number"
                type="text"
                required
                placeholder="e.g. 849201 or DA-2026-1001"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F1035] font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-[#20216B] focus:border-[#20216B]"
              />
            </div>

            {/* Class */}
            <div>
              <label 
                htmlFor="class-select" 
                className="block text-xs font-extrabold text-[#0F1035] uppercase tracking-wider mb-1.5"
              >
                Class Level *
              </label>
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F1035] font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#20216B]"
              >
                <option value="Class X (Matriculation)">Class X (Matriculation)</option>
                <option value="Class IX (Secondary)">Class IX (Secondary)</option>
                <option value="Class VIII (Middle)">Class VIII (Middle)</option>
                <option value="HSSC-I (College)">HSSC-I (College)</option>
              </select>
            </div>

            {/* Examination */}
            <div>
              <label 
                htmlFor="exam-select" 
                className="block text-xs font-extrabold text-[#0F1035] uppercase tracking-wider mb-1.5"
              >
                Examination *
              </label>
              <select
                id="exam-select"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border-2 border-[#CBD5E1] rounded-lg bg-[#F8FAFC] text-[#0F1035] font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#20216B]"
              >
                <option value="Annual Board Model Examination 2026">
                  Annual Board Model Examination 2026
                </option>
                <option value="Mid-Term Examination 2025–2026">
                  Mid-Term Examination 2025–2026
                </option>
                <option value="Pre-Board Simulation Examination 2026">
                  Pre-Board Simulation Examination 2026
                </option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-slate-100">
            <div className="flex items-center gap-2 text-xs text-[#334155] font-medium">
              <ShieldCheck className="w-4 h-4 text-[#20216B] shrink-0" />
              <span>Enter registered Roll Number or Student ID to verify official gazette records.</span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-7 py-3 text-xs font-extrabold text-white bg-gradient-to-r from-[#171852] to-[#20216B] hover:from-[#20216B] hover:to-[#292A86] border-2 border-[#F5D900]/50 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
            >
              <Search className="w-4 h-4 text-[#FFF000]" />
              <span>{isSearching ? 'Verifying Records...' : 'Verify & View Result'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Default Instruction State when no search executed yet */}
      {!currentResult && !errorMessage && (
        <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <Emblem size="lg" className="mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
              Direct Examination Transcript Lookup
            </h3>
            <p className="text-xs sm:text-sm text-[#1E293B] font-prose-serif leading-relaxed">
              Official student transcripts, marks breakdown, overall division status, and certified examination gazette records are generated directly from the institutional database.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {errorMessage && (
        <div className="p-4 bg-[#FEE2E2] border-2 border-[#DC2626] rounded-xl text-xs text-[#991B1B] flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-sm block">Record Not Found:</strong>
            <span className="font-medium text-xs mt-0.5 block">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Official Marksheet Display */}
      {currentResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 text-xs font-bold text-[#171852] bg-white hover:bg-[#EEF0FF] border-2 border-[#20216B] rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#20216B]" />
              <span>Print Official Marksheet</span>
            </button>
          </div>

          <div className="bg-white border-2 border-[#20216B] rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 print-area relative overflow-hidden">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Emblem size="xl" className="w-96 h-96" />
            </div>

            {/* Official Marksheet Header */}
            <div className="text-center pb-6 border-b-2 border-[#20216B] space-y-2">
              <div className="flex items-center justify-center gap-3.5">
                <Emblem size="lg" />
                <div className="text-left">
                  <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight text-[#20216B]">
                    DAR - E - ARQAM
                  </h2>
                  <div className="text-xs text-[#0F1035] font-extrabold tracking-wide">
                    CONTROLLER OF EXAMINATIONS · OFFICIAL RESULT TRANSCRIPT
                  </div>
                  <div className="text-[11px] text-[#475569] font-mono font-medium">
                    Affiliated with Board of Intermediate & Secondary Education
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <div className="inline-block bg-[#171852] text-[#FFF000] border-2 border-[#F5D900] px-5 py-1.5 rounded-md text-xs font-bold font-mono uppercase tracking-wider shadow-xs">
                  {currentResult.examination}
                </div>
              </div>
            </div>

            {/* Student Credential Particulars */}
            <div className="bg-[#EEF0FF] border-2 border-[#292A86]/30 rounded-xl p-5">
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs">
                <div>
                  <dt className="text-[#475569] font-bold">Candidate Name:</dt>
                  <dd className="font-extrabold text-[#0F1035] text-sm mt-0.5">{currentResult.studentName}</dd>
                </div>
                <div>
                  <dt className="text-[#475569] font-bold">Father's Name:</dt>
                  <dd className="font-extrabold text-[#0F1035] text-sm mt-0.5">{currentResult.fatherName}</dd>
                </div>
                <div>
                  <dt className="text-[#475569] font-bold">Roll Number:</dt>
                  <dd className="font-mono font-extrabold text-[#20216B] text-sm mt-0.5">{currentResult.rollNumber}</dd>
                </div>
                <div>
                  <dt className="text-[#475569] font-bold">Student Registration ID:</dt>
                  <dd className="font-mono font-bold text-[#0F1035] mt-0.5">{currentResult.studentId}</dd>
                </div>
                <div>
                  <dt className="text-[#475569] font-bold">Class & Group:</dt>
                  <dd className="font-bold text-[#0F1035] mt-0.5">{currentResult.className} · {currentResult.section}</dd>
                </div>
                <div>
                  <dt className="text-[#475569] font-bold">Academic Session:</dt>
                  <dd className="font-mono font-bold text-[#0F1035] mt-0.5">{currentResult.session}</dd>
                </div>
              </dl>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto rounded-xl border-2 border-[#20216B] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#171852] text-white font-extrabold">
                  <tr>
                    <th className="py-3 px-4">Subject Description</th>
                    <th className="py-3 px-4 text-right">Max Marks</th>
                    <th className="py-3 px-4 text-right">Obtained</th>
                    <th className="py-3 px-4 text-center">Grade</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 text-[#0F1035]">
                  {currentResult.subjects.map((sub, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                      <td className="py-3 px-4 font-bold text-[#0F1035]">{sub.name}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700 tabular-nums">{sub.totalMarks}</td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-[#20216B] text-sm tabular-nums">
                        {sub.obtainedMarks}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[#0F1035]">
                        {sub.grade}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-extrabold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-0.5 rounded border border-[#16A34A]/30">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aggregate Summary Box */}
            <div className="bg-gradient-to-r from-[#171852] to-[#20216B] text-white border-2 border-[#F5D900] rounded-xl p-5 shadow-md">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-[11px] text-[#EEF0FF] font-semibold">Grand Total</div>
                  <div className="text-xl font-mono font-extrabold text-white mt-0.5 tabular-nums">
                    {currentResult.obtainedMarks} / {currentResult.totalMarks}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#EEF0FF] font-semibold">Percentage</div>
                  <div className="text-xl font-mono font-extrabold text-[#FFF000] mt-0.5 tabular-nums">
                    {currentResult.percentage}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#EEF0FF] font-semibold">Overall Grade</div>
                  <div className="text-xl font-mono font-extrabold text-[#FFF000] mt-0.5">
                    {currentResult.overallGrade}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#EEF0FF] font-semibold">Final Determination</div>
                  <div className="text-base font-extrabold text-[#FFF000] mt-0.5">
                    {currentResult.resultStatus}
                  </div>
                </div>
              </div>

              {currentResult.remarks && (
                <div className="mt-3.5 pt-3 border-t border-white/20 text-xs text-[#EEF0FF] font-prose-serif italic text-center">
                  “{currentResult.remarks}”
                </div>
              )}
            </div>

            {/* Institutional Signatures & Stamp */}
            <div className="pt-8 flex flex-col sm:flex-row items-end justify-between gap-6 border-t-2 border-slate-200 text-xs">
              <div className="space-y-1 text-[#475569] text-[11px] font-medium">
                <div>Date of Issuance: <strong className="text-[#0F1035]">{currentResult.examDate}</strong></div>
                <div>Gazette Reference: <strong className="text-[#0F1035] font-mono">DA-GAZ-{currentResult.rollNumber}</strong></div>
                <div>Disclaimer: Official verified transcript copy from institutional database.</div>
              </div>

              <div className="text-right">
                <div className="w-44 h-10 border-b-2 border-dashed border-slate-400 mx-auto sm:ml-auto mb-1 flex items-end justify-center text-[10px] text-slate-500 italic">
                  (Signature of Controller)
                </div>
                <div className="font-extrabold text-[#0F1035]">Controller of Examinations</div>
                <div className="text-[11px] text-[#20216B] font-bold">DAR - E - ARQAM School System</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
