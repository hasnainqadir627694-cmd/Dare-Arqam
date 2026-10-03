import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { checkIsAdmin, AdminRecord } from '../services/adminService';
import { ViewLoadingSkeleton } from './ViewLoadingSkeleton';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';
import { PageId } from '../types';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  onNavigate: (page: PageId) => void;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children, onNavigate }) => {
  const { user, loading: authLoading, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(true);
  const [adminRecord, setAdminRecord] = useState<AdminRecord | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAuthorization() {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setIsAdmin(false);
          setAdminRecord(null);
          setCheckingAdmin(false);
        }
        return;
      }

      setCheckingAdmin(true);
      try {
        const result = await checkIsAdmin(user);
        if (isMounted) {
          setIsAdmin(result.isAdmin);
          setAdminRecord(result.adminRecord);
        }
      } catch (err) {
        console.warn('Admin route guard authorization notice:', err);
        if (isMounted) {
          setIsAdmin(false);
          setAdminRecord(null);
        }
      } finally {
        if (isMounted) {
          setCheckingAdmin(false);
        }
      }
    }

    verifyAdminAuthorization();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // 1. Loading state while Firebase Auth restores session and verifies Firestore admin status
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F8FAFC]">
        <ViewLoadingSkeleton />
      </div>
    );
  }

  // 2. Unauthenticated User -> Access Restricted Screen with Direct Login Trigger
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white border-2 border-[#20216B] rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#171852] via-[#F5D900] to-[#20216B] absolute top-0 left-0 right-0" />
          
          <div className="w-16 h-16 rounded-full bg-[#171852] text-[#FFF000] flex items-center justify-center mx-auto border-2 border-[#F5D900] shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#20216B] text-[#FFF000] font-bold">
              PROTECTED ADMIN ROUTE
            </div>
            <h2 className="font-editorial text-2xl font-extrabold text-[#0F1035] pt-1">
              Authentication Required
            </h2>
          </div>

          <p className="text-xs text-slate-600 font-prose-serif leading-relaxed">
            Access to this administrative section is strictly restricted. Please authenticate with your authorized Directorate credentials.
          </p>

          <div className="pt-3 flex flex-col gap-2.5">
            <button
              onClick={() => onNavigate('admin-login')}
              className="w-full py-3 bg-[#20216B] hover:bg-[#171852] text-[#FFF000] font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 border border-[#F5D900]"
            >
              Sign In to Admin Console
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated Non-Admin User -> Access Denied Screen
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white border-2 border-red-600 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="h-1.5 bg-red-600 absolute top-0 left-0 right-0" />

          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto border-2 border-red-300 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-600 font-bold">
              UNAUTHORIZED USER ACCOUNT
            </span>
            <h2 className="font-editorial text-2xl font-extrabold text-red-700">
              Access Denied
            </h2>
          </div>

          <p className="text-xs text-slate-700 font-prose-serif leading-relaxed">
            Your authenticated email (<strong className="font-mono text-[#0F1035]">{user.email}</strong>) is not registered as an active administrator in the Firestore Directorate database.
          </p>

          <div className="pt-3 flex flex-col gap-2.5">
            <button
              onClick={async () => {
                await logout();
                onNavigate('admin-login');
              }}
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin -> Render Protected Route Content
  return <>{children}</>;
};
