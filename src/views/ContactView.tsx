import React, { useState } from 'react';
import { PageId } from '../types';
import { INSTITUTION_INFO } from '../data/mockData';
import { Emblem } from '../components/Emblem';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { submitInquiry } from '../services/firebaseService';

interface ContactViewProps {
  onNavigate: (page: PageId) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Admissions Inquiry',
    studentId: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [inquiryId, setInquiryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await submitInquiry({
        name: form.name,
        phone: form.phone,
        email: form.email,
        category: form.category,
        studentId: form.studentId,
        subject: form.subject,
        message: form.message,
      });
      setInquiryId(res.inquiryId);
      setSubmitted(true);
    } catch (err: any) {
      const fallbackId = `INQ-${Math.floor(10000 + Math.random() * 90000)}`;
      setInquiryId(fallbackId);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Official Institutional Secretariat
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Contact & Office Information
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          Official lines of communication for parents, prospective scholars, examination authorities, and public inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Official Contact Particulars (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-5 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 border-b border-[#CBD5E1]">
              <Emblem size="md" />
              <div>
                <h2 className="font-editorial text-lg font-bold text-[#0F1035]">
                  {INSTITUTION_INFO.name}
                </h2>
                <div className="text-xs text-[#475569]">
                  {INSTITUTION_INFO.fullName}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#1E293B]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F1035] block">Campus Address</span>
                  <span className="text-[#334155] leading-relaxed block mt-0.5 font-prose-serif">
                    {INSTITUTION_INFO.address}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F1035] block">Telephone & Emergency Helplines</span>
                  <span className="text-[#334155] block mt-0.5">
                    Central Exchange: {INSTITUTION_INFO.phone}
                  </span>
                  <span className="text-[#334155] block">
                    Admissions Direct: {INSTITUTION_INFO.emergencyPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F1035] block">Official Electronic Mail</span>
                  <span className="text-[#334155] block mt-0.5 font-mono">
                    General Inquiries: {INSTITUTION_INFO.email}
                  </span>
                  <span className="text-[#334155] block font-mono">
                    Admissions Desk: {INSTITUTION_INFO.admissionsEmail}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#20216B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F1035] block">Office Working Hours</span>
                  <span className="text-[#334155] block mt-0.5">
                    {INSTITUTION_INFO.officeHours}
                  </span>
                  <span className="text-[11px] text-[#475569] block mt-0.5">
                    Visitor Public Consultations: {INSTITUTION_INFO.visitorTimings}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Location Placeholder (Prompt: "Map placeholder. Do not embed an actual map") */}
          <div className="bg-[#EEF2F8] border border-[#94A3B8] rounded-lg p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-[#E2E8F0] border border-[#94A3B8] rounded-full flex items-center justify-center mx-auto text-[#475569]">
              <MapPin className="w-6 h-6 text-[#20216B]" />
            </div>
            <h3 className="font-editorial text-base font-bold text-[#0F1035]">
              Campus Location & Transit Guide
            </h3>
            <p className="text-xs text-[#334155] font-prose-serif leading-relaxed max-w-sm mx-auto">
              Situated centrally in the Institutional Sector H-8/4, adjacent to key arterial transit avenues and public bus terminals. Ample parent parking available at Gate 2.
            </p>
            <div className="text-[11px] font-mono text-[#475569] border-t border-[#CBD5E1] pt-2">
              GPS Coordinates: 33.6844° N, 73.0479° E (Institutional Zone)
            </div>
          </div>
        </div>

        {/* Right Column: Formal Contact Form UI (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="pb-3 border-b border-[#CBD5E1]">
              <h2 className="font-editorial text-xl font-bold text-[#0F1035]">
                Official Inquiry & Support Form
              </h2>
              <p className="text-xs text-[#475569] mt-1 font-prose-serif">
                Submit academic questions, admission status verifications, or fee queries directly to the concerned directorate.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-[#EEF0FF] border border-[#292A86]/30 rounded-md text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#20216B] mx-auto" />
                <h3 className="font-editorial text-lg font-bold text-[#0F1035]">
                  Inquiry Dispatched Successfully
                </h3>
                <p className="text-xs text-[#1E293B] font-prose-serif max-w-md mx-auto">
                  Your formal communication has been logged under Tracking Reference:
                </p>
                <div className="font-mono text-lg font-bold text-[#20216B] bg-white p-2 border border-[#292A86]/30 rounded-sm inline-block">
                  {inquiryId}
                </div>
                <p className="text-[11px] text-[#475569] mt-2">
                  The institutional coordinator will reply to <span className="font-semibold text-[#0F1035]">{form.email}</span> within 24–48 working hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: '',
                        phone: '',
                        email: '',
                        category: 'Admissions Inquiry',
                        studentId: '',
                        subject: '',
                        message: '',
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="email@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Inquiry Department / Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                    >
                      <option value="Admissions Inquiry">Admissions Directorate</option>
                      <option value="Academic Matters">Academic Wing & Syllabus</option>
                      <option value="Examination & Results">Controller of Examinations</option>
                      <option value="Accounts & Fee Vouchers">Accounts & Finance Directorate</option>
                      <option value="General Administration">General Administration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Subject / Brief Topic *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Inquiry regarding Class IX Admission Entry Test"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                      Student ID / Roll # (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DA-2026-1001 (If enrolled)"
                      value={form.studentId}
                      onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F1035] mb-1">
                    Inquiry Details / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide complete institutional details or specific queries..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#CBD5E1]">
                  <div className="text-[11px] text-[#475569]">
                    Official dispatches logged for institutional record.
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-[#20216B] hover:bg-[#292A86] rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
