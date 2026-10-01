import { Notice, AcademicEvent, NewsItem, StudentResult, DocumentDownload, FacultyMember } from '../types';

export const INSTITUTION_INFO = {
  name: 'DAR - E - ARQAM',
  fullName: 'DAR - E - ARQAM SCHOOL SYSTEM',
  tagline: 'School Katlang Campus',
  establishedYear: '1998',
  registrationNo: 'REG/EDU-PK/1998/4402',
  affiliation: 'Board of Intermediate and Secondary Education (BISE) Recognized',
  address: 'Institution Main Campus, Institutional Area, Sector H-8/4, Islamabad, Pakistan',
  phone: '+92 (051) 9260100-04 (Ext. 204)',
  emergencyPhone: '+92 (051) 9260105',
  email: 'info@dare-arqam.edu.pk',
  admissionsEmail: 'admissions@dare-arqam.edu.pk',
  officeHours: 'Monday – Thursday, Saturday: 08:00 AM – 02:30 PM | Friday: 08:00 AM – 12:30 PM (Closed Sunday)',
  visitorTimings: '10:00 AM – 01:00 PM by prior appointment only',
  principalName: 'Prof. Dr. Abdul Rahman Qureshi',
  principalQualification: 'Ph.D. in Educational Leadership & Curriculum Design',
};

export const NOTICES_DATA: Notice[] = [
  {
    id: 'not-01',
    refNo: 'DA/ADM/2026/014',
    title: 'Admission Schedule for Academic Session 2026–2027',
    category: 'Admissions',
    date: '2026-03-24',
    isImportant: true,
    issuedBy: 'Office of the Registrar / Admissions Directorate',
    fileSize: '420 KB',
    summary: 'Registrations are open for Playgroup through Matriculation & Intermediate (Pre-Medical, Pre-Engineering, ICS). Parents and guardians must submit the application form along with verifiable B-Form copies before the specified deadline.',
    fullText: `OFFICIAL NOTIFICATION
Ref: DA/ADM/2026/014
Date: 24th March, 2026

SUBJECT: COMMENCEMENT OF ADMISSION CYCLE 2026–2027

It is hereby notified for the information of all prospective students, parents, and guardians that the admission schedule for the Academic Session 2026–2027 has commenced across all wings of DAR - E - ARQAM:

1. Junior Wing (Pre-School, Classes I to V)
2. Middle Wing (Classes VI to VIII)
3. Senior Wing (Matriculation Classes IX & X - Science / Humanities)
4. Higher Secondary Wing (HSSC - Pre-Medical, Pre-Engineering, Computer Science)

KEY TIMELINES:
- Issuance of Prospectus & Admission Forms: 25th March, 2026 onwards
- Last Date for Submission of Applications: 18th April, 2026
- Written Assessment & Evaluation: 22nd–24th April, 2026
- Display of First Merit List: 28th April, 2026
- Fee Deposit Deadline for Merit List Applicants: 05th May, 2026
- Orientation & Academic Session Commencement: 12th May, 2026

REQUIRED ATTESTED DOCUMENTS:
a) Candidate's NADRA B-Form or CNIC copy
b) Father / Legal Guardian's CNIC copy
c) Four recent passport-sized photographs with light background
d) Original School Leaving Certificate (SLC) & Character Certificate from previous registered institution
e) Attested copy of previous academic transcripts / result gazette

Note: Incomplete applications or those submitted without verified NADRA documents shall not be entertained under institutional regulations.

Sd/-
Registrar / Admissions Directorate
DAR - E - ARQAM School System`
  },
  {
    id: 'not-02',
    refNo: 'DA/EXAM/2026/089',
    title: 'Mid-Term Examination Timetable & Admit Card Collection',
    category: 'Examination',
    date: '2026-03-18',
    isImportant: true,
    issuedBy: 'Controller of Examinations',
    fileSize: '650 KB',
    summary: 'All registered students of Classes VI to X are advised to obtain their verified Examination Roll Number slips from their respective section heads before the clearance cut-off.',
    fullText: `OFFICIAL CIRCULAR
Ref: DA/EXAM/2026/089
Date: 18th March, 2026

SUBJECT: MID-TERM EXAMINATION TIMETABLE NOTIFICATION

The Controller of Examinations, DAR - E - ARQAM, announces the date sheet for the Mid-Term Evaluation Examinations 2026.

1. Examination commencement: Monday, 06th April, 2026.
2. Reporting time: 08:00 AM sharp. No student will be admitted to examination halls 15 minutes past commencement.
3. Admit cards (Roll Number slips) must be stamped and validated by the Accounts Office confirming dues clearance up to March 2026.
4. Candidates must bring their original student identification card and blue/black ballpoint pens. Electronic calculators are strictly regulated in accordance with Board policies.

Sd/-
Controller of Examinations
DAR - E - ARQAM`
  },
  {
    id: 'not-03',
    refNo: 'DA/ACAD/2026/052',
    title: 'Revised Spring Academic Calendar & Schedule Adjustment',
    category: 'Academic',
    date: '2026-03-10',
    isImportant: false,
    issuedBy: 'Vice Principal (Academics)',
    fileSize: '310 KB',
    summary: 'Institutional operational hours, assembly schedules, and Friday prayer adjustments announced for all academic wings in accordance with the seasonal calendar.',
    fullText: `OFFICIAL CIRCULAR
Ref: DA/ACAD/2026/052
Date: 10th March, 2026

SUBJECT: ADJUSTED INSTRUCTIONAL HOURS

In accordance with institutional guidelines and seasonal adjustments, instructional class schedules stand revised:
- Monday to Thursday & Saturday: 08:00 AM to 01:15 PM
- Friday: 08:00 AM to 12:00 Noon (Assembly followed by direct period blocks)
Parents are requested to ensure timely arrival of institutional school vans and private transport arrangements.

Sd/-
Vice Principal (Academics)`
  },
  {
    id: 'not-04',
    refNo: 'DA/ADMIN/2026/031',
    title: 'Scholarship and Financial Aid Committee Applications',
    category: 'Administrative',
    date: '2026-02-28',
    isImportant: false,
    issuedBy: 'Board of Governors / Financial Aid Committee',
    fileSize: '290 KB',
    summary: 'Merit-based scholarships and need-based fee concession applications are invited for eligible enrolled students for the upcoming financial quarter.',
    fullText: `OFFICIAL CIRCULAR
Ref: DA/ADMIN/2026/031
Date: 28th February, 2026

SUBJECT: MERIT & NEED-BASED FINANCIAL CONCESSIONS

Applications are invited from students who demonstrated Grade A-1 in the preceding annual examination or face documented economic distress. Application forms are available at the Accounts Department counter.

Sd/-
Secretary, Financial Aid Committee`
  },
  {
    id: 'not-05',
    refNo: 'DA/GEN/2026/019',
    title: 'Annual Inter-Branch Quranic Recitation & Seerat Conference',
    category: 'General',
    date: '2026-02-15',
    isImportant: false,
    issuedBy: 'Department of Islamic Studies & Student Affairs',
    fileSize: '180 KB',
    summary: 'The inter-wing Husn-e-Qirat and Naat competition will take place in the Central Auditorium. Auditions will be overseen by certified Qaris.',
    fullText: `OFFICIAL ANNOUNCEMENT
Ref: DA/GEN/2026/019
Date: 15th February, 2026

SUBJECT: 28TH ANNUAL SEERAT & HUZN-E-QIRAT COMPETITION

Students wishing to participate in Qirat, Naat, and Urdu/English debate categories may submit nominations via their homeroom teachers.

Sd/-
Head of Department, Islamic Studies`
  }
];

export const RESULTS_DATABASE: StudentResult[] = [
  {
    studentId: 'DA-2026-1001',
    rollNumber: '849201',
    studentName: 'Muhammad Bilal Khan',
    fatherName: 'Tariq Mehmood Khan',
    className: 'Class X (Matriculation)',
    section: 'Section A (Science Group)',
    examination: 'Annual Board Model Examination 2026',
    session: '2025–2026',
    examDate: 'March 2026',
    subjects: [
      { name: 'English Compulsory', totalMarks: 100, obtainedMarks: 89, grade: 'A1', status: 'Pass' },
      { name: 'Urdu Compulsory', totalMarks: 100, obtainedMarks: 91, grade: 'A1', status: 'Pass' },
      { name: 'Islamiyat / Ethics', totalMarks: 50, obtainedMarks: 48, grade: 'A1', status: 'Pass' },
      { name: 'Pakistan Studies', totalMarks: 50, obtainedMarks: 46, grade: 'A1', status: 'Pass' },
      { name: 'Mathematics (Science)', totalMarks: 100, obtainedMarks: 95, grade: 'A1', status: 'Pass' },
      { name: 'Physics (Theory & Practical)', totalMarks: 100, obtainedMarks: 92, grade: 'A1', status: 'Pass' },
      { name: 'Chemistry (Theory & Practical)', totalMarks: 100, obtainedMarks: 88, grade: 'A1', status: 'Pass' },
      { name: 'Biology / Computer Science', totalMarks: 100, obtainedMarks: 94, grade: 'A1', status: 'Pass' }
    ],
    totalMarks: 700,
    obtainedMarks: 643,
    percentage: 91.86,
    overallGrade: 'A1 (Exceptional)',
    resultStatus: 'PASS - FIRST DIVISION',
    positionInClass: '2nd Position',
    remarks: 'Demonstrated outstanding academic proficiency and consistent disciplinary conduct.'
  },
  {
    studentId: 'DA-2026-1002',
    rollNumber: '849202',
    studentName: 'Ayesha Fatima',
    fatherName: 'Muhammad Salman Akhtar',
    className: 'Class X (Matriculation)',
    section: 'Section B (Science Group)',
    examination: 'Annual Board Model Examination 2026',
    session: '2025–2026',
    examDate: 'March 2026',
    subjects: [
      { name: 'English Compulsory', totalMarks: 100, obtainedMarks: 93, grade: 'A1', status: 'Pass' },
      { name: 'Urdu Compulsory', totalMarks: 100, obtainedMarks: 90, grade: 'A1', status: 'Pass' },
      { name: 'Islamiyat / Ethics', totalMarks: 50, obtainedMarks: 49, grade: 'A1', status: 'Pass' },
      { name: 'Pakistan Studies', totalMarks: 50, obtainedMarks: 47, grade: 'A1', status: 'Pass' },
      { name: 'Mathematics (Science)', totalMarks: 100, obtainedMarks: 98, grade: 'A1', status: 'Pass' },
      { name: 'Physics (Theory & Practical)', totalMarks: 100, obtainedMarks: 95, grade: 'A1', status: 'Pass' },
      { name: 'Chemistry (Theory & Practical)', totalMarks: 100, obtainedMarks: 94, grade: 'A1', status: 'Pass' },
      { name: 'Biology / Computer Science', totalMarks: 100, obtainedMarks: 97, grade: 'A1', status: 'Pass' }
    ],
    totalMarks: 700,
    obtainedMarks: 663,
    percentage: 94.71,
    overallGrade: 'A1 (Exceptional)',
    resultStatus: 'PASS - FIRST DIVISION',
    positionInClass: '1st Position',
    remarks: 'Top honors awarded with commendation for excellence in Mathematics and Sciences.'
  },
  {
    studentId: 'DA-2026-1003',
    rollNumber: '849203',
    studentName: 'Hamza Farooq',
    fatherName: 'Farooq Ahmed',
    className: 'Class IX (Secondary)',
    section: 'Section A (Computer Science)',
    examination: 'Mid-Term Examination 2025–2026',
    session: '2025–2026',
    examDate: 'December 2025',
    subjects: [
      { name: 'English Compulsory', totalMarks: 75, obtainedMarks: 62, grade: 'A', status: 'Pass' },
      { name: 'Urdu Compulsory', totalMarks: 75, obtainedMarks: 58, grade: 'B', status: 'Pass' },
      { name: 'Islamiyat', totalMarks: 50, obtainedMarks: 44, grade: 'A1', status: 'Pass' },
      { name: 'Mathematics', totalMarks: 75, obtainedMarks: 68, grade: 'A1', status: 'Pass' },
      { name: 'Computer Science', totalMarks: 75, obtainedMarks: 70, grade: 'A1', status: 'Pass' },
      { name: 'Physics', totalMarks: 75, obtainedMarks: 61, grade: 'A', status: 'Pass' }
    ],
    totalMarks: 425,
    obtainedMarks: 363,
    percentage: 85.41,
    overallGrade: 'A (Excellent)',
    resultStatus: 'PASS - FIRST DIVISION',
    remarks: 'Satisfactory analytical competence. Advised to focus on descriptive literature.'
  }
];

export const EVENTS_DATA: AcademicEvent[] = [
  {
    id: 'evt-01',
    title: 'Admissions Assessment & Entry Evaluation 2026–2027',
    date: '2026-04-22',
    category: 'Academic',
    time: '09:00 AM – 12:30 PM',
    venue: 'Academic Wing Test Halls A & B',
    description: 'Standardized written evaluation in English, Mathematics, and General Knowledge for candidates applying for Classes VI through X.',
    isUpcoming: true
  },
  {
    id: 'evt-02',
    title: 'Parent-Teacher Consultative Conference (Term Review)',
    date: '2026-04-29',
    category: 'Ceremony',
    time: '08:30 AM – 01:30 PM',
    venue: 'Campus Main Academic Complex',
    description: 'Institutional meeting between faculty members and parents regarding student attendance, homework discipline, and diagnostic results.',
    isUpcoming: true
  },
  {
    id: 'evt-03',
    title: 'Annual Science & Robotic Technology Exhibition',
    date: '2026-05-18',
    category: 'Academic',
    time: '10:00 AM – 03:00 PM',
    venue: 'Central Quadrangle & Science Laboratories',
    description: 'Student-led models in alternative energy, water purification, programming, and biology specimens judged by invited university academics.',
    isUpcoming: true
  },
  {
    id: 'evt-04',
    title: 'Annual Sports Olympiad & Physical Fitness Trials',
    date: '2026-02-10',
    category: 'Sports',
    time: '08:30 AM – 04:00 PM',
    venue: 'Institutional Athletic Grounds',
    description: 'Inter-house cricket, football, sprint relays, tug of war, and gymnastics tournaments with official prize distribution.',
    isUpcoming: false
  },
  {
    id: 'evt-05',
    title: 'Commemoration of Pakistan Resolution Day',
    date: '2026-03-23',
    category: 'Ceremony',
    time: '09:00 AM – 11:30 AM',
    venue: 'Auditorium Hall',
    description: 'Flag-hoisting ceremony, national anthems, student speech competitions, and historical documentary screenings.',
    isUpcoming: false
  }
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: 'news-01',
    title: 'DAR - E - ARQAM Students Secure Top Positions in Federal Board Pre-Board Examinations',
    date: '2026-03-20',
    category: 'Academic Achievement',
    summary: 'Institution candidates recorded a 98.4% overall pass rate with high percentages across both Science and Computer Science groups.',
    content: 'The academic faculty of DAR - E - ARQAM is pleased to report verifiable excellence in the recent regional evaluation. A total of 142 candidates appeared in the Matriculation preliminary examinations, securing 112 Grade A1s and 26 Grade As with zero failures.'
  },
  {
    id: 'news-02',
    title: 'Upgradation of Campus Digital Science Laboratories and Computer Wing Completed',
    date: '2026-03-05',
    category: 'Campus Infrastructure',
    summary: 'Institution completes deployment of 60 advanced computing terminals and modular apparatus for Physics and Chemistry laboratories.',
    content: 'Under the oversight of the Institutional Infrastructure Directorate, the junior and senior science wings have been modernized with high-precision optics, digital sensors, and dedicated practical testing workbenches.'
  },
  {
    id: 'news-03',
    title: 'Teacher Training Workshop on National Single Curriculum Standards Concluded',
    date: '2026-02-18',
    category: 'Faculty Development',
    summary: 'Over 85 educators participated in a four-day rigorous pedagogical alignment seminar conducted by senior educational specialists.',
    content: 'Continuous professional development remains a core institutional mandate. The program focused on formative classroom assessment, inclusive learning strategies, and ethics-centered instructional leadership.'
  }
];

export const DOWNLOADS_DATA: DocumentDownload[] = [
  {
    id: 'dl-01',
    title: 'Official Admission Application Form (Session 2026–2027)',
    category: 'Admissions',
    date: '2026-03-24',
    fileSize: '840 KB',
    fileType: 'PDF',
    refNo: 'DA-FORM-ADM-2026'
  },
  {
    id: 'dl-02',
    title: 'Complete Academic Calendar 2026–2027 (Terms & Holidays)',
    category: 'Academic',
    date: '2026-03-15',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    refNo: 'DA-CAL-2026-V1'
  },
  {
    id: 'dl-03',
    title: 'Institutional Fee Structure & Payment Regulations',
    category: 'Admissions',
    date: '2026-03-01',
    fileSize: '460 KB',
    fileType: 'PDF',
    refNo: 'DA-FEE-2026-REG'
  },
  {
    id: 'dl-04',
    title: 'Examination Regulations & Code of Conduct for Candidates',
    category: 'Examination',
    date: '2026-02-20',
    fileSize: '580 KB',
    fileType: 'PDF',
    refNo: 'DA-EXAM-RULES-2026'
  },
  {
    id: 'dl-05',
    title: 'Matriculation (Classes IX & X) Science Group Syllabus Outline',
    category: 'Academic',
    date: '2026-01-10',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    refNo: 'DA-SYL-MAT-SCI'
  },
  {
    id: 'dl-06',
    title: 'Student Leave / Absence Exemption Application Form',
    category: 'Forms',
    date: '2026-01-05',
    fileSize: '220 KB',
    fileType: 'PDF',
    refNo: 'DA-FORM-LEAVE-01'
  },
  {
    id: 'dl-07',
    title: 'Official Prospectus & Institutional Charter',
    category: 'Admissions',
    date: '2026-03-22',
    fileSize: '4.8 MB',
    fileType: 'PDF',
    refNo: 'DA-PROSP-2026'
  }
];

export const FACULTY_DATA: FacultyMember[] = [
  {
    id: 'fac-01',
    name: 'Prof. Dr. Abdul Rahman Qureshi',
    designation: 'Principal & Head of Institution',
    department: 'Executive Administration',
    qualification: 'M.Sc., M.Phil., Ph.D. (Education)',
    experience: '28 Years in Secondary & Higher Education'
  },
  {
    id: 'fac-02',
    name: 'Mrs. Shaheen Kausar',
    designation: 'Vice Principal (Academics)',
    department: 'Academic Directorate',
    qualification: 'M.A. English Literature, B.Ed.',
    experience: '22 Years Institutional Teaching'
  },
  {
    id: 'fac-03',
    name: 'Engr. Tariq Masood Hashmi',
    designation: 'Head of Department (Physics & Applied Sciences)',
    department: 'Department of Sciences',
    qualification: 'B.Sc. Mechanical Engg., M.Sc. Applied Physics',
    experience: '18 Years Board Mentorship'
  },
  {
    id: 'fac-04',
    name: 'Dr. Nighat Sultana',
    designation: 'Senior Faculty Member (Chemistry)',
    department: 'Department of Sciences',
    qualification: 'M.Sc. Organic Chemistry, Ph.D.',
    experience: '16 Years Practical Laboratory Supervision'
  },
  {
    id: 'fac-05',
    name: 'Mr. Muhammad Imran Siddiqui',
    designation: 'Head of Mathematics Department',
    department: 'Department of Mathematics',
    qualification: 'M.Sc. Pure Mathematics, M.Ed.',
    experience: '19 Years Board Examination Evaluation'
  },
  {
    id: 'fac-06',
    name: 'Qari Hafiz Muhammad Usman',
    designation: 'Director of Quranic & Islamic Studies Wing',
    department: 'Islamic Studies & Character Formation',
    qualification: 'Shahadat-ul-Aalamia (Wafaq-ul-Madaris), M.A. Islamic Studies',
    experience: '15 Years Hifz & Tajweed Instruction'
  }
];

export const FEE_STRUCTURE_DATA = [
  { className: 'Playgroup to Kindergarten (Pre-School)', admissionFee: '15,000 PKR', monthlyTuition: '6,500 PKR', securityDeposit: '5,000 PKR (Refundable)', annualCharges: '4,000 PKR' },
  { className: 'Primary Wing (Classes I to V)', admissionFee: '18,000 PKR', monthlyTuition: '7,500 PKR', securityDeposit: '5,000 PKR (Refundable)', annualCharges: '5,000 PKR' },
  { className: 'Middle Wing (Classes VI to VIII)', admissionFee: '20,000 PKR', monthlyTuition: '8,500 PKR', securityDeposit: '5,000 PKR (Refundable)', annualCharges: '6,000 PKR' },
  { className: 'Secondary / Matriculation (Classes IX & X)', admissionFee: '22,000 PKR', monthlyTuition: '9,800 PKR', securityDeposit: '6,000 PKR (Refundable)', annualCharges: '7,500 PKR (Inc. Science Labs)' },
  { className: 'Higher Secondary / Intermediate (HSSC I & II)', admissionFee: '25,000 PKR', monthlyTuition: '11,500 PKR', securityDeposit: '6,000 PKR (Refundable)', annualCharges: '8,500 PKR' }
];

export const ACADEMIC_CALENDAR_DATA = [
  { month: 'April 2026', title: 'Session Commencement & Diagnostic Tests', description: 'Orientation assembly, distribution of textbooks, class diagnostic baseline evaluations.' },
  { month: 'May 2026', title: 'First Periodic Assessments', description: 'Weekly formative tests across core subjects; monthly attendance review.' },
  { month: 'June – July 2026', title: 'Summer Recess & Remedial Guidance', description: 'Institutional summer closure with structured holiday research assignments.' },
  { month: 'August 2026', title: 'Campus Reopening & Independence Celebrations', description: 'Formal re-assembly on 1st August; National Independence Day proceedings.' },
  { month: 'October 2026', title: 'Mid-Term Comprehensive Examinations', description: 'Centralized mid-term evaluations, marks tabulation, parent-teacher review meeting.' },
  { month: 'November 2026', title: 'Annual Co-Curricular & Sports Week', description: 'Inter-house athletic trials, debate contests, Husn-e-Qirat competitions.' },
  { month: 'December 2026', title: 'Pre-Board Trials & Winter Break', description: 'Class IX & X pre-board simulations; institutional winter break (Dec 24 – Jan 03).' },
  { month: 'February 2027', title: 'Final Revision & Board Clearance', description: 'Issuance of Board roll number slips, submission of internal marks, send-up tests.' },
  { month: 'March 2027', title: 'Annual Board & Institutional Examinations', description: 'Final examination cycle conducted under institutional examination guidelines.' }
];
