import React, { useState, useEffect } from 'react';
import { PageId, StudentProfile } from '../types';
import { Emblem } from '../components/Emblem';
import { lookupStudentByQrToken } from '../services/firebaseService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Calendar, 
  Building2, 
  ArrowLeft,
  QrCode,
  Sparkles
} from 'lucide-react';

interface VerifyStudentViewProps {
  initialToken?: string;
  onNavigate: (page: PageId) => void;
}

export const VerifyStudentView: React.FC<VerifyStudentViewProps> = ({ initialToken = '', onNavigate }) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'active' | 'revoked' | 'not_found'>('idle');
  const [message, setMessage] = useState('');

  const executeVerification = async (tokenToVerify: string) => {
    const clean = tokenToVerify.trim();
    if (!clean) return;

    setVerificationStatus('loading');
    setMessage('');

    try {
      const res = await lookupStudentByQrToken(clean);
      setStudent(res.student);
      setVerificationStatus(res.status);
      setMessage(res.message);
    } catch (err: any) {
      setVerificationStatus('not_found');
      setMessage(err?.message || 'Verification service could not complete the lookup.');
      setStudent(null);
    }
  };

  useEffect(() => {
    if (initialToken) {
      executeVerification(initialToken);
    }
  }, [initialToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(tokenInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="pb-4 border-b-2 border-[#CBD5E1] flex items-center justify-between">
        <div>
          <div className="text-xs font-extrabold text-[#20216B] tracking-wider uppercase mb-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D900]" />
            <span>Official Identity Registry</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0F1035]">
            Student QR Identity Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#1E293B] mt-1 max-w-2xl font-prose-serif font-normal">
            Real-time cryptographic verification of student cards issued by DAR - E - ARQAM Katlang Campus.
          </p>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#CBD5E1] hover:border-[#20216B] text-xs font-bold text-[#20216B] hover:bg-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </div>

      {/* Verification Lookup Input */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter Student QR Token ID (e.g. dast_9f83b...)"
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border-2 border-[#CBD5E1] focus:border-[#20216B] rounded-xl font-mono text-[#0F1035] placeholder:text-slate-400 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            disabled={verificationStatus === 'loading' || !tokenInput.trim()}
            className="px-5 py-2.5 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 neon-glow-gold border border-[#F5D900]"
          >
            <Search className="w-4 h-4" />
            <span>{verificationStatus === 'loading' ? 'Verifying...' : 'Verify'}</span>
          </button>
        </form>
      </div>

      {/* Verification Result Card */}
      {verificationStatus === 'active' && student && (
        <div className="bg-gradient-to-br from-[#171852] via-[#20216B] to-[#2D3092] text-white border-2 border-[#F5D900] neon-border-gold rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-white/20 gap-4">
            <div className="flex items-center gap-3">
              <Emblem size="md" neonGlow className="!w-12 !h-12" />
              <div>
                <div className="font-editorial text-lg sm:text-xl font-bold text-white">
                  DAR - E - ARQAM
                </div>
                <div className="text-[11px] text-[#FFF000] font-mono uppercase font-bold tracking-wider">
                  Verified Institutional Credential
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>OFFICIALLY ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-[#FFF9B8] font-bold">Student Name</span>
              <div className="font-editorial text-base sm:text-lg font-extrabold text-white">
                {student.fullName}
              </div>
            </div>

            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-[#FFF9B8] font-bold">Father Name</span>
              <div className="font-editorial text-base sm:text-lg font-bold text-white">
                {student.fatherName || 'N/A'}
              </div>
            </div>

            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-[#FFF9B8] font-bold">Class / Section</span>
              <div className="font-semibold text-white">
                {student.className || 'Registered Student'} {student.section ? `(${student.section})` : ''}
              </div>
            </div>

            <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
              <span className="text-[11px] uppercase tracking-wider text-[#FFF9B8] font-bold">Roll / Student ID</span>
              <div className="font-mono font-bold text-[#FFF000]">
                {student.rollNumber || student.studentId || 'Assigned'}
              </div>
            </div>
          </div>

          <div className="pt-2 text-center text-[11px] text-white/70 font-mono">
            Token: {student.qrIdentity?.tokenId || tokenInput} · Verified by DARE ARQAM Directorate
          </div>
        </div>
      )}

      {verificationStatus === 'revoked' && (
        <div className="bg-red-950/80 text-white border-2 border-red-500 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4 text-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
          <h2 className="font-editorial text-xl font-bold text-red-200">
            QR Identity Revoked
          </h2>
          <p className="text-xs sm:text-sm text-red-100 max-w-md mx-auto">
            {message || 'This student card identity token has been marked as revoked or cancelled by the school administration.'}
          </p>
        </div>
      )}

      {verificationStatus === 'not_found' && (
        <div className="bg-amber-950/70 text-white border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4 text-center">
          <XCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="font-editorial text-xl font-bold text-amber-200">
            No Student Record Found
          </h2>
          <p className="text-xs sm:text-sm text-amber-100 max-w-md mx-auto">
            {message || 'The specified QR identity token does not match any registered student credentials.'}
          </p>
        </div>
      )}
    </div>
  );
};
