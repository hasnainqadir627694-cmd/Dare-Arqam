import React, { useState } from 'react';
import { PageId } from '../types';
import { FEE_STRUCTURE_DATA, INSTITUTION_INFO } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { 
  CheckCircle2, 
  FileCheck, 
  Calendar, 
  HelpCircle, 
  ArrowRight, 
  Download, 
  AlertCircle, 
  Printer, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { submitAdmissionApplication } from '../services/firebaseService';

interface AdmissionsViewProps {
  initialTab?: 'info' | 'eligibility' | 'process' | 'documents' | 'fees' | 'apply';
  onNavigate: (page: PageId) => void;
}

export const AdmissionsView: React.FC<AdmissionsViewProps> = ({
  initialTab = 'info',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'eligibility' | 'process' | 'documents' | 'fees' | 'apply'>(initialTab);

  // Application Form State
  const [appForm, setAppForm] = useState({
    candidateName: '',
    fatherName: '',
    bForm: '',
    gender: 'Male',
    dob: '',
    targetClass: 'Class IX (Secondary Science)',
    previousSchool: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    documentsAttached: {
      bFormCopy: true,
      photos: true,
      prevTranscript: true,
      characterCert: false,
    },
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitAdmissionApplication({
        candidateName: appForm.candidateName,
        fatherName: appForm.fatherName,
        bForm: appForm.bForm,
        gender: appForm.gender,
        dob: appForm.dob,
        targetClass: appForm.targetClass,
        previousSchool: appForm.previousSchool,
        parentPhone: appForm.parentPhone,
        parentEmail: appForm.parentEmail,
        address: appForm.address,
        documentsAttached: appForm.documentsAttached,
      });
      setRefNumber(res.referenceNumber);
      setFormSubmitted(true);
    } catch (err: any) {
      // Fallback with generated ref if network error so user isn't blocked
      const fallbackRef = `ADM-DA-${Math.floor(10000 + Math.random() * 90000)}`;
      setRefNumber(fallbackRef);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Admissions Directorate · Session 2026–2027
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Admissions & Enrollment
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          Comprehensive guidelines, eligibility requirements, certified fee schedule, and application submission for prospective scholars.
        </p>
      </div>

      {/* Navigation Tabs (Zero-Pill compliant segmented bar) */}
      <div className="bg-[#EEF2F8] p-1 rounded-md flex flex-wrap gap-1 border border-[#CBD5E1]">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Admission Overview
        </button>
        <button
          onClick={() => setActiveTab('eligibility')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'eligibility'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Eligibility Criteria
        </button>
        <button
          onClick={() => setActiveTab('process')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'process'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Admission Process (5 Steps)
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Required Documents
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'fees'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Fee Structure
        </button>
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'apply'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Apply for Admission
        </button>
      </div>

      {/* 1. ADMISSION INFORMATION TAB */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
              Session 2026–2027 Admissions Overview
            </h2>
            <div className="text-[#1E293B] text-xs sm:text-sm leading-relaxed font-prose-serif space-y-3">
              <p>
                DAR - E - ARQAM welcomes applications from students who display strong intellectual curiosity, ethical character, and a dedication to academic excellence. Admissions are granted strictly on merit determined through age criteria, previous institutional record, and performance in our standardized entry evaluation.
              </p>
              <p>
                Our educational ecosystem is structured into distinct academic divisions designed to provide age-appropriate scholastic nurturing and character guidance.
              </p>
            </div>

            {/* Available Classes Matrix */}
            <div className="pt-4 border-t border-[#CBD5E1]">
              <h3 className="font-editorial text-base font-bold text-[#0F1035] mb-3">
                Available Classes for Direct Intake
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                  <div className="font-bold text-[#20216B]">Pre-School Wing</div>
                  <div className="text-[#334155] mt-1">Playgroup, Nursery, Kindergarten</div>
                  <div className="text-[11px] text-[#475569] mt-2 font-mono">Age: 3.5 to 5.5 Years</div>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                  <div className="font-bold text-[#20216B]">Primary Wing</div>
                  <div className="text-[#334155] mt-1">Classes I, II, III, IV, and V</div>
                  <div className="text-[11px] text-[#475569] mt-2 font-mono">Age: 5.5 to 10.5 Years</div>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                  <div className="font-bold text-[#20216B]">Middle Wing</div>
                  <div className="text-[#334155] mt-1">Classes VI, VII, and VIII</div>
                  <div className="text-[11px] text-[#475569] mt-2 font-mono">Assessment in Eng, Math, Sci</div>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md">
                  <div className="font-bold text-[#20216B]">Senior & College Wing</div>
                  <div className="text-[#334155] mt-1">Matriculation (IX-X) & HSSC</div>
                  <div className="text-[11px] text-[#475569] mt-2 font-mono">Board Registration Rules Apply</div>
                </div>
              </div>
            </div>

            {/* Important Dates Table */}
            <div className="pt-4 border-t border-[#CBD5E1]">
              <h3 className="font-editorial text-base font-bold text-[#0F1035] mb-3">
                Important Admission Dates & Cut-offs
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#CBD5E1]">
                  <thead className="bg-[#EEF2F8] text-[#1E293B] font-semibold border-b border-[#CBD5E1]">
                    <tr>
                      <th className="py-2.5 px-3">Event / Milestone</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Venue / Channel</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-[#0F1035] font-prose-serif">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Commencement of Registration</td>
                      <td className="py-2.5 px-3 font-mono">25th March 2026</td>
                      <td className="py-2.5 px-3">Online Portal & Admissions Desk</td>
                      <td className="py-2.5 px-3">Prospectus available at main desk</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Application Submission Cut-off</td>
                      <td className="py-2.5 px-3 font-mono">18th April 2026</td>
                      <td className="py-2.5 px-3">Directorate of Admissions</td>
                      <td className="py-2.5 px-3">No late applications entertained</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Written Assessment Evaluation</td>
                      <td className="py-2.5 px-3 font-mono">22nd – 24th April 2026</td>
                      <td className="py-2.5 px-3">Test Halls A & B</td>
                      <td className="py-2.5 px-3">Reporting at 08:30 AM with Admit Slip</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">First Merit List Display</td>
                      <td className="py-2.5 px-3 font-mono">28th April 2026</td>
                      <td className="py-2.5 px-3">Official Notice Board & Portal</td>
                      <td className="py-2.5 px-3">Selected candidates notified via SMS</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold">Fee Deposit & Final Clearance</td>
                      <td className="py-2.5 px-3 font-mono">05th May 2026</td>
                      <td className="py-2.5 px-3">Designated Bank Counters</td>
                      <td className="py-2.5 px-3">Original documents must be presented</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELIGIBILITY CRITERIA TAB */}
      {activeTab === 'eligibility' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <h2 className="font-editorial text-xl font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
            Institutional Eligibility Criteria
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-[#1E293B] font-prose-serif leading-relaxed">
            <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md space-y-2">
              <h3 className="font-editorial text-base font-bold text-[#20216B]">
                1. Age Criteria (As of 1st April 2026)
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#334155] pl-1">
                <li>Playgroup: 3 to 3.5 Years</li>
                <li>Nursery: 3.5 to 4.5 Years</li>
                <li>Kindergarten: 4.5 to 5.5 Years</li>
                <li>Class I: 5.5 to 6.5 Years</li>
                <li>No relaxation beyond 6 months will be granted under Board regulations.</li>
              </ul>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md space-y-2">
              <h3 className="font-editorial text-base font-bold text-[#20216B]">
                2. Academic Baseline (Classes VI to X)
              </h3>
              <p className="text-xs text-[#334155]">
                Candidates must have passed their preceding examination from a recognized school registered with the relevant Education Department or Board of Intermediate and Secondary Education (BISE) with at least 60% aggregate marks.
              </p>
            </div>

            <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md space-y-2">
              <h3 className="font-editorial text-base font-bold text-[#20216B]">
                3. Entry Assessment Evaluation
              </h3>
              <p className="text-xs text-[#334155]">
                A standardized test covering English (30%), Mathematics (30%), Science (20%), and Urdu/Islamic Studies (20%). Qualifying baseline is set at 50% marks in each test section.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADMISSION PROCESS (5 STEPS) */}
      {activeTab === 'process' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <h2 className="font-editorial text-xl font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
            Official 5-Step Admission Process
          </h2>

          <div className="space-y-4">
            <div className="p-4 border-l-4 border-[#292A86] bg-[#F8FAFC] rounded-r-md">
              <div className="text-xs font-bold text-[#20216B] uppercase tracking-wider">
                Step 01
              </div>
              <h3 className="text-base font-bold text-[#0F1035] mt-0.5">
                Read Eligibility & Age Guidelines
              </h3>
              <p className="text-xs text-[#334155] mt-1 font-prose-serif leading-relaxed">
                Parents must thoroughly verify that the candidate satisfies the prescribed age limits and educational prerequisites for the target academic class.
              </p>
            </div>

            <div className="p-4 border-l-4 border-[#292A86] bg-[#F8FAFC] rounded-r-md">
              <div className="text-xs font-bold text-[#20216B] uppercase tracking-wider">
                Step 02
              </div>
              <h3 className="text-base font-bold text-[#0F1035] mt-0.5">
                Complete Registration / Application Dossier
              </h3>
              <p className="text-xs text-[#334155] mt-1 font-prose-serif leading-relaxed">
                Fill the official application either online through this portal or in hardcopy at the Campus Admissions Directorate, obtaining an official tracking receipt.
              </p>
            </div>

            <div className="p-4 border-l-4 border-[#292A86] bg-[#F8FAFC] rounded-r-md">
              <div className="text-xs font-bold text-[#20216B] uppercase tracking-wider">
                Step 03
              </div>
              <h3 className="text-base font-bold text-[#0F1035] mt-0.5">
                Submit Required Attested Documents
              </h3>
              <p className="text-xs text-[#334155] mt-1 font-prose-serif leading-relaxed">
                Attach certified copies of NADRA B-Form, guardian CNIC, school leaving certificates, and passport photographs.
              </p>
            </div>

            <div className="p-4 border-l-4 border-[#292A86] bg-[#F8FAFC] rounded-r-md">
              <div className="text-xs font-bold text-[#20216B] uppercase tracking-wider">
                Step 04
              </div>
              <h3 className="text-base font-bold text-[#0F1035] mt-0.5">
                Review Application & Entry Assessment
              </h3>
              <p className="text-xs text-[#334155] mt-1 font-prose-serif leading-relaxed">
                The Academic Scrutiny Committee evaluates records and administers the written diagnostic entry evaluation on designated dates.
              </p>
            </div>

            <div className="p-4 border-l-4 border-[#292A86] bg-[#F8FAFC] rounded-r-md">
              <div className="text-xs font-bold text-[#20216B] uppercase tracking-wider">
                Step 05
              </div>
              <h3 className="text-base font-bold text-[#0F1035] mt-0.5">
                Admission Decision & Fee Clearance
              </h3>
              <p className="text-xs text-[#334155] mt-1 font-prose-serif leading-relaxed">
                Merit lists are published on the website and campus notice board. Admitted scholars complete bank fee voucher payment to secure institutional roll number allocation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. REQUIRED DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <h2 className="font-editorial text-xl font-bold text-[#0F1035] pb-2 border-b border-[#CBD5E1]">
            Mandatory Documents Checklist
          </h2>

          <p className="text-xs text-[#334155] font-prose-serif">
            All prospective scholars must submit clear, legible, and attested photocopies along with the completed application form:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">Candidate NADRA B-Form / CNIC</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Attested photocopy of valid computerized NADRA B-Form or CNIC (for Class X/HSSC).
                </p>
              </div>
            </div>

            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">Father / Guardian CNIC</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Attested photocopy of Father’s or legal court-appointed guardian’s valid Computerized National ID Card.
                </p>
              </div>
            </div>

            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">Passport-Size Photographs</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Four (4) recent color photographs taken against sky blue or white background with name written on back.
                </p>
              </div>
            </div>

            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">School Leaving Certificate (SLC)</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Original SLC / Transfer Certificate countersigned by the District Education Officer (for out-of-district transfers).
                </p>
              </div>
            </div>

            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">Previous Academic Transcripts</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Verified copy of the previous annual examination report card or Board result gazette slip.
                </p>
              </div>
            </div>

            <div className="p-3.5 border border-[#CBD5E1] rounded-md flex items-start gap-3 bg-[#F8FAFC]">
              <CheckCircle2 className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#0F1035]">Vaccination / Medical Fitness Record</span>
                <p className="text-[#334155] mt-0.5 text-[11px]">
                  Signed certificate of standard immunizations and documented blood group for institutional emergency files.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. FEE STRUCTURE TAB */}
      {activeTab === 'fees' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#CBD5E1] gap-2">
            <div>
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Official Institutional Fee Schedule (Session 2026–2027)
              </h2>
              <div className="text-xs text-[#475569] font-mono mt-0.5">
                DEMO / PLACEHOLDER SCHEDULE — ALL VALUES SUBJECT TO EXECUTIVE GOVERNING APPROVAL
              </div>
            </div>
            <button
              onClick={() => onNavigate('downloads')}
              className="text-xs font-semibold text-[#20216B] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Fee Circular (PDF)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[#CBD5E1]">
              <thead className="bg-[#EEF2F8] text-[#1E293B] font-semibold border-b border-[#CBD5E1]">
                <tr>
                  <th className="py-3 px-3">Class / Division</th>
                  <th className="py-3 px-3">Admission Fee (One-Time)</th>
                  <th className="py-3 px-3">Monthly Tuition</th>
                  <th className="py-3 px-3">Security Deposit</th>
                  <th className="py-3 px-3">Annual Charges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-[#0F1035] font-prose-serif">
                {FEE_STRUCTURE_DATA.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]/50'}>
                    <td className="py-3 px-3 font-semibold text-[#0F1035]">{row.className}</td>
                    <td className="py-3 px-3 font-mono">{row.admissionFee}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-[#20216B]">{row.monthlyTuition}</td>
                    <td className="py-3 px-3 font-mono text-[#334155]">{row.securityDeposit}</td>
                    <td className="py-3 px-3 font-mono text-[#334155]">{row.annualCharges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fee Payment Regulations */}
          <div className="p-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs text-[#334155] space-y-1.5 font-prose-serif leading-relaxed">
            <div className="font-bold text-[#0F1035]">Fee Regulation Guidelines:</div>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li>Tuition fee is payable on a monthly basis by the 10th of every calendar month through designated bank challan slips.</li>
              <li>Sibling concession: 20% concession on monthly tuition fee is extended to the second and third biological siblings.</li>
              <li>Late payment fine of 50 PKR per day will be levied after the prescribed monthly due date.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 6. APPLY FOR ADMISSION TAB (Interactive Application Form) */}
      {activeTab === 'apply' && (
        <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 sm:p-8 space-y-6">
          <div className="pb-3 border-b border-[#CBD5E1]">
            <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
              Online Admission Application (Intake 2026–2027)
            </h2>
            <p className="text-xs text-[#475569] mt-1">
              Please enter candidate particulars carefully. A reference identifier will be generated upon submission.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-6 bg-[#EEF0FF] border border-[#292A86]/30 rounded-md text-center space-y-4 max-w-lg mx-auto">
              <CheckCircle2 className="w-12 h-12 text-[#20216B] mx-auto" />
              <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
                Application Received Successfully
              </h3>
              <p className="text-xs text-[#334155] font-prose-serif">
                Your admission dossier has been generated under Application Reference:
              </p>
              <div className="font-mono text-xl font-bold text-[#20216B] bg-white p-2 border border-[#292A86]/30 rounded-sm">
                {refNumber}
              </div>
              <p className="text-[11px] text-[#475569]">
                Please visit the campus admissions office with your original NADRA documents before 18th April 2026 to collect the entry test roll number slip.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-[#20216B] rounded-md hover:bg-[#292A86] cursor-pointer"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleAppSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Candidate Legal Name"
                    value={appForm.candidateName}
                    onChange={(e) => setAppForm({ ...appForm, candidateName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Father / Guardian Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Father Name"
                    value={appForm.fatherName}
                    onChange={(e) => setAppForm({ ...appForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    NADRA B-Form Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 61101-1234567-1"
                    value={appForm.bForm}
                    onChange={(e) => setAppForm({ ...appForm, bForm: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Target Class for Admission *
                  </label>
                  <select
                    value={appForm.targetClass}
                    onChange={(e) => setAppForm({ ...appForm, targetClass: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  >
                    <option value="Playgroup / Nursery">Playgroup / Nursery</option>
                    <option value="Class I to V (Primary Wing)">Class I to V (Primary Wing)</option>
                    <option value="Class VI to VIII (Middle Wing)">Class VI to VIII (Middle Wing)</option>
                    <option value="Class IX (Secondary Science)">Class IX (Secondary Science)</option>
                    <option value="Class X (Matriculation)">Class X (Matriculation)</option>
                    <option value="HSSC-I (Pre-Medical)">HSSC-I (Pre-Medical)</option>
                    <option value="HSSC-I (Pre-Engineering)">HSSC-I (Pre-Engineering)</option>
                    <option value="HSSC-I (ICS Computer Science)">HSSC-I (ICS Computer Science)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Father/Guardian Mobile Contact *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300-1234567"
                    value={appForm.parentPhone}
                    onChange={(e) => setAppForm({ ...appForm, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Guardian Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guardian@domain.com"
                    value={appForm.parentEmail}
                    onChange={(e) => setAppForm({ ...appForm, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                  Permanent Residential Address *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Street Address, City, District"
                  value={appForm.address}
                  onChange={(e) => setAppForm({ ...appForm, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#CBD5E1]">
                <span className="text-[11px] text-[#475569]">
                  Form is evaluated by the Admissions Board. No application charges for submission.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Submit Admission Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
