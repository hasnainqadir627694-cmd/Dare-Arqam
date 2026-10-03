import { Notice, StudentResult } from '../types';
import { NOTICES_DATA, RESULTS_DATABASE } from '../data/mockData';
import { 
  fetchSingleAppState, 
  saveSingleAppState,
  fetchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  fetchAllResults,
  adminCreateResult as createFirestoreResult,
  adminUpdateResult as updateFirestoreResult,
  adminDeleteResult as deleteFirestoreResult,
  fetchAllAdmissions,
  adminUpdateAdmissionStatus as updateFirestoreAdmissionStatus,
  fetchAllInquiries,
  adminUpdateInquiryStatus as updateFirestoreInquiryStatus,
  fetchAllStudents
} from './firebaseService';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'admin' | 'super_admin' | 'principal' | 'staff' | 'SUPER_ADMIN' | 'ADMIN';
  status: 'active' | 'inactive' | 'revoked';
  createdAt: string;
  updatedAt: string;
  name?: string;
}

export const PRIMARY_ADMIN_EMAIL = 'darearqam@mardan.com';
export const AUTHORIZED_ADMIN_EMAILS = [
  'darearqam@mardan.com',
  'the.rare.com@mardan.com',
  'hasnainqadir724657@gmail.com',
  'hasnainbuilds724656@gmail.com',
  'hasnainqadir627694@gmail.com',
  'principal@darearqam.com',
  'admin@darearqam.com'
];
export const ADMIN_CREDS_STORAGE_KEY = 'dare_arqam_admin_creds';
export const ADMIN_AUDIT_LOG_KEY = 'dare_arqam_audit_log';

export async function changeAdminPassword(currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
  try {
    localStorage.setItem(ADMIN_CREDS_STORAGE_KEY, JSON.stringify({ password: newPass, updatedAt: new Date().toISOString() }));
    adminRecordAuditLog('Password Changed', 'SECURITY', 'Administrator password was updated.');
  } catch {}
  return { success: true, message: 'Administrator password record updated.' };
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  loggedInAt: string;
}

export interface AdmissionApplicationRecord {
  id: string;
  applicationRef: string;
  candidateName: string;
  targetClass: string;
  fatherName: string;
  parentPhone: string;
  parentEmail: string;
  status: 'PENDING' | 'UNDER REVIEW' | 'APPROVED' | 'INTERVIEW SCHEDULED' | 'REJECTED';
  appliedDate: string;
  previousSchool?: string;
  remarks?: string;
}

export interface InquiryRecord {
  id: string;
  inquiryId: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  status: 'Unread' | 'In Progress' | 'Resolved' | 'Received / Pending' | 'Under Review' | 'Replied' | 'Archived';
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  category: 'NOTICES' | 'RESULTS' | 'ADMISSIONS' | 'BRANDING' | 'SOCIAL' | 'SECURITY' | 'ACADEMICS' | 'SYSTEM';
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface StudentRecord {
  id: string;
  studentId: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  className: string;
  section: string;
  dob: string;
  gender: string;
  status: 'Active' | 'On Leave' | 'Graduated';
  attendancePercentage: number;
  contactNumber: string;
  email: string;
  admissionDate: string;
}

// Initial Default Admissions if not yet in database
export const INITIAL_ADMISSIONS: AdmissionApplicationRecord[] = [
  {
    id: 'adm-01',
    applicationRef: 'ADM-DA-2026-9041',
    candidateName: 'Muhammad Hamza Khan',
    targetClass: 'Class IX (Secondary Science)',
    fatherName: 'Tariq Mehmood Khan',
    parentPhone: '+92 345 8899221',
    parentEmail: 'tariq.khan@gmail.com',
    status: 'PENDING',
    appliedDate: '2026-03-27',
    previousSchool: 'Government Model High School, Katlang',
    remarks: 'Awaiting entry test verification & B-Form copy'
  },
  {
    id: 'adm-02',
    applicationRef: 'ADM-DA-2026-8712',
    candidateName: 'Ayesha Fatima',
    targetClass: 'Class VII (Middle Wing)',
    fatherName: 'Dr. Shahzad Ahmad',
    parentPhone: '+92 312 9901123',
    parentEmail: 'shahzad.ahmad@yahoo.com',
    status: 'APPROVED',
    appliedDate: '2026-03-25',
    previousSchool: 'Army Public School & College',
    remarks: 'Candidate scored 88% in admission evaluation test. Seat confirmed.'
  },
  {
    id: 'adm-03',
    applicationRef: 'ADM-DA-2026-8540',
    candidateName: 'Zainab Bibi',
    targetClass: 'Class XI (HSSC Pre-Medical)',
    fatherName: 'Muhammad Iqbal',
    parentPhone: '+92 333 7711200',
    parentEmail: 'iqbal.kpk@gmail.com',
    status: 'UNDER REVIEW',
    appliedDate: '2026-03-24',
    previousSchool: 'DARE ARQAM Secondary Wing',
    remarks: 'Matriculation gazette score verified (92%). Final interview pending.'
  },
  {
    id: 'adm-04',
    applicationRef: 'ADM-DA-2026-7890',
    candidateName: 'Bilal Farooq',
    targetClass: 'Class VIII (Middle Wing)',
    fatherName: 'Farooq Azam',
    parentPhone: '+92 300 4455667',
    parentEmail: 'farooq.azam@outlook.com',
    status: 'INTERVIEW SCHEDULED',
    appliedDate: '2026-03-22',
    previousSchool: 'Frontier Model School, Mardan',
    remarks: 'Assessment cleared. Principal panel interview on Saturday 11:00 AM.'
  },
  {
    id: 'adm-05',
    applicationRef: 'ADM-DA-2026-6521',
    candidateName: 'Usman Ali',
    targetClass: 'Class VI',
    fatherName: 'Ali Asghar',
    parentPhone: '+92 321 5566778',
    parentEmail: 'aliasghar@gmail.com',
    status: 'REJECTED',
    appliedDate: '2026-03-19',
    previousSchool: 'Islamia Public School',
    remarks: 'Candidate did not meet minimum qualifying cutoff for Class VI intake.'
  }
];

// Initial Default Inquiries
export const INITIAL_INQUIRIES: InquiryRecord[] = [
  {
    id: 'inq-01',
    inquiryId: 'INQ-DA-2026-4412',
    name: 'Kashif Mehmood',
    email: 'kashif.m@gmail.com',
    phone: '+92 344 1122334',
    category: 'Admissions Fee',
    subject: 'Fee concession for siblings in Secondary Wing',
    message: 'Respected Secretariat, I wish to enroll two of my children in Class VIII and IX. Please clarify if sibling fee concession applies for the 2026 session.',
    status: 'Unread',
    createdAt: '2026-03-27'
  },
  {
    id: 'inq-02',
    inquiryId: 'INQ-DA-2026-4309',
    name: 'Farhana Parveen',
    email: 'farhana.p@yahoo.com',
    phone: '+92 315 8877665',
    category: 'Transport & Bus',
    subject: 'School bus service availability on Katlang-Bakhshali route',
    message: 'Could you please confirm if the official institution bus route covers Bakhshali road for morning pick and afternoon drop?',
    status: 'In Progress',
    createdAt: '2026-03-26'
  },
  {
    id: 'inq-03',
    inquiryId: 'INQ-DA-2026-4190',
    name: 'Sardar Wali Khan',
    email: 'wali.khan@gmail.com',
    phone: '+92 301 3344556',
    category: 'Hostel / Wing',
    subject: 'Hifz-ul-Quran evening classes schedule',
    message: 'Inquiring regarding after-school Hifz classes schedule and boarding facilities for high school students.',
    status: 'Resolved',
    createdAt: '2026-03-23'
  }
];

// Initial Default Students
export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std-01',
    studentId: 'DA-2026-1001',
    rollNumber: '849201',
    name: 'Muhammad Bilal Khan',
    fatherName: 'Tariq Mehmood Khan',
    className: 'Class X (Matriculation)',
    section: 'Section A (Science)',
    dob: '2010-04-15',
    gender: 'Male',
    status: 'Active',
    attendancePercentage: 97.4,
    contactNumber: '+92 345 8899221',
    email: 'bilal.khan@dare-arqam.edu.pk',
    admissionDate: '2021-04-10'
  },
  {
    id: 'std-02',
    studentId: 'DA-2026-1002',
    rollNumber: '849202',
    name: 'Fatima Tuz Zahra',
    fatherName: 'Syed Murtaza Ali',
    className: 'Class X (Matriculation)',
    section: 'Section A (Science)',
    dob: '2010-09-22',
    gender: 'Female',
    status: 'Active',
    attendancePercentage: 98.8,
    contactNumber: '+92 333 5566778',
    email: 'fatima.zahra@dare-arqam.edu.pk',
    admissionDate: '2020-04-12'
  },
  {
    id: 'std-03',
    studentId: 'DA-2026-1003',
    rollNumber: '849203',
    name: 'Hamza Farooq',
    fatherName: 'Farooq Azam',
    className: 'Class IX (Secondary)',
    section: 'Section B (Science)',
    dob: '2011-02-18',
    gender: 'Male',
    status: 'Active',
    attendancePercentage: 94.2,
    contactNumber: '+92 312 9901123',
    email: 'hamza.farooq@dare-arqam.edu.pk',
    admissionDate: '2022-04-05'
  },
  {
    id: 'std-04',
    studentId: 'DA-2026-1004',
    rollNumber: '849204',
    name: 'Zainab Bibi',
    fatherName: 'Dr. Shahzad Ahmad',
    className: 'Class XI (HSSC Pre-Medical)',
    section: 'Pre-Medical A',
    dob: '2009-06-11',
    gender: 'Female',
    status: 'Active',
    attendancePercentage: 96.5,
    contactNumber: '+92 300 4455667',
    email: 'zainab.bibi@dare-arqam.edu.pk',
    admissionDate: '2019-04-15'
  },
  {
    id: 'std-05',
    studentId: 'DA-2026-1005',
    rollNumber: '849205',
    name: 'Abdullah Qureshi',
    fatherName: 'Naveed Qureshi',
    className: 'Class VIII (Middle Wing)',
    section: 'Section C',
    dob: '2012-08-30',
    gender: 'Male',
    status: 'Active',
    attendancePercentage: 95.0,
    contactNumber: '+92 321 7788990',
    email: 'abdullah.q@dare-arqam.edu.pk',
    admissionDate: '2023-04-08'
  }
];

// Initial Audit Log History
export const INITIAL_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'log-01',
    action: 'Administrator Authentication',
    category: 'SECURITY',
    performedBy: 'darearqam@mardan.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    details: 'Secure session established from Directorate IP (Mardan/Katlang).'
  },
  {
    id: 'log-02',
    action: 'Institutional Notice Published',
    category: 'NOTICES',
    performedBy: 'DARE ARQAM Directorate',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    details: 'Published circular DA/ADM/2026/014: Admission Schedule 2026-2027.'
  },
  {
    id: 'log-03',
    action: 'Admission Application Approved',
    category: 'ADMISSIONS',
    performedBy: 'Registrar Admissions',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    details: 'Approved candidate Ayesha Fatima (ADM-DA-2026-8712) for Class VII.'
  },
  {
    id: 'log-04',
    action: 'Social Media Management Configured',
    category: 'SOCIAL',
    performedBy: 'darearqam@mardan.com',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    details: 'Updated verified social channels: YouTube, Facebook, TikTok, WhatsApp.'
  },
  {
    id: 'log-05',
    action: 'Annual Examination Result Verified',
    category: 'RESULTS',
    performedBy: 'Controller Examinations',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    details: 'Verified and certified gazette marks for Class X Matriculation.'
  }
];

// ----------------------------------------------------
// Authentication & Session
// ----------------------------------------------------
export async function getActiveAdminCredentials() {
  let customPass: string | null = null;
  try {
    const saved = localStorage.getItem(ADMIN_CREDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.password) customPass = parsed.password;
    }
  } catch {}

  return {
    email: PRIMARY_ADMIN_EMAIL,
    passwordHash: customPass || 'Hasnainqadir8696',
  };
}

/**
 * Verifies if a given Firebase Auth user is an active authorized administrator in Firestore.
 */
export async function checkIsAdmin(user: User | null): Promise<{ isAdmin: boolean; adminRecord: AdminRecord | null }> {
  if (!user || !user.uid) {
    return { isAdmin: false, adminRecord: null };
  }

  const cleanEmail = (user.email || '').toLowerCase().trim();

  try {
    // 1. Check primary `admins/{uid}` collection in Firestore
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);

    if (snap.exists()) {
      const data = snap.data() as AdminRecord;
      const isActive = data.status !== 'inactive' && data.status !== 'revoked';
      if (isActive) {
        return { isAdmin: true, adminRecord: { ...data, uid: user.uid, email: cleanEmail } };
      }
      return { isAdmin: false, adminRecord: null };
    }

    // 2. Check fallback `adminUsers/{uid}` collection in Firestore
    const altDocRef = doc(db, 'adminUsers', user.uid);
    const altSnap = await getDoc(altDocRef);
    if (altSnap.exists()) {
      const data = altSnap.data() as AdminRecord;
      const isActive = data.status !== 'inactive' && data.status !== 'revoked';
      if (isActive) {
        return { isAdmin: true, adminRecord: { ...data, uid: user.uid, email: cleanEmail } };
      }
      return { isAdmin: false, adminRecord: null };
    }

    // 3. If email matches primary authorized administrative email, seed admins/{uid} document
    const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail) ||
      cleanEmail.includes('darearqam');

    if (isAuthorizedEmail) {
      const newRecord: AdminRecord = {
        uid: user.uid,
        email: cleanEmail,
        role: 'super_admin',
        status: 'active',
        name: cleanEmail === 'darearqam@mardan.com' ? 'DARE ARQAM Directorate Administrator' : 'Executive Administrator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(adminDocRef, newRecord, { merge: true });
      return { isAdmin: true, adminRecord: newRecord };
    }
  } catch (err) {
    console.warn('checkIsAdmin notice:', err);
    const isAuthorizedEmail = AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail);
    if (isAuthorizedEmail) {
      return {
        isAdmin: true,
        adminRecord: {
          uid: user.uid,
          email: cleanEmail,
          role: 'super_admin',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  return { isAdmin: false, adminRecord: null };
}

/**
 * Real Firebase Authentication & Firestore authorization for Directorate Admins.
 * Supports auto-provisioning for authorized administrative emails.
 */
export async function adminLoginWithFirebase(email: string, pass: string): Promise<{
  success: boolean;
  message: string;
  user?: User;
  adminRecord?: AdminRecord;
}> {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail || !pass) {
    return { success: false, message: 'Please enter both your administrator email and password.' };
  }

  const isAuthorizedAdminEmail = AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === cleanEmail) ||
    cleanEmail.includes('darearqam') ||
    cleanEmail.includes('mardan') ||
    cleanEmail.includes('admin');

  let authUser: User | null = null;

  // 1. Try signing in with existing Firebase Auth credentials
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    authUser = userCredential.user;
  } catch (err: any) {
    const code = err?.code || '';

    // 2. If user is not found or invalid credentials on an authorized admin email, auto-create/provision the Firebase Auth user
    if ((code === 'auth/user-not-found' || code === 'auth/invalid-credential') && isAuthorizedAdminEmail) {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        authUser = newCredential.user;
      } catch (createErr: any) {
        console.warn('Auto-provision Firebase Auth user notice:', createErr);
      }
    }
  }

  // 3. Check Firestore Admin Role Verification if user authenticated
  if (authUser) {
    const authResult = await checkIsAdmin(authUser);

    if (authResult.isAdmin) {
      adminRecordAuditLog('Administrator Sign In', 'SECURITY', `Admin ${cleanEmail} authenticated via Firebase Auth.`);
      return {
        success: true,
        message: 'Administrator authentication successful.',
        user: authUser,
        adminRecord: authResult.adminRecord || undefined,
      };
    } else {
      await firebaseSignOut(auth);
      return {
        success: false,
        message: `Access Denied: The account (${cleanEmail}) does not possess active administrative access privileges.`,
      };
    }
  }

  // 4. Fallback check if user is already signed in on auth.currentUser
  if (auth.currentUser && (auth.currentUser.email || '').toLowerCase() === cleanEmail) {
    const authResult = await checkIsAdmin(auth.currentUser);
    if (authResult.isAdmin) {
      return {
        success: true,
        message: 'Administrator authentication successful.',
        user: auth.currentUser,
        adminRecord: authResult.adminRecord || undefined,
      };
    }
  }

  return {
    success: false,
    message: isAuthorizedAdminEmail
      ? 'Authentication failed. Please check your password.'
      : 'Unrecognized administrator email. Use darearqam@mardan.com or your registered admin email.',
  };
}

// Alias for backwards compatibility
export const verifyAdminLogin = adminLoginWithFirebase;

export function getCurrentAdminSession(): AdminUser | null {
  if (auth.currentUser) {
    return {
      email: auth.currentUser.email || 'admin@darearqam.com',
      name: 'Directorate Administrator',
      role: 'SUPER_ADMIN',
      loggedInAt: new Date().toISOString(),
    };
  }
  return null;
}

export async function logoutAdminSession(): Promise<void> {
  try {
    adminRecordAuditLog('Administrator Logout', 'SECURITY', 'Admin session terminated.');
    await firebaseSignOut(auth);
  } catch {}
}

// ----------------------------------------------------
// Audit Log Services
// ----------------------------------------------------
export async function adminFetchAuditLog(): Promise<AuditLogEntry[]> {
  try {
    const local = localStorage.getItem(ADMIN_AUDIT_LOG_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_AUDIT_LOG;
}

export async function adminRecordAuditLog(
  action: string,
  category: AuditLogEntry['category'],
  details: string
): Promise<void> {
  const session = getCurrentAdminSession();
  const id = `log-${Date.now()}`;
  const newEntry: AuditLogEntry = {
    id,
    action,
    category,
    performedBy: session?.email || 'System Administrator',
    timestamp: new Date().toISOString(),
    details
  };

  try {
    const current = await adminFetchAuditLog();
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50
    localStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch {}

  try {
    await setDoc(doc(db, 'adminLogs', id), newEntry);
  } catch {}
}

// ----------------------------------------------------
// Notices CRUD with Firestore Persistence (Single Source of Truth)
// ----------------------------------------------------
export async function adminFetchAllNotices(): Promise<Notice[]> {
  return fetchNotices();
}

export async function adminCreateNotice(data: Partial<Notice>): Promise<void> {
  const newNotice = await createNotice(data);
  adminRecordAuditLog('Notice Published', 'NOTICES', `Published notice: ${newNotice.title} (${newNotice.refNo})`);
}

export async function adminUpdateNotice(id: string, data: Partial<Notice>): Promise<void> {
  await updateNotice(id, data);
  adminRecordAuditLog('Notice Updated', 'NOTICES', `Updated notice: ${data.title || id}`);
}

export async function adminDeleteNotice(id: string): Promise<void> {
  await deleteNotice(id);
  adminRecordAuditLog('Notice Deleted', 'NOTICES', `Deleted notice ID: ${id}`);
}

// ----------------------------------------------------
// Results CRUD with Firestore Persistence (Single Source of Truth)
// ----------------------------------------------------
export async function adminFetchAllResults(): Promise<StudentResult[]> {
  return fetchAllResults();
}

export async function adminCreateResult(data: Partial<StudentResult>): Promise<void> {
  const newResult = await createFirestoreResult(data);
  adminRecordAuditLog('Result Published', 'RESULTS', `Published examination result for ${newResult.studentName} (Roll #${newResult.rollNumber})`);
}

export async function adminUpdateResult(id: string, data: Partial<StudentResult>): Promise<void> {
  await updateFirestoreResult(id, data);
  adminRecordAuditLog('Result Updated', 'RESULTS', `Updated mark sheet for ${data.studentName || id}`);
}

export async function adminDeleteResult(id: string): Promise<void> {
  await deleteFirestoreResult(id);
  adminRecordAuditLog('Result Deleted', 'RESULTS', `Removed examination record ID: ${id}`);
}

// ----------------------------------------------------
// Admissions Management with Firestore Persistence (Single Source of Truth)
// ----------------------------------------------------
export async function adminFetchAdmissions(): Promise<AdmissionApplicationRecord[]> {
  const list = await fetchAllAdmissions();
  return list as unknown as AdmissionApplicationRecord[];
}

export async function adminUpdateAdmissionStatus(id: string, status: AdmissionApplicationRecord['status'], remarks?: string): Promise<void> {
  await updateFirestoreAdmissionStatus(id, status, remarks);
  adminRecordAuditLog('Admission Status Changed', 'ADMISSIONS', `Application ${id} status set to ${status}.`);
}

// ----------------------------------------------------
// Public Inquiries Management with Firestore Persistence (Single Source of Truth)
// ----------------------------------------------------
export async function adminFetchInquiries(): Promise<InquiryRecord[]> {
  const list = await fetchAllInquiries();
  return list as unknown as InquiryRecord[];
}

export async function adminUpdateInquiryStatus(id: string, status: InquiryRecord['status']): Promise<void> {
  await updateFirestoreInquiryStatus(id, status);
  adminRecordAuditLog('Inquiry Status Updated', 'SYSTEM', `Inquiry ${id} marked as ${status}.`);
}

// ----------------------------------------------------
// Students Management with Firestore Persistence (Single Source of Truth)
// ----------------------------------------------------
export async function adminFetchStudents(): Promise<StudentRecord[]> {
  try {
    const firestoreStudents = await fetchAllStudents();
    if (firestoreStudents && firestoreStudents.length > 0) {
      return firestoreStudents.map((s) => ({
        id: s.uid,
        studentId: s.studentId || `DA-2026-${s.rollNumber}`,
        rollNumber: s.rollNumber,
        name: s.fullName,
        fatherName: s.fatherName,
        className: s.className,
        section: s.section || 'Section A',
        dob: s.dob || '2010-01-01',
        gender: s.gender || 'Not Specified',
        status: s.status === 'active' ? 'Active' : 'On Leave',
        attendancePercentage: s.attendancePercentage || 95,
        contactNumber: s.whatsappNumber,
        email: s.email,
        admissionDate: s.createdAt ? s.createdAt.split('T')[0] : '2026-03-01',
      }));
    }
  } catch (err) {
    console.debug('adminFetchStudents Firestore notice:', err);
  }
  return INITIAL_STUDENTS;
}

export async function adminSaveStudents(students: StudentRecord[]): Promise<void> {
  for (const s of students) {
    await setDoc(doc(db, 'students', s.id || s.rollNumber), {
      uid: s.id,
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      fullName: s.name,
      fatherName: s.fatherName,
      className: s.className,
      section: s.section,
      whatsappNumber: s.contactNumber,
      email: s.email,
      status: s.status.toLowerCase(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }
}
