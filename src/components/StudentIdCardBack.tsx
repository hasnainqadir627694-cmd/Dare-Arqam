import React, { useState, useEffect } from 'react';
import { StudentProfile, IdCardTemplate } from '../types';
import { Emblem } from './Emblem';
import { 
  ShieldCheck, 
  AlertTriangle, 
  QrCode, 
  Building2, 
  Phone, 
  RotateCw, 
  CheckCircle2, 
  ExternalLink,
  Award,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { ensureStudentQrIdentity } from '../services/firebaseService';
import { DEFAULT_BACK_TEMPLATE_SVG_DATA_URL } from '../services/idCardTemplateService';
import { MemoizedQrCode } from './MemoizedQrCode';

interface StudentIdCardBackProps {
  student: StudentProfile | any;
  template?: IdCardTemplate | null;
  aspectRatio?: number;
  onFlipToFront?: () => void;
  className?: string;
  showFlipButton?: boolean;
}

export const StudentIdCardBack: React.FC<StudentIdCardBackProps> = ({
  student,
  template,
  aspectRatio: propAspectRatio,
  onFlipToFront,
  className = '',
  showFlipButton = true,
}) => {
  const [qrIdentity, setQrIdentity] = useState(student.qrIdentity || null);

  const activeAspectRatio = template?.aspectRatio || propAspectRatio || 0.625;
  const backTemplateUrl = template?.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL;
  const qrConfig = template?.backFields?.qrCode || {
    x: 22.5,
    y: 25.0,
    width: 55.0,
    height: 34.375,
    quietZone: 8,
    borderRadius: 16,
    borderColor: '#D4AF37',
    borderWidth: 2,
    showLabel: true,
    label: 'SCAN TO VERIFY STUDENT',
    visible: true,
  };

  // Auto-ensure permanent QR identity is provisioned silently in the background
  useEffect(() => {
    let isMounted = true;

    if (student.qrIdentity?.qrDataUrl) {
      setQrIdentity(student.qrIdentity);
      return;
    }

    if (student.uid) {
      ensureStudentQrIdentity(student.uid)
        .then((qr) => {
          if (isMounted && qr) {
            setQrIdentity(qr);
          }
        })
        .catch((err) => {
          console.warn('ensureStudentQrIdentity note:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [student.uid, student.qrIdentity]);

  const isRevoked = qrIdentity?.status === 'revoked';
  const instantQrUrl = qrIdentity?.qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(student.uid || student.rollNumber || student.fullName || 'DA-STUDENT')}`;

  // If a custom uploaded template back image is present (or default template)
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-[0_0_24px_rgba(255,240,0,0.35),0_12px_28px_rgba(23,24,82,0.35)] border-2 border-[#20216B] ring-2 ring-[#FFF000]/60 bg-[#0A0D18] select-none transition-all print:border print:shadow-none ${className}`}
      style={{ aspectRatio: `${activeAspectRatio}` }}
    >
      {/* 1. Background Template Image */}
      <img
        src={backTemplateUrl}
        alt="ID Card Back Template"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Quick Flip to Front Side Button (Floating top-right) */}
      {showFlipButton && onFlipToFront && (
        <button
          type="button"
          onClick={onFlipToFront}
          className="absolute top-3 right-3 z-30 p-1.5 rounded-lg bg-[#20216B]/90 hover:bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/60 shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1 text-[10px] font-mono font-bold backdrop-blur-xs"
          title="Flip to Front Side"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Front</span>
        </button>
      )}

      {/* 2. Admin-Configured Dynamic QR Code Box */}
      {qrConfig.visible !== false && (
        <div
          className="absolute z-20 flex flex-col items-center justify-center transition-all"
          style={{
            left: `${qrConfig.x}%`,
            top: `${qrConfig.y}%`,
            width: `${qrConfig.width}%`,
            height: `${qrConfig.height}%`,
          }}
        >
          {/* QR Box Container */}
          <div
            className="w-full h-full bg-white shadow-xl flex flex-col items-center justify-center transition-all overflow-hidden relative"
            style={{
              padding: `${qrConfig.quietZone ?? 8}px`,
              borderRadius: `${qrConfig.borderRadius ?? 16}px`,
              border: `${qrConfig.borderWidth ?? 2}px solid ${qrConfig.borderColor ?? '#D4AF37'}`,
            }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <MemoizedQrCode
                tokenId={qrIdentity?.tokenId || student.qrIdentity?.tokenId}
                qrDataUrl={qrIdentity?.qrDataUrl || student.qrIdentity?.qrDataUrl}
                fallbackData={student.uid || student.rollNumber || student.fullName || 'DA-STUDENT'}
              />

              {/* Revocation Warning Overlay */}
              {isRevoked && (
                <div className="absolute inset-0 bg-red-950/90 backdrop-blur-2xs rounded flex flex-col items-center justify-center text-center p-2 text-red-200">
                  <AlertTriangle className="w-6 h-6 text-rose-400 mb-0.5" />
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-rose-200">
                    QR REVOKED
                  </span>
                  <span className="text-[8px] text-stone-300 leading-tight">
                    Token Invalidated
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Optional Configured QR Label Below */}
          {qrConfig.showLabel && qrConfig.label && (
            <div className="mt-1 text-center w-full">
              <span className="text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#FFF000] drop-shadow-md bg-black/60 px-2 py-0.5 rounded-full inline-block">
                {qrConfig.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
