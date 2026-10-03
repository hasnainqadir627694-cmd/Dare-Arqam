import React, { useState, useEffect } from 'react';
import { PageId, DocumentDownload } from '../types';
import { ACADEMIC_CALENDAR_DATA, DOWNLOADS_DATA } from '../data/mockData';
import { 
  fetchAcademicCalendar, 
  subscribeAcademicCalendar, 
  fetchDocuments, 
  subscribeDocuments 
} from '../services/firebaseService';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

interface AcademicsViewProps {
  initialTab?: 'programs' | 'classes' | 'calendar' | 'examination' | 'syllabus';
  onNavigate: (page: PageId) => void;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  initialTab = 'programs',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'programs' | 'classes' | 'calendar' | 'examination' | 'syllabus'>(initialTab);
  const [calendarEvents, setCalendarEvents] = useState<any[]>(ACADEMIC_CALENDAR_DATA);
  const [academicDocs, setAcademicDocs] = useState<DocumentDownload[]>(() =>
    DOWNLOADS_DATA.filter((d) => d.category === 'Academic')
  );

  useEffect(() => {
    fetchAcademicCalendar().then((data) => {
      if (data && data.length > 0) setCalendarEvents(data);
    }).catch(() => {});

    const unsubCal = subscribeAcademicCalendar((data) => {
      if (data && data.length > 0) setCalendarEvents(data);
    });

    fetchDocuments().then((docs) => {
      if (docs && docs.length > 0) {
        setAcademicDocs(docs.filter((d) => d.category === 'Academic'));
      }
    }).catch(() => {});

    const unsubDocs = subscribeDocuments((docs) => {
      if (docs && docs.length > 0) {
        setAcademicDocs(docs.filter((d) => d.category === 'Academic'));
      }
    });

    return () => {
      unsubCal();
      unsubDocs();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Academic Directorate & Curriculum Standards
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Academic Structure & Programs
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          Comprehensive curriculum framework, subject allocations, annual academic schedules, and board examination timetables.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#EEF2F8] p-1 rounded-md flex flex-wrap gap-1 border border-[#CBD5E1]">
        <button
          onClick={() => setActiveTab('programs')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'programs'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Academic Programs
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Classes & Subjects Table
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Academic Calendar
        </button>
        <button
          onClick={() => setActiveTab('examination')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'examination'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Examination Schedule
        </button>
        <button
          onClick={() => setActiveTab('syllabus')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Syllabus Outlines
        </button>
      </div>

      {/* 1. ACADEMIC PROGRAMS */}
      {activeTab === 'programs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Wing */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#20216B] uppercase">WING 01</div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Primary Education Program (Grades 1–5)
              </h2>
              <p className="text-xs sm:text-sm text-[#334155] font-prose-serif leading-relaxed">
                Emphasis on foundational language fluency (English & Urdu), mathematical logical reasoning, general science inquiry, and Quranic Tajweed recitation with daily moral ethos lessons.
              </p>
              <div className="pt-2 text-xs text-[#475569] space-y-1">
                <div>Assessment Mode: Continuous Formative Evaluation & Term Portfolios</div>
                <div>Instruction Medium: Bilingual English-Urdu Core</div>
              </div>
            </div>

            {/* Middle Wing */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#20216B] uppercase">WING 02</div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Middle School Program (Grades 6–8)
              </h2>
              <p className="text-xs sm:text-sm text-[#334155] font-prose-serif leading-relaxed">
                A rigorous transition to discrete STEM subjects (General Science transitioning to Physics, Chemistry, Biology basics), computer coding logic, and formal Urdu and English literary composition.
              </p>
              <div className="pt-2 text-xs text-[#475569] space-y-1">
                <div>Assessment Mode: Centralized Institutional Periodic & Annual Exams</div>
                <div>Laboratory: Hands-on introductory science & computer experiments</div>
              </div>
            </div>

            {/* Matriculation Wing */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#20216B] uppercase">WING 03</div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Secondary / Matriculation (Grades 9 & 10)
              </h2>
              <p className="text-xs sm:text-sm text-[#334155] font-prose-serif leading-relaxed">
                Fully accredited by the Board of Intermediate and Secondary Education (BISE). Two distinct tracks: Science Group (Biology) and Computer Science Group, supported by dedicated practical laboratories.
              </p>
              <div className="pt-2 text-xs text-[#475569] space-y-1">
                <div>Affiliation: BISE Verified Examination Center</div>
                <div>Success Baseline: 98%+ Pass Percentage with majority A1 Grade</div>
              </div>
            </div>

            {/* Higher Secondary Wing */}
            <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-3">
              <div className="text-xs font-mono font-bold text-[#20216B] uppercase">WING 04</div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Higher Secondary (HSSC I & II / College)
              </h2>
              <p className="text-xs sm:text-sm text-[#334155] font-prose-serif leading-relaxed">
                Specialized pre-university education in Pre-Medical, Pre-Engineering, and Intermediate in Computer Science (ICS), coupled with dedicated university entrance examination workshops (MDCAT/ECAT/NUST).
              </p>
              <div className="pt-2 text-xs text-[#475569] space-y-1">
                <div>Faculty: Senior Subject Specialists & M.Phil/Ph.D. Educators</div>
                <div>Guidance: Dedicated Career Counseling & Board Mentorship</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLASSES & SUBJECTS TABLE */}
      {activeTab === 'classes' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Prescribed Classes & Weekly Instructional Periods
              </h2>
              <p className="text-xs text-[#475569] font-prose-serif mt-0.5">
                Instructional allocation per subject in accordance with National Curriculum standards.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#CBD5E1]">
              <thead className="bg-[#EEF2F8] text-[#1E293B] font-semibold border-b border-[#CBD5E1]">
                <tr>
                  <th className="py-2.5 px-3">Class Level</th>
                  <th className="py-2.5 px-3">Compulsory Subjects</th>
                  <th className="py-2.5 px-3">Elective / Science Subjects</th>
                  <th className="py-2.5 px-3">Weekly Hours</th>
                  <th className="py-2.5 px-3">Practical Labs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-[#0F1035] font-prose-serif">
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#0F1035]">Class I – V (Primary)</td>
                  <td className="py-3 px-3">English, Urdu, Islamiyat, Pak Studies, Math</td>
                  <td className="py-3 px-3">General Science, Drawing, Computer Basics</td>
                  <td className="py-3 px-3 font-mono">30 Hours</td>
                  <td className="py-3 px-3">Demonstration Work</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#0F1035]">Class VI – VIII (Middle)</td>
                  <td className="py-3 px-3">English, Urdu, Islamiyat, History, Geography</td>
                  <td className="py-3 px-3">Mathematics, General Science, Computer Science</td>
                  <td className="py-3 px-3 font-mono">34 Hours</td>
                  <td className="py-3 px-3">Weekly Lab Sessions</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#0F1035]">Class IX – X (Matric Science)</td>
                  <td className="py-3 px-3">English, Urdu, Islamiyat, Pak Studies</td>
                  <td className="py-3 px-3">Physics, Chemistry, Biology/Computer Science, Math</td>
                  <td className="py-3 px-3 font-mono">36 Hours</td>
                  <td className="py-3 px-3">6 Hours / Week (Board Verified)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-[#0F1035]">HSSC (Pre-Medical/Engg)</td>
                  <td className="py-3 px-3">English, Urdu, Islamic Education, Pak Studies</td>
                  <td className="py-3 px-3">Physics, Chemistry, Biology / Mathematics</td>
                  <td className="py-3 px-3 font-mono">38 Hours</td>
                  <td className="py-3 px-3">8 Hours / Week Specialized</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ACADEMIC CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Annual Institutional Academic Calendar (2026–2027)
              </h2>
              <div className="text-xs text-[#475569] font-prose-serif mt-0.5">
                Approved by the Executive Board of Studies.
              </div>
            </div>
            <button
              onClick={() => onNavigate('downloads')}
              className="text-xs font-semibold text-[#20216B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Printable Calendar (PDF)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calendarEvents.map((item, idx) => (
              <div key={idx} className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md space-y-1.5">
                <div className="text-xs font-mono font-bold text-[#20216B] uppercase">
                  {item.month}
                </div>
                <h3 className="font-editorial text-sm font-bold text-[#0F1035]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#334155] font-prose-serif leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EXAMINATION SCHEDULE */}
      {activeTab === 'examination' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Examination Timetable & Date Sheet
              </h2>
              <div className="text-xs text-[#475569] font-mono mt-0.5">
                NOTIFICATION REF: DA/EXAM/2026/089 — SPRING EVALUATION CYCLE
              </div>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md transition-colors cursor-pointer"
            >
              Online Results Portal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#CBD5E1]">
              <thead className="bg-[#EEF2F8] text-[#1E293B] font-semibold border-b border-[#CBD5E1]">
                <tr>
                  <th className="py-2.5 px-3">Date & Day</th>
                  <th className="py-2.5 px-3">Time Slot</th>
                  <th className="py-2.5 px-3">Subject / Paper</th>
                  <th className="py-2.5 px-3">Classes</th>
                  <th className="py-2.5 px-3">Hall Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-[#0F1035] font-prose-serif">
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">06 April 2026 (Mon)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">English Compulsory</td>
                  <td className="py-2.5 px-3">Classes VI to X</td>
                  <td className="py-2.5 px-3">Main Academic Hall A</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">08 April 2026 (Wed)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">Urdu Compulsory</td>
                  <td className="py-2.5 px-3">Classes VI to X</td>
                  <td className="py-2.5 px-3">Main Academic Hall A</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">11 April 2026 (Sat)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">Mathematics (General & Science)</td>
                  <td className="py-2.5 px-3">Classes VI to X</td>
                  <td className="py-2.5 px-3">Halls A & B</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">13 April 2026 (Mon)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">Physics (Theory)</td>
                  <td className="py-2.5 px-3">Class IX & X</td>
                  <td className="py-2.5 px-3">Science Wing Hall C</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">15 April 2026 (Wed)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">Chemistry (Theory)</td>
                  <td className="py-2.5 px-3">Class IX & X</td>
                  <td className="py-2.5 px-3">Science Wing Hall C</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-mono font-semibold">18 April 2026 (Sat)</td>
                  <td className="py-2.5 px-3 font-mono">08:30 AM – 11:30 AM</td>
                  <td className="py-2.5 px-3 font-semibold">Biology / Computer Science</td>
                  <td className="py-2.5 px-3">Class IX & X</td>
                  <td className="py-2.5 px-3">Science Wing Hall C</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SYLLABUS OUTLINES */}
      {activeTab === 'syllabus' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <div className="pb-3 border-b border-[#CBD5E1]">
            <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
              Curricular Outlines & Downloadable Syllabus
            </h2>
            <p className="text-xs text-[#475569] font-prose-serif mt-0.5">
              Detailed unit breakdowns, learning outcomes, and recommended reading for all academic classes.
            </p>
          </div>

          <div className="divide-y divide-stone-200">
            {academicDocs.map(doc => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#0F1035]">{doc.title}</div>
                  <div className="text-[11px] text-[#475569]">Ref: {doc.refNo} · File Size: {doc.fileSize} · {doc.fileType}</div>
                </div>
                <button
                  onClick={() => alert(`Simulated document download for ${doc.title}`)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#20216B] bg-[#EEF2F8] hover:bg-[#E2E8F0] border border-[#94A3B8] rounded-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
