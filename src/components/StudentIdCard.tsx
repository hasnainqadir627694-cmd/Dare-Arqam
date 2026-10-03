import React, { useRef, useState, useEffect } from 'react';
import { StudentProfile, IdCardTemplate } from '../types';
import { Emblem } from './Emblem';
import { StudentIdCardBack } from './StudentIdCardBack';
import { 
  User, 
  Camera, 
  RefreshCw, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  Calendar, 
  Award, 
  IdCard,
  Hash,
  Maximize2,
  RotateCw,
  Layers
} from 'lucide-react';
import { subscribeActiveTemplate, DEFAULT_TEMPLATE, formatClassValue, calculateAutoFitFontSize, getCachedActiveTemplateSync } from '../services/idCardTemplateService';

interface StudentIdCardProps {
  student: StudentProfile | {
    fullName: string;
    fatherName: string;
    className: string;
    rollNumber: string;
    whatsappNumber: string;
    email: string;
    profileImageUrl?: string;
    studentId?: string;
    createdAt?: string;
    session?: string;
    qrIdentity?: any;
    uid?: string;
  };
  template?: IdCardTemplate | null;
  onUploadPhoto?: (file: File) => void;
  isUploadingPhoto?: boolean;
  canUploadPhoto?: boolean;
  className?: string;
  variant?: 'student-view' | 'admin-view' | 'compact';
  initialSide?: 'front' | 'back' | 'both';
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({
  student,
  template: propTemplate,
  onUploadPhoto,
  isUploadingPhoto = false,
  canUploadPhoto = false,
  className = '',
  variant = 'student-view',
  initialSide = 'both',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<IdCardTemplate>(propTemplate || getCachedActiveTemplateSync());
  const [cardDisplayMode, setCardDisplayMode] = useState<'template' | 'classic'>('template');
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>(initialSide);

  // Sync with propTemplate or live active template from Firestore
  useEffect(() => {
    if (propTemplate) {
      setActiveTemplate(propTemplate);
      return;
    }

    const unsub = subscribeActiveTemplate((tpl) => {
      if (tpl) {
        setActiveTemplate(tpl);
      }
    });

    return () => unsub();
  }, [propTemplate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      onUploadPhoto(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formattedDate = student.createdAt 
    ? new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Session 2026';

  const cleanSession = (student as any).session || '2026–2027';

  // Dynamic template field configs
  const fields = activeTemplate.fields || DEFAULT_TEMPLATE.fields;

  return (
    <div className={`w-full max-w-xl mx-auto space-y-3 ${className}`}>
      {/* Hidden File Input for Profile Picture Upload */}
      {canUploadPhoto && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      {/* Control Bar: Side Switcher (Front/Back/Both) & Format Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        
        {/* Left: FRONT / BACK / DUAL Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            VIEW:
          </span>
          <div className="inline-flex p-0.5 bg-slate-200 rounded-lg shadow-inner">
            <button
              type="button"
              onClick={() => setCardSide('both')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                cardSide === 'both'
                  ? 'bg-[#171852] text-[#FFF000] border border-[#FFF000] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Both</span>
            </button>
            <button
              type="button"
              onClick={() => setCardSide('front')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                cardSide === 'front'
                  ? 'bg-[#171852] text-[#FFF000] border border-[#FFF000] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IdCard className="w-3.5 h-3.5" />
              <span>Front</span>
            </button>
            <button
              type="button"
              onClick={() => setCardSide('back')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                cardSide === 'back'
                  ? 'bg-[#171852] text-[#FFF000] border border-[#FFF000] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Right: Design Format & Photo Upload (when front is visible) */}
        <div className="flex items-center gap-2">
          {cardSide !== 'back' && (
            <div className="inline-flex p-0.5 bg-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setCardDisplayMode('template')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  cardDisplayMode === 'template'
                    ? 'bg-[#171852] text-[#FFF000] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Template
              </button>
              <button
                type="button"
                onClick={() => setCardDisplayMode('classic')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  cardDisplayMode === 'classic'
                    ? 'bg-[#171852] text-[#FFF000] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Classic
              </button>
            </div>
          )}

          {canUploadPhoto && cardSide !== 'back' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="text-[11px] font-bold text-[#20216B] hover:text-[#171852] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-[#20216B]" />
              <span>{student.profileImageUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RENDER: BACK SIDE ONLY MODE */}
      {/* ========================================================================= */}
      {cardSide === 'back' && (
        <div className="max-w-[380px] mx-auto animate-in fade-in duration-200">
          <StudentIdCardBack
            student={student}
            template={activeTemplate}
            aspectRatio={activeTemplate.aspectRatio || 0.625}
            onFlipToFront={() => setCardSide('front')}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* RENDER: FRONT SIDE (MODE 1: DYNAMIC UPLOADED TEMPLATE ID CARD) */}
      {/* ========================================================================= */}
      {cardSide !== 'back' && cardDisplayMode === 'template' && (
        <div className="relative mx-auto rounded-2xl overflow-hidden shadow-[0_0_24px_rgba(255,240,0,0.35),0_12px_28px_rgba(23,24,82,0.35)] border-2 border-[#20216B] ring-2 ring-[#FFF000]/60 max-w-[380px] w-full select-none bg-white transition-all print:border print:shadow-none">
          {/* Outer Aspect Ratio Frame */}
          <div 
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: `${activeTemplate.aspectRatio || 0.625}` }}
          >
            {/* 1. Uploaded Background Template Image */}
            <img
              src={activeTemplate.templateUrl}
              alt="Official ID Card Template"
              className="w-full h-full object-cover object-center absolute inset-0 pointer-events-none"
            />

            {/* 2. Dynamic Profile Picture */}
            {fields.profilePicture && fields.profilePicture.visible !== false && (
              <div
                className={`absolute overflow-hidden shadow-md flex items-center justify-center group ${
                  fields.profilePicture.shape === 'circle' ? 'rounded-full aspect-square' : 'aspect-square'
                }`}
                style={{
                  left: `${fields.profilePicture.x}%`,
                  top: `${fields.profilePicture.y}%`,
                  width: `${fields.profilePicture.width}%`,
                  height: (fields.profilePicture.shape === 'circle' || fields.profilePicture.shape === 'square' || fields.profilePicture.shape === 'rounded') 
                    ? `${fields.profilePicture.width * (activeTemplate.aspectRatio || 0.625)}%` 
                    : `${fields.profilePicture.height}%`,
                  aspectRatio: (fields.profilePicture.shape === 'circle' || fields.profilePicture.shape === 'square' || fields.profilePicture.shape === 'rounded') ? '1 / 1' : undefined,
                  borderRadius: fields.profilePicture.shape === 'circle' 
                    ? '9999px' 
                    : fields.profilePicture.shape === 'rounded'
                    ? `${fields.profilePicture.borderRadius ?? 16}px`
                    : '0px',
                  border: `${fields.profilePicture.borderWidth || 2}px solid ${fields.profilePicture.borderColor || '#20216B'}`,
                  isolation: 'isolate',
                }}
              >
                {student.profileImageUrl ? (
                  <img
                    src={student.profileImageUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    style={{
                      borderRadius: fields.profilePicture.shape === 'circle' 
                        ? '9999px' 
                        : fields.profilePicture.shape === 'rounded'
                        ? `${fields.profilePicture.borderRadius ?? 16}px`
                        : '0px',
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#E2E8F0] flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                    <User className="w-8 h-8 text-[#64748B]" />
                    <span className="text-[8px] font-mono font-bold text-[#475569] mt-0.5">
                      PHOTO
                    </span>
                  </div>
                )}

                {/* Upload Photo Overlay Trigger for Student */}
                {canUploadPhoto && !isUploadingPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-5 h-5 text-[#FFF000]" />
                  </button>
                )}

                {/* Uploading Spinner */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-[#0F1424]/85 backdrop-blur-2xs flex flex-col items-center justify-center text-white p-1 text-center">
                    <RefreshCw className="w-5 h-5 text-[#FFF000] animate-spin mb-1" />
                    <span className="text-[8px] font-mono font-bold text-[#FFF000]">
                      Saving...
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 3. Dynamic Student Name (Auto-Fit to Width, No Truncation) */}
            {fields.name && fields.name.visible !== false && (
              <div
                className="absolute flex items-center px-0.5 pointer-events-none overflow-visible"
                style={{
                  left: `${fields.name.x}%`,
                  top: `${fields.name.y}%`,
                  width: `${fields.name.width}%`,
                  height: `${fields.name.height}%`,
                  color: fields.name.color || '#0F1035',
                  fontSize: `${calculateAutoFitFontSize(student.fullName || 'Student Name', fields.name.width, fields.name.fontSize, 380)}px`,
                  fontWeight: fields.name.fontWeight || 'bold',
                  justifyContent: fields.name.textAlign === 'center' ? 'center' : fields.name.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: fields.name.textAlign || 'center',
                }}
              >
                <span className="whitespace-nowrap font-editorial leading-tight">
                  {student.fullName || 'Student Name'}
                </span>
              </div>
            )}

            {/* 4. Dynamic Father Name (Pure Father Name, No Prefixes) */}
            {fields.fatherName && fields.fatherName.visible !== false && (
              <div
                className="absolute flex items-center px-0.5 pointer-events-none overflow-visible"
                style={{
                  left: `${fields.fatherName.x}%`,
                  top: `${fields.fatherName.y}%`,
                  width: `${fields.fatherName.width}%`,
                  height: `${fields.fatherName.height}%`,
                  color: fields.fatherName.color || '#334155',
                  fontSize: `${calculateAutoFitFontSize(student.fatherName || 'Father Name', fields.fatherName.width, fields.fatherName.fontSize, 380)}px`,
                  fontWeight: fields.fatherName.fontWeight || 'semibold',
                  justifyContent: fields.fatherName.textAlign === 'center' ? 'center' : fields.fatherName.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: fields.fatherName.textAlign || 'center',
                }}
              >
                <span className="whitespace-nowrap font-prose-serif leading-tight">
                  {student.fatherName || 'Father Name'}
                </span>
              </div>
            )}

            {/* 5. Dynamic Class (Pure Class Number Only) */}
            {fields.className && fields.className.visible !== false && (
              <div
                className="absolute flex items-center px-0.5 pointer-events-none overflow-visible"
                style={{
                  left: `${fields.className.x}%`,
                  top: `${fields.className.y}%`,
                  width: `${fields.className.width}%`,
                  height: `${fields.className.height}%`,
                  color: fields.className.color || '#20216B',
                  fontSize: `${calculateAutoFitFontSize(formatClassValue(student.className, 'number-only'), fields.className.width, fields.className.fontSize, 380)}px`,
                  fontWeight: fields.className.fontWeight || 'bold',
                  justifyContent: fields.className.textAlign === 'center' ? 'center' : fields.className.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: fields.className.textAlign || 'center',
                }}
              >
                <span className="whitespace-nowrap font-bold leading-tight">
                  {formatClassValue(student.className, 'number-only')}
                </span>
              </div>
            )}

            {/* 6. Dynamic Roll Number (Pure Roll Digits Only) */}
            {fields.rollNumber && fields.rollNumber.visible !== false && (
              <div
                className="absolute flex items-center px-0.5 pointer-events-none font-mono overflow-visible"
                style={{
                  left: `${fields.rollNumber.x}%`,
                  top: `${fields.rollNumber.y}%`,
                  width: `${fields.rollNumber.width}%`,
                  height: `${fields.rollNumber.height}%`,
                  color: fields.rollNumber.color || '#171852',
                  fontSize: `${calculateAutoFitFontSize(student.rollNumber || '4892', fields.rollNumber.width, fields.rollNumber.fontSize, 380)}px`,
                  fontWeight: fields.rollNumber.fontWeight || 'extrabold',
                  justifyContent: fields.rollNumber.textAlign === 'center' ? 'center' : fields.rollNumber.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: fields.rollNumber.textAlign || 'center',
                }}
              >
                <span className="whitespace-nowrap font-extrabold leading-tight">
                  {student.rollNumber || '—'}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Card Security Strip */}
          <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-mono text-slate-600 font-bold">
                {student.studentId || `DA-${student.rollNumber}`}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              Session {cleanSession}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CLASSIC INSTITUTIONAL DOSSIER CARD (FRONT) */}
      {/* ========================================================================= */}
      {cardSide !== 'back' && cardDisplayMode === 'classic' && (
        <div className="relative bg-white rounded-2xl border-2 border-[#20216B] shadow-[0_0_24px_rgba(255,240,0,0.35),0_12px_28px_rgba(23,24,82,0.35)] ring-2 ring-[#FFF000]/60 overflow-hidden print:border print:shadow-none transition-all max-w-[440px] mx-auto">
          {/* Top Institutional Header Band */}
          <div className="bg-gradient-to-r from-[#171852] via-[#20216B] to-[#2E3192] text-white px-5 py-4 border-b-2 border-[#F5D900]">
            <div className="flex items-center justify-between gap-3">
              {/* Left: DARE ARQAM Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#FFF000] bg-white p-0.5 shadow-md shrink-0 flex items-center justify-center">
                  <Emblem size="sm" className="!w-full !h-full" />
                </div>
                <div className="space-y-0.5">
                  <div className="font-editorial text-sm sm:text-base font-extrabold tracking-wide uppercase text-white leading-tight">
                    DAR - E - ARQAM SCHOOL
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono tracking-widest text-[#FFF000] font-bold uppercase">
                    Katlang Campus · Official Student ID Card
                  </div>
                  <div className="text-[9px] text-[#EEF0FF]/80 tracking-wider uppercase font-medium">
                    Registered Academic Directorate · Est. 1998
                  </div>
                </div>
              </div>

              {/* Right: Academic Session Badge */}
              <div className="hidden sm:flex flex-col items-end shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFF000] text-[#171852] border border-[#D4AF37] shadow-xs">
                  {cleanSession}
                </span>
                <span className="text-[9px] font-mono text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  VERIFIED REGULAR
                </span>
              </div>
            </div>
          </div>

          {/* Card Body Content */}
          <div className="p-5 sm:p-6 bg-radial from-slate-50 to-white relative">
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Student Photo Column */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center space-y-2.5">
                <div className="relative group">
                  <div className="w-32 h-36 sm:w-34 sm:h-40 rounded-xl overflow-hidden border-2 border-[#20216B] shadow-md bg-[#EEF2F8] flex items-center justify-center">
                    {student.profileImageUrl ? (
                      <img
                        src={student.profileImageUrl}
                        alt={student.fullName}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#EEF2F8] to-[#CBD5E1] text-slate-400 p-2 text-center">
                        <User className="w-16 h-16 text-[#64748B] stroke-[1.5]" />
                        <span className="text-[9px] font-mono font-semibold text-[#475569] mt-1">
                          PHOTO PENDING
                        </span>
                      </div>
                    )}

                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-[#0F1424]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 text-center">
                        <RefreshCw className="w-6 h-6 text-[#FFF000] animate-spin mb-1" />
                        <span className="text-[10px] font-mono font-bold text-[#FFF000]">
                          Optimizing...
                        </span>
                      </div>
                    )}
                  </div>

                  {canUploadPhoto && !isUploadingPhoto && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 right-2 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] hover:text-white p-2 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Upload or Change Profile Photo"
                      aria-label="Upload student profile picture"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EEF0FF] text-[#20216B] border border-[#20216B]/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>{student.studentId || `DA-${student.rollNumber}`}</span>
                </div>
              </div>

              {/* Student Dossier Information */}
              <div className="sm:col-span-8 space-y-3 sm:pl-2 text-left">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    STUDENT NAME
                  </div>
                  <div className="font-editorial text-lg sm:text-xl font-extrabold text-[#0F1035] leading-tight">
                    {student.fullName || 'Student Name'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                    FATHER'S NAME
                  </div>
                  <div className="font-editorial text-xs sm:text-sm font-bold text-[#1E293B]">
                    {student.fatherName || 'Father Name'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                  <div className="bg-[#EEF2F8] p-2.5 rounded-lg border border-[#CBD5E1]">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-[#20216B] font-bold">
                      ACADEMIC CLASS
                    </div>
                    <div className="font-editorial text-xs sm:text-sm font-bold text-[#0F1035] mt-0.5 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#20216B] shrink-0" />
                      <span className="truncate">{student.className || 'Not Assigned'}</span>
                    </div>
                  </div>

                  <div className="bg-[#FFFDE6] p-2.5 rounded-lg border border-[#F5D900]">
                    <div className="text-[9px] font-mono uppercase tracking-wider text-[#8A7100] font-bold">
                      ROLL NUMBER
                    </div>
                    <div className="font-mono text-sm sm:text-base font-extrabold text-[#171852] mt-0.5">
                      {student.rollNumber || '—'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-3 h-3 text-emerald-700" />
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 font-mono">WhatsApp:</span>
                    <span className="font-mono font-semibold text-[#0F1035] text-[11px] sm:text-xs">
                      {student.whatsappNumber || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Mail className="w-3 h-3 text-blue-700" />
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 font-mono">Email:</span>
                    <span className="font-mono font-medium text-[#0F1035] text-[11px] truncate max-w-[200px] sm:max-w-xs">
                      {student.email || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#20216B] text-[#FFF000] flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                DA
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  ENROLLED ON
                </div>
                <div className="text-[11px] font-semibold text-[#1E293B]">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 shadow-2xs">
              <div className="text-right">
                <div className="text-[9px] font-mono font-bold text-[#20216B] uppercase tracking-wider">
                  DIGITAL ID
                </div>
                <div className="text-[8px] font-mono text-slate-500">
                  OFFICIAL RECORD
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-[#20216B] text-[#FFF000] flex items-center justify-center shrink-0 p-1 font-mono font-bold text-xs">
                <ShieldCheck className="w-5 h-5 text-[#FFF000]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RENDER: BACK SIDE (WHEN DUAL / BOTH SIDES IS ACTIVE) */}
      {/* ========================================================================= */}
      {cardSide === 'both' && (
        <div className="space-y-3 pt-2">
          {/* Institutional Divider Ribbon */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-px bg-slate-300 flex-1" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171852] text-[#FFF000] border border-[#D4AF37] text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs">
              <QrCode className="w-3.5 h-3.5 text-[#FFF000]" />
              <span>OFFICIAL ID CARD · BACK SIDE (PERMANENT QR IDENTITY)</span>
            </div>
            <div className="h-px bg-slate-300 flex-1" />
          </div>

          <div className="max-w-[380px] mx-auto animate-in fade-in duration-200">
            <StudentIdCardBack
              student={student}
              template={activeTemplate}
              aspectRatio={activeTemplate.aspectRatio || 0.625}
              showFlipButton={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
