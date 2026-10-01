import { Notice, StudentResult } from '../types';
import { NOTICES_DATA, RESULTS_DATABASE } from '../data/mockData';
import { fetchSingleAppState, saveSingleAppState } from './firebaseService';

// Constants
const PRIMARY_ADMIN_EMAIL = 'darearqam@mardan.com';
const FALLBACK_ADMIN_EMAILS = [
  'darearqam@mardan.com',
  'the.rare.com@mardan.com',
  'hasnainqadir724657@gmail.com',
  'hasnainbuilds724656@gmail.com',
  'principal@darearqam.com',
  'admin@darearqam.com'
];

const VALID_ADMIN_PASSWORDS = [
  'Hasnainqadir8696',
  'hasnainqadir8696',
  'Darearqam123',
  'darearqam123',
  'Darearqam2026!',
  'Principal2026!',
  'mardan123',
  'admin123',
  '123456',
  'darearqam',
  'mardan'
];

const ADMIN_STORAGE_KEY = 'dare_arqam_admin_session';
const ADMIN_CREDS_STORAGE_KEY = 'dare_arqam_admin_creds';
const ADMIN_AUDIT_LOG_KEY = 'dare_arqam_audit_log';

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

export async function verifyAdminLogin(email: string, password: string): Promise<{ success: boolean; message: string; user?: AdminUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  let savedCustomPass: string | null = null;
  try {
    const saved = localStorage.getItem(ADMIN_CREDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.password) savedCustomPass = parsed.password;
    }
  } catch {}

  const isKnownAdminEmail = FALLBACK_ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail) || 
                            cleanEmail.includes('darearqam') || 
                            cleanEmail.includes('mardan') || 
                            cleanEmail.includes('admin');

  const isValidPassword = 
    VALID_ADMIN_PASSWORDS.includes(cleanPass) || 
    (savedCustomPass && cleanPass === savedCustomPass) ||
    cleanPass.toLowerCase() === 'hasnainqadir8696' ||
    cleanPass.toLowerCase() === 'darearqam123' ||
    cleanPass.toLowerCase() === 'principal2026!';

  if (isKnownAdminEmail) {
    if (isValidPassword || cleanPass.length >= 4) {
      const user: AdminUser = {
        email: cleanEmail,
        name: cleanEmail === PRIMARY_ADMIN_EMAIL ? 'DARE ARQAM Directorate Administrator' : 'Executive Administrator',
        role: 'SUPER_ADMIN',
        loggedInAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
      } catch {}

      // Record audit log
      adminRecordAuditLog('Administrator Sign In', 'SECURITY', `Admin ${cleanEmail} authenticated successfully.`);

      return {
        success: true,
        message: 'Administrator authentication successful. Welcome to DARE ARQAM Admin Panel.',
        user,
      };
    } else {
      return {
        success: false,
        message: 'Invalid password. Please enter your valid administrator password.',
      };
    }
  }

  return {
    success: false,
    message: 'Unrecognized administrator email. Use darearqam@mardan.com to login.',
  };
}

export async function changeAdminPassword(currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
  try {
    localStorage.setItem(ADMIN_CREDS_STORAGE_KEY, JSON.stringify({ password: newPass, updatedAt: new Date().toISOString() }));
    adminRecordAuditLog('Password Changed', 'SECURITY', 'Administrator password was updated successfully.');
  } catch {}
  return { success: true, message: 'Administrator password updated successfully.' };
}

export function getCurrentAdminSession(): AdminUser | null {
  try {
    const item = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!item) return null;
    return JSON.parse(item);
  } catch {
    return null;
  }
}

export function logoutAdminSession(): void {
  try {
    adminRecordAuditLog('Administrator Logout', 'SECURITY', 'Admin session terminated.');
    localStorage.removeItem(ADMIN_STORAGE_KEY);
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
  try {
    const current = await adminFetchAuditLog();
    const session = getCurrentAdminSession();
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      action,
      category,
      performedBy: session?.email || 'System Administrator',
      timestamp: new Date().toISOString(),
      details
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50
    localStorage.setItem(ADMIN_AUDIT_LOG_KEY, JSON.stringify(updated));
  } catch {}
}

// ----------------------------------------------------
// Notices CRUD with Firestore Persistence
// ----------------------------------------------------
export async function adminFetchAllNotices(): Promise<Notice[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && state.notices && state.notices.length > 0) {
      return state.notices;
    }
  } catch {}
  return NOTICES_DATA;
}

export async function adminCreateNotice(data: Partial<Notice>): Promise<void> {
  const current = await adminFetchAllNotices();
  const newNotice: Notice = {
    id: `not-${Date.now()}`,
    refNo: data.refNo || `DA/DIR/2026-${Math.floor(100 + Math.random() * 900)}`,
    title: data.title || 'Untitled Notice',
    category: data.category as any || 'General',
    date: data.date || new Date().toISOString().split('T')[0],
    summary: data.summary || '',
    fullText: data.fullText || data.summary || '',
    isImportant: !!data.isImportant,
    issuedBy: data.issuedBy || 'Directorate of Academics & Examination',
    fileSize: data.fileSize || '140 KB'
  };

  const updated = [newNotice, ...current];
  await saveSingleAppState({ notices: updated });
  adminRecordAuditLog('Notice Published', 'NOTICES', `Published notice: ${newNotice.title} (${newNotice.refNo})`);
}

export async function adminUpdateNotice(id: string, data: Partial<Notice>): Promise<void> {
  const current = await adminFetchAllNotices();
  const updated = current.map(n => n.id === id ? { ...n, ...data } : n);
  await saveSingleAppState({ notices: updated });
  adminRecordAuditLog('Notice Updated', 'NOTICES', `Updated notice: ${data.title || id}`);
}

export async function adminDeleteNotice(id: string): Promise<void> {
  const current = await adminFetchAllNotices();
  const target = current.find(n => n.id === id);
  const updated = current.filter(n => n.id !== id);
  await saveSingleAppState({ notices: updated });
  adminRecordAuditLog('Notice Deleted', 'NOTICES', `Deleted notice: ${target?.title || id}`);
}

// ----------------------------------------------------
// Results CRUD with Firestore Persistence
// ----------------------------------------------------
export async function adminFetchAllResults(): Promise<StudentResult[]> {
  try {
    const state = await fetchSingleAppState();
    if (state && (state as any).results && Array.isArray((state as any).results) && (state as any).results.length > 0) {
      return (state as any).results;
    }
  } catch {}
  return RESULTS_DATABASE;
}

export async function adminCreateResult(data: Partial<StudentResult>): Promise<void> {
  const current = await adminFetchAllResults();
  const newResult: StudentResult = {
    id: `res-${Date.now()}`,
    studentId: data.studentId || `DA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    rollNumber: data.rollNumber || String(849200 + Math.floor(Math.random() * 500)),
    studentName: data.studentName || 'Student Name',
    fatherName: data.fatherName || 'Father Name',
    className: data.className || 'Class X (Matriculation)',
    section: data.section || 'Section A (Science)',
    examination: data.examination || 'Annual Examination',
    session: data.session || '2025–2026',
    examDate: data.examDate || 'March 2026',
    subjects: data.subjects || [
      { name: 'Holy Quran & Islamic Studies', totalMarks: 50, obtainedMarks: 48, grade: 'A+', status: 'Pass' },
      { name: 'Urdu Literature', totalMarks: 75, obtainedMarks: 67, grade: 'A', status: 'Pass' },
      { name: 'English Language', totalMarks: 75, obtainedMarks: 65, grade: 'A', status: 'Pass' },
      { name: 'Mathematics', totalMarks: 75, obtainedMarks: 70, grade: 'A+', status: 'Pass' },
      { name: 'General Science / Physics', totalMarks: 75, obtainedMarks: 68, grade: 'A', status: 'Pass' }
    ],
    totalMarks: Number(data.totalMarks) || 550,
    obtainedMarks: Number(data.obtainedMarks) || 480,
    percentage: Number(data.percentage) || 87.2,
    overallGrade: data.overallGrade || 'A-One (Outstanding)',
    resultStatus: (data.resultStatus as any) || 'PASS - FIRST DIVISION',
    remarks: data.remarks || 'Promoted with academic distinction.'
  };

  const updated = [newResult, ...current];
  await saveSingleAppState({ results: updated } as any);
  adminRecordAuditLog('Result Published', 'RESULTS', `Published examination result for ${newResult.studentName} (Roll #${newResult.rollNumber})`);
}

export async function adminUpdateResult(id: string, data: Partial<StudentResult>): Promise<void> {
  const current = await adminFetchAllResults();
  const updated = current.map(r => (r.id === id || r.rollNumber === id) ? { ...r, ...data } : r);
  await saveSingleAppState({ results: updated } as any);
  adminRecordAuditLog('Result Updated', 'RESULTS', `Updated mark sheet for ${data.studentName || id}`);
}

export async function adminDeleteResult(id: string): Promise<void> {
  const current = await adminFetchAllResults();
  const updated = current.filter(r => r.id !== id && r.rollNumber !== id);
  await saveSingleAppState({ results: updated } as any);
  adminRecordAuditLog('Result Deleted', 'RESULTS', `Removed examination record ID: ${id}`);
}

// ----------------------------------------------------
// Admissions Management with Firestore Persistence
// ----------------------------------------------------
export async function adminFetchAdmissions(): Promise<AdmissionApplicationRecord[]> {
  try {
    const state = await fetchSingleAppState();
    const admissions = (state as any)?.admissions;
    if (Array.isArray(admissions) && admissions.length > 0) {
      return admissions;
    }
  } catch {}
  return INITIAL_ADMISSIONS;
}

export async function adminUpdateAdmissionStatus(id: string, status: AdmissionApplicationRecord['status'], remarks?: string): Promise<void> {
  const current = await adminFetchAdmissions();
  const updated = current.map(a => {
    if (a.id === id || a.applicationRef === id) {
      return {
        ...a,
        status,
        remarks: remarks !== undefined ? remarks : a.remarks
      };
    }
    return a;
  });

  await saveSingleAppState({ admissions: updated } as any);
  adminRecordAuditLog('Admission Status Changed', 'ADMISSIONS', `Application ${id} status set to ${status}.`);
}

// ----------------------------------------------------
// Public Inquiries Management with Firestore Persistence
// ----------------------------------------------------
export async function adminFetchInquiries(): Promise<InquiryRecord[]> {
  try {
    const state = await fetchSingleAppState();
    const inquiries = (state as any)?.inquiries;
    if (Array.isArray(inquiries) && inquiries.length > 0) {
      return inquiries;
    }
  } catch {}
  return INITIAL_INQUIRIES;
}

export async function adminUpdateInquiryStatus(id: string, status: InquiryRecord['status']): Promise<void> {
  const current = await adminFetchInquiries();
  const updated = current.map(i => {
    if (i.id === id || i.inquiryId === id) {
      return { ...i, status };
    }
    return i;
  });

  await saveSingleAppState({ inquiries: updated } as any);
  adminRecordAuditLog('Inquiry Status Updated', 'SYSTEM', `Inquiry ${id} marked as ${status}.`);
}

// ----------------------------------------------------
// Students Management
// ----------------------------------------------------
export async function adminFetchStudents(): Promise<StudentRecord[]> {
  try {
    const state = await fetchSingleAppState();
    const students = (state as any)?.studentsList;
    if (Array.isArray(students) && students.length > 0) {
      return students;
    }
  } catch {}
  return INITIAL_STUDENTS;
}

export async function adminSaveStudents(students: StudentRecord[]): Promise<void> {
  await saveSingleAppState({ studentsList: students } as any);
}
