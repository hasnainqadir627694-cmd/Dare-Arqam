import React, { useState, useEffect } from 'react';
import { PageId, Notice, StudentProfile } from '../types';
import { RESULTS_DATABASE, NOTICES_DATA, DOWNLOADS_DATA } from '../data/mockData';
import { StudentIdCard } from '../components/StudentIdCard';
import { 
  User, 
  BookOpen, 
  Award, 
  Calendar, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  LogOut, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  Mail,
  Camera,
  RefreshCw,
  Lock,
  Edit3,
  HelpCircle,
  Sparkles,
  ExternalLink,
  QrCode,
  Layers,
  Check
} from 'lucide-react';
import { 
  uploadStudentProfilePicture, 
  updateStudentProfile,
  subscribeStudentProfile,
  getStudentProfile,
  ensureStudentQrIdentity
} from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';
import { StudentPhotoCustomizerModal } from '../components/StudentPhotoCustomizerModal';

interface StudentPortalViewProps {
  onNavigate: (page: PageId) => void;
  onSelectNotice: (notice: Notice) => void;
  onLogout: () => void;
  studentProfile?: StudentProfile | any;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onNavigate,
  onSelectNotice,
  onLogout,
  studentProfile: initialProfile,
}) => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(initialProfile || null);

  // Profile Picture Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Profile Photo Customizer Modal State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerFile, setCustomizerFile] = useState<File | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'id-card' | 'profile' | 'academic' | 'attendance' | 'notices' | 'downloads'>('id-card');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    whatsappNumber: '',
    fatherName: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [showClassChangeHelp, setShowClassChangeHelp] = useState(false);

  // Real-time synchronization for student profile
  useEffect(() => {
    if (!user?.uid) return;

    // Load initial
    getStudentProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setEditFormData({
          whatsappNumber: p.whatsappNumber || '',
          fatherName: p.fatherName || '',
        });
      }
    });

    // Realtime Firestore subscriber
    const unsub = subscribeStudentProfile(user.uid, (updated) => {
      if (updated) {
        setProfile(updated);
        setEditFormData({
          whatsappNumber: updated.whatsappNumber || '',
          fatherName: updated.fatherName || '',
        });
      }
    });

    return () => unsub();
  }, [user?.uid]);

  // Handle Profile Picture Upload
  const handleUploadPhoto = async (file: File) => {
    setIsUploadingPhoto(true);
    setUploadFeedback({ type: 'info', text: 'Applying cropped profile photo to your ID Card...' });

    // Helper to read file as data URL
    const readFileAsDataUrl = (blob: Blob): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    };

    try {
      if (user?.uid) {
        const downloadUrl = await uploadStudentProfilePicture(user.uid, file, (stage) => {
          if (stage === 'uploading') {
            setUploadFeedback({ type: 'info', text: 'Uploading high-resolution photo to secure storage...' });
          } else if (stage === 'completed') {
            setUploadFeedback({ type: 'success', text: 'Profile picture updated successfully!' });
          }
        });

        // Update state locally
        setProfile((prev) => prev ? { ...prev, profileImageUrl: downloadUrl } : ({ fullName: 'Student', profileImageUrl: downloadUrl } as any));
        await refreshProfile();
        setUploadFeedback({ type: 'success', text: 'Cropped profile photo saved and applied to ID Card!' });
        setTimeout(() => setUploadFeedback(null), 4000);
      } else {
        // Fallback for unauthenticated preview mode: generate data URL immediately
        const localDataUrl = await readFileAsDataUrl(file);
        setProfile((prev) => prev ? { ...prev, profileImageUrl: localDataUrl } : ({ fullName: 'Student', profileImageUrl: localDataUrl } as any));
        setUploadFeedback({ type: 'success', text: 'Cropped profile photo applied to ID Card!' });
        setTimeout(() => setUploadFeedback(null), 4000);
      }
    } catch (err: any) {
      console.error('Profile photo upload error:', err);
      try {
        const fallbackUrl = await readFileAsDataUrl(file);
        setProfile((prev) => prev ? { ...prev, profileImageUrl: fallbackUrl } : ({ fullName: 'Student', profileImageUrl: fallbackUrl } as any));
        setUploadFeedback({ type: 'success', text: 'Cropped photo saved and applied to ID Card!' });
        setTimeout(() => setUploadFeedback(null), 4000);
      } catch {
        setUploadFeedback({
          type: 'error',
          text: err?.message || 'Failed to update profile picture. Please try again with a valid photo.',
        });
        setTimeout(() => setUploadFeedback(null), 6000);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Student Dossier Data
  const studentData = {
    fullName: profile?.fullName || user?.displayName || 'Registered Student',
    fatherName: profile?.fatherName || 'Guardian',
    className: profile?.className || 'Class 1',
    rollNumber: profile?.rollNumber || '—',
    whatsappNumber: profile?.whatsappNumber || '—',
    email: profile?.email || user?.email || '—',
    profileImageUrl: profile?.profileImageUrl || '',
    studentId: profile?.studentId || (profile?.rollNumber ? `DA-${new Date().getFullYear()}-${profile.rollNumber}` : 'DA-2026'),
    createdAt: profile?.createdAt || new Date().toISOString(),
    session: `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`,
    qrIdentity: profile?.qrIdentity,
    uid: user?.uid || profile?.uid,
  };

  // Auto-ensure student QR identity is provisioned
  useEffect(() => {
    if (studentData?.uid && (!studentData.qrIdentity || !studentData.qrIdentity.qrDataUrl)) {
      ensureStudentQrIdentity(studentData.uid)
        .then((qr) => {
          if (qr) {
            setProfile((prev) => prev ? { ...prev, qrIdentity: qr } : prev);
          }
        })
        .catch((err) => {
          console.warn('QR auto-ensure in student portal note:', err);
        });
    }
  }, [studentData?.uid, studentData?.qrIdentity?.qrDataUrl]);

  // Download personal QR image
  const handleDownloadPersonalQr = () => {
    const qrUrl = studentData?.qrIdentity?.qrDataUrl;
    if (!qrUrl) {
      alert('Your permanent QR Code is generating. Please wait a moment and try again.');
      return;
    }
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `dare-arqam-qr-${studentData.rollNumber || studentData.uid || 'student'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Open the interactive customization modal when student selects an image
  const handleStartCustomizePhoto = (file: File) => {
    setCustomizerFile(file);
    setIsCustomizerOpen(true);
  };

  // When student confirms in the modal, upload the perfected image
  const handleSaveCustomizedPhoto = async (processedFile: File) => {
    setIsCustomizerOpen(false);
    await handleUploadPhoto(processedFile);
  };

  // Handle Edit Permitted Profile Fields
  const handleSavePermittedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    setIsSavingProfile(true);
    try {
      await updateStudentProfile(user.uid, {
        whatsappNumber: editFormData.whatsappNumber.trim(),
        fatherName: editFormData.fatherName.trim(),
      });
      setEditSuccessMsg('Profile information updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setEditSuccessMsg(''), 3500);
    } catch (err: any) {
      alert('Could not update profile: ' + (err?.message || 'Permission denied'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* 1. Top Portal Header Bar */}
      <div className="bg-white border-2 border-[#20216B] rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Student Photo / Avatar Preview */}
          <div 
            onClick={() => {
              setCustomizerFile(null);
              setIsCustomizerOpen(true);
            }}
            className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#EEF2F8] border-2 border-[#20216B] flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
            title="Click to customize profile photo"
          >
            {studentData.profileImageUrl ? (
              <img
                src={studentData.profileImageUrl}
                alt={studentData.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-[#475569]" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#FFF000] transition-opacity">
              <Camera className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-[#20216B] text-white rounded-full p-0.5 border border-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FFF000]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-[#20216B] bg-[#EEF0FF] px-2 py-0.5 rounded-md border border-[#20216B]/20">
                {studentData.studentId}
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ACTIVE / REGULAR ENROLLED
              </span>
            </div>
            <h1 className="font-editorial text-xl sm:text-2xl font-bold text-[#0F1035] mt-1">
              {studentData.fullName}
            </h1>
            <p className="text-xs text-slate-600 font-mono">
              Class: <span className="font-bold text-[#20216B]">{studentData.className}</span> · Roll #: <span className="font-bold text-[#20216B]">{studentData.rollNumber}</span> · {studentData.email}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-[#1E293B] hover:text-[#20216B] bg-[#EEF2F8] hover:bg-[#E2E8F0] border border-[#CBD5E1] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-[#20216B]" />
            <span>Print Student Card</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="px-3.5 py-2 text-xs font-bold text-red-700 hover:text-white hover:bg-red-700 bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all shadow-sm ${
            uploadFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : uploadFeedback.type === 'error'
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {uploadFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : uploadFeedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          )}
          <span className="font-semibold">{uploadFeedback.text}</span>
        </div>
      )}

      {/* Success Banner from Profile Save */}
      {editSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{editSuccessMsg}</span>
        </div>
      )}

      {/* 2. Portal Segmented Tab Navigation */}
      <div className="bg-[#EEF2F8] p-1.5 rounded-xl flex flex-wrap gap-1 border border-[#CBD5E1]">
        <button
          type="button"
          onClick={() => setActiveTab('id-card')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'id-card'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Digital Student ID Card</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Dossier</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'academic'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum & Results</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance Record</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'notices'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Institutional Circulars</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'downloads'
              ? 'bg-[#20216B] text-[#FFF000] shadow-sm'
              : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Downloads</span>
        </button>
      </div>

      {/* 3. TAB 1: DIGITAL STUDENT ID CARD SHOWCASE */}
      {activeTab === 'id-card' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6 text-center space-y-2">
            <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#0F1035] flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span>Official Institutional Digital ID Card</span>
            </h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto">
              This digital identity card is verified by DARE ARQAM School Katlang Campus Directorate.
              Click the camera icon on the card below to upload or change your official profile picture.
            </p>
          </div>

          {/* Institutional Student ID Card Component */}
          <StudentIdCard
            student={studentData}
            canUploadPhoto={true}
            onUploadPhoto={handleStartCustomizePhoto}
            isUploadingPhoto={isUploadingPhoto}
            variant="student-view"
          />

          {/* Quick Actions Under ID Card */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCustomizerFile(null);
                setIsCustomizerOpen(true);
              }}
              className="px-4 py-2 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] border border-[#D4AF37] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#FFF000]" />
              <span>Customize Profile Photo (Crop & Zoom)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPersonalQr}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Download Permanent QR Code</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Official Student ID Card (Front & Back)</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* PERMANENT STUDENT QR CODE IDENTITY & VERIFICATION STATION */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-[#0F1424] via-[#141B34] to-[#1C244B] border-2 border-[#20216B] rounded-2xl p-5 sm:p-6 shadow-xl text-white space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#263352] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#20216B] border border-[#D4AF37] flex items-center justify-center text-[#FFF000] shadow-md shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1C2546] text-[#FFF000] border border-[#D4AF37]/50 mb-1">
                    <ShieldCheck className="w-3 h-3 text-[#FFF000]" />
                    <span>PERMANENT STUDENT IDENTITY TOKEN</span>
                  </div>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-white">
                    Your Permanent Personal QR Identity
                  </h3>
                  <p className="text-xs text-stone-300">
                    This unique permanent QR code is assigned to your Dar-e-Arqam student profile. It never changes when you update photos or details.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex items-center gap-2">
                {studentData?.qrIdentity?.status === 'revoked' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-600/70 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>STATUS: REVOKED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/70 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>STATUS: ACTIVE & VERIFIED</span>
                  </span>
                )}
              </div>
            </div>

            {/* QR Card & Guidelines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* QR Image Box */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border-2 border-[#D4AF37] space-y-2 text-center">
                {studentData?.qrIdentity?.qrDataUrl ? (
                  <img
                    src={studentData.qrIdentity.qrDataUrl}
                    alt="Student Permanent QR Code"
                    className="w-40 h-40 object-contain rounded-lg block"
                  />
                ) : (
                  <div className="w-40 h-40 bg-slate-100 flex flex-col items-center justify-center text-slate-500 rounded-lg space-y-2">
                    <RefreshCw className="w-6 h-6 text-[#20216B] animate-spin" />
                    <span className="text-[10px] font-mono font-bold text-[#20216B]">Generating Identity...</span>
                  </div>
                )}
                
                <div className="text-[10px] font-mono font-bold text-slate-700">
                  SCAN TO VERIFY STUDENT
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPersonalQr}
                  className="w-full py-1.5 px-3 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download QR (.PNG)</span>
                </button>
              </div>

              {/* Security & Future E-Attendance Details */}
              <div className="md:col-span-8 space-y-3 font-mono text-xs">
                <div className="bg-[#101528] p-3.5 rounded-xl border border-[#243052] space-y-2">
                  <div className="flex items-center justify-between text-[11px] border-b border-[#1E293B] pb-2">
                    <span className="text-slate-400">Secure Token ID:</span>
                    <span className="text-cyan-300 font-bold select-all">
                      {studentData?.qrIdentity?.tokenId || 'DA-QR-TOKEN'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] border-b border-[#1E293B] pb-2">
                    <span className="text-slate-400">Associated Roll #:</span>
                    <span className="text-amber-300 font-bold">
                      {studentData.rollNumber || '—'} ({studentData.className || 'Enrolled'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Privacy & Security:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Non-Sensitive Token Encrypted</span>
                    </span>
                  </div>
                </div>

                {/* Information Bullet Points */}
                <div className="space-y-1.5 text-stone-300 text-[11px] leading-relaxed">
                  <p className="flex items-start gap-2">
                    <span className="text-[#FFF000] font-bold">✓</span>
                    <span><strong>Permanent Back Side Placement:</strong> Your QR code is stamped onto the official Back Side of your Student ID Card.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#FFF000] font-bold">✓</span>
                    <span><strong>Automatic Verification:</strong> Any camera scan looks up your authorized academic verification page in real time.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[#FFF000] font-bold">✓</span>
                    <span><strong>Future E-Attendance Ready:</strong> This same permanent QR code will link with the Dar-e-Arqam Katlang Campus mobile attendance gates.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: PROFILE & DOSSIER */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="font-editorial text-base font-bold text-[#0F1035] flex items-center gap-2">
                <User className="w-4 h-4 text-[#20216B]" />
                <span>Academic Identity Details</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
              <div>
                <dt className="text-slate-500 font-mono font-semibold uppercase text-[10px]">Full Name</dt>
                <dd className="font-bold text-[#0F1035] text-sm mt-0.5">{studentData.fullName}</dd>
              </div>

              <div>
                <dt className="text-slate-500 font-mono font-semibold uppercase text-[10px]">Father Name</dt>
                <dd className="font-bold text-[#0F1035] text-sm mt-0.5">{studentData.fatherName}</dd>
              </div>

              {/* Class (Protected Field) */}
              <div className="bg-[#EEF2F8] p-2.5 rounded-xl border border-[#CBD5E1]">
                <div className="flex items-center justify-between">
                  <dt className="text-[#20216B] font-mono font-bold uppercase text-[9px]">Class</dt>
                  <span title="Protected Field">
                    <Lock className="w-3 h-3 text-[#20216B]" />
                  </span>
                </div>
                <dd className="font-extrabold text-[#0F1035] text-xs sm:text-sm mt-0.5">{studentData.className}</dd>
                <span className="text-[9px] text-slate-500 block mt-0.5">Fixed at registration</span>
              </div>

              {/* Roll Number (Protected Field) */}
              <div className="bg-[#FFFDE6] p-2.5 rounded-xl border border-[#F5D900]">
                <div className="flex items-center justify-between">
                  <dt className="text-[#8A7100] font-mono font-bold uppercase text-[9px]">Roll Number</dt>
                  <span title="Protected Field">
                    <Lock className="w-3 h-3 text-[#8A7100]" />
                  </span>
                </div>
                <dd className="font-mono font-extrabold text-[#171852] text-sm sm:text-base mt-0.5">{studentData.rollNumber}</dd>
                <span className="text-[9px] text-[#8A7100] block mt-0.5">Directorate Assigned</span>
              </div>

              <div>
                <dt className="text-slate-500 font-mono font-semibold uppercase text-[10px]">WhatsApp Contact</dt>
                <dd className="font-mono font-bold text-[#0F1035] mt-0.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{studentData.whatsappNumber}</span>
                </dd>
              </div>

              <div>
                <dt className="text-slate-500 font-mono font-semibold uppercase text-[10px]">Email Address</dt>
                <dd className="font-mono text-[#0F1035] mt-0.5 truncate text-[11px] sm:text-xs">
                  {studentData.email}
                </dd>
              </div>
            </dl>

            {/* Protected Field Request Banner */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowClassChangeHelp(!showClassChangeHelp)}
                className="text-xs text-[#20216B] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Need to update Class or Roll Number?</span>
              </button>

              {showClassChangeHelp && (
                <div className="mt-2.5 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1.5 animate-in fade-in">
                  <p className="font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Protected Identity Fields</span>
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    To maintain academic record integrity, Roll Number and Class cannot be altered arbitrarily by students. 
                    Please contact the Directorate administration office at <strong>info@dare-arqam.edu.pk</strong> or call <strong>+92-937-567890</strong> to request official record changes.
                  </p>
                </div>
              )}
            </div>

            {/* Profile Photo Quick Customize Section */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-[#20216B] shrink-0 flex items-center justify-center">
                  {studentData.profileImageUrl ? (
                    <img src={studentData.profileImageUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Profile Picture</span>
                  <span className="text-xs text-[#0F1035] font-semibold">Official ID Card Photo</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCustomizerFile(null);
                  setIsCustomizerOpen(true);
                }}
                className="px-3 py-1.5 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-bold rounded-lg border border-[#D4AF37]/50 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Customize Photo</span>
              </button>
            </div>
          </div>

          {/* Edit Permitted Info Card */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="font-editorial text-base font-bold text-[#0F1035] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#20216B]" />
                <span>Editable Contact Information</span>
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">Student Permitted</span>
            </div>

            <form onSubmit={handleSavePermittedProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  WhatsApp Contact Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={editFormData.whatsappNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsappNumber: e.target.value })}
                    placeholder="03001234567"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-[#20216B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Father Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editFormData.fatherName}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                    placeholder="Father Name"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#20216B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Registered Email (Fixed)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={studentData.email}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-100 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-2.5 px-4 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Contact Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ACADEMIC & RESULTS */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-slate-200">
              Official Enrolled Curriculum for {studentData.className} (Session {studentData.session})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-[#EEF2F8] text-[#1E293B] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Weekly Hours</th>
                    <th className="py-2.5 px-3">Medium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[#0F1035]">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">English Language & Literature</td>
                    <td className="py-2.5 px-3 font-mono">ENG-101</td>
                    <td className="py-2.5 px-3">Compulsory</td>
                    <td className="py-2.5 px-3">6 Hours</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Urdu Qawaid & Insha</td>
                    <td className="py-2.5 px-3 font-mono">URD-102</td>
                    <td className="py-2.5 px-3">Compulsory</td>
                    <td className="py-2.5 px-3">6 Hours</td>
                    <td className="py-2.5 px-3">Urdu</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Mathematics</td>
                    <td className="py-2.5 px-3 font-mono">MTH-201</td>
                    <td className="py-2.5 px-3">Core Science</td>
                    <td className="py-2.5 px-3">7 Hours</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">General Science & Practical Lab</td>
                    <td className="py-2.5 px-3 font-mono">SCI-202</td>
                    <td className="py-2.5 px-3">Science</td>
                    <td className="py-2.5 px-3">6 Hours</td>
                    <td className="py-2.5 px-3">English</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold">Islamiyat & Quranic Tajweed</td>
                    <td className="py-2.5 px-3 font-mono">ISL-103</td>
                    <td className="py-2.5 px-3">Compulsory</td>
                    <td className="py-2.5 px-3">5 Hours</td>
                    <td className="py-2.5 px-3">Urdu / Arabic</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: ATTENDANCE RECORD */}
      {activeTab === 'attendance' && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-slate-200">
            Official Attendance Transcript
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
              <span className="text-[11px] font-mono text-emerald-800 font-bold uppercase">Attendance Rate</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">96.5%</div>
              <span className="text-[10px] text-emerald-600">Satisfactory</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
              <span className="text-[11px] font-mono text-blue-800 font-bold uppercase">Working Days</span>
              <div className="text-2xl font-extrabold text-blue-700 mt-1">150</div>
              <span className="text-[10px] text-blue-600">Total Term</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="text-[11px] font-mono text-slate-800 font-bold uppercase">Present Days</span>
              <div className="text-2xl font-extrabold text-slate-700 mt-1">145</div>
              <span className="text-[10px] text-slate-600">Verified</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
              <span className="text-[11px] font-mono text-amber-800 font-bold uppercase">Excused Leaves</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">5</div>
              <span className="text-[10px] text-amber-600">Sanctioned</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 5: NOTICES */}
      {activeTab === 'notices' && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-slate-200">
            Directorate Circulars & Notices for {studentData.className}
          </h2>
          <div className="space-y-3">
            {NOTICES_DATA.slice(0, 3).map((notice) => (
              <div
                key={notice.id}
                onClick={() => onSelectNotice(notice)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#20216B] transition-all bg-slate-50 hover:bg-white cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#20216B] text-[#FFF000]">
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{notice.date}</span>
                  </div>
                  <h4 className="font-editorial text-xs sm:text-sm font-bold text-[#0F1035] group-hover:text-[#20216B]">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-prose-serif">
                    {notice.summary}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#20216B] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB 6: DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-[#0F1035] pb-2 border-b border-slate-200">
            Official Curriculum & Form Downloads
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOWNLOADS_DATA.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-editorial text-xs font-bold text-[#0F1035] truncate max-w-[200px]">
                    {doc.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    {doc.category} · {doc.fileSize}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Downloading ${doc.title}...`)}
                  className="p-2 rounded-lg bg-[#20216B] hover:bg-[#171852] text-[#FFF000] cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Student Photo Customizer Modal */}
      <StudentPhotoCustomizerModal
        isOpen={isCustomizerOpen}
        imageFile={customizerFile}
        currentImageUrl={studentData.profileImageUrl}
        studentName={studentData.fullName}
        studentClass={studentData.className}
        studentRoll={studentData.rollNumber}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={handleSaveCustomizedPhoto}
        isSaving={isUploadingPhoto}
      />
    </div>
  );
};
