import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw,
  UserPlus,
  ArrowLeft,
  KeyRound,
  LogIn
} from 'lucide-react';
import { 
  loginStudentWithFirebase, 
  resetStudentPassword 
} from '../services/firebaseService';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onNavigate: (page: PageId, authMode?: 'choice' | 'login') => void;
  onLoginSuccess: () => void;
  initialMode?: 'choice' | 'login';
}

export const LoginView: React.FC<LoginViewProps> = ({ 
  onNavigate, 
  onLoginSuccess,
}) => {
  const { refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAccountNotFound, setIsAccountNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password recovery modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsAccountNotFound(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered Gmail / Email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid Gmail / Email address format.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      // Authenticate via Firebase Authentication & retrieve Firestore profile
      const result = await loginStudentWithFirebase(cleanEmail, password);
      
      // Refresh AuthContext profile
      await refreshProfile();

      setIsLoading(false);
      onLoginSuccess();
      onNavigate('student-portal');
    } catch (error: any) {
      setIsLoading(false);
      const code = error?.code || '';
      console.warn('Firebase student login error:', code, error?.message);

      if (code === 'auth/user-not-found') {
        setIsAccountNotFound(true);
        setErrorMsg('No registered account was found with this email. Please register your account first.');
      } else if (code === 'auth/wrong-password') {
        setErrorMsg('Incorrect password. Please verify your password and try again.');
      } else if (code === 'auth/invalid-credential') {
        // Firebase Auth v10+ returns invalid-credential for both wrong password and missing user
        setErrorMsg('Invalid login credentials. If you have not registered yet, please create an account.');
        setIsAccountNotFound(true);
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('The email address format is invalid. Please enter a valid Gmail / Email address.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Too many unsuccessful attempts. Access is temporarily suspended. Please try again in a few minutes or reset your password.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Network connectivity issue. Please check your internet connection and try again.');
      } else {
        setErrorMsg(error?.message || 'Login failed. Please check your credentials and try again.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setRecoverySuccess(false);

    if (!recoveryEmail.trim() || !recoveryEmail.includes('@')) {
      setRecoveryError('Please enter a valid registered email address.');
      return;
    }

    setIsSendingRecovery(true);
    try {
      await resetStudentPassword(recoveryEmail.trim());
      setRecoverySuccess(true);
    } catch (err: any) {
      setRecoveryError(err?.message || 'Could not send reset link. Verify your email and try again.');
    } finally {
      setIsSendingRecovery(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md space-y-6">
        {/* Main Card Container */}
        <div className="bg-white border-2 border-[#20216B] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Institutional Accent Strip */}
          <div className="h-1.5 bg-gradient-to-r from-[#171852] via-[#F5D900] to-[#20216B] absolute top-0 left-0 right-0" />

          {/* Top Home Link */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mt-1">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs text-[#20216B] hover:text-[#171852] font-semibold hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>

            <span className="text-[11px] font-mono text-slate-500 font-semibold">
              Katlang Campus
            </span>
          </div>

          {/* Institutional Emblem & Title */}
          <div className="text-center space-y-2 pt-3 pb-2">
            <Emblem size="md" className="mx-auto shadow-md" neonGlow />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/50 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>STUDENT PORTAL LOGIN</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0F1035] tracking-tight">
                Student & Parent Sign In
              </h1>
              <p className="text-xs text-slate-500 font-prose-serif max-w-sm mx-auto">
                Enter your registered Gmail / Email and password to access your Student ID Card and academic dashboard.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs space-y-2 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-snug">{errorMsg}</span>
              </div>
              {isAccountNotFound && (
                <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                  <span className="text-[11px] text-red-600">New student?</span>
                  <button
                    type="button"
                    onClick={() => onNavigate('student-register')}
                    className="px-3 py-1 rounded-lg bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-bold text-xs inline-flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Account</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="student-email"
                className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1"
              >
                Gmail / Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="student-email"
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label 
                  htmlFor="student-password"
                  className="block text-xs font-bold text-[#20216B] uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] text-[#20216B] hover:text-[#171852] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your portal password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#20216B] bg-white text-[#0F1035] placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#171852] via-[#20216B] to-[#171852] hover:from-[#20216B] hover:to-[#292A86] text-[#FFF000] font-extrabold rounded-xl border-2 border-[#FFF000] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 text-sm mt-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FFF000]" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-[#FFF000]" />
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 text-[#FFF000]" />
                </>
              )}
            </button>
          </form>

          {/* Explicit Register Callout */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('student-register')}
                className="font-bold text-[#20216B] hover:text-[#171852] hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>

            <button
              type="button"
              onClick={() => onNavigate('student-register')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-[#EEF0FF] text-[#171852] border border-[#20216B]/30 hover:border-[#20216B] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-[#20216B]" />
              <span>Create New Student Account</span>
            </button>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p>Protected by Firebase Authentication & Zero-Trust Security Rules</p>
          <p>© {new Date().getFullYear()} DAR - E - ARQAM School Katlang Campus Directorate</p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border-2 border-[#20216B] shadow-2xl relative">
            <div className="flex items-center gap-2 text-[#20216B]">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
                Reset Portal Password
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your registered Gmail / Email address and we will dispatch an official Firebase password reset link.
            </p>

            {recoverySuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password Reset Email Dispatched!</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Please check your inbox (and spam folder) for the official reset link.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2 bg-[#20216B] text-white font-bold rounded-lg text-xs mt-1"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3">
                {recoveryError && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{recoveryError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#20216B]"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingRecovery}
                    className="px-4 py-2 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-bold text-xs rounded-lg shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSendingRecovery ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
