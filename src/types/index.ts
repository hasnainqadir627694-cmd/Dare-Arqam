export type PageId =
  | 'home'
  | 'about'
  | 'principal-message'
  | 'vision-mission'
  | 'administration'
  | 'faculty'
  | 'departments'
  | 'academic-programs'
  | 'classes'
  | 'academic-calendar'
  | 'examination'
  | 'results'
  | 'syllabus'
  | 'admission-info'
  | 'eligibility'
  | 'admission-process'
  | 'required-documents'
  | 'fee-structure'
  | 'apply-admission'
  | 'student-portal'
  | 'student-login'
  | 'student-register'
  | 'admin-login'
  | 'admin-dashboard'
  | 'super-admin-dashboard'
  | 'notices'
  | 'notice-detail'
  | 'events'
  | 'news'
  | 'gallery'
  | 'downloads'
  | 'contact'
  | 'verify-student';

export interface StudentQrIdentity {
  tokenId: string; // Cryptographically unique unpredictable lookup token e.g. "dast_9f83b1..."
  status: 'active' | 'revoked';
  createdAt: string;
  revokedAt?: string;
  revokedReason?: string;
  qrDataUrl?: string; // Persistent generated data URL for rapid zero-latency rendering
  version: number;
}

export interface AttendanceRecord {
  id?: string;
  studentUid: string;
  studentName?: string;
  fatherName?: string;
  className?: string;
  rollNumber?: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO 8601
  status: 'present' | 'late' | 'absent';
  gateId: string;
  recordedBy: string;
  qrTokenId: string;
}

export interface Notice {
  id: string;
  refNo: string;
  title: string;
  category: 'Admissions' | 'Academic' | 'Examination' | 'Administrative' | 'General';
  date: string;
  summary: string;
  fullText: string;
  isImportant?: boolean;
  issuedBy: string;
  fileSize?: string;
}

export interface AcademicEvent {
  id: string;
  title: string;
  date: string;
  category: 'Examination' | 'Ceremony' | 'Holiday' | 'Sports' | 'Academic';
  description: string;
  venue: string;
  time: string;
  isUpcoming: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  content: string;
}

export interface StudentResult {
  id?: string;
  studentId: string;
  rollNumber: string;
  studentName: string;
  fatherName: string;
  className: string;
  section: string;
  examination: string;
  session: string;
  examDate: string;
  subjects: {
    name: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
    status: 'Pass' | 'Fail';
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  overallGrade: string;
  resultStatus: 'PASS - FIRST DIVISION' | 'PASS - SECOND DIVISION' | 'FAILED' | 'HELD';
  positionInClass?: string;
  remarks: string;
}

export interface DocumentDownload {
  id: string;
  title: string;
  category: 'Admissions' | 'Academic' | 'Forms' | 'Examination' | 'Rules';
  date: string;
  fileSize: string;
  fileType: string;
  refNo: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
}

export interface GallerySlide {
  id: string;
  url: string;
  thumbnailUrl?: string; // Ultra-low resolution (e.g. 32px) blur placeholder
  title?: string;
  caption?: string;
  category?: string;
  order: number;
  enabled: boolean;
  createdAt: string;
  storagePath?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  fileSizeKB?: number;
  originalSizeKB?: number;
  format?: string;
  publicId?: string;
}

export interface GallerySettings {
  autoSlideInterval: number; // in milliseconds (e.g. 3000, 4000, 5000, 7000, 10000)
  pauseOnHover: boolean;
  loop: boolean;
  showNavigation: boolean;
  showIndicators: boolean;
}

export const DARE_ARQAM_CLASSES = [
  'Play Group',
  'Nursery',
  'Prep',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
] as const;

export type DareArqamClass = typeof DARE_ARQAM_CLASSES[number];

export interface StudentProfile {
  uid: string;
  fullName: string;
  fatherName: string;
  className: DareArqamClass | string;
  rollNumber: string;
  whatsappNumber: string;
  email: string;
  profileImageUrl?: string;
  profileImagePublicId?: string;
  status?: 'active' | 'inactive' | 'suspended';
  studentId?: string;
  qrIdentity?: StudentQrIdentity;
  createdAt: string;
  updatedAt: string;
  dob?: string;
  gender?: string;
  bForm?: string;
  section?: string;
  session?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  residentialAddress?: string;
  attendancePercentage?: number;
  totalWorkingDays?: number;
  presentDays?: number;
  leavesSanctioned?: number;
  unexcusedAbsences?: number;
}

export type TemplateFieldKey = 'profilePicture' | 'name' | 'fatherName' | 'className' | 'rollNumber';

export interface TemplateFieldConfig {
  x: number; // 0 to 100 percentage from left
  y: number; // 0 to 100 percentage from top
  width: number; // 0 to 100 percentage width
  height: number; // 0 to 100 percentage height
  fontSize: number; // in px at standard 400px width canvas
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  shape?: 'square' | 'rounded' | 'circle'; // For profile picture
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  prefix?: string;
  showLabel?: boolean;
  label?: string;
  visible?: boolean;
  classDisplayFormat?: 'number-only' | 'full-name'; // When true/number-only, displays '6' instead of 'Class 6'
}

export interface QrCodeFieldConfig {
  x: number; // 0 to 100 percentage from left
  y: number; // 0 to 100 percentage from top
  width: number; // 0 to 100 percentage width
  height: number; // 0 to 100 percentage height
  quietZone?: number; // padding in px inside white frame
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  showLabel?: boolean;
  label?: string;
  visible?: boolean;
}

export interface IdCardTemplate {
  id: string;
  name: string;
  templateUrl: string; // Front template image URL
  frontTemplateUrl?: string;
  backTemplateUrl?: string;
  storagePath?: string;
  backStoragePath?: string;
  aspectRatio: number; // width / height (e.g. 0.625 for portrait card)
  originalWidth?: number;
  originalHeight?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fields: {
    profilePicture: TemplateFieldConfig;
    name: TemplateFieldConfig;
    fatherName: TemplateFieldConfig;
    className: TemplateFieldConfig;
    rollNumber: TemplateFieldConfig;
  };
  frontFields?: {
    profilePicture: TemplateFieldConfig;
    name: TemplateFieldConfig;
    fatherName: TemplateFieldConfig;
    className: TemplateFieldConfig;
    rollNumber: TemplateFieldConfig;
  };
  backFields?: {
    qrCode: QrCodeFieldConfig;
  };
}

