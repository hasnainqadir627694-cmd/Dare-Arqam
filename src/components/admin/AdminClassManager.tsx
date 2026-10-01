import React, { useState, useEffect, useMemo } from 'react';
import { StudentProfile, DARE_ARQAM_CLASSES } from '../../types';
import { 
  subscribeAllStudents, 
  fetchAllStudents,
  revokeStudentQrIdentity,
  restoreStudentQrIdentity,
  regenerateStudentQrIdentity,
  ensureStudentQrIdentity,
  adminUpdateStudentClass,
  adminDeleteStudent,
  adminAddStudentManual
} from '../../services/firebaseService';
import { StudentIdCard } from '../StudentIdCard';
import { 
  GraduationCap, 
  Users, 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  Award, 
  Phone, 
  Mail, 
  Calendar, 
  IdCard, 
  Printer, 
  X, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  User, 
  Hash,
  CheckCircle2,
  BookOpen,
  QrCode,
  AlertTriangle,
  Download,
  Lock,
  Unlock,
  Plus,
  Trash2
} from 'lucide-react';

interface AdminClassManagerProps {
  onSuccessNotification?: (msg: string) => void;
  initialClass?: string | null;
}

export const AdminClassManager: React.FC<AdminClassManagerProps> = ({
  onSuccessNotification,
  initialClass = null,
}) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected class view state: null = list of all 13 class tabs/cards; string = view students inside that class
  const [activeClass, setActiveClass] = useState<string | null>(initialClass);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected student for complete Profile / ID Card Modal
  const [inspectedStudent, setInspectedStudent] = useState<StudentProfile | null>(null);
  const [isQrActionLoading, setIsQrActionLoading] = useState(false);
  const [qrActionFeedback, setQrActionFeedback] = useState<string | null>(null);

  // Manual Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: '',
    fatherName: '',
    rollNumber: '',
    whatsappNumber: '',
    email: '',
    section: 'Section A',
  });

  const handleManualAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;
    if (!newStudentForm.fullName.trim() || !newStudentForm.rollNumber.trim()) {
      alert('Please fill in Student Name and Roll Number.');
      return;
    }

    try {
      setIsSubmittingStudent(true);
      await adminAddStudentManual({
        fullName: newStudentForm.fullName,
        fatherName: newStudentForm.fatherName || 'Guardian',
        className: activeClass,
        rollNumber: newStudentForm.rollNumber,
        whatsappNumber: newStudentForm.whatsappNumber || '03000000000',
        email: newStudentForm.email || `${Date.now()}@darearqam.edu.pk`,
        section: newStudentForm.section || 'Section A',
      });
      if (onSuccessNotification) {
        onSuccessNotification(`Successfully added ${newStudentForm.fullName} to ${activeClass}!`);
      }
      setIsAddStudentModalOpen(false);
      setNewStudentForm({
        fullName: '',
        fatherName: '',
        rollNumber: '',
        whatsappNumber: '',
        email: '',
        section: 'Section A',
      });
    } catch (err: any) {
      alert(`Error adding student: ${err.message || err}`);
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleClassTransfer = async (student: StudentProfile, targetClass: string) => {
    if (!student.uid || student.className === targetClass) return;
    const confirmed = window.confirm(
      `Transfer ${student.fullName} from ${student.className} to ${targetClass}?`
    );
    if (!confirmed) return;

    try {
      await adminUpdateStudentClass(student.uid, targetClass);
      if (onSuccessNotification) {
        onSuccessNotification(`Transferred ${student.fullName} to ${targetClass} successfully!`);
      }
      if (inspectedStudent && inspectedStudent.uid === student.uid) {
        setInspectedStudent({ ...inspectedStudent, className: targetClass });
      }
    } catch (err: any) {
      alert(`Error transferring class: ${err.message || err}`);
    }
  };

  const handleDeleteStudentRecord = async (student: StudentProfile) => {
    if (!student.uid) return;
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to PERMANENTLY DELETE student "${student.fullName}" (Roll #${student.rollNumber})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await adminDeleteStudent(student.uid);
      if (onSuccessNotification) {
        onSuccessNotification(`Student ${student.fullName} deleted successfully.`);
      }
      if (inspectedStudent && inspectedStudent.uid === student.uid) {
        setInspectedStudent(null);
      }
    } catch (err: any) {
      alert(`Error deleting student: ${err.message || err}`);
    }
  };

  // Handle revoking QR Identity
  const handleRevokeQr = async (student: StudentProfile) => {
    if (!student.uid) return;
    const confirmed = window.confirm(
      `Are you sure you want to REVOKE the QR Identity for ${student.fullName}? The student's current QR code will immediately stop scanning/resolving.`
    );
    if (!confirmed) return;

    try {
      setIsQrActionLoading(true);
      await revokeStudentQrIdentity(student.uid, 'Revoked by School Administration');
      setQrActionFeedback('QR Identity successfully revoked.');
      if (onSuccessNotification) onSuccessNotification('QR Identity successfully revoked.');
      // Refresh local inspectedStudent
      setInspectedStudent((prev) =>
        prev && prev.uid === student.uid
          ? { ...prev, qrIdentity: { ...(prev.qrIdentity as any), status: 'revoked' } }
          : prev
      );
      setTimeout(() => setQrActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error revoking QR code: ${err.message || err}`);
    } finally {
      setIsQrActionLoading(false);
    }
  };

  // Handle restoring QR Identity
  const handleRestoreQr = async (student: StudentProfile) => {
    if (!student.uid) return;
    try {
      setIsQrActionLoading(true);
      await restoreStudentQrIdentity(student.uid);
      setQrActionFeedback('QR Identity successfully reactivated.');
      if (onSuccessNotification) onSuccessNotification('QR Identity successfully reactivated.');
      setInspectedStudent((prev) =>
        prev && prev.uid === student.uid
          ? { ...prev, qrIdentity: { ...(prev.qrIdentity as any), status: 'active' } }
          : prev
      );
      setTimeout(() => setQrActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error reactivating QR code: ${err.message || err}`);
    } finally {
      setIsQrActionLoading(false);
    }
  };

  // Handle regenerating a new QR Identity
  const handleRegenerateQr = async (student: StudentProfile) => {
    if (!student.uid) return;
    const confirmed = window.confirm(
      `⚠️ WARNING: Regenerating will PERMANENTLY INVALIDATE the current QR code for ${student.fullName}. Any physical ID cards with the old QR will no longer scan or resolve. A new unique permanent token will be issued. Proceed?`
    );
    if (!confirmed) return;

    try {
      setIsQrActionLoading(true);
      const newQr = await regenerateStudentQrIdentity(student.uid);
      setQrActionFeedback('New Permanent QR Identity successfully generated & linked.');
      if (onSuccessNotification) onSuccessNotification('New Permanent QR Identity generated.');
      setInspectedStudent((prev) =>
        prev && prev.uid === student.uid ? { ...prev, qrIdentity: newQr } : prev
      );
      setTimeout(() => setQrActionFeedback(null), 4000);
    } catch (err: any) {
      alert(`Error regenerating QR code: ${err.message || err}`);
    } finally {
      setIsQrActionLoading(false);
    }
  };

  // Handle downloading QR image
  const handleDownloadQrImage = (student: StudentProfile) => {
    const qrUrl = (student.qrIdentity as any)?.qrDataUrl;
    if (!qrUrl) {
      alert('QR Code image is currently generating. Please retry in a moment.');
      return;
    }
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `dare-arqam-qr-${student.rollNumber || student.uid}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Real-time synchronization for all students from Firebase
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Initial fetch
    fetchAllStudents().then((data) => {
      if (isMounted) {
        setStudents(data);
        setIsLoading(false);
      }
    });

    // Real-time listener
    const unsub = subscribeAllStudents((updatedStudents) => {
      if (isMounted) {
        setStudents(updatedStudents);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Group all students by their registered class
  const studentsByClass = useMemo(() => {
    const map: Record<string, StudentProfile[]> = {};
    DARE_ARQAM_CLASSES.forEach((cls) => {
      map[cls] = [];
    });

    students.forEach((student) => {
      const targetClass = student.className || 'Class 1';
      if (map[targetClass]) {
        map[targetClass].push(student);
      } else {
        // Fallback for legacy class label matching
        const match = DARE_ARQAM_CLASSES.find(
          (c) => c.toLowerCase() === targetClass.toLowerCase() || targetClass.toLowerCase().includes(c.toLowerCase())
        );
        if (match) {
          map[match].push(student);
        } else {
          if (!map[targetClass]) map[targetClass] = [];
          map[targetClass].push(student);
        }
      }
    });

    // Sort students in each class by roll number ascending
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const rollA = parseInt(a.rollNumber, 10) || 0;
        const rollB = parseInt(b.rollNumber, 10) || 0;
        if (rollA !== rollB) return rollA - rollB;
        return (a.fullName || '').localeCompare(b.fullName || '');
      });
    });

    return map;
  }, [students]);

  // Total metrics
  const totalRegistered = students.length;
  const classesWithEnrollment = Object.values(studentsByClass).filter((list) => list.length > 0).length;

  // Students belonging to the currently selected class, filtered by search query
  const activeClassStudents = useMemo(() => {
    if (!activeClass) return [];
    const list = studentsByClass[activeClass] || [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter((s) => {
      return (
        s.fullName?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.whatsappNumber?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [activeClass, studentsByClass, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0F1424] via-[#141A35] to-[#1C244B] border border-[#263352] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 shadow-xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#FFF000]" />
            <span>REALTIME CLASS DIRECTORY</span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            {activeClass ? `Class: ${activeClass}` : 'Class Management Directory'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-prose-serif max-w-2xl">
            {activeClass
              ? `Viewing all registered students enrolled in ${activeClass}. Click any student card to view their complete official ID Card & profile.`
              : 'Select any class tab below to open and view all students registered in that academic wing.'}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#161B30] border border-[#263352] px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              {activeClass ? 'In This Class' : 'Total Students'}
            </span>
            <span className="font-editorial text-xl font-extrabold text-[#FFF000]">
              {activeClass ? (studentsByClass[activeClass]?.length || 0) : totalRegistered}
            </span>
          </div>
          <div className="bg-[#161B30] border border-[#263352] px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
              Official Classes
            </span>
            <span className="font-editorial text-xl font-extrabold text-white">13</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: LIST / GRID OF THE 13 CLASS TABS (shown when activeClass === null) */}
      {/* ========================================================================= */}
      {!activeClass && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              <span>Official Academic Classes (13)</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono">
              Click any class to view registered students
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {DARE_ARQAM_CLASSES.map((className, index) => {
              const count = studentsByClass[className]?.length || 0;
              const hasStudents = count > 0;

              return (
                <button
                  key={className}
                  type="button"
                  onClick={() => {
                    setActiveClass(className);
                    setSearchQuery('');
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all group cursor-pointer shadow-md flex flex-col justify-between space-y-3.5 relative overflow-hidden ${
                    hasStudents
                      ? 'bg-gradient-to-b from-[#141A35] to-[#10152B] border-[#2E3C62] hover:border-[#D4AF37] hover:scale-[1.01]'
                      : 'bg-[#0E1222] border-[#1C243B] hover:border-[#2E3C62] hover:bg-[#12172A]'
                  }`}
                >
                  {/* Subtle top indicator strip */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      hasStudents ? 'bg-gradient-to-r from-[#FFF000] to-[#20216B]' : 'bg-[#1C243B]'
                    }`} 
                  />

                  {/* Top: Icon & Registered Count Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 font-bold group-hover:scale-105 transition-transform shadow-xs">
                      <GraduationCap className="w-5 h-5 text-[#FFF000]" />
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-extrabold border ${
                        hasStudents
                          ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]/60 shadow-xs'
                          : 'bg-stone-900/90 text-stone-400 border-stone-800'
                      }`}
                    >
                      {count} {count === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>

                  {/* Middle: Class Name */}
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                      ACADEMIC CLASS {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </div>
                    <h4 className="font-editorial text-base sm:text-lg font-bold text-white group-hover:text-[#FFF000] transition-colors">
                      {className}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-prose-serif line-clamp-1">
                      {hasStudents 
                        ? `${count} student${count > 1 ? 's' : ''} currently registered` 
                        : 'No students registered yet'}
                    </p>
                  </div>

                  {/* Bottom: Action CTA */}
                  <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-xs text-stone-300 font-medium group-hover:text-[#FFF000] transition-colors">
                    <span className="text-[11px] font-semibold">
                      {hasStudents ? 'View Registered Students' : 'Open Class'}
                    </span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: ACTIVE CLASS STUDENT LIST (shown when activeClass !== null) */}
      {/* ========================================================================= */}
      {activeClass && (
        <div className="space-y-5">
          {/* Navigation & Controls Bar */}
          <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Left: Back Button & Active Class Indicator */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveClass(null);
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 bg-[#182038] hover:bg-[#202946] text-[#FFF000] hover:text-white border border-[#2D3A5D] hover:border-[#D4AF37]/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>All Classes</span>
              </button>

              <div className="h-6 w-px bg-stone-700/60 hidden sm:block" />

              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                  SELECTED CLASS
                </span>
                <span className="font-editorial text-sm sm:text-base font-extrabold text-white">
                  {activeClass}
                </span>
              </div>
            </div>

            {/* Middle: Search input within active class */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search in ${activeClass} by name, roll, father name...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-hidden focus:border-[#D4AF37]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Right: Add Student & Quick Switch Class Dropdown */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="px-3.5 py-2 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] border border-[#D4AF37]/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#FFF000]" />
                <span>+ Add Student</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-mono hidden lg:inline">Switch:</span>
                <div className="relative">
                  <select
                    value={activeClass}
                    onChange={(e) => {
                      setActiveClass(e.target.value);
                      setSearchQuery('');
                    }}
                    className="px-3 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs font-bold text-[#FFF000] cursor-pointer focus:outline-hidden pr-8 appearance-none"
                  >
                    {DARE_ARQAM_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls} ({studentsByClass[cls]?.length || 0})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick horizontal class switch tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {DARE_ARQAM_CLASSES.map((cls) => {
              const isSelected = cls === activeClass;
              const count = studentsByClass[cls]?.length || 0;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    setActiveClass(cls);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37] shadow-sm font-bold'
                      : 'bg-[#12172A] hover:bg-[#182038] text-stone-300 border border-[#202946]'
                  }`}
                >
                  <span>{cls}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-[#171852] text-[#FFF000]' : 'bg-stone-800 text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Students Grid inside Active Class */}
          {activeClassStudents.length === 0 ? (
            <div className="p-12 text-center bg-[#0F1424] rounded-2xl border border-dashed border-[#263352] space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#182038] border border-[#263352] flex items-center justify-center mx-auto text-stone-500">
                <GraduationCap className="w-7 h-7 text-stone-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-editorial text-base sm:text-lg font-bold text-white">
                  {searchQuery ? 'No matching students found' : `No students currently registered in ${activeClass}`}
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 font-prose-serif max-w-md mx-auto">
                  {searchQuery
                    ? `No students in ${activeClass} matched "${searchQuery}". Clear your search query to see all records.`
                    : `When a new student registers online and selects "${activeClass}", their complete profile and digital Student ID Card will automatically appear here.`}
                </p>
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-1.5 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeClassStudents.map((student) => {
                const formattedDate = student.createdAt
                  ? new Date(student.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={student.uid}
                    className="bg-[#14192D] border border-[#2A3756] hover:border-[#D4AF37]/60 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between space-y-3.5 group"
                  >
                    {/* Top: Photo & Basic Details */}
                    <div className="flex items-start gap-3.5">
                      {/* Photo / Avatar */}
                      <div className="w-14 h-16 rounded-lg overflow-hidden border border-[#D4AF37]/50 bg-[#0E1222] shrink-0 flex items-center justify-center">
                        {student.profileImageUrl ? (
                          <img
                            src={student.profileImageUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-stone-500" />
                        )}
                      </div>

                      {/* Student Name & Roll */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40">
                            Roll #: {student.rollNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {student.qrIdentity?.status === 'revoked' ? (
                              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                                <Lock className="w-2.5 h-2.5" />
                                QR Revoked
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                                <QrCode className="w-2.5 h-2.5" />
                                QR Active
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-editorial text-sm font-bold text-white truncate group-hover:text-[#FFF000] transition-colors">
                          {student.fullName}
                        </h4>
                        <p className="text-[11px] text-stone-300 truncate">
                          S/O: <span className="font-semibold text-stone-200">{student.fatherName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Middle: Contact & Registration Metadata */}
                    <div className="space-y-1.5 text-[11px] font-mono pt-2 border-t border-[#1E293B]">
                      {/* WhatsApp with click-to-chat */}
                      <div className="flex items-center justify-between text-stone-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp:</span>
                        </span>
                        {student.whatsappNumber ? (
                          <a
                            href={`https://wa.me/${student.whatsappNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
                            title="Open WhatsApp Chat"
                          >
                            {student.whatsappNumber}
                          </a>
                        ) : (
                          <span className="text-stone-500">—</span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between text-stone-300">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span>Email:</span>
                        </span>
                        <span className="truncate max-w-[150px] text-stone-300" title={student.email}>
                          {student.email || '—'}
                        </span>
                      </div>

                      {/* Registration Date */}
                      <div className="flex items-center justify-between text-stone-400 text-[10px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          <span>Enrolled:</span>
                        </span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Bottom Actions: View ID Card, Change Class, Delete */}
                    <div className="space-y-2 pt-2 border-t border-[#1E293B]">
                      <button
                        type="button"
                        onClick={() => setInspectedStudent(student)}
                        className="w-full py-2 px-3 bg-[#1B233D] hover:bg-[#20216B] text-stone-200 hover:text-[#FFF000] border border-[#2D3A5D] hover:border-[#D4AF37]/60 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                      >
                        <IdCard className="w-3.5 h-3.5 text-[#FFF000]" />
                        <span>View Complete Profile & ID Card</span>
                      </button>

                      <div className="flex items-center justify-between gap-2">
                        {/* Change Class Dropdown */}
                        <div className="relative flex-1">
                          <select
                            value={student.className || activeClass}
                            onChange={(e) => handleClassTransfer(student, e.target.value)}
                            className="w-full py-1.5 px-2 bg-[#12172A] border border-[#263352] rounded-lg text-[11px] font-mono font-bold text-stone-300 cursor-pointer focus:outline-hidden pr-6 appearance-none"
                            title="Change Student Class"
                          >
                            <option value="" disabled>Change Class...</option>
                            {DARE_ARQAM_CLASSES.map((cls) => (
                              <option key={cls} value={cls}>
                                Class: {cls}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-stone-400">
                            ▼
                          </div>
                        </div>

                        {/* Delete Student Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStudentRecord(student)}
                          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg border border-[#263352] transition-colors cursor-pointer"
                          title="Delete Student Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Complete Student Profile & Official ID Card Modal */}
      {/* ========================================================================= */}
      {inspectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F1424] border-2 border-[#20216B] rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#FFF000]" />
                <h3 className="font-editorial text-lg font-bold text-white">
                  Student Official Identity Card & Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedStudent(null)}
                className="p-1.5 text-stone-400 hover:text-white bg-[#161B30] hover:bg-[#1E2540] rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Exact Same Institutional Student ID Card Component */}
            <StudentIdCard
              student={inspectedStudent}
              canUploadPhoto={false}
              variant="admin-view"
            />

            {/* QR Identity Management Panel for Administrators */}
            <div className="bg-[#141A32] border border-[#2D3A5D] rounded-xl p-3.5 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#243050] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Permanent Student QR Identity Management
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Token ID: <span className="text-cyan-300 select-all">{inspectedStudent.qrIdentity?.tokenId || 'Provisioning on demand'}</span>
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {inspectedStudent.qrIdentity?.status === 'revoked' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>REVOKED</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>ACTIVE & VERIFIED</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback alert */}
              {qrActionFeedback && (
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>{qrActionFeedback}</span>
                </div>
              )}

              {/* Administrative Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* 1. Download QR Image */}
                <button
                  type="button"
                  onClick={() => handleDownloadQrImage(inspectedStudent)}
                  disabled={isQrActionLoading}
                  className="px-3 py-2 bg-[#1B233D] hover:bg-[#253052] disabled:opacity-50 text-stone-200 border border-[#2D3A5D] rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download QR</span>
                </button>

                {/* 2. Revoke / Restore Toggle */}
                {inspectedStudent.qrIdentity?.status === 'revoked' ? (
                  <button
                    type="button"
                    onClick={() => handleRestoreQr(inspectedStudent)}
                    disabled={isQrActionLoading}
                    className="px-3 py-2 bg-emerald-900/60 hover:bg-emerald-800/80 disabled:opacity-50 text-emerald-200 border border-emerald-600/60 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Reactivate QR</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRevokeQr(inspectedStudent)}
                    disabled={isQrActionLoading}
                    className="px-3 py-2 bg-amber-950/60 hover:bg-amber-900/80 disabled:opacity-50 text-amber-200 border border-amber-700/60 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Revoke QR</span>
                  </button>
                )}

                {/* 3. Regenerate New Permanent QR */}
                <button
                  type="button"
                  onClick={() => handleRegenerateQr(inspectedStudent)}
                  disabled={isQrActionLoading}
                  className="px-3 py-2 bg-[#20216B] hover:bg-[#2C2E85] disabled:opacity-50 text-[#FFF000] border border-[#D4AF37]/50 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#FFF000] ${isQrActionLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerate QR</span>
                </button>
              </div>

              <p className="text-[10px] text-stone-400 font-mono italic">
                * Note: Regenerating a QR invalidates previous physical cards. Scans with the old token will immediately be rejected.
              </p>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#1E293B]">
              <div className="text-[11px] font-mono text-stone-400">
                UID: <span className="text-stone-300">{inspectedStudent.uid}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#161B30] hover:bg-[#1E2540] text-stone-200 text-xs font-semibold rounded-lg border border-[#263352] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFF000]" />
                  <span>Print Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedStudent(null)}
                  className="px-4 py-1.5 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-bold rounded-lg cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. Manual Add Student Modal */}
      {/* ========================================================================= */}
      {isAddStudentModalOpen && activeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F1424] border-2 border-[#20216B] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#FFF000]" />
                <h3 className="font-editorial text-lg font-bold text-white">
                  Add Student to {activeClass}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white bg-[#161B30] hover:bg-[#1E2540] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-300 font-bold">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.fullName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                  placeholder="e.g. Hasnain Qadir"
                  className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-300 font-bold">Father Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentForm.fatherName}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, fatherName: e.target.value })}
                  placeholder="e.g. Qadir Khan"
                  className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-stone-300 font-bold">Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.rollNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNumber: e.target.value })}
                    placeholder="e.g. 8696"
                    className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-stone-300 font-bold">Section</label>
                  <input
                    type="text"
                    value={newStudentForm.section}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, section: e.target.value })}
                    placeholder="Section A"
                    className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-300 font-bold">WhatsApp Number</label>
                <input
                  type="text"
                  value={newStudentForm.whatsappNumber}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, whatsappNumber: e.target.value })}
                  placeholder="03001234567"
                  className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-stone-300 font-bold">Email Address</label>
                <input
                  type="email"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  placeholder="student@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 bg-[#161B30] hover:bg-[#1E2540] text-stone-300 text-xs font-bold rounded-xl border border-[#263352] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="px-5 py-2 bg-[#20216B] hover:bg-[#171852] disabled:opacity-50 text-[#FFF000] text-xs font-bold rounded-xl border border-[#D4AF37]/60 cursor-pointer shadow-xs"
                >
                  {isSubmittingStudent ? 'Creating & Generating QR...' : 'Save & Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
