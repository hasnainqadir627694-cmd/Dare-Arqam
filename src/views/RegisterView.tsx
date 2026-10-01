import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { registerStudentWithFirebase, checkDuplicateRollNumber } from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

interface RegisterViewProps {
  onNavigate: (page: PageId, authMode?: 'choice' | 'login') => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { refreshProfile } = useAuth();

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    try {
      // 1. Create account & structured student record in Firestore
      await registerStudentWithFirebase({
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        className: formData.className,
        rollNumber: formData.rollNumber,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        password: formData.password,
      });

      // 2. Refresh auth profile
      await refreshProfile();

      // 3. Immediately redirect student to authenticated portal dashboard
      onNavigate('student-portal');
    } catch (err: any) {
      console.error('Registration failed:', err);
      let message = 'Registration failed. Please check your information.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login or use a different email.';
        setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters with mixed numbers/letters.';
        setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
        setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      } else if (err?.message) {
        message = err.message;
      }
      setGeneralError(message);
    } finally {
      setIsSubmitting(false);
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
              <span>Back to Portal Home</span>
            </button>

            <div className="text-xs text-slate-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('student-login', 'login')}
                className="font-bold text-[#20216B] hover:text-[#171852] underline cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 pt-4 pb-2">
            <Emblem size="md" className="mx-auto shadow-md ring-1 ring-[#FFF000]/60" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/50 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>OFFICIAL STUDENT ENROLLMENT</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0F1035] tracking-tight">
                Student Account Registration
              </h1>
              <p className="text-xs text-slate-500 font-prose-serif max-w-md mx-auto">
                Create your student portal account to generate your digital Student ID Card and access academic records.
              </p>
            </div>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold leading-snug">{generalError}</p>
                {generalError.includes('already registered') && (
                  <button
                    type="button"
                    onClick={() => onNavigate('student-login', 'login')}
                    className="text-xs font-bold text-[#20216B] underline cursor-pointer block mt-1"
                  >
                    Go to Login Page →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4.5" noValidate>
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
              className="w-full py-3 px-4 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-extrabold rounded-xl shadow-lg border border-[#F5D900]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFF000]" />
                  <span>Registering Student Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration & Generate ID Card</span>
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
