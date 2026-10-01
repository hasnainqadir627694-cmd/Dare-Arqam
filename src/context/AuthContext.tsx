import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, reload } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  getStudentProfile, 
  logoutStudentFromFirebase,
  sendStudentVerificationEmail,
  checkStudentEmailVerified 
} from '../services/firebaseService';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  studentProfile: any | null;
  loading: boolean;
  isEmailVerified: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  sendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  user: null,
  studentProfile: null,
  loading: true,
  isEmailVerified: false,
  logout: async () => {},
  refreshProfile: async () => {},
  reloadUser: async () => null,
  sendVerificationEmail: async () => {},
  checkVerificationStatus: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  const loadProfile = async (user: User) => {
    try {
      const profile = await getStudentProfile(user.uid);
      setStudentProfile(profile);
    } catch (e) {
      console.warn('Could not fetch student profile from Firestore:', e);
    }
  };

  const syncUserState = useCallback(async (user: User | null) => {
    if (user) {
      setIsEmailVerified(!!user.emailVerified);
      await loadProfile(user);
    } else {
      setIsEmailVerified(false);
      setStudentProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await syncUserState(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUserState]);

  const reloadUser = async (): Promise<User | null> => {
    if (!auth.currentUser) return null;
    try {
      await reload(auth.currentUser);
      const updated = auth.currentUser;
      setCurrentUser(updated);
      setIsEmailVerified(!!updated.emailVerified);
      if (updated.emailVerified) {
        await loadProfile(updated);
      }
      return updated;
    } catch (e) {
      console.warn('Could not reload Firebase auth user:', e);
      return auth.currentUser;
    }
  };

  const checkVerificationStatus = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    const verified = await checkStudentEmailVerified(auth.currentUser);
    setIsEmailVerified(verified);
    if (verified) {
      await reloadUser();
      await refreshProfile();
    }
    return verified;
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (!auth.currentUser) {
      throw new Error('No signed-in user to send verification email to.');
    }
    await sendStudentVerificationEmail(auth.currentUser);
  };

  // Re-check verification on window focus (e.g., when returning from verifying in email app)
  useEffect(() => {
    const handleFocus = async () => {
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await reloadUser();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await loadProfile(currentUser);
    }
  };

  const logout = async () => {
    await logoutStudentFromFirebase();
    setCurrentUser(null);
    setIsEmailVerified(false);
    setStudentProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser,
        studentProfile,
        loading,
        isEmailVerified,
        logout,
        refreshProfile,
        reloadUser,
        sendVerificationEmail,
        checkVerificationStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
