import React, { useState, useRef } from 'react';
import { PageId, DARE_ARQAM_CLASSES } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Hash,
  Camera,
  Upload,
  X,
  Sparkles,
  LogIn,
  KeyRound,
  Zap
} from 'lucide-react';
import { 
  registerStudentWithFirebase, 
  checkDuplicateRollNumber,
  createStudentQrIdentity,
  LOCAL_STORAGE_CURRENT_STUDENT_KEY 
} from '../services/firebaseService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { StudentProfile } from '../types';

interface RegisterViewProps {
  onNavigate: (page: PageId, authMode?: 'choice' | 'login') => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    className: 'Class 1',
    rollNumber: '',
    whatsappNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Profile Picture File & Preview
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [emailAlreadyInUse, setEmailAlreadyInUse] = useState<boolean>(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please select a valid image file (JPG, PNG, WebP).' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, photo: 'Photo size should not exceed 10MB.' }));
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors(prev => {
      const next = { ...prev };
      delete next.photo;
      return next;
    });
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') {
      setEmailAlreadyInUse(false);
      setGeneralError(null);
    }
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father Name is required';
    }

    if (!formData.className || !DARE_ARQAM_CLASSES.includes(formData.className as any)) {
      newErrors.className = 'Please select a valid class from the dropdown';
    }

    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll Number is required';
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp Number is required';
    } else if (formData.whatsappNumber.replace(/[^0-9]/g, '').length < 10) {
      newErrors.whatsappNumber = 'Enter a valid WhatsApp number (at least 10 digits)';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Gmail / Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid Gmail / Email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl = '';
    let uploadedPublicId = '';

    try {
      // 1. Upload profile photo to Cloudinary if provided
      if (photoFile) {
        setSubmissionStep('Uploading profile photo to Cloudinary...');
        try {
          const cloudRes = await uploadToCloudinary(photoFile, {
            folder: 'dare_arqam_students',
            resourceType: 'image',
          });
          if (cloudRes.success && cloudRes.url) {
            uploadedImageUrl = cloudRes.url;
            uploadedPublicId = cloudRes.publicId || '';
          }
        } catch (photoErr) {
          console.warn('Cloudinary student photo upload notice:', photoErr);
        }
      }

      // 2. Create account & structured student record in Firestore
      setSubmissionStep('Creating student authentication account...');
      await registerStudentWithFirebase({
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        className: formData.className,
        rollNumber: formData.rollNumber,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        password: formData.password,
        profileImageUrl: uploadedImageUrl,
        profileImagePublicId: uploadedPublicId,
      });

      // 3. Finalize & refresh auth profile
      setSubmissionStep('Finalizing registration & digital ID card...');
      await refreshProfile();

      // 4. Immediately redirect student to authenticated portal dashboard
      onNavigate('student-portal');
    } catch (err: any) {
      console.warn('Student registration validation notice:', err?.code || err?.message || err);
      let message = 'Registration could not be completed. Please check your information.';
      if (err?.code === 'auth/email-already-in-use') {
        // Seamless Recovery: If account was already created, sign in with the password just entered
        try {
          setSubmissionStep('Account recognized. Signing in and finalizing student ID card...');
          const cred = await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
          const currentYear = new Date().getFullYear();
          const studentId = `DA-${currentYear}-${formData.rollNumber.trim()}`;
          const qrIdentity = await createStudentQrIdentity(0);

          const studentProfile: StudentProfile = {
            uid: cred.user.uid,
            fullName: formData.fullName.trim(),
            fatherName: formData.fatherName.trim(),
            className: formData.className,
            rollNumber: formData.rollNumber.trim(),
            whatsappNumber: formData.whatsappNumber.trim(),
            email: cred.user.email || formData.email.trim(),
            profileImageUrl: uploadedImageUrl,
            profileImagePublicId: uploadedPublicId,
            status: 'active',
            studentId,
            qrIdentity,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            section: 'Section A',
            session: `${currentYear}–${currentYear + 1}`,
          };

          // Save to Firestore (graceful)
          try {
            await setDoc(doc(db, 'students', cred.user.uid), studentProfile, { merge: true });
          } catch {}

          // Save to Server database
          try {
            await fetch('/api/students/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentProfile),
            });
          } catch {}

          // Cache in local storage
          try {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_STUDENT_KEY, JSON.stringify(studentProfile));
          } catch {}

          await refreshProfile();
          onNavigate('student-portal');
          return;
        } catch (signInErr: any) {
          console.debug('Auto-signin fallback notice:', signInErr);
          message = 'This email is already registered. Please login with your password or reset it.';
          setErrors(prev => ({ ...prev, email: 'Account already exists' }));
          setEmailAlreadyInUse(true);
        }
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password too weak. Please use at least 6 characters.';
        setErrors(prev => ({ ...prev, password: 'Minimum 6 characters' }));
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
        setErrors(prev => ({ ...prev, email: 'Invalid format' }));
      } else if (err?.message) {
        message = err.message;
      }
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
      setSubmissionStep('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Main Card Container */}
        <div className="bg-white border-2 border-[#20216B] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Institutional Accent Strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#171852] via-[#F5D900] to-[#20216B] absolute top-0 left-0 right-0" />

          {/* Top Navigation Row */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mt-1">
            <button
              type="button"
              onClick={() => onNavigate('student-login', 'choice')}
              className="inline-flex items-center gap-1.5 text-xs text-[#20216B] hover:text-[#171852] font-semibold hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <span>Registered?</span>
              <button
                type="button"
                onClick={() => onNavigate('student-login', 'login')}
                className="font-bold text-[#20216B] hover:text-[#171852] underline cursor-pointer inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 pt-4 pb-2">
            <Emblem size="md" className="mx-auto shadow-md ring-2 ring-[#FFF000]/70" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/70 font-bold mb-1 shadow-[0_0_15px_rgba(255,240,0,0.55)] ring-1 ring-[#FFF000]/60">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>OFFICIAL ENROLLMENT</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0F1035] tracking-tight">
                Student Account Registration
              </h1>
              <p className="text-xs text-slate-500 font-prose-serif max-w-md mx-auto">
                Create student portal account to generate digital Student ID Card and access academic records.
              </p>
            </div>
          </div>

          {/* Email Already Registered Institutional Card with Neon Glow */}
          {emailAlreadyInUse && (
            <div className="mt-4 p-4 bg-gradient-to-r from-[#10142A] to-[#171C38] border-2 border-[#FFF000] rounded-2xl text-white shadow-[0_0_20px_rgba(255,240,0,0.35)] relative overflow-hidden animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#20216B] border border-[#FFF000]/60 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,240,0,0.5)]">
                  <KeyRound className="w-5 h-5 text-[#FFF000]" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase bg-[#FFF000] text-[#0F1035] shadow-[0_0_8px_rgba(255,240,0,0.7)]">
                      EXISTS
                    </span>
                    <h3 className="font-editorial text-sm font-bold text-white tracking-wide">
                      Account Already Registered
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 font-prose-serif">
                    An account already exists for <span className="font-bold text-[#FFF000]">{formData.email}</span>. Please login or reset your password.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('student-login', 'login')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-bold border border-[#FFF000]/70 shadow-[0_0_14px_rgba(255,240,0,0.5)] inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Login</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('student-login', 'login')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold border border-white/20 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                    >
                      <KeyRound className="w-3 h-3 text-[#FFF000]" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailAlreadyInUse(false);
                        setGeneralError(null);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Error Banner (when not email duplicate) */}
          {generalError && !emailAlreadyInUse && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold leading-snug">{generalError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4.5" noValidate>
            {/* 0. Student Profile Picture Upload Section */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 border-[#20216B] shadow-md flex items-center justify-center relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                      <Camera className="w-7 h-7 text-[#20216B]/60 mb-1" />
                      <span className="text-[9px] font-bold text-[#20216B]/70 uppercase">No Photo</span>
                    </div>
                  )}
                </div>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-[#0F1035] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5D900]" />
                    <span>Student Profile Picture</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-prose-serif mt-0.5">
                    Upload a clear passport-style portrait. This photo will be printed directly onto your official Student ID Card.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    id="student-photo-upload"
                  />
                  <label
                    htmlFor="student-photo-upload"
                    className="px-3 py-1.5 rounded-xl bg-[#20216B] hover:bg-[#171852] text-[#FFF000] text-xs font-bold border border-[#F5D900]/40 inline-flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FFF000]" />
                    <span>{photoFile ? 'Change Photo' : 'Select Photo'}</span>
                  </label>
                  {photoFile && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      ✓ {photoFile.name.length > 18 ? `${photoFile.name.substring(0, 15)}...` : photoFile.name}
                    </span>
                  )}
                </div>
                {errors.photo && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.photo}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Muhammad Bilal Khan"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 ${
                      errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* 2. Father Name */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Father Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fatherName"
                    required
                    placeholder="e.g. Tariq Mehmood Khan"
                    value={formData.fatherName}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 ${
                      errors.fatherName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.fatherName && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fatherName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 3. Class (MANDATORY DROPDOWN WITH EXACT 13 CLASSES) */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    name="className"
                    required
                    value={formData.className}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] appearance-none font-semibold cursor-pointer ${
                      errors.className ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  >
                    {DARE_ARQAM_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
                {errors.className && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.className}</span>
                  </p>
                )}
              </div>

              {/* 4. Roll Number */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="rollNumber"
                    required
                    placeholder="e.g. 1042 or 849201"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 font-mono ${
                      errors.rollNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.rollNumber && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.rollNumber}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 5. WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="whatsappNumber"
                    required
                    placeholder="e.g. 03001234567"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 font-mono ${
                      errors.whatsappNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.whatsappNumber}</span>
                  </p>
                )}
              </div>

              {/* 6. Gmail / Email */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Gmail / Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. bilal@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 font-mono ${
                      errors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 7. Password */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 ${
                      errors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* 8. Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Institutional Security Notice */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                By registering, your profile will be securely registered with DARE ARQAM School Directorate. Passwords are encrypted and never stored in plaintext.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#171852] via-[#20216B] to-[#171852] hover:from-[#20216B] hover:to-[#171852] text-[#FFF000] font-extrabold rounded-xl border-2 border-[#FFF000] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 text-sm tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFF000]" />
                  <span>{submissionStep || 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FFF000]" />
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 text-[#FFF000]" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Login Link */}
          <div className="text-center pt-4 border-t border-slate-200 mt-6 text-xs text-slate-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('student-login', 'login')}
              className="font-bold text-[#20216B] hover:text-[#171852] hover:underline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
