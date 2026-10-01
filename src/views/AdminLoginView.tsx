import React, { useState } from 'react';
import { PageId } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { verifyAdminLogin } from '../services/adminService';

interface AdminLoginViewProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your Directorate Administrator Email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your Administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyAdminLogin(email, password);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Authentication error. Please verify your connection.');
    }
  };

  const handleFillDemoCreds = () => {
    setEmail('darearqam@mardan.com');
    setPassword('Hasnainqadir8696');
    setErrorMsg('');
    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 2500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 bg-[#F8FAFC] text-[#1E204A]">
      <div className="w-full max-w-md space-y-6">
        {/* Directorate Card Container */}
        <div className="bg-white border-2 border-[#20216B] rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Institutional Brand Top Accent Strip */}
          <div className="brand-gradient-line absolute top-0 left-0 right-0" />

          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-200 mt-2">
            <Emblem size="lg" className="mx-auto shadow-md" neonGlow />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#20216B] text-[#FFF000] border border-[#F5D900]/50 font-bold mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>DIRECTORATE ADMINISTRATION</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1E204A] tracking-tight">
                Executive Admin Login
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-prose-serif">
                Central Institutional Directorate Management Console
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-[#FEE2E2] border border-[#DC2626] text-[#DC2626] rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label 
                htmlFor="admin-email" 
                className="block text-xs font-bold text-[#20216B] uppercase tracking-wider mb-1.5"
              >
                Admin Email / Gmail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="Darearqam@mardan.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#20216B] focus:border-[#20216B] bg-white text-[#1E204A] placeholder-slate-400 font-mono"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="admin-password" 
                  className="block text-xs font-bold text-[#20216B] uppercase tracking-wider"
                >
                  Admin Password
                </label>
                <span className="text-[11px] font-mono text-[#20216B] font-semibold">Secure Access</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#20216B] focus:border-[#20216B] bg-white text-[#1E204A] placeholder-slate-400"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Fill Credentials Shortcut */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="text-[11px] text-[#20216B] hover:text-[#292A86] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Sparkles className="w-3 h-3 text-[#F5D900]" />
                <span>Fill Designated Admin Credentials</span>
              </button>
              {autoFilled && (
                <span className="text-[10px] text-[#16A34A] flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Filled
                </span>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#292A86] active:bg-[#1A1B57] focus:outline-hidden focus:ring-2 focus:ring-[#FFF000] rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
              >
                {isLoading ? (
                  <span>Authenticating Directorate...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-[#FFF000]" />
                    <span>Login to Admin Panel</span>
                    <ArrowRight className="w-4 h-4 text-[#FFF000]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick return back to school public site */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-xs text-slate-600 hover:text-[#20216B] flex items-center gap-1.5 mx-auto transition-colors cursor-pointer py-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public School Website</span>
            </button>
          </div>
        </div>

        {/* Security watermark */}
        <div className="text-center text-[11px] text-slate-500 font-mono">
          DIRECTORATE CENTRAL REPOSITORY · RESTRICTED EXECUTIVE ACCESS ONLY
        </div>
      </div>
    </div>
  );
};
