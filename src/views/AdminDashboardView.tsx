import React, { useState, useEffect } from 'react';
import { PageId, Notice, StudentResult } from '../types';
import { Emblem } from '../components/Emblem';
import { 
  useBranding, 
  DEFAULT_CAMPUS_BANNER, 
  DEFAULT_PRINCIPAL_PHOTO,
  SocialMediaState
} from '../context/BrandingContext';
import { generateAndSaveSitemapXml } from '../services/sitemapGenerator';
import { 
  ShieldCheck, 
  LogOut, 
  Globe, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Award, 
  Users, 
  MessageSquare, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Lock, 
  Check, 
  X, 
  Layers, 
  ExternalLink,
  Eye,
  Crop,
  Sliders,
  Download,
  Code,
  UserCheck,
  Camera,
  User,
  Menu,
  LayoutDashboard,
  ArrowLeft,
  GraduationCap,
  IdCard
} from 'lucide-react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminNavigationDrawer, AdminSectionKey } from '../components/admin/AdminNavigationDrawer';
import { 
  getCurrentAdminSession, 
  logoutAdminSession, 
  changeAdminPassword, 
  getActiveAdminCredentials,
  adminFetchAllNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminDeleteNotice,
  adminFetchAllResults,
  adminCreateResult,
  adminUpdateResult,
  adminDeleteResult,
  adminFetchAdmissions,
  adminUpdateAdmissionStatus,
  adminFetchInquiries,
  adminUpdateInquiryStatus,
  AdmissionApplicationRecord,
  InquiryRecord
} from '../services/adminService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { LogoCustomizerModal } from '../components/admin/LogoCustomizerModal';
import { HomepageGalleryManager } from '../components/admin/HomepageGalleryManager';
import { AdminClassManager } from '../components/admin/AdminClassManager';
import { IdCardTemplateManager } from '../components/admin/IdCardTemplateManager';
import { 
  processSquareLogoFromSrc, 
  saveWebsiteLogo, 
  revertWebsiteLogoToDefault,
  useWebsiteLogo 
} from '../services/brandingManager';

interface AdminDashboardViewProps {
  onNavigate: (page: PageId) => void;
  onLogout: () => void;
}

type AdminTab = 'overview' | 'classes' | 'id-card-template' | 'branding' | 'leadership' | 'social' | 'gallery' | 'notices' | 'results' | 'admissions' | 'inquiries' | 'security';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate, onLogout }) => {
  const { 
    logoUrl, 
    bannerUrl, 
    updateLogo, 
    resetLogo, 
    updateBanner, 
    resetBanner, 
    institutionName, 
    tagline, 
    updateBrandingDetails,
    principalPhotoUrl,
    principalName,
    principalTitle,
    principalQualification,
    principalMessage,
    updatePrincipalPhoto,
    resetPrincipalPhoto,
    updatePrincipalDetails,
    socialMedia,
    updateSocialMedia,
  } = useBranding();
  
  const [currentTab, setCurrentTab] = useState<AdminTab>('branding');
  const [tabHistory, setTabHistory] = useState<AdminTab[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => getCurrentAdminSession());

  const navigateToTab = (newTab: AdminTab) => {
    if (newTab === currentTab) return;
    setTabHistory(prev => [...prev, currentTab]);
    setCurrentTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory(prev => prev.slice(0, -1));
      setCurrentTab(prevTab);
    } else {
      setCurrentTab('overview');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSectionTitle = (tab: AdminTab): string => {
    switch (tab) {
      case 'classes':
        return 'Class Management & Enrolled Students';
      case 'id-card-template':
        return 'ID Card Template Studio & Mapping';
      case 'branding':
        return 'Custom Logo & Branding';
      case 'leadership':
        return 'Principal Custom Photo & Message';
      case 'social':
        return 'Social Media Management';
      case 'gallery':
        return 'Homepage Gallery Showcase';
      case 'notices':
        return 'Notices & Circulars';
      case 'results':
        return 'Examination Results';
      case 'admissions':
        return 'Admissions Applications';
      case 'inquiries':
        return 'Public Inquiries & Messages';
      case 'security':
        return 'Security & Password';
      case 'overview':
      default:
        return 'Directorate Command Center';
    }
  };

  const handleSelectSection = (section: AdminSectionKey) => {
    let targetTab: AdminTab = 'overview';
    if (section === 'dashboard') {
      targetTab = 'overview';
    } else if (
      section === 'classes' ||
      section === 'students' ||
      section === 'student-profiles'
    ) {
      targetTab = 'classes';
    } else if (section === 'id-card-template') {
      targetTab = 'id-card-template';
    } else if (
      section === 'branding' || 
      section === 'leadership' || 
      section === 'social' || 
      section === 'gallery' ||
      section === 'notices' || 
      section === 'results' || 
      section === 'admissions' || 
      section === 'security'
    ) {
      targetTab = section;
    } else if (section === 'admissions-pending' || section === 'admissions-approved' || section === 'admissions-rejected') {
      targetTab = 'admissions';
    } else if (section === 'contact-info') {
      targetTab = 'inquiries';
    } else if (section === 'attendance' || section === 'academic-records') {
      targetTab = 'classes';
    } else if (section === 'news' || section === 'events' || section === 'downloads' || section === 'academic-info' || section === 'about-info') {
      targetTab = 'notices';
    } else if (section === 'social-youtube' || section === 'social-facebook' || section === 'social-tiktok' || section === 'social-whatsapp') {
      targetTab = 'social';
    } else if (section === 'admin-profile' || section === 'settings' || section === 'audit-log') {
      targetTab = 'security';
    } else {
      targetTab = 'overview';
    }

    if (targetTab !== currentTab) {
      setTabHistory(prev => [...prev, currentTab]);
      setCurrentTab(targetTab);
    }
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global notification banner in admin console
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // ----------------------------------------------------
  // Tab 1: Logo, Banner & Branding State
  // ----------------------------------------------------
  const [tempLogoUrl, setTempLogoUrl] = useState<string>(logoUrl || '');
  const [logoPreviewSrc, setLogoPreviewSrc] = useState<string>('');
  const [logoCropZoom, setLogoCropZoom] = useState<number>(1.0);
  const [isLogoDragOver, setIsLogoDragOver] = useState<boolean>(false);
  const logoFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [tempBannerUrl, setTempBannerUrl] = useState<string>(bannerUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [tempInstName, setTempInstName] = useState(institutionName);
  const [tempTagline, setTempTagline] = useState(tagline);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerImageSrc, setCustomizerImageSrc] = useState<string>('');

  // ----------------------------------------------------
  // Tab: Principal Leadership State
  // ----------------------------------------------------
  const [tempPrincipalPhoto, setTempPrincipalPhoto] = useState<string>(principalPhotoUrl || '');
  const [tempPrincipalName, setTempPrincipalName] = useState<string>(principalName);
  const [tempPrincipalTitle, setTempPrincipalTitle] = useState<string>(principalTitle);
  const [tempPrincipalQual, setTempPrincipalQual] = useState<string>(principalQualification);
  const [tempPrincipalMsg, setTempPrincipalMsg] = useState<string>(principalMessage);
  const [isUploadingPrincipalPhoto, setIsUploadingPrincipalPhoto] = useState(false);

  // ----------------------------------------------------
  // Tab: Social Media Management State
  // ----------------------------------------------------
  const [tempSocialMedia, setTempSocialMedia] = useState<SocialMediaState>(socialMedia);

  useEffect(() => {
    setTempSocialMedia(socialMedia);
  }, [socialMedia]);

  // Keep local leadership state in sync with context
  useEffect(() => {
    setTempPrincipalPhoto(principalPhotoUrl || '');
    setTempPrincipalName(principalName);
    setTempPrincipalTitle(principalTitle);
    setTempPrincipalQual(principalQualification);
    setTempPrincipalMsg(principalMessage);
  }, [
    principalPhotoUrl,
    principalName,
    principalTitle,
    principalQualification,
    principalMessage
  ]);

  // ----------------------------------------------------
  // Tab 2: Notices Management State
  // ----------------------------------------------------
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoadingNotices, setIsLoadingNotices] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeFormData, setNoticeFormData] = useState({
    title: '',
    refNo: '',
    category: 'Academic' as Notice['category'],
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    summary: '',
    fullText: '',
    isImportant: false,
    issuedBy: 'Directorate of Academics & Examination',
  });

  // ----------------------------------------------------
  // Tab 3: Results Management State
  // ----------------------------------------------------
  const [resultsList, setResultsList] = useState<StudentResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState<StudentResult | null>(null);
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [resultFormData, setResultFormData] = useState({
    studentName: '',
    rollNumber: '',
    studentId: '',
    fatherName: '',
    examination: 'Annual Examination',
    session: '2025–2026',
    examDate: 'March 2026',
    className: 'Class X (Matriculation)',
    section: 'Section A (Science)',
    totalMarks: 550,
    obtainedMarks: 480,
    percentage: 87.2,
    overallGrade: 'A-One (Outstanding)',
    resultStatus: 'PASS - FIRST DIVISION' as StudentResult['resultStatus'],
  });

  // ----------------------------------------------------
  // Tab 4: Admissions Applications State
  // ----------------------------------------------------
  const [admissions, setAdmissions] = useState<AdmissionApplicationRecord[]>([]);
  const [isLoadingAdmissions, setIsLoadingAdmissions] = useState(false);

  // ----------------------------------------------------
  // Tab 5: Inquiries State
  // ----------------------------------------------------
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);

  // ----------------------------------------------------
  // Tab 6: Security & Password State
  // ----------------------------------------------------
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [activeAdminEmail, setActiveAdminEmail] = useState('Darearqam@mardan.com');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sync tempLogoUrl and tempBannerUrl if they change from context
  useEffect(() => {
    setTempLogoUrl(logoUrl || '');
  }, [logoUrl]);

  useEffect(() => {
    setTempBannerUrl(bannerUrl || '');
  }, [bannerUrl]);

  // Load active admin credentials on mount
  useEffect(() => {
    getActiveAdminCredentials().then(c => {
      setActiveAdminEmail(c.email);
    }).catch(() => {});
  }, []);

  // Fetch data on tab change
  useEffect(() => {
    if (currentTab === 'notices') {
      loadNotices();
    } else if (currentTab === 'results') {
      loadResults();
    } else if (currentTab === 'admissions') {
      loadAdmissions();
    } else if (currentTab === 'inquiries') {
      loadInquiries();
    }
  }, [currentTab]);

  const loadNotices = async () => {
    setIsLoadingNotices(true);
    const data = await adminFetchAllNotices();
    setNotices(data);
    setIsLoadingNotices(false);
  };

  const loadResults = async () => {
    setIsLoadingResults(true);
    const data = await adminFetchAllResults();
    setResultsList(data);
    setIsLoadingResults(false);
  };

  const loadAdmissions = async () => {
    setIsLoadingAdmissions(true);
    const data = await adminFetchAdmissions();
    setAdmissions(data);
    setIsLoadingAdmissions(false);
  };

  const loadInquiries = async () => {
    setIsLoadingInquiries(true);
    const data = await adminFetchInquiries();
    setInquiries(data);
    setIsLoadingInquiries(false);
  };

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // ----------------------------------------------------
  // Logo Upload, Drag & Drop, 1:1 Aspect Crop & Persistence
  // ----------------------------------------------------
  const processSelectedLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification('error', 'File size exceeds 15MB limit. Please upload an image under 15MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoPreviewSrc(result);
        setTempLogoUrl(result);
        setLogoCropZoom(1.0);
        showNotification('info', 'Logo image loaded! Adjust the 1:1 preview/crop slider and click Save.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedLogoFile(file);
    e.target.value = '';
  };

  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLogoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedLogoFile(file);
    }
  };

  const handleOpenCustomizer = (srcToEdit?: string) => {
    const targetSrc = srcToEdit || logoPreviewSrc || tempLogoUrl;
    if (!targetSrc) {
      showNotification('info', 'Please select or upload an image file first.');
      return;
    }
    setCustomizerImageSrc(targetSrc);
    setIsCustomizerOpen(true);
  };

  const handleApplyCustomizedLogo = async (croppedUrl: string) => {
    setTempLogoUrl(croppedUrl);
    setLogoPreviewSrc(croppedUrl);
    try {
      await saveWebsiteLogo(croppedUrl);
      await updateLogo(croppedUrl);
      await updateBrandingDetails(tempInstName, tempTagline);
      showNotification('success', 'Official institutional logo permanently saved & broadcasted real-time across all components!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to publish logo website-wide.');
    }
  };

  const handleApplyLogo = async () => {
    const activeSrc = logoPreviewSrc || tempLogoUrl;
    if (!activeSrc.trim()) {
      showNotification('error', 'Please select or upload a logo image first.');
      return;
    }

    setIsUploadingLogo(true);
    showNotification('info', 'Processing 1:1 square master logo and synchronizing...');
    try {
      // 1. Process 1:1 ultra-sharp square crop (512x512)
      let squareUrl = activeSrc;
      try {
        squareUrl = await processSquareLogoFromSrc(activeSrc, 512, logoCropZoom);
      } catch (procErr) {
        console.warn('Canvas crop fallback notice:', procErr);
      }

      // 2. Save via universal brandingManager
      await saveWebsiteLogo(squareUrl);
      await updateLogo(squareUrl);
      await updateBrandingDetails(tempInstName, tempTagline);

      setTempLogoUrl(squareUrl);
      setLogoPreviewSrc(squareUrl);
      showNotification('success', 'Website logo permanently saved & synchronized in real-time across all devices!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleResetToDefaultLogo = async () => {
    setIsUploadingLogo(true);
    try {
      await revertWebsiteLogoToDefault();
      await resetLogo();
      setTempLogoUrl('/branding/logo.png');
      setLogoPreviewSrc('');
      setLogoCropZoom(1.0);
      showNotification('info', 'Website logo reverted to default institutional emblem.');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to revert logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // ----------------------------------------------------
  // Hero Cover Banner Upload & Management
  // ----------------------------------------------------
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotification('error', 'Banner file size exceeds 15MB limit. Please upload an image under 15MB.');
      return;
    }

    setIsUploadingBanner(true);
    showNotification('info', 'Uploading custom hero banner to Cloudinary media storage...');

    try {
      const uploadRes = await uploadToCloudinary(file);
      if (uploadRes.success && uploadRes.url) {
        await updateBanner(uploadRes.url);
        setTempBannerUrl(uploadRes.url);
        showNotification('success', 'Custom hero banner uploaded and published website-wide successfully!');
      } else {
        throw new Error(uploadRes.error || 'Failed to upload banner to Cloudinary.');
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to upload hero banner to Cloudinary.');
    } finally {
      setIsUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyBanner = async () => {
    if (!tempBannerUrl.trim()) {
      showNotification('error', 'Please upload or specify a banner image URL first.');
      return;
    }
    setIsUploadingBanner(true);
    try {
      await updateBanner(tempBannerUrl.trim());
      showNotification('success', 'Custom hero banner updated and published website-wide!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update hero banner.');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleResetBanner = async () => {
    await resetBanner();
    setTempBannerUrl('');
    showNotification('info', 'Hero banner reset to institutional default campus image.');
  };

  const [sitemapXmlContent, setSitemapXmlContent] = useState<string>('');
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false);

  const handleGenerateSitemap = async () => {
    setIsGeneratingSitemap(true);
    showNotification('info', 'Generating automated XML sitemap tracking all portal pages...');
    try {
      const xml = await generateAndSaveSitemapXml();
      setSitemapXmlContent(xml);
      showNotification('success', 'sitemap.xml successfully generated and stored in Firebase single document state!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to generate sitemap.');
    } finally {
      setIsGeneratingSitemap(false);
    }
  };

  const handleDownloadSitemap = () => {
    if (!sitemapXmlContent) {
      showNotification('info', 'Please generate the sitemap first.');
      return;
    }
    const blob = new Blob([sitemapXmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('success', 'sitemap.xml downloaded successfully.');
  };

  // ----------------------------------------------------
  // Leadership & Executive Portraits Actions
  // ----------------------------------------------------
  const handlePrincipalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showNotification('error', 'Image file size must be under 10MB.');
      return;
    }

    setIsUploadingPrincipalPhoto(true);
    showNotification('info', 'Uploading Principal custom photo to CDN media storage...');
    try {
      const res = await uploadToCloudinary(file, { folder: 'dare_arqam_leadership' });
      if (res.success && res.url) {
        setTempPrincipalPhoto(res.url);
        await updatePrincipalPhoto(res.url);
        showNotification('success', 'Principal custom photo successfully uploaded & published website-wide!');
      } else {
        showNotification('error', res.error || 'Failed to upload Principal photo.');
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Error uploading Principal photo.');
    } finally {
      setIsUploadingPrincipalPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleApplyPrincipalPhoto = async () => {
    if (!tempPrincipalPhoto.trim()) {
      showNotification('error', 'Please provide or upload a valid photo URL first.');
      return;
    }
    setIsUploadingPrincipalPhoto(true);
    try {
      await updatePrincipalPhoto(tempPrincipalPhoto.trim());
      showNotification('success', 'Principal custom photo published website-wide!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update photo.');
    } finally {
      setIsUploadingPrincipalPhoto(false);
    }
  };

  const handleResetPrincipalPhoto = async () => {
    await resetPrincipalPhoto();
    setTempPrincipalPhoto('');
    showNotification('info', 'Principal portrait reset to institutional default image.');
  };

  const handleSavePrincipalDetails = async () => {
    try {
      await updatePrincipalDetails({
        principalName: tempPrincipalName.trim(),
        principalTitle: tempPrincipalTitle.trim(),
        principalQualification: tempPrincipalQual.trim(),
        principalMessage: tempPrincipalMsg.trim(),
      });
      showNotification('success', 'Principal details & communique successfully updated!');
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to save principal details.');
    }
  };

  // ----------------------------------------------------
  // Notice Form Actions
  // ----------------------------------------------------
  const openNewNoticeModal = () => {
    setEditingNotice(null);
    setNoticeFormData({
      title: '',
      refNo: `DA/DIR/2026-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Academic',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      summary: '',
      fullText: '',
      isImportant: false,
      issuedBy: 'Directorate of Academics & Examination',
    });
    setShowNoticeModal(true);
  };

  const openEditNoticeModal = (notice: Notice) => {
    setEditingNotice(notice);
    setNoticeFormData({
      title: notice.title,
      refNo: notice.refNo,
      category: notice.category,
      date: notice.date,
      summary: notice.summary,
      fullText: notice.fullText,
      isImportant: !!notice.isImportant,
      issuedBy: notice.issuedBy,
    });
    setShowNoticeModal(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeFormData.title || !noticeFormData.summary) {
      showNotification('error', 'Please fill in notice title and summary.');
      return;
    }

    try {
      if (editingNotice) {
        await adminUpdateNotice(editingNotice.id, noticeFormData);
        showNotification('success', 'Notice circular updated successfully.');
      } else {
        await adminCreateNotice({
          ...noticeFormData,
          fileSize: '160 KB',
        });
        showNotification('success', 'New institutional notice published successfully.');
      }
      setShowNoticeModal(false);
      await loadNotices();
    } catch (err: any) {
      showNotification('error', err?.message || 'Error saving notice.');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this official notice?')) return;
    try {
      await adminDeleteNotice(id);
      showNotification('success', 'Notice deleted successfully.');
      await loadNotices();
    } catch (e: any) {
      showNotification('error', e?.message || 'Failed to delete notice.');
    }
  };

  // ----------------------------------------------------
  // Result Actions
  // ----------------------------------------------------
  const openNewResultModal = () => {
    setEditingResult(null);
    setResultFormData({
      studentName: '',
      rollNumber: String(849200 + Math.floor(Math.random() * 500)),
      studentId: `DA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fatherName: '',
      examination: 'Annual Examination',
      session: '2025–2026',
      examDate: 'March 2026',
      className: 'Class X (Matriculation)',
      section: 'Section A (Science)',
      totalMarks: 550,
      obtainedMarks: 480,
      percentage: 87.2,
      overallGrade: 'A-One (Outstanding)',
      resultStatus: 'PASS - FIRST DIVISION',
    });
    setShowResultModal(true);
  };

  const openEditResultModal = (res: StudentResult) => {
    setEditingResult(res);
    setResultFormData({
      studentName: res.studentName,
      rollNumber: res.rollNumber,
      studentId: res.studentId,
      fatherName: res.fatherName,
      examination: res.examination || 'Annual Examination',
      session: res.session || '2025–2026',
      examDate: res.examDate || 'March 2026',
      className: res.className,
      section: res.section,
      totalMarks: res.totalMarks,
      obtainedMarks: res.obtainedMarks,
      percentage: res.percentage,
      overallGrade: res.overallGrade || 'A-One (Outstanding)',
      resultStatus: res.resultStatus || 'PASS - FIRST DIVISION',
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultFormData.studentName || !resultFormData.rollNumber) {
      showNotification('error', 'Student name and Roll Number are required.');
      return;
    }

    const calculatedPercentage = parseFloat(((resultFormData.obtainedMarks / resultFormData.totalMarks) * 100).toFixed(1));
    const resultDocId = editingResult?.id || `res-${resultFormData.rollNumber}`;
    const finalResult: StudentResult = {
      id: resultDocId,
      studentName: resultFormData.studentName,
      rollNumber: resultFormData.rollNumber,
      studentId: resultFormData.studentId,
      fatherName: resultFormData.fatherName,
      examination: resultFormData.examination,
      session: resultFormData.session,
      examDate: resultFormData.examDate,
      className: resultFormData.className,
      section: resultFormData.section,
      totalMarks: resultFormData.totalMarks,
      obtainedMarks: resultFormData.obtainedMarks,
      percentage: calculatedPercentage,
      overallGrade: resultFormData.overallGrade,
      resultStatus: resultFormData.resultStatus,
      subjects: [
        { name: 'Nazra Quran & Tajweed', totalMarks: 50, obtainedMarks: 48, grade: 'A-1', status: 'Pass' },
        { name: 'Urdu Literature', totalMarks: 100, obtainedMarks: 86, grade: 'A-1', status: 'Pass' },
        { name: 'English Language', totalMarks: 100, obtainedMarks: 84, grade: 'A', status: 'Pass' },
        { name: 'Mathematics (Advanced)', totalMarks: 100, obtainedMarks: 94, grade: 'A-1', status: 'Pass' },
        { name: 'General Science', totalMarks: 100, obtainedMarks: 88, grade: 'A-1', status: 'Pass' },
        { name: 'Pakistan Studies', totalMarks: 50, obtainedMarks: 45, grade: 'A-1', status: 'Pass' },
      ],
      remarks: 'Certified official examination record issued by the Directorate Controller of Examinations.',
    };

    try {
      if (editingResult && editingResult.id) {
        await adminUpdateResult(editingResult.id, finalResult);
        showNotification('success', 'Student examination record updated.');
      } else {
        await adminCreateResult(finalResult);
        showNotification('success', `New examination result added for Roll No. ${finalResult.rollNumber}`);
      }
      setShowResultModal(false);
      await loadResults();
    } catch (err: any) {
      showNotification('error', err?.message || 'Error saving result.');
    }
  };

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm('Delete this examination record?')) return;
    try {
      await adminDeleteResult(id);
      showNotification('success', 'Examination record deleted.');
      await loadResults();
    } catch (e: any) {
      showNotification('error', e?.message || 'Failed to delete record.');
    }
  };

  // ----------------------------------------------------
  // Password Change
  // ----------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPasswordInput) {
      showNotification('error', 'Please enter your current administrator password.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      showNotification('error', 'New password and confirmation do not match.');
      return;
    }
    if (newPasswordInput.length < 6) {
      showNotification('error', 'New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await changeAdminPassword(currentPasswordInput, newPasswordInput);
      if (res.success) {
        showNotification('success', res.message);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        showNotification('error', res.message);
      }
    } catch (err: any) {
      showNotification('error', err?.message || 'Failed to update administrator password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleAdminLogout = () => {
    logoutAdminSession();
    onLogout();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#0A0D18] text-stone-100 flex flex-col font-sans">
      {/* 1. Professional Admin Header with Left Hamburger Button & Back Button */}
      <AdminHeader
        currentSectionTitle={getSectionTitle(currentTab)}
        adminUser={adminUser}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        onNavigatePublic={(page) => onNavigate(page)}
        onLogout={handleAdminLogout}
        onOpenSecurity={() => navigateToTab('security')}
        unreadCount={inquiries.filter(i => i.status === 'Unread').length}
        canGoBack={currentTab !== 'overview'}
        onGoBack={handleGoBack}
      />

      {/* 2. Slide-out Navigation Drawer from the LEFT */}
      <AdminNavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeSection={(currentTab === 'overview' ? 'dashboard' : currentTab) as AdminSectionKey}
        onSelectSection={handleSelectSection}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
        badgeCounts={{
          pendingAdmissions: admissions.filter(a => a.status === 'PENDING' || a.status === 'UNDER REVIEW').length,
          unreadInquiries: inquiries.filter(i => i.status === 'Unread').length,
          totalNotices: notices.length
        }}
      />

      {/* 3. Feedback Notification Toast */}
      {feedback && (
        <div className="fixed top-16 right-4 z-50 max-w-md animate-in slide-in-from-top-2">
          <div
            className={`p-4 rounded-lg shadow-xl border text-xs sm:text-sm flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-[#20216B] border-[#292A86] text-[#FFF000]'
                : feedback.type === 'error'
                ? 'bg-red-950 border-red-700 text-red-200'
                : 'bg-stone-900 border-stone-700 text-stone-200'
            }`}
          >
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#FFF000] shrink-0" />}
            {feedback.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
            {feedback.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />}
            <span className="leading-snug">{feedback.text}</span>
          </div>
        </div>
      )}

      {/* 4. Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-5">
        {/* Section Header Breadcrumb Bar */}
        <div className="bg-[#12172B] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-[#202946] flex items-center justify-between gap-3 shadow-sm">
          {/* Left: Current Active Section Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-stone-400 font-mono hidden sm:inline">Administration /</span>
            <div className="inline-flex items-center gap-2 text-white text-xs sm:text-sm font-bold truncate">
              <span className="w-2 h-2 rounded-full bg-[#FFF000] shrink-0" />
              <span className="truncate">{getSectionTitle(currentTab)}</span>
            </div>
          </div>

          {/* Right: Quick Action to Dashboard Overview or Public Website */}
          <div className="flex items-center gap-2 shrink-0">
            {currentTab !== 'overview' && (
              <button
                type="button"
                onClick={() => navigateToTab('overview')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-[#182038] hover:bg-[#202946] border border-[#2A375E] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Overview Dashboard</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-[#182038] hover:bg-[#202946] border border-[#2A375E] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Open Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">View Website</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 0: EXECUTIVE DASHBOARD OVERVIEW & QUICK ACTIONS */}
        {/* ========================================================================= */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            {/* Executive Welcome Card */}
            <div className="bg-gradient-to-r from-[#12172B] via-[#161E38] to-[#12172B] border border-[#263354] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 w-96 h-96 bg-[#20216B]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 text-xs font-mono font-bold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DIRECTORATE COMMAND CENTER · ACTIVE SESSION</span>
                  </div>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Welcome, Administrator
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl font-prose-serif leading-relaxed">
                    Access all management modules via the <strong>Navigation Menu</strong> on the left side or select a quick action below to configure branding, publish circulars, record examination results, and manage applications.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#20216B] to-[#292A86] text-[#FFF000] border border-[#D4AF37] rounded-xl text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                  >
                    <Menu className="w-4 h-4" />
                    <span>Open Navigation Menu</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-[#12172B] border border-[#202946] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-mono uppercase tracking-wider">Published Notices</span>
                  <FileText className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{notices.length}</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('notices')}
                  className="text-[11px] text-[#FFF000] hover:underline mt-2 text-left cursor-pointer"
                >
                  Manage Notices & Circulars →
                </button>
              </div>

              <div className="bg-[#12172B] border border-[#202946] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-mono uppercase tracking-wider">Exam Records</span>
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{resultsList.length}</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('results')}
                  className="text-[11px] text-[#FFF000] hover:underline mt-2 text-left cursor-pointer"
                >
                  Manage Exam Results →
                </button>
              </div>

              <div className="bg-[#12172B] border border-[#202946] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-mono uppercase tracking-wider">Admissions</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{admissions.length}</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('admissions')}
                  className="text-[11px] text-[#FFF000] hover:underline mt-2 text-left cursor-pointer"
                >
                  Review Applications →
                </button>
              </div>

              <div className="bg-[#12172B] border border-[#202946] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-mono uppercase tracking-wider">Public Inquiries</span>
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mt-2">{inquiries.length}</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('inquiries')}
                  className="text-[11px] text-[#FFF000] hover:underline mt-2 text-left cursor-pointer"
                >
                  View Inquiries & Messages →
                </button>
              </div>
            </div>

            {/* 8 Core Management Modules Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <span>Institutional Management Modules</span>
                </h3>
                <span className="text-xs text-stone-400">All 8 modules accessible in left menu</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* 0. Classes & Enrolled Students */}
                <button
                  type="button"
                  onClick={() => navigateToTab('classes')}
                  className="p-4 rounded-xl bg-[#141A35] hover:bg-[#1C254B] border-2 border-[#D4AF37]/50 hover:border-[#FFF000] text-left transition-all group cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FFF000] text-[#171852]">
                      13 Classes
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors flex items-center gap-1.5">
                    <span>Class Management & Students</span>
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 font-prose-serif line-clamp-2">
                    View students grouped automatically by class (Play Group to Class 10) with complete official digital ID Cards.
                  </p>
                </button>

                {/* 0.1 ID Card Template Studio */}
                <button
                  type="button"
                  onClick={() => navigateToTab('id-card-template')}
                  className="p-4 rounded-xl bg-[#141A35] hover:bg-[#1C254B] border-2 border-[#D4AF37]/50 hover:border-[#FFF000] text-left transition-all group cursor-pointer shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IdCard className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50">
                      Studio
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors flex items-center gap-1.5">
                    <span>ID Card Template Studio</span>
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 font-prose-serif line-clamp-2">
                    Upload blank ID card templates and visually drag & drop student data fields with live student preview.
                  </p>
                </button>

                {/* 1. Custom Logo & Branding */}
                <button
                  type="button"
                  onClick={() => navigateToTab('branding')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Custom Logo & Branding
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Upload circular emblem and wide hero cover backdrop banner.
                  </p>
                </button>

                {/* 2. Principal Custom Photo */}
                <button
                  type="button"
                  onClick={() => navigateToTab('leadership')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Principal Custom Photo
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Update Principal picture, designation, qualifications, and official address.
                  </p>
                </button>

                {/* 3. Social Media Management */}
                <button
                  type="button"
                  onClick={() => navigateToTab('social')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Social Media Management
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Manage YouTube, Facebook, TikTok, and WhatsApp URLs & toggles.
                  </p>
                </button>

                {/* 4. Homepage Gallery Showcase */}
                <button
                  type="button"
                  onClick={() => navigateToTab('gallery')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Homepage Gallery Showcase
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Upload unlimited photos, reorder horizontal slides, and adjust carousel intervals.
                  </p>
                </button>

                {/* 5. Notices & Circulars */}
                <button
                  type="button"
                  onClick={() => navigateToTab('notices')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Notices & Circulars
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Publish official notices, holiday notifications, and exam dates.
                  </p>
                </button>

                {/* 5. Examination Results */}
                <button
                  type="button"
                  onClick={() => navigateToTab('results')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Examination Results
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Record marks, search student transcripts, and verify grade sheets.
                  </p>
                </button>

                {/* 6. Admissions Applications */}
                <button
                  type="button"
                  onClick={() => navigateToTab('admissions')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Admissions Applications
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Review incoming admission forms, schedule interviews, and approve candidates.
                  </p>
                </button>

                {/* 7. Public Inquiries */}
                <button
                  type="button"
                  onClick={() => navigateToTab('inquiries')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Public Inquiries
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Track parent queries, contact submissions, and support requests.
                  </p>
                </button>

                {/* 8. Security & Password */}
                <button
                  type="button"
                  onClick={() => navigateToTab('security')}
                  className="p-4 rounded-xl bg-[#12172B] hover:bg-[#182038] border border-[#202946] hover:border-[#D4AF37]/60 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-[#FFF000] transition-colors">
                    Security & Password
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 font-prose-serif line-clamp-2">
                    Update administrative credentials, view audit logs, and security logs.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: CLASS MANAGEMENT & ENROLLED STUDENTS (13 OFFICIAL CLASSES) */}
        {/* ========================================================================= */}
        {currentTab === 'classes' && (
          <AdminClassManager
            onSuccessNotification={(msg) => showNotification('success', msg)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB: DYNAMIC ID CARD TEMPLATE STUDIO & FIELD MAPPING */}
        {/* ========================================================================= */}
        {currentTab === 'id-card-template' && (
          <IdCardTemplateManager
            onSuccessNotification={(msg) => showNotification('success', msg)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CUSTOM LOGO, HERO BANNER & BRANDING MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'branding' && (
          <div className="space-y-6">
            {/* Top Identity Status Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                    INSTITUTIONAL IDENTITY & MEDIA CLOUD
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Custom Logo & Hero Cover Banner Management
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif leading-relaxed">
                    Upload your custom institutional circular logo and wide hero backdrop banner. Changes publish live website-wide in ultra-high resolution.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#20216B] border border-[#292A86]/60 rounded-lg text-[#FFF000] text-xs shrink-0 font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                  <span>Cloudinary Media CDN: <strong>ehc1fewm</strong></span>
                </div>
              </div>

              {/* SECTION 1: HERO COVER BANNER (BACKDROP) */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center font-bold text-xs">
                      01
                    </div>
                    <div>
                      <h3 className="font-editorial text-base sm:text-lg font-bold text-white">
                        Hero Cover Backdrop Banner
                      </h3>
                      <p className="text-xs text-stone-400 font-prose-serif">
                        Wide background banner image displayed at the top of the homepage behind the big round logo.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-2.5 py-1 rounded border border-[#292A86] font-bold">
                    {tempBannerUrl ? 'Custom Banner Set' : 'Default Campus Banner'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
                  {/* Banner Upload / URL */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* File Upload Box */}
                    <div className="border-2 border-dashed border-stone-700 hover:border-[#F5D900] rounded-xl p-5 text-center transition-colors bg-stone-900/50 relative">
                      <input
                        type="file"
                        id="banner-file-input"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleBannerFileUpload}
                        disabled={isUploadingBanner}
                        className="hidden"
                      />
                      <label 
                        htmlFor="banner-file-input"
                        className="cursor-pointer block space-y-2"
                      >
                        <div className="w-12 h-12 bg-[#20216B] border border-[#292A86] text-[#FFF000] rounded-full flex items-center justify-center mx-auto shadow-inner">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-[#FFF000] hover:underline">
                            {isUploadingBanner ? 'Uploading Banner to Cloudinary CDN...' : 'Click to upload custom hero banner image'}
                          </span>
                          <p className="text-[11px] text-[#94A3B8] mt-0.5 font-mono">
                            High resolution landscape format (recommended: 1920x800px or 16:9)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Direct Banner URL */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                        Or Specify Banner Web Image URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://your-domain.com/campus-cover-banner.jpg"
                          value={tempBannerUrl}
                          onChange={(e) => setTempBannerUrl(e.target.value)}
                          className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBanner}
                          disabled={isUploadingBanner}
                          className="px-4 py-2 text-xs font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-[#F5D900]/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5 text-[#FFF000]" />
                          <span>Save Banner</span>
                        </button>
                        {tempBannerUrl && (
                          <button
                            type="button"
                            onClick={handleResetBanner}
                            className="px-3 py-2 text-xs text-stone-400 hover:text-white bg-stone-800 rounded-lg transition-colors"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Preview */}
                  <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-mono font-bold text-stone-300 uppercase block">
                      Current Banner Preview
                    </span>
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-stone-700 bg-stone-950">
                      <img
                        src={tempBannerUrl || bannerUrl || '/src/assets/images/campus_main_building_1790434904126.jpg'}
                        alt="Hero Cover Banner Live Preview"
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold truncate">
                        {tempBannerUrl ? 'Active Custom Cover Banner' : 'Default Academic Campus Block'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CUSTOM LOGO / BIG ROUND EMBLEM */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center font-bold text-xs">
                      02
                    </div>
                    <div>
                      <h3 className="font-editorial text-base sm:text-lg font-bold text-white">
                        Institutional Circular Logo / Crest
                      </h3>
                      <p className="text-xs text-stone-400 font-prose-serif">
                        Big round logo displayed overlapping the hero cover banner and across the top navigation bar.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-2.5 py-1 rounded border border-[#292A86] font-bold">
                    {tempLogoUrl ? 'Custom Emblem Set' : 'Default Vector Crest'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                  {/* Left: Drag & Drop Upload, 1:1 Aspect Crop Slider, URL controls */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Drag & Drop File Upload Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsLogoDragOver(true);
                      }}
                      onDragLeave={() => setIsLogoDragOver(false)}
                      onDrop={handleLogoDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all bg-stone-900/50 relative cursor-pointer ${
                        isLogoDragOver
                          ? 'border-[#FFF000] bg-[#20216B]/40 neon-glow-gold scale-[1.01]'
                          : 'border-stone-700 hover:border-[#F5D900]'
                      }`}
                    >
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        id="logo-file-input"
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                      <label 
                        htmlFor="logo-file-input"
                        className="cursor-pointer block space-y-3"
                      >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-inner transition-all ${
                          isLogoDragOver ? 'bg-[#FFF000] text-[#171852] scale-110' : 'bg-[#20216B] border border-[#292A86] text-[#FFF000]'
                        }`}>
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-[#FFF000] hover:underline block">
                            {isLogoDragOver ? 'Drop your logo image here' : 'Drag & Drop Logo Image or Click to Browse'}
                          </span>
                          <p className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                            Supports PNG, JPG, WebP, SVG • Auto-converts to 1:1 (512x512) Ultra-Sharp
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* 1:1 Aspect Ratio Preview & Crop Zoom Slider */}
                    {(logoPreviewSrc || tempLogoUrl) && (
                      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-300 flex items-center gap-1.5 font-mono">
                            <Crop className="w-3.5 h-3.5 text-[#FFF000]" />
                            1:1 Aspect Ratio Center-Crop & Zoom
                          </span>
                          <span className="font-mono text-[#FFF000] font-bold">
                            {Math.round(logoCropZoom * 100)}%
                          </span>
                        </div>

                        {/* Interactive Zoom Slider */}
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.05"
                            value={logoCropZoom}
                            onChange={(e) => setLogoCropZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-[#FFF000] h-2 bg-stone-700 rounded-lg cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() => setLogoCropZoom(1.0)}
                            className="text-[11px] px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-white font-mono cursor-pointer"
                          >
                            Reset 1x
                          </button>
                        </div>

                        {/* Side-by-Side 1:1 Square & Circular Preview */}
                        <div className="grid grid-cols-2 gap-4 pt-1 items-center">
                          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 text-center space-y-1.5">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">
                              1:1 Square Crop (512x512)
                            </span>
                            <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden border border-[#FFF000]/40 bg-[#171852] flex items-center justify-center relative shadow-sm">
                              <img
                                src={logoPreviewSrc || tempLogoUrl}
                                alt="1:1 Square Preview"
                                className="w-full h-full object-cover transition-transform select-none"
                                style={{ transform: `scale(${logoCropZoom})` }}
                              />
                            </div>
                          </div>

                          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 text-center space-y-1.5">
                            <span className="text-[10px] font-mono text-stone-400 block uppercase">
                              Circular Emblem Preview
                            </span>
                            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden ring-2 ring-[#FFF000] neon-glow-gold bg-[#171852] flex items-center justify-center relative shadow-sm">
                              <img
                                src={logoPreviewSrc || tempLogoUrl}
                                alt="1:1 Circular Preview"
                                className="w-full h-full object-cover transition-transform select-none"
                                style={{ transform: `scale(${logoCropZoom})` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Or Enter Direct Logo Image URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                          Or Specify Direct Logo Image URL
                        </label>
                        {tempLogoUrl && (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomizer(tempLogoUrl)}
                            className="text-xs text-[#FFF000] hover:text-[#FFF000] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Advanced Studio Customizer</span>
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://your-domain.com/official-logo.png"
                          value={tempLogoUrl}
                          onChange={(e) => {
                            setTempLogoUrl(e.target.value);
                            setLogoPreviewSrc(e.target.value);
                          }}
                          className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                        />
                        {tempLogoUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setTempLogoUrl('');
                              setLogoPreviewSrc('');
                            }}
                            className="px-3 py-2 text-xs text-stone-400 hover:text-white bg-stone-800 rounded-lg cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Institution Title & Tagline update */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          value={tempInstName}
                          onChange={(e) => setTempInstName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                          Tagline / Subtitle
                        </label>
                        <input
                          type="text"
                          value={tempTagline}
                          onChange={(e) => setTempTagline(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white"
                        />
                      </div>
                    </div>

                    {/* Action Buttons: Save Website Logo & Revert to Default */}
                    <div className="pt-3 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleApplyLogo}
                        disabled={isUploadingLogo}
                        className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-[#F5D900]/40 rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 neon-glow-gold disabled:opacity-60"
                      >
                        {isUploadingLogo ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-[#FFF000]" />
                        ) : (
                          <Save className="w-4 h-4 text-[#FFF000]" />
                        )}
                        <span>Save Website Logo</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetToDefaultLogo}
                        disabled={isUploadingLogo}
                        className="px-4 py-2.5 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Revert to Default Logo
                      </button>
                    </div>
                  </div>

                  {/* Right: EXACT HERO SECTION COMPOSITION PREVIEW (Cover Banner + Big Round Logo Overlapping + Title) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-mono font-bold text-stone-300 uppercase">
                        Live Homepage Hero Layout Preview
                      </span>
                      <span className="text-[10px] font-mono text-[#FFF000]">WYSIWYG Simulation</span>
                    </div>

                    {/* Exact Hero Mockup matching User Reference Image */}
                    <div className="bg-[#171852] border-2 border-[#292A86] rounded-2xl overflow-hidden shadow-2xl space-y-0">
                      {/* Top Banner Cover */}
                      <div className="relative w-full h-32 bg-[#0F1035] overflow-hidden">
                        <img
                          src={tempBannerUrl || bannerUrl || '/src/assets/images/campus_main_building_1790434904126.jpg'}
                          alt="Hero Banner Preview"
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#171852] via-[#171852]/50 to-transparent" />
                      </div>

                      {/* Center Overlapping Big Round Logo (Sleek Ultra-Slim Outline) */}
                      <div className="-mt-14 flex justify-center relative z-10 mb-2">
                        <div className="rounded-full shadow-2xl ring-1 ring-[#FFF000]/60 overflow-hidden">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center">
                            {tempLogoUrl ? (
                              <img
                                src={tempLogoUrl}
                                alt="Big Round Logo Preview"
                                className="w-full h-full object-contain select-none"
                              />
                            ) : (
                              <Emblem size="lg" className="!w-full !h-full" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Text Directly Underneath (DAR - E - ARQAM) */}
                      <div className="text-center px-4 pb-4 space-y-1">
                        <div className="font-editorial text-lg font-extrabold text-white leading-tight">
                          {tempInstName}
                        </div>
                        <div className="text-xs font-bold text-[#FFF000] tracking-wide uppercase">
                          {tempTagline}
                        </div>
                        <div className="text-[10px] text-[#EEF0FF]/70 font-mono pt-1 border-t border-white/10 mt-2">
                          Live Hero Section Preview (Matching Reference Composition)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: AUTOMATED SITEMAP.XML GENERATOR FOR SEO CRAWLERS */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#20216B] text-[#FFF000] flex items-center justify-center font-bold text-xs">
                      03
                    </div>
                    <div>
                      <h3 className="font-editorial text-base sm:text-lg font-bold text-white">
                        Automated Sitemap.xml Generator (SEO CRAWLERS)
                      </h3>
                      <p className="text-xs text-stone-400 font-prose-serif">
                        Automatically tracks all institutional portal pages, priorities, and change frequencies, saving the XML sitemap directly to Firebase.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-2.5 py-1 rounded border border-[#292A86] font-bold">
                    Search Engine Indexing
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateSitemap}
                    disabled={isGeneratingSitemap}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-[#F5D900]/40 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Code className="w-4 h-4 text-[#FFF000]" />
                    <span>{isGeneratingSitemap ? 'Generating Sitemap...' : 'Generate & Sync Sitemap to Firebase'}</span>
                  </button>

                  {sitemapXmlContent && (
                    <button
                      type="button"
                      onClick={handleDownloadSitemap}
                      className="px-5 py-2.5 text-xs font-bold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4 text-[#171852]" />
                      <span>Download sitemap.xml</span>
                    </button>
                  )}
                </div>

                {sitemapXmlContent && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono text-stone-300 font-bold block uppercase">
                      Generated sitemap.xml Preview:
                    </span>
                    <pre className="p-3 bg-stone-900 border border-stone-800 rounded-lg text-emerald-400 text-[11px] font-mono overflow-x-auto max-h-56">
                      {sitemapXmlContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PRINCIPAL CUSTOM PHOTO & PROFILE */}
        {/* ========================================================================= */}
        {currentTab === 'leadership' && (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8">
              <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                EXECUTIVE LEADERSHIP & PORTRAIT MANAGEMENT
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white mt-1">
                Principal Custom Photograph & Information
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-2 font-prose-serif max-w-3xl leading-relaxed">
                Upload a custom high-resolution photograph for the School Principal. You can upload an image file directly from your computer or specify a web image link. All changes persist automatically to Firebase and reflect immediately across the homepage and principal's address page.
              </p>
            </div>

            {/* SECTION: PRINCIPAL CUSTOM PHOTO & PROFILE */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#20216B] text-[#FFF000] flex items-center justify-center font-bold text-sm border border-[#292A86]">
                    01
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-white">
                      Principal Custom Portrait & Information
                    </h3>
                    <p className="text-xs text-stone-400 font-prose-serif">
                      Controls the official portrait, name, designation, and welcome address of the School Principal.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#FFF000] bg-[#20216B] px-3 py-1 rounded border border-[#292A86] font-bold self-start sm:self-auto">
                  {principalPhotoUrl ? 'Custom Photo Active' : 'Default Institutional Photo'}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Upload & Controls */}
                <div className="lg:col-span-7 space-y-4">
                  {/* File Upload Box */}
                  <div className="border-2 border-dashed border-stone-700 hover:border-[#F5D900] rounded-xl p-5 text-center transition-colors bg-stone-950/50 relative">
                    <input
                      type="file"
                      id="principal-file-input"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePrincipalFileUpload}
                      disabled={isUploadingPrincipalPhoto}
                      className="hidden"
                    />
                    <label 
                      htmlFor="principal-file-input"
                      className="cursor-pointer block space-y-2"
                    >
                      <div className="w-12 h-12 bg-[#20216B] border border-[#292A86] text-[#FFF000] rounded-full flex items-center justify-center mx-auto shadow-inner">
                        {isUploadingPrincipalPhoto ? (
                          <RefreshCw className="w-5 h-5 animate-spin text-[#FFF000]" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-[#FFF000] hover:underline">
                          {isUploadingPrincipalPhoto ? 'Uploading Principal photo to CDN...' : 'Click to upload Principal custom photo from computer'}
                        </span>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5 font-mono">
                          Square or portrait ratio (PNG, JPG, WebP up to 10MB)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Direct Photo URL */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1">
                      Or Specify Web Photo URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://your-domain.com/principal-photo.jpg"
                        value={tempPrincipalPhoto}
                        onChange={(e) => setTempPrincipalPhoto(e.target.value)}
                        className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPrincipalPhoto}
                        disabled={isUploadingPrincipalPhoto}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#20216B] hover:bg-[#292A86] border border-[#F5D900]/40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5 text-[#FFF000]" />
                        <span>Save Photo</span>
                      </button>
                      {principalPhotoUrl && (
                        <button
                          type="button"
                          onClick={handleResetPrincipalPhoto}
                          className="px-3 py-2 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                          title="Reset to default image"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Principal Details Form */}
                  <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 pt-4">
                    <div className="text-xs font-bold text-[#FFF000] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Principal Identity & Address Details</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                          Principal Full Name
                        </label>
                        <input
                          type="text"
                          value={tempPrincipalName}
                          onChange={(e) => setTempPrincipalName(e.target.value)}
                          placeholder="e.g. Prof. Dr. Abdul Rahman Qureshi"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                          Designation / Title
                        </label>
                        <input
                          type="text"
                          value={tempPrincipalTitle}
                          onChange={(e) => setTempPrincipalTitle(e.target.value)}
                          placeholder="e.g. Principal"
                          className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Academic Qualifications
                      </label>
                      <input
                        type="text"
                        value={tempPrincipalQual}
                        onChange={(e) => setTempPrincipalQual(e.target.value)}
                        placeholder="e.g. Ph.D. in Educational Leadership & Curriculum Design"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Principal Communique / Welcome Quote
                      </label>
                      <textarea
                        rows={3}
                        value={tempPrincipalMsg}
                        onChange={(e) => setTempPrincipalMsg(e.target.value)}
                        placeholder="Official message or quote displayed on homepage and principal page..."
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSavePrincipalDetails}
                      className="px-4 py-2.5 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Save className="w-3.5 h-3.5 text-[#171852]" />
                      <span>Save Principal Profile & Address</span>
                    </button>
                  </div>
                </div>

                {/* Right: Live Principal Portrait Card Preview */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                      Live Principal Portrait Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#FFF000]">Public View</span>
                  </div>

                  <div className="bg-[#171852] border-2 border-[#292A86] rounded-2xl p-6 text-center shadow-xl space-y-4">
                    <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-[#FFF000] shadow-2xl bg-[#EEF0FF]">
                      <img
                        src={tempPrincipalPhoto || principalPhotoUrl || DEFAULT_PRINCIPAL_PHOTO}
                        alt="Principal Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#FFF000] uppercase tracking-wider">
                        {tempPrincipalTitle || 'Principal'}
                      </div>
                      <div className="font-editorial text-lg font-bold text-white">
                        {tempPrincipalName || 'Prof. Dr. Abdul Rahman Qureshi'}
                      </div>
                      <div className="text-xs text-[#EEF0FF]/80 font-mono">
                        {tempPrincipalQual || 'Ph.D. in Educational Leadership & Curriculum Design'}
                      </div>
                    </div>

                    <blockquote className="border-l-2 border-[#FFF000] pl-3 text-[#FFF9B8] text-xs font-prose-serif italic leading-relaxed text-left bg-black/20 p-3 rounded-r-lg">
                      “{tempPrincipalMsg || 'In an age of rapid technological transition, true education is not merely the accumulation of facts, but the disciplined training of the intellect.'}”
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: SOCIAL MEDIA MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'social' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                    INSTITUTIONAL SOCIAL CHANNELS
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Social Media Management & Profiles
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif leading-relaxed">
                    Configure official YouTube, Facebook, and TikTok channels. Enabled profiles instantly appear in the public website header strip.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    for (const [key, platform] of Object.entries(tempSocialMedia)) {
                      if (platform.enabled && platform.url && platform.url.trim() !== '') {
                        try {
                          new URL(platform.url);
                        } catch {
                          showNotification('error', `Invalid URL format for ${key.toUpperCase()}. Please enter a valid URL (e.g. https://...).`);
                          return;
                        }
                      }
                    }
                    await updateSocialMedia(tempSocialMedia);
                    showNotification('success', 'Social media profiles updated and synchronized with public website successfully!');
                  }}
                  className="px-5 py-2.5 bg-[#FFF000] hover:bg-[#F5D900] text-[#171852] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <Save className="w-4 h-4 text-[#171852]" />
                  <span>Save All Social Media Changes</span>
                </button>
              </div>

              {/* Four Cards: YouTube, Facebook, TikTok, WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. YOUTUBE */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-950 text-red-400 border border-red-800/60 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                      <h3 className="font-editorial text-lg font-bold text-white">YouTube</h3>
                    </div>
                    {/* Enable / Disable Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSocialMedia.youtube.enabled}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          youtube: { ...tempSocialMedia.youtube, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                      <span className="ml-2 text-[11px] font-bold text-stone-300">
                        {tempSocialMedia.youtube.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Button Display Name (e.g. YouTube)
                      </label>
                      <input
                        type="text"
                        value={tempSocialMedia.youtube.profileName}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          youtube: { ...tempSocialMedia.youtube, profileName: e.target.value }
                        })}
                        placeholder="YouTube"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Channel URL
                      </label>
                      <input
                        type="url"
                        value={tempSocialMedia.youtube.url}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          youtube: { ...tempSocialMedia.youtube, url: e.target.value }
                        })}
                        placeholder="https://youtube.com/@darearqam"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={tempSocialMedia.youtube.displayOrder}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          youtube: { ...tempSocialMedia.youtube, displayOrder: parseInt(e.target.value) || 1 }
                        })}
                        className="w-24 px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. FACEBOOK */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <h3 className="font-editorial text-lg font-bold text-white">Facebook</h3>
                    </div>
                    {/* Enable / Disable Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSocialMedia.facebook.enabled}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          facebook: { ...tempSocialMedia.facebook, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-[11px] font-bold text-stone-300">
                        {tempSocialMedia.facebook.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Button Display Name (e.g. Facebook)
                      </label>
                      <input
                        type="text"
                        value={tempSocialMedia.facebook.profileName}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          facebook: { ...tempSocialMedia.facebook, profileName: e.target.value }
                        })}
                        placeholder="Facebook"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Page URL
                      </label>
                      <input
                        type="url"
                        value={tempSocialMedia.facebook.url}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          facebook: { ...tempSocialMedia.facebook, url: e.target.value }
                        })}
                        placeholder="https://facebook.com/darearqam"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={tempSocialMedia.facebook.displayOrder}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          facebook: { ...tempSocialMedia.facebook, displayOrder: parseInt(e.target.value) || 2 }
                        })}
                        className="w-24 px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. TIKTOK */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-950 text-pink-400 border border-pink-800/60 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002-.001a2.895 2.895 0 0 1 3.144-4.53v-3.47a6.342 6.342 0 0 0-5.645 5.842.634.634 0 0 0-.014.137v.005a6.344 6.344 0 0 0 10.835 4.485 6.35 6.35 0 0 0 1.848-4.485V8.808a8.196 8.196 0 0 0 4.697 1.458v-3.48a4.776 4.776 0 0 1-1.205-.1z"/>
                        </svg>
                      </div>
                      <h3 className="font-editorial text-lg font-bold text-white">TikTok</h3>
                    </div>
                    {/* Enable / Disable Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSocialMedia.tiktok.enabled}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          tiktok: { ...tempSocialMedia.tiktok, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                      <span className="ml-2 text-[11px] font-bold text-stone-300">
                        {tempSocialMedia.tiktok.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Button Display Name (e.g. TikTok)
                      </label>
                      <input
                        type="text"
                        value={tempSocialMedia.tiktok.profileName}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          tiktok: { ...tempSocialMedia.tiktok, profileName: e.target.value }
                        })}
                        placeholder="TikTok"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Account URL
                      </label>
                      <input
                        type="url"
                        value={tempSocialMedia.tiktok.url}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          tiktok: { ...tempSocialMedia.tiktok, url: e.target.value }
                        })}
                        placeholder="https://tiktok.com/@darearqam"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={tempSocialMedia.tiktok.displayOrder}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          tiktok: { ...tempSocialMedia.tiktok, displayOrder: parseInt(e.target.value) || 3 }
                        })}
                        className="w-24 px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. WHATSAPP */}
                <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <h3 className="font-editorial text-lg font-bold text-white">WhatsApp</h3>
                    </div>
                    {/* Enable / Disable Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tempSocialMedia.whatsapp?.enabled ?? false}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          whatsapp: { 
                            ...(tempSocialMedia.whatsapp || { profileName: 'WhatsApp', url: '', phoneNumber: '', displayOrder: 4 }), 
                            enabled: e.target.checked 
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-[11px] font-bold text-stone-300">
                        {tempSocialMedia.whatsapp?.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Button Display Name (e.g. WhatsApp)
                      </label>
                      <input
                        type="text"
                        value={tempSocialMedia.whatsapp?.profileName || ''}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          whatsapp: { 
                            ...(tempSocialMedia.whatsapp || { url: '', phoneNumber: '', displayOrder: 4, enabled: true }), 
                            profileName: e.target.value 
                          }
                        })}
                        placeholder="WhatsApp"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={tempSocialMedia.whatsapp?.phoneNumber || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const cleanDigits = val.replace(/[^0-9]/g, '');
                          const autoUrl = cleanDigits ? `https://wa.me/${cleanDigits}` : '';
                          setTempSocialMedia({
                            ...tempSocialMedia,
                            whatsapp: { 
                              ...(tempSocialMedia.whatsapp || { profileName: 'WhatsApp', displayOrder: 4, enabled: true }), 
                              phoneNumber: val,
                              url: autoUrl || tempSocialMedia.whatsapp?.url || ''
                            }
                          });
                        }}
                        placeholder="+92 300 1234567"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        WhatsApp Link / Chat URL
                      </label>
                      <input
                        type="url"
                        value={tempSocialMedia.whatsapp?.url || ''}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          whatsapp: { 
                            ...(tempSocialMedia.whatsapp || { profileName: 'WhatsApp', phoneNumber: '', displayOrder: 4, enabled: true }), 
                            url: e.target.value 
                          }
                        })}
                        placeholder="https://wa.me/923001234567"
                        className="w-full px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-300 uppercase mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={tempSocialMedia.whatsapp?.displayOrder ?? 4}
                        onChange={(e) => setTempSocialMedia({
                          ...tempSocialMedia,
                          whatsapp: { 
                            ...(tempSocialMedia.whatsapp || { profileName: 'WhatsApp', url: '', phoneNumber: '', enabled: true }), 
                            displayOrder: parseInt(e.target.value) || 4 
                          }
                        })}
                        className="w-24 px-3 py-2 text-xs border border-stone-700 rounded-lg bg-stone-900 text-white focus:ring-2 focus:ring-[#292A86]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: HOMEPAGE GALLERY SHOWCASE */}
        {/* ========================================================================= */}
        {currentTab === 'gallery' && (
          <HomepageGalleryManager
            onSuccessNotification={(msg) => showNotification('success', msg)}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: NOTICES & CIRCULARS MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                    PUBLIC CIRCULARS & NOTIFICATIONS
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Notice Board Management
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                    Publish, edit, or archive official academic notices, datesheets, and administrative circulars.
                  </p>
                </div>

                <button
                  onClick={openNewNoticeModal}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#20216B] hover:bg-[#292A86] text-white rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue New Notice</span>
                </button>
              </div>

              {/* Notices Table */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Title & Details</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Issue Date</th>
                      <th className="py-3 px-4">Importance</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingNotices ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          Loading institutional notices...
                        </td>
                      </tr>
                    ) : notices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          No circulars found. Click "Issue New Notice" to add one.
                        </td>
                      </tr>
                    ) : (
                      notices.map((n) => (
                        <tr key={n.id} className="hover:bg-stone-800/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[#FFF000] font-medium">
                            {n.refNo}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{n.title}</div>
                            <div className="text-xs text-stone-400 line-clamp-1">{n.summary}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                              {n.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-stone-400 font-mono text-xs">
                            {n.date}
                          </td>
                          <td className="py-3 px-4">
                            {n.isImportant ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                PINNED / URGENT
                              </span>
                            ) : (
                              <span className="text-[#475569] text-[11px] font-mono">Normal</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => openEditNoticeModal(n)}
                              className="p-1.5 text-white/80 hover:text-[#FFF000] hover:bg-[#292A86]/60 rounded transition-colors cursor-pointer"
                              title="Edit Notice"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotice(n.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAMINATION RESULTS MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                    CONTROLLER OF EXAMINATIONS
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                    Examination Results Management
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                    Add and maintain student academic report cards, marks sheets, and grade records searchable by roll number.
                  </p>
                </div>

                <button
                  onClick={openNewResultModal}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#20216B] hover:bg-[#292A86] text-white rounded-lg transition-colors shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Student Result Record</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-[#475569] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Student Name or Roll Number..."
                  value={resultSearchQuery}
                  onChange={(e) => setResultSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white placeholder-stone-500"
                />
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Roll Number</th>
                      <th className="py-3 px-4">Student & Father Name</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Obtained / Total</th>
                      <th className="py-3 px-4">Grade & Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingResults ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          Loading examination records...
                        </td>
                      </tr>
                    ) : resultsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          No results found. Click "Add Student Result Record" to create one.
                        </td>
                      </tr>
                    ) : (
                      resultsList
                        .filter(r => 
                          !resultSearchQuery || 
                          r.studentName?.toLowerCase().includes(resultSearchQuery.toLowerCase()) ||
                          r.rollNumber?.includes(resultSearchQuery)
                        )
                        .map((res) => (
                          <tr key={res.id || res.rollNumber} className="hover:bg-stone-800/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#FFF000]">
                              {res.rollNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{res.studentName}</div>
                              <div className="text-xs text-stone-400">S/O {res.fatherName}</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              {res.className}
                            </td>
                            <td className="py-3 px-4 font-mono text-xs">
                              <span className="font-bold text-white">{res.obtainedMarks}</span> / {res.totalMarks} ({res.percentage}%)
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#20216B] text-[#FFF000] border border-[#292A86]">
                                {res.overallGrade || 'A'} · {res.resultStatus || 'PASS'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-2">
                              <button
                                onClick={() => openEditResultModal(res)}
                                className="p-1.5 text-white/80 hover:text-[#FFF000] hover:bg-[#292A86]/60 rounded transition-colors cursor-pointer"
                                title="Edit Result"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteResult(res.id || res.rollNumber)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded transition-colors cursor-pointer"
                                title="Delete Result"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ADMISSIONS APPLICATIONS REVIEW */}
        {/* ========================================================================= */}
        {currentTab === 'admissions' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                  DIRECTORATE OF ADMISSIONS & ENROLLMENT
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Admissions Applications Management
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  Review applicant dossiers submitted through the online admission portal. Update eligibility and enrollment approvals.
                </p>
              </div>

              {/* Applications List */}
              <div className="overflow-x-auto rounded-lg border border-stone-800">
                <table className="w-full text-left text-xs sm:text-sm text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase text-[11px] font-mono border-b border-stone-800">
                    <tr>
                      <th className="py-3 px-4">Ref Number</th>
                      <th className="py-3 px-4">Candidate & Father</th>
                      <th className="py-3 px-4">Target Class</th>
                      <th className="py-3 px-4">Guardian Contact</th>
                      <th className="py-3 px-4">Application Status</th>
                      <th className="py-3 px-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/60 font-prose-serif">
                    {isLoadingAdmissions ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          Loading admission records...
                        </td>
                      </tr>
                    ) : admissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#475569] font-mono">
                          No admission applications received yet.
                        </td>
                      </tr>
                    ) : (
                      admissions.map((adm) => (
                        <tr key={adm.id} className="hover:bg-stone-800/60 transition-colors">
                          <td className="py-3 px-4 font-mono text-[#FFF000] font-bold">
                            {adm.applicationRef}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{adm.candidateName}</div>
                            <div className="text-xs text-stone-400">{adm.fatherName}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {adm.targetClass}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono">
                            <div>{adm.parentPhone}</div>
                            <div className="text-stone-400 text-[11px]">{adm.parentEmail}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                adm.status === 'APPROVED'
                                  ? 'bg-[#20216B] text-[#FFF000] border border-[#292A86]'
                                  : adm.status === 'REJECTED'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {adm.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={adm.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                await adminUpdateAdmissionStatus(adm.id, newStatus);
                                showNotification('success', `Status updated to ${newStatus}`);
                                await loadAdmissions();
                              }}
                              className="px-2 py-1 text-xs border border-stone-700 bg-stone-950 text-white rounded cursor-pointer font-mono"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="UNDER REVIEW">UNDER REVIEW</option>
                              <option value="INTERVIEW SCHEDULED">INTERVIEW SCHEDULED</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PUBLIC INQUIRIES MANAGEMENT */}
        {/* ========================================================================= */}
        {currentTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                  PUBLIC SECRETARIAT & HELPDESK
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Public Inquiries Management
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  Messages, admissions queries, and institutional correspondence received from the public Contact page.
                </p>
              </div>

              <div className="space-y-3">
                {isLoadingInquiries ? (
                  <div className="p-8 text-center text-[#475569] font-mono text-xs">
                    Loading inquiries...
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="p-8 text-center text-[#475569] font-mono text-xs">
                    No active inquiries in secretariat queue.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div 
                      key={inq.id}
                      className="bg-stone-950 border border-stone-800 rounded-lg p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{inq.name}</span>
                            <span className="text-[11px] font-mono text-[#FFF000] bg-[#20216B] px-2 py-0.5 rounded border border-[#292A86]">
                              {inq.inquiryId}
                            </span>
                          </div>
                          <div className="text-xs text-stone-400 font-mono mt-0.5">
                            {inq.email} · {inq.phone} · Category: <span className="text-stone-300">{inq.category}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-400">Status:</span>
                          <select
                            value={inq.status}
                            onChange={async (e) => {
                              await adminUpdateInquiryStatus(inq.id, e.target.value as InquiryRecord['status']);
                              showNotification('success', 'Inquiry status updated.');
                              await loadInquiries();
                            }}
                            className="px-2 py-1 text-xs border border-stone-700 bg-stone-900 text-white rounded font-mono"
                          >
                            <option value="Received / Pending">Received / Pending</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Replied">Replied</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs text-stone-300 font-prose-serif leading-relaxed">
                        <div className="font-bold text-stone-200 mb-1">{inq.subject}</div>
                        <p>{inq.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY & PASSWORD CHANGE */}
        {/* ========================================================================= */}
        {currentTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto">
              <div>
                <span className="text-[11px] font-mono text-[#FFF000] uppercase tracking-widest font-bold block">
                  EXECUTIVE ACCESS SECURITY
                </span>
                <h2 className="font-editorial text-2xl font-bold text-white mt-1">
                  Change Admin Password
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-prose-serif">
                  You can modify your administrator credentials at any time. Changes take effect immediately for all subsequent login sessions.
                </p>
              </div>

              {/* Active Admin Details Banner */}
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#FFF000] shrink-0" />
                <div>
                  <div className="text-xs text-stone-400">Current Administrator Identity:</div>
                  <div className="font-mono text-sm font-bold text-[#FFF000]">
                    {activeAdminEmail}
                  </div>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password (Default: Hasnainqadir8696)"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    New Administrator Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-stone-700 rounded-lg bg-stone-950 text-white focus:outline-hidden focus:ring-2 focus:ring-[#292A86] font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="w-full py-3 px-6 text-xs sm:text-sm font-semibold text-white bg-[#20216B] hover:bg-[#292A86] text-white rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isChangingPass ? 'Updating Credentials...' : 'Save New Administrator Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* NOTICE MODAL (CREATE / EDIT) */}
      {/* ========================================================================= */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs" 
            onClick={() => setShowNoticeModal(false)} 
          />
          <div className="relative z-10 w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-editorial text-lg font-bold text-white">
                {editingNotice ? 'Edit Institutional Notice' : 'Issue New Official Notice'}
              </h3>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule of Annual Board Examinations 2026"
                  value={noticeFormData.title}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Reference No.</label>
                  <input
                    type="text"
                    required
                    value={noticeFormData.refNo}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, refNo: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={noticeFormData.category}
                    onChange={(e) => setNoticeFormData({ ...noticeFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examination">Examination</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Administrative">Administrative</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Summary (Short Preview)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Brief synopsis for home ticker and list cards"
                  value={noticeFormData.summary}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, summary: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-prose-serif"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Full Circular Text</label>
                <textarea
                  rows={4}
                  placeholder="Full text details of this institutional directive"
                  value={noticeFormData.fullText}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, fullText: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-prose-serif"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notice-important"
                  checked={noticeFormData.isImportant}
                  onChange={(e) => setNoticeFormData({ ...noticeFormData, isImportant: e.target.checked })}
                  className="rounded border-stone-700 text-[#20216B] focus:ring-[#292A86]"
                />
                <label htmlFor="notice-important" className="text-xs text-amber-300 font-medium cursor-pointer">
                  Mark as Pinned / Urgent Notice (Shows alert indicator on home view)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 border border-stone-700 rounded text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#20216B] hover:bg-[#292A86] text-white text-white font-semibold rounded"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESULT MODAL (CREATE / EDIT) */}
      {/* ========================================================================= */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-xs" 
            onClick={() => setShowResultModal(false)} 
          />
          <div className="relative z-10 w-full max-w-lg bg-stone-900 border border-stone-700 rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-editorial text-lg font-bold text-white">
                {editingResult ? 'Edit Examination Result' : 'Add Student Examination Record'}
              </h3>
              <button 
                onClick={() => setShowResultModal(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Muhammad Ali"
                    value={resultFormData.studentName}
                    onChange={(e) => setResultFormData({ ...resultFormData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Father Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Tariq Mehmood"
                    value={resultFormData.fatherName}
                    onChange={(e) => setResultFormData({ ...resultFormData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Roll Number (Search Key)</label>
                  <input
                    type="text"
                    required
                    placeholder="849201"
                    value={resultFormData.rollNumber}
                    onChange={(e) => setResultFormData({ ...resultFormData, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="DA-2026-1001"
                    value={resultFormData.studentId}
                    onChange={(e) => setResultFormData({ ...resultFormData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Class</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.className}
                    onChange={(e) => setResultFormData({ ...resultFormData, className: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.section}
                    onChange={(e) => setResultFormData({ ...resultFormData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    required
                    value={resultFormData.obtainedMarks}
                    onChange={(e) => setResultFormData({ ...resultFormData, obtainedMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={resultFormData.totalMarks}
                    onChange={(e) => setResultFormData({ ...resultFormData, totalMarks: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider mb-1">Overall Grade</label>
                  <input
                    type="text"
                    required
                    value={resultFormData.overallGrade}
                    onChange={(e) => setResultFormData({ ...resultFormData, overallGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider mb-1">Result Status</label>
                <select
                  value={resultFormData.resultStatus}
                  onChange={(e) => setResultFormData({ ...resultFormData, resultStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-stone-700 rounded bg-stone-950 text-white font-mono"
                >
                  <option value="PASS - FIRST DIVISION">PASS - FIRST DIVISION</option>
                  <option value="PASS - SECOND DIVISION">PASS - SECOND DIVISION</option>
                  <option value="FAILED">FAILED</option>
                  <option value="HELD">HELD</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-4 py-2 border border-stone-700 rounded text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#20216B] hover:bg-[#292A86] text-white text-white font-semibold rounded"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Logo Customizer Modal (Zoom, Pan, Rotate, Tilt, Mask, & Direct Cloudinary Upload) */}
      <LogoCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        imageSrc={customizerImageSrc}
        onApplyCroppedLogo={handleApplyCustomizedLogo}
      />
    </div>
  );
};
