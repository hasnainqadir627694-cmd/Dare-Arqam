import React, { useState, useEffect, useRef } from 'react';
import { 
  IdCardTemplate, 
  TemplateFieldKey, 
  TemplateFieldConfig, 
  QrCodeFieldConfig 
} from '../../types';
import { 
  getActiveTemplate, 
  getAllTemplates, 
  subscribeAllTemplates,
  saveTemplate, 
  saveTemplateAndVerify,
  publishTemplate, 
  publishTemplateAndVerify,
  deleteTemplate, 
  uploadTemplateImage, 
  normalizeTemplate,
  verifyIdCardSystemHealth,
  TemplateSaveResult,
  IdCardSystemDiagnostic,
  DEFAULT_TEMPLATE,
  DEFAULT_TEMPLATE_SVG_DATA_URL,
  DEFAULT_BACK_TEMPLATE_SVG_DATA_URL,
  formatClassValue,
  calculateAutoFitFontSize
} from '../../services/idCardTemplateService';
import { 
  IdCard, 
  Upload, 
  Eye, 
  Edit3, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Move, 
  Layers, 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  User, 
  Award, 
  Hash, 
  RotateCcw, 
  Sliders, 
  HelpCircle,
  Maximize2,
  Check,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minus,
  Lock,
  Unlock,
  Scaling,
  Crosshair,
  Circle,
  Square,
  QrCode,
  Copy,
  Printer,
  ChevronRight,
  ArrowLeft as ArrowLeftIcon,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';

interface IdCardTemplateManagerProps {
  onSuccessNotification?: (msg: string) => void;
}

// Demo student records to verify text auto-fitting and formatting across different names
const DEMO_STUDENTS = [
  {
    id: 'demo-1',
    fullName: 'Muhammad Bilal',
    fatherName: 'Ghulam Qadir',
    className: 'Class 6',
    rollNumber: '4892',
    studentId: 'DA-2026-4892',
    profileImageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-2',
    fullName: 'Syeda Fatima Zahra Al-Hussaini',
    fatherName: 'Syed Tariq Mahmood',
    className: 'Class 9',
    rollNumber: '2105',
    studentId: 'DA-2026-2105',
    profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'demo-3',
    fullName: 'Hamza Khan Yousafzai',
    fatherName: 'Muhammad Yousaf Khan',
    className: 'Class 3',
    rollNumber: '1034',
    studentId: 'DA-2026-1034',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
];

// Sample QR image for back-side studio & preview
const DEMO_QR_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" fill="#FFFFFF"/>
  <!-- Standard QR Target Markers -->
  <rect x="20" y="20" width="45" height="45" fill="#000000"/>
  <rect x="25" y="25" width="35" height="35" fill="#FFFFFF"/>
  <rect x="31" y="31" width="23" height="23" fill="#000000"/>
  
  <rect x="135" y="20" width="45" height="45" fill="#000000"/>
  <rect x="140" y="25" width="35" height="35" fill="#FFFFFF"/>
  <rect x="146" y="31" width="23" height="23" fill="#000000"/>
  
  <rect x="20" y="135" width="45" height="45" fill="#000000"/>
  <rect x="25" y="140" width="35" height="35" fill="#FFFFFF"/>
  <rect x="31" y="146" width="23" height="23" fill="#000000"/>
  
  <!-- QR Data Blocks -->
  <rect x="75" y="25" width="12" height="12" fill="#000000"/>
  <rect x="95" y="25" width="12" height="12" fill="#000000"/>
  <rect x="115" y="25" width="12" height="12" fill="#000000"/>
  <rect x="75" y="45" width="12" height="12" fill="#000000"/>
  <rect x="105" y="45" width="12" height="12" fill="#000000"/>
  <rect x="25" y="75" width="12" height="12" fill="#000000"/>
  <rect x="45" y="75" width="12" height="12" fill="#000000"/>
  <rect x="65" y="75" width="12" height="12" fill="#000000"/>
  <rect x="85" y="75" width="30" height="30" fill="#20216B"/>
  <rect x="125" y="75" width="12" height="12" fill="#000000"/>
  <rect x="145" y="75" width="12" height="12" fill="#000000"/>
  <rect x="165" y="75" width="12" height="12" fill="#000000"/>
  <rect x="75" y="115" width="12" height="12" fill="#000000"/>
  <rect x="105" y="115" width="12" height="12" fill="#000000"/>
  <rect x="125" y="115" width="12" height="12" fill="#000000"/>
  <rect x="155" y="115" width="12" height="12" fill="#000000"/>
  <rect x="75" y="135" width="12" height="12" fill="#000000"/>
  <rect x="95" y="135" width="12" height="12" fill="#000000"/>
  <rect x="115" y="135" width="12" height="12" fill="#000000"/>
  <rect x="145" y="135" width="12" height="12" fill="#000000"/>
  <rect x="165" y="135" width="12" height="12" fill="#000000"/>
  <rect x="75" y="155" width="12" height="12" fill="#000000"/>
  <rect x="105" y="155" width="12" height="12" fill="#000000"/>
  <rect x="135" y="155" width="12" height="12" fill="#000000"/>
  <rect x="155" y="155" width="12" height="12" fill="#000000"/>
  <text x="100" y="94" font-family="sans-serif" font-weight="900" font-size="10" fill="#FFF000" text-anchor="middle">DA</text>
</svg>
`)}`;

const FRONT_FIELD_METADATA: Record<TemplateFieldKey, { label: string; icon: React.ReactNode }> = {
  profilePicture: {
    label: 'Profile Picture',
    icon: <User className="w-3.5 h-3.5" />,
  },
  name: {
    label: 'Student Name',
    icon: <Type className="w-3.5 h-3.5" />,
  },
  fatherName: {
    label: "Father's Name",
    icon: <User className="w-3.5 h-3.5" />,
  },
  className: {
    label: 'Class',
    icon: <Award className="w-3.5 h-3.5" />,
  },
  rollNumber: {
    label: 'Roll Number',
    icon: <Hash className="w-3.5 h-3.5" />,
  },
};

const BRAND_COLORS = [
  '#0F1035', // Deep Midnight Navy
  '#20216B', // Institutional Royal Blue
  '#171852', // Dark Indigo
  '#D4AF37', // Academic Gold
  '#F5D900', // Bright Accent Gold
  '#0F172A', // Slate 900
  '#334155', // Slate 700
  '#475569', // Slate 600
  '#FFFFFF', // Pure White
];

export const IdCardTemplateManager: React.FC<IdCardTemplateManagerProps> = ({
  onSuccessNotification,
}) => {
  const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<IdCardTemplate>(DEFAULT_TEMPLATE);
  const [editingTemplate, setEditingTemplate] = useState<IdCardTemplate>(DEFAULT_TEMPLATE);
  
  // Workspace UI states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeEditorSide, setActiveEditorSide] = useState<'front' | 'back'>('front');
  const [editorMode, setEditorMode] = useState<'canvas' | 'preview'>('canvas');
  const [selectedFrontField, setSelectedFrontField] = useState<TemplateFieldKey>('name');
  
  // Preview modal state
  const [previewTemplate, setPreviewTemplate] = useState<IdCardTemplate | null>(null);
  const [previewSide, setPreviewSide] = useState<'front' | 'back' | 'both'>('both');
  const [demoStudentIndex, setDemoStudentIndex] = useState(0);

  // Uploading / Saving / Deleting states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetSide, setUploadTargetSide] = useState<'front' | 'back'>('front');
  const [uploadStageText, setUploadStageText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Deletion Confirmation Modal state
  const [templateToDelete, setTemplateToDelete] = useState<IdCardTemplate | null>(null);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);

  // Canvas DOM refs for front dragging & resizing
  const frontCanvasRef = useRef<HTMLDivElement | null>(null);
  const isDraggingFrontRef = useRef(false);
  const dragFrontFieldRef = useRef<TemplateFieldKey | null>(null);
  const dragFrontStartPosRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const isResizingFrontRef = useRef(false);
  const resizeFrontFieldRef = useRef<TemplateFieldKey | null>(null);
  const resizeFrontStartPosRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startW: 0,
    startH: 0,
  });

  // Canvas DOM refs for back QR dragging & resizing
  const backCanvasRef = useRef<HTMLDivElement | null>(null);
  const isDraggingBackQrRef = useRef(false);
  const dragBackQrStartPosRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const isResizingBackQrRef = useRef(false);
  const resizeBackQrStartPosRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startW: 0,
    startH: 0,
  });

  // Photo aspect ratio lock
  const [lockPhotoRatio, setLockPhotoRatio] = useState<boolean>(true);

  // Hidden file inputs
  const frontFileInputRef = useRef<HTMLInputElement | null>(null);
  const backFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load & subscribe to templates on mount
  useEffect(() => {
    let isMounted = true;
    const unsub = subscribeAllTemplates((list) => {
      if (isMounted) {
        setTemplates(list);
        const active = list.find((t) => t.isActive) || list[0] || DEFAULT_TEMPLATE;
        setActiveTemplate(active);
      }
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    if (type === 'success' && onSuccessNotification) {
      onSuccessNotification(text);
    }
    setTimeout(() => setFeedback(null), 4500);
  };

  // Open the editor to create a new template
  const handleAddNewTemplate = () => {
    const newTemplate: IdCardTemplate = {
      id: `tpl_${Date.now()}`,
      name: `Academic ID Template ${templates.length + 1}`,
      templateUrl: DEFAULT_TEMPLATE_SVG_DATA_URL,
      frontTemplateUrl: DEFAULT_TEMPLATE_SVG_DATA_URL,
      backTemplateUrl: DEFAULT_BACK_TEMPLATE_SVG_DATA_URL,
      aspectRatio: 600 / 960,
      originalWidth: 600,
      originalHeight: 960,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: JSON.parse(JSON.stringify(DEFAULT_TEMPLATE.fields)),
      frontFields: JSON.parse(JSON.stringify(DEFAULT_TEMPLATE.frontFields || DEFAULT_TEMPLATE.fields)),
      backFields: JSON.parse(JSON.stringify(DEFAULT_TEMPLATE.backFields || {
        qrCode: {
          x: 22.5,
          y: 25.0,
          width: 55.0,
          height: 34.375,
          quietZone: 8,
          borderRadius: 16,
          borderColor: '#D4AF37',
          borderWidth: 2,
          showLabel: true,
          label: 'SCAN TO VERIFY STUDENT',
          visible: true,
        },
      })),
    };

    setEditingTemplate(newTemplate);
    setActiveEditorSide('front');
    setEditorMode('canvas');
    setSelectedFrontField('name');
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open the editor for an existing template
  const handleEditTemplate = (tpl: IdCardTemplate) => {
    const normalized = normalizeTemplate(tpl);
    setEditingTemplate(JSON.parse(JSON.stringify(normalized)));
    setActiveEditorSide('front');
    setEditorMode('canvas');
    setSelectedFrontField('name');
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Diagnostic States
  const [saveDiagnosticInfo, setSaveDiagnosticInfo] = useState<TemplateSaveResult | null>(null);
  const [systemHealthDiagnostic, setSystemHealthDiagnostic] = useState<IdCardSystemDiagnostic | null>(null);

  // Set as Active template
  const handleSetActive = async (tpl: IdCardTemplate) => {
    try {
      showNotification('info', `Activating template "${tpl.name}" in Firestore...`);
      const res = await publishTemplateAndVerify(tpl.id);
      showNotification('success', `Template "${res.activeName}" is now verified as ACTIVE in Firestore!`);
    } catch (err: any) {
      showNotification('error', `Failed to set active template: ${err.message || err}`);
    }
  };

  // Run System Persistence Health Diagnostic
  const handleRunDiagnostic = async () => {
    showNotification('info', 'Running live Firestore persistence & template health diagnostic...');
    try {
      const result = await verifyIdCardSystemHealth();
      setSystemHealthDiagnostic(result);
      showNotification('success', `Diagnostic Complete: ${result.allTemplatesCount} template(s) verified in Firestore.`);
    } catch (err: any) {
      showNotification('error', `Diagnostic Error: ${err.message || err}`);
    }
  };

  // Prompt template deletion modal
  const handlePromptDelete = (tpl: IdCardTemplate) => {
    if (tpl.id === DEFAULT_TEMPLATE.id) {
      showNotification('error', 'The default institutional system template cannot be deleted.');
      return;
    }
    setTemplateToDelete(tpl);
  };

  // Execute confirmed template deletion
  const executeDeleteTemplate = async () => {
    if (!templateToDelete) return;
    setIsDeletingTemplate(true);
    try {
      showNotification('info', `Deleting template "${templateToDelete.name}" from Firestore...`);
      await deleteTemplate(templateToDelete.id);
      showNotification('success', `Template "${templateToDelete.name}" was permanently deleted.`);
      if (isEditorOpen && editingTemplate.id === templateToDelete.id) {
        setIsEditorOpen(false);
      }
      setTemplateToDelete(null);
    } catch (err: any) {
      console.error('Delete template error:', err);
      showNotification('error', `Delete failed: ${err?.message || err}`);
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  // Upload Front Side or Back Side Template Image
  const handleUploadSideImage = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    setIsUploading(true);
    setUploadTargetSide(side);
    setUploadStageText(`Processing ${side} template image dimensions...`);

    try {
      const uploadRes = await uploadTemplateImage(file, (stage) => {
        if (stage === 'uploading') {
          setUploadStageText(`Uploading ${side} template to Cloudinary CDN...`);
        } else if (stage === 'completed') {
          setUploadStageText('Finalizing image canvas...');
        }
      });

      setEditingTemplate((prev) => {
        const copy = { ...prev };
        if (side === 'front') {
          copy.templateUrl = uploadRes.url;
          copy.frontTemplateUrl = uploadRes.url;
          copy.aspectRatio = uploadRes.aspectRatio || 0.625;
          copy.originalWidth = uploadRes.width;
          copy.originalHeight = uploadRes.height;
        } else {
          copy.backTemplateUrl = uploadRes.url;
        }
        copy.updatedAt = new Date().toISOString();
        return copy;
      });

      showNotification('success', `${side === 'front' ? 'Front' : 'Back'} side template image uploaded successfully!`);
    } catch (err: any) {
      console.error(`${side} template upload error:`, err);
      showNotification('error', err?.message || `Failed to upload ${side} template image.`);
    } finally {
      setIsUploading(false);
      setUploadStageText('');
      if (e.target) e.target.value = '';
    }
  };

  // Reset back template to default institutional SVG
  const handleResetBackToDefaultSvg = () => {
    setEditingTemplate((prev) => ({
      ...prev,
      backTemplateUrl: DEFAULT_BACK_TEMPLATE_SVG_DATA_URL,
    }));
    showNotification('info', 'Back template reset to Institutional Dar-e-Arqam backdrop.');
  };

  // -------------------------------------------------------------
  // FRONT FIELD DRAGGING & RESIZING
  // -------------------------------------------------------------
  const handleFrontFieldMouseDown = (e: React.MouseEvent, fieldKey: TemplateFieldKey) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedFrontField(fieldKey);
    isDraggingFrontRef.current = true;
    dragFrontFieldRef.current = fieldKey;

    const currentConfig = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];
    dragFrontStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentConfig.x,
      startY: currentConfig.y,
    };

    window.addEventListener('mousemove', handleFrontWindowMouseMove);
    window.addEventListener('mouseup', handleFrontWindowMouseUp);
  };

  const handleFrontWindowMouseMove = (e: MouseEvent) => {
    if (!isDraggingFrontRef.current || !dragFrontFieldRef.current || !frontCanvasRef.current) return;
    const canvasRect = frontCanvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaX = ((e.clientX - dragFrontStartPosRef.current.mouseX) / canvasRect.width) * 100;
    const deltaY = ((e.clientY - dragFrontStartPosRef.current.mouseY) / canvasRect.height) * 100;

    const fieldKey = dragFrontFieldRef.current;
    const fieldConfig = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];
    const newX = Math.max(0, Math.min(100 - fieldConfig.width, dragFrontStartPosRef.current.startX + deltaX));
    const newY = Math.max(0, Math.min(100 - fieldConfig.height, dragFrontStartPosRef.current.startY + deltaY));

    setEditingTemplate((prev) => {
      const copy = { ...prev };
      const currentFields = { ...(copy.frontFields || copy.fields) };
      currentFields[fieldKey] = {
        ...currentFields[fieldKey],
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      };
      copy.fields = currentFields;
      copy.frontFields = currentFields;
      return copy;
    });
  };

  const handleFrontWindowMouseUp = () => {
    isDraggingFrontRef.current = false;
    dragFrontFieldRef.current = null;
    window.removeEventListener('mousemove', handleFrontWindowMouseMove);
    window.removeEventListener('mouseup', handleFrontWindowMouseUp);
  };

  const handleFrontResizeMouseDown = (e: React.MouseEvent, fieldKey: TemplateFieldKey) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedFrontField(fieldKey);
    isResizingFrontRef.current = true;
    resizeFrontFieldRef.current = fieldKey;

    const currentConfig = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];
    resizeFrontStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: currentConfig.width,
      startH: currentConfig.height,
    };

    window.addEventListener('mousemove', handleFrontWindowResizeMouseMove);
    window.addEventListener('mouseup', handleFrontWindowResizeMouseUp);
  };

  const handleFrontWindowResizeMouseMove = (e: MouseEvent) => {
    if (!isResizingFrontRef.current || !resizeFrontFieldRef.current || !frontCanvasRef.current) return;
    const canvasRect = frontCanvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaW = ((e.clientX - resizeFrontStartPosRef.current.mouseX) / canvasRect.width) * 100;
    const deltaH = ((e.clientY - resizeFrontStartPosRef.current.mouseY) / canvasRect.height) * 100;

    const fieldKey = resizeFrontFieldRef.current;
    const currentConfig = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];

    let newW = Math.max(8, Math.min(100 - currentConfig.x, resizeFrontStartPosRef.current.startW + deltaW));
    let newH = Math.max(3, Math.min(100 - currentConfig.y, resizeFrontStartPosRef.current.startH + deltaH));

    if (fieldKey === 'profilePicture' && (lockPhotoRatio || currentConfig.shape === 'circle' || currentConfig.shape === 'square' || currentConfig.shape === 'rounded')) {
      const cardAspectRatio = editingTemplate.aspectRatio || 0.625;
      newH = (currentConfig.shape === 'circle' || currentConfig.shape === 'square' || currentConfig.shape === 'rounded') 
        ? newW * cardAspectRatio 
        : newW * (1.15 * cardAspectRatio);
      newH = Math.min(100 - currentConfig.y, newH);
    }

    setEditingTemplate((prev) => {
      const copy = { ...prev };
      const currentFields = { ...(copy.frontFields || copy.fields) };
      currentFields[fieldKey] = {
        ...currentFields[fieldKey],
        width: Math.round(newW * 10) / 10,
        height: Math.round(newH * 10) / 10,
      };
      copy.fields = currentFields;
      copy.frontFields = currentFields;
      return copy;
    });
  };

  const handleFrontWindowResizeMouseUp = () => {
    isResizingFrontRef.current = false;
    resizeFrontFieldRef.current = null;
    window.removeEventListener('mousemove', handleFrontWindowResizeMouseMove);
    window.removeEventListener('mouseup', handleFrontWindowResizeMouseUp);
  };

  // -------------------------------------------------------------
  // BACK QR DRAGGING & RESIZING
  // -------------------------------------------------------------
  const handleBackQrMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDraggingBackQrRef.current = true;

    const currentQr = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
    dragBackQrStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: currentQr.x,
      startY: currentQr.y,
    };

    window.addEventListener('mousemove', handleBackQrWindowMouseMove);
    window.addEventListener('mouseup', handleBackQrWindowMouseUp);
  };

  const handleBackQrWindowMouseMove = (e: MouseEvent) => {
    if (!isDraggingBackQrRef.current || !backCanvasRef.current) return;
    const canvasRect = backCanvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaX = ((e.clientX - dragBackQrStartPosRef.current.mouseX) / canvasRect.width) * 100;
    const deltaY = ((e.clientY - dragBackQrStartPosRef.current.mouseY) / canvasRect.height) * 100;

    const currentQr = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
    const newX = Math.max(0, Math.min(100 - currentQr.width, dragBackQrStartPosRef.current.startX + deltaX));
    const newY = Math.max(0, Math.min(100 - currentQr.height, dragBackQrStartPosRef.current.startY + deltaY));

    setEditingTemplate((prev) => ({
      ...prev,
      backFields: {
        ...prev.backFields,
        qrCode: {
          ...(prev.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode),
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        },
      },
    }));
  };

  const handleBackQrWindowMouseUp = () => {
    isDraggingBackQrRef.current = false;
    window.removeEventListener('mousemove', handleBackQrWindowMouseMove);
    window.removeEventListener('mouseup', handleBackQrWindowMouseUp);
  };

  const handleBackQrResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isResizingBackQrRef.current = true;

    const currentQr = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
    resizeBackQrStartPosRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: currentQr.width,
      startH: currentQr.height,
    };

    window.addEventListener('mousemove', handleBackQrResizeWindowMouseMove);
    window.addEventListener('mouseup', handleBackQrResizeWindowMouseUp);
  };

  const handleBackQrResizeWindowMouseMove = (e: MouseEvent) => {
    if (!isResizingBackQrRef.current || !backCanvasRef.current) return;
    const canvasRect = backCanvasRef.current.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;

    const deltaW = ((e.clientX - resizeBackQrStartPosRef.current.mouseX) / canvasRect.width) * 100;
    const currentQr = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;

    const newW = Math.max(15, Math.min(100 - currentQr.x, resizeBackQrStartPosRef.current.startW + deltaW));
    const cardAspect = editingTemplate.aspectRatio || 0.625;
    const newH = Math.min(100 - currentQr.y, newW * cardAspect);

    setEditingTemplate((prev) => ({
      ...prev,
      backFields: {
        ...prev.backFields,
        qrCode: {
          ...(prev.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode),
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        },
      },
    }));
  };

  const handleBackQrResizeWindowMouseUp = () => {
    isResizingBackQrRef.current = false;
    window.removeEventListener('mousemove', handleBackQrResizeWindowMouseMove);
    window.removeEventListener('mouseup', handleBackQrResizeWindowMouseUp);
  };

  // Update front field configuration
  const updateFrontFieldProp = <K extends keyof TemplateFieldConfig>(
    fieldKey: TemplateFieldKey,
    prop: K,
    value: TemplateFieldConfig[K]
  ) => {
    setEditingTemplate((prev) => {
      const copy = { ...prev };
      const currentFields = { ...(copy.frontFields || copy.fields) };
      currentFields[fieldKey] = {
        ...currentFields[fieldKey],
        [prop]: value,
      };
      copy.fields = currentFields;
      copy.frontFields = currentFields;
      return copy;
    });
  };

  // Update back QR configuration
  const updateBackQrProp = <K extends keyof QrCodeFieldConfig>(
    prop: K,
    value: QrCodeFieldConfig[K]
  ) => {
    setEditingTemplate((prev) => ({
      ...prev,
      backFields: {
        ...prev.backFields,
        qrCode: {
          ...(prev.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode),
          [prop]: value,
        },
      },
    }));
  };

  // Nudge front field position
  const nudgeFrontField = (fieldKey: TemplateFieldKey, dx: number, dy: number) => {
    const currentConfig = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];
    const newX = Math.max(0, Math.min(100 - currentConfig.width, currentConfig.x + dx));
    const newY = Math.max(0, Math.min(100 - currentConfig.height, currentConfig.y + dy));
    updateFrontFieldProp(fieldKey, 'x', Math.round(newX * 10) / 10);
    updateFrontFieldProp(fieldKey, 'y', Math.round(newY * 10) / 10);
  };

  // Nudge back QR position
  const nudgeBackQr = (dx: number, dy: number) => {
    const currentQr = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
    const newX = Math.max(0, Math.min(100 - currentQr.width, currentQr.x + dx));
    const newY = Math.max(0, Math.min(100 - currentQr.height, currentQr.y + dy));
    updateBackQrProp('x', Math.round(newX * 10) / 10);
    updateBackQrProp('y', Math.round(newY * 10) / 10);
  };

  // Save template
  const handleSaveTemplate = async (publishAsActive = false) => {
    if (!editingTemplate.name.trim()) {
      showNotification('error', 'Please enter a name for this ID Card template.');
      return;
    }

    const shouldPublish = publishAsActive;

    setIsSaving(true);
    try {
      showNotification('info', 'Uploading template media and persisting configuration to Firestore...');
      
      const saveResult = await saveTemplateAndVerify(editingTemplate, shouldPublish);
      setSaveDiagnosticInfo(saveResult);

      showNotification(
        'success',
        `Template "${saveResult.templateName}" saved successfully & verified in Firestore!`
      );
      setIsEditorOpen(false);
    } catch (err: any) {
      console.error('Error saving template:', err);
      showNotification('error', `Save failed: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedFrontConfig = (editingTemplate.frontFields || editingTemplate.fields)[selectedFrontField];
  const backQrConfig = editingTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
  const currentDemo = DEMO_STUDENTS[demoStudentIndex];

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for Front and Back side uploads */}
      <input
        ref={frontFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => handleUploadSideImage(e, 'front')}
      />
      <input
        ref={backFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
        onChange={(e) => handleUploadSideImage(e, 'back')}
      />

      {/* Top Banner Alert Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono font-bold animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500'
              : feedback.type === 'error'
              ? 'bg-rose-950/80 text-rose-200 border-rose-500'
              : 'bg-cyan-950/80 text-cyan-200 border-cyan-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {feedback.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {feedback.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save Diagnostic Verification Card */}
      {saveDiagnosticInfo && (
        <div className="p-4 bg-[#0F1426] border-2 border-[#D4AF37] rounded-xl text-white space-y-2.5 font-mono text-xs shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#263352] pb-2">
            <div className="flex items-center gap-2 text-[#FFF000] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#FFF000]" />
              <span>FIRESTORE READ-BACK PERSISTENCE VERIFIED</span>
            </div>
            <button 
              type="button"
              onClick={() => setSaveDiagnosticInfo(null)}
              className="p-1 text-stone-400 hover:text-white text-xs cursor-pointer rounded-md hover:bg-[#20216B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] pt-1">
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Template Name:</span>
              <span className="text-white font-bold">{saveDiagnosticInfo.templateName}</span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Firestore Document ID:</span>
              <span className="text-[#38BDF8] font-bold break-all">{saveDiagnosticInfo.templateId}</span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Active Status:</span>
              <span className={saveDiagnosticInfo.isActive ? 'text-emerald-400 font-bold' : 'text-stone-300'}>
                {saveDiagnosticInfo.isActive ? 'ACTIVE (Student Portal Synced)' : 'INACTIVE'}
              </span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Read-Back Persistence:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                VERIFIED SUCCESS
              </span>
            </div>
          </div>
          <div className="text-[10px] text-stone-400 border-t border-[#263352]/60 pt-2 flex flex-wrap justify-between gap-2">
            <span>Front CDN: {saveDiagnosticInfo.frontUrl ? 'Cloudinary Verified' : 'Default Asset'}</span>
            <span>Back CDN: {saveDiagnosticInfo.backUrl ? 'Cloudinary Verified' : 'Default Asset'}</span>
            <span>Verified At: {saveDiagnosticInfo.updatedAt}</span>
          </div>
        </div>
      )}

      {/* System Health Diagnostic Card */}
      {systemHealthDiagnostic && (
        <div className="p-4 bg-[#0A0D1A] border-2 border-[#38BDF8] rounded-xl text-white space-y-3 font-mono text-xs shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#263352] pb-2">
            <div className="flex items-center gap-2 text-[#38BDF8] font-bold text-sm">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span>ID CARD SYSTEM PERSISTENCE & HEALTH DIAGNOSTIC REPORT</span>
            </div>
            <button 
              type="button"
              onClick={() => setSystemHealthDiagnostic(null)}
              className="p-1 text-stone-400 hover:text-white text-xs cursor-pointer rounded-md hover:bg-[#20216B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Firebase Auth SDK:</span>
              <span className={systemHealthDiagnostic.firebaseInitialized ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {systemHealthDiagnostic.firebaseInitialized ? 'INITIALIZED' : 'FAILED'}
              </span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Firestore Read/Write:</span>
              <span className={systemHealthDiagnostic.firestoreConnected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {systemHealthDiagnostic.firestoreConnected ? `CONNECTED (${systemHealthDiagnostic.allTemplatesCount} templates)` : 'DISCONNECTED'}
              </span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Active Template ID:</span>
              <span className="text-[#38BDF8] font-bold break-all">
                {systemHealthDiagnostic.activeTemplateId || 'None'}
              </span>
            </div>
            <div className="bg-[#14192D] p-2.5 rounded-lg border border-[#243050]">
              <span className="text-stone-400 block text-[10px]">Media CDNs:</span>
              <span className="text-amber-300 font-bold">
                Front: {systemHealthDiagnostic.frontImageValid ? 'OK' : 'MISSING'} · Back: {systemHealthDiagnostic.backImageValid ? 'OK' : 'MISSING'}
              </span>
            </div>
          </div>
          <div className="bg-[#14192D] p-3 rounded-lg border border-[#243050] space-y-1 text-[10.5px]">
            <span className="text-[#38BDF8] font-bold block border-b border-[#243050] pb-1">Diagnostic Log Events:</span>
            {systemHealthDiagnostic.details.map((log, idx) => (
              <div key={idx} className="text-stone-300 flex items-center gap-1.5">
                <span className="text-stone-500">•</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: TEMPLATE LIBRARY REPOSITORY (When editor is closed) */}
      {/* ========================================================================= */}
      {!isEditorOpen && (
        <div className="space-y-6">
          {/* Main Header Banner */}
          <div className="bg-gradient-to-r from-[#0F1426] via-[#141B35] to-[#1C244B] border-2 border-[#20216B] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 text-white">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 shadow-xs">
                <IdCard className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>STUDENT ID CARD TEMPLATE REPOSITORY</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-tight">
                ID Card Template Library & Studio
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 font-prose-serif leading-relaxed">
                Design and manage official dual-sided ID Card templates. Customize front student fields and back permanent QR Code placement. One active template automatically renders for all enrolled students.
              </p>
            </div>

            {/* + Add New Card Template CTA Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleAddNewTemplate}
                className="px-5 py-3 bg-gradient-to-r from-[#20216B] via-[#2A2C85] to-[#D4AF37] hover:from-[#171852] hover:to-[#FFF000] text-[#FFF000] hover:text-[#0F1035] font-bold text-xs sm:text-sm font-mono rounded-xl shadow-lg border border-[#FFF000]/60 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Card Template</span>
              </button>
            </div>
          </div>

          {/* Library Summary Stats Pill */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#14192D] border border-[#243050] rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#20216B] text-[#FFF000]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Templates</span>
                <span className="text-lg font-bold text-white font-editorial">{templates.length} Saved in Library</span>
              </div>
            </div>

            <div className="bg-[#14192D] border border-[#243050] rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Active Student Template</span>
                <span className="text-xs font-bold text-emerald-300 font-mono truncate block" title={activeTemplate.name}>
                  {activeTemplate.name}
                </span>
              </div>
            </div>

            <div className="bg-[#14192D] border border-[#243050] rounded-xl p-3.5 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#1C2546] text-[#D4AF37] border border-[#D4AF37]/40">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Dual-Sided Support</span>
                <span className="text-xs font-bold text-amber-200 font-mono">Front & Back QR Synchronized</span>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => {
              const isCurrentActive = tpl.id === activeTemplate.id;
              const formattedDate = tpl.updatedAt 
                ? new Date(tpl.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              return (
                <div
                  key={tpl.id}
                  className={`bg-[#14192D] border-2 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all group ${
                    isCurrentActive
                      ? 'border-[#D4AF37] ring-2 ring-[#FFF000]/20 bg-[#161D38]'
                      : 'border-[#263352] hover:border-[#384A74]'
                  }`}
                >
                  {/* Top Header: Name & Status */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formattedDate}</span>
                      </span>

                      {isCurrentActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ACTIVE CARD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#1C2546] text-slate-400 border border-[#2D3A5D]">
                          INACTIVE
                        </span>
                      )}
                    </div>

                    <h3 className="font-editorial text-base font-bold text-white group-hover:text-[#FFF000] transition-colors truncate" title={tpl.name}>
                      {tpl.name}
                    </h3>
                  </div>

                  {/* Split Visual Preview (Front + Back Mini Thumbnails) */}
                  <div className="bg-[#0B0E1B] p-2.5 rounded-xl border border-[#243050] flex items-center justify-center gap-3">
                    {/* Front Mini Preview */}
                    <div className="flex-1 flex flex-col items-center space-y-1">
                      <div 
                        className="relative w-full rounded-lg overflow-hidden border border-[#D4AF37]/50 shadow-md bg-white max-w-[120px]"
                        style={{ aspectRatio: `${tpl.aspectRatio || 0.625}` }}
                      >
                        <img
                          src={tpl.frontTemplateUrl || tpl.templateUrl || DEFAULT_TEMPLATE_SVG_DATA_URL}
                          alt="Front"
                          className="w-full h-full object-cover block"
                        />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">FRONT SIDE</span>
                    </div>

                    {/* Back Mini Preview */}
                    <div className="flex-1 flex flex-col items-center space-y-1">
                      <div 
                        className="relative w-full rounded-lg overflow-hidden border border-[#D4AF37]/50 shadow-md bg-[#0F1426] max-w-[120px]"
                        style={{ aspectRatio: `${tpl.aspectRatio || 0.625}` }}
                      >
                        <img
                          src={tpl.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL}
                          alt="Back"
                          className="w-full h-full object-cover block"
                        />
                        {/* QR Placeholder Icon Indicator */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="p-1 rounded bg-white shadow-xs border border-[#D4AF37]">
                            <QrCode className="w-3.5 h-3.5 text-black" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">BACK (QR CODE)</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="space-y-2 pt-2 border-t border-[#1F2B48]">
                    {/* Primary Edit Button */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewTemplate(tpl);
                          setPreviewSide('both');
                        }}
                        className="py-2 px-3 bg-[#1B233D] hover:bg-[#263156] text-stone-200 text-xs font-mono font-bold rounded-lg border border-[#2D3A5D] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditTemplate(tpl)}
                        className="py-2 px-3 bg-[#20216B] hover:bg-[#2C2E85] text-[#FFF000] text-xs font-mono font-bold rounded-lg border border-[#D4AF37]/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Studio</span>
                      </button>
                    </div>

                    {/* Secondary Actions: Set Active / Delete */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {!isCurrentActive ? (
                        <button
                          type="button"
                          onClick={() => handleSetActive(tpl)}
                          className="flex-1 py-1.5 px-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-[11px] font-mono font-bold rounded-lg border border-emerald-600/60 flex items-center justify-center gap-1 transition-all cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Set as Active</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-1.5 px-2 bg-emerald-950/40 text-emerald-400 text-[10px] font-mono font-bold rounded-lg border border-emerald-700/40 text-center">
                          Currently Active for All Students
                        </div>
                      )}

                      {tpl.id !== DEFAULT_TEMPLATE.id && (
                        <button
                          type="button"
                          onClick={() => handlePromptDelete(tpl)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                          title="Delete Template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TEMPLATE CREATION & EDITING STUDIO WORKSPACE */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="space-y-6">
          {/* Top Sticky Studio Navigation Bar */}
          <div className="bg-[#0F1426] border-2 border-[#20216B] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl bg-[#171D36] hover:bg-[#20274A] text-slate-300 hover:text-white border border-[#2B385C] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
              >
                <ArrowLeftIcon className="w-4 h-4 text-[#FFF000]" />
                <span className="hidden sm:inline">Library</span>
              </button>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#FFF000] font-bold block">
                  DUAL-SIDED TEMPLATE STUDIO WORKSPACE
                </span>
                <input
                  type="text"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-[#171D36] border border-[#2B385C] focus:border-[#D4AF37] px-3 py-1 text-sm sm:text-base font-bold font-editorial text-white rounded-lg outline-none w-full max-w-sm"
                  placeholder="Template Name..."
                />
              </div>
            </div>

            {/* Center: Side Selector Tabs (FRONT vs BACK) */}
            <div className="flex items-center gap-2">
              <div className="inline-flex p-1 bg-[#171D36] rounded-xl border border-[#2B385C]">
                <button
                  type="button"
                  onClick={() => setActiveEditorSide('front')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeEditorSide === 'front'
                      ? 'bg-[#20216B] text-[#FFF000] shadow-md border border-[#D4AF37]/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>FRONT SIDE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveEditorSide('back')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeEditorSide === 'back'
                      ? 'bg-[#20216B] text-[#FFF000] shadow-md border border-[#D4AF37]/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>BACK (QR CODE)</span>
                </button>
              </div>

              {/* View Mode: Drag Canvas vs Live Demo Preview */}
              <div className="inline-flex p-1 bg-[#171D36] rounded-xl border border-[#2B385C]">
                <button
                  type="button"
                  onClick={() => setEditorMode('canvas')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    editorMode === 'canvas'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Interactive Field Placement"
                >
                  <Move className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('preview')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    editorMode === 'preview'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Live Demo Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Save & Delete Action Buttons */}
            <div className="flex items-center gap-2">
              {editingTemplate.id !== DEFAULT_TEMPLATE.id && (
                <button
                  type="button"
                  onClick={() => handlePromptDelete(editingTemplate)}
                  disabled={isSaving || isDeletingTemplate}
                  className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 disabled:opacity-50 text-rose-300 text-xs font-mono font-bold rounded-xl border border-rose-700/60 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSaveTemplate(false)}
                disabled={isSaving}
                className="px-3.5 py-2 bg-[#1B233D] hover:bg-[#253052] disabled:opacity-50 text-stone-200 text-xs font-mono font-bold rounded-xl border border-[#2D3A5D] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveTemplate(true)}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-[#20216B] to-[#2C2E85] hover:from-[#171852] hover:to-[#20216B] disabled:opacity-50 text-[#FFF000] text-xs font-mono font-bold rounded-xl border border-[#D4AF37] shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FFF000]" />
                )}
                <span>Save & Set Active</span>
              </button>
            </div>
          </div>

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-3 bg-[#20216B] border border-[#D4AF37] rounded-xl text-center font-mono text-xs text-[#FFF000] flex items-center justify-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{uploadStageText}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STUDIO TAB A: FRONT SIDE EDITOR */}
          {/* ========================================================================= */}
          {activeEditorSide === 'front' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Front Canvas Stage */}
              <div className="lg:col-span-7 bg-[#0B0E1B] border-2 border-[#20216B] rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-4">
                
                {/* Stage Header Controls */}
                <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-white font-bold">FRONT SIDE CANVAS</span>
                    <span>(Aspect: {(editingTemplate.aspectRatio || 0.625).toFixed(3)})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => frontFileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-[#20216B] hover:bg-[#2C2E85] text-[#FFF000] rounded-lg text-[11px] font-bold flex items-center gap-1 border border-[#D4AF37]/40 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Front Image</span>
                  </button>
                </div>

                {/* Interactive Drag Canvas */}
                <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto">
                  <div
                    ref={frontCanvasRef}
                    className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-[#20216B] select-none bg-white transition-all"
                    style={{ aspectRatio: `${editingTemplate.aspectRatio || 0.625}` }}
                  >
                    {/* Background Front Image */}
                    <img
                      src={editingTemplate.frontTemplateUrl || editingTemplate.templateUrl || DEFAULT_TEMPLATE_SVG_DATA_URL}
                      alt="Front Card Template"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Canvas Drag Fields (Only 5 student fields) */}
                    {(['profilePicture', 'name', 'fatherName', 'className', 'rollNumber'] as TemplateFieldKey[]).map((fieldKey) => {
                      const cfg = (editingTemplate.frontFields || editingTemplate.fields)[fieldKey];
                      if (cfg.visible === false) return null;
                      const isSelected = selectedFrontField === fieldKey;

                      // Display value for preview/editing
                      let displayContent: React.ReactNode = null;
                      if (fieldKey === 'profilePicture') {
                        const isCircle = cfg.shape === 'circle';
                        const isRounded = cfg.shape === 'rounded';
                        const shapeClass = isCircle ? 'rounded-full' : isRounded ? 'rounded-xl' : 'rounded-none';
                        const effectiveRadius = isCircle ? '9999px' : isRounded ? `${cfg.borderRadius ?? 16}px` : '0px';
                        displayContent = (
                          <div
                            className={`w-full h-full overflow-hidden flex items-center justify-center bg-slate-200 ${shapeClass}`}
                            style={{
                              borderRadius: effectiveRadius,
                              border: `${cfg.borderWidth ?? 3}px solid ${cfg.borderColor ?? '#20216B'}`,
                            }}
                          >
                            <img
                              src={currentDemo.profileImageUrl}
                              alt="Student"
                              className="w-full h-full object-cover pointer-events-none select-none"
                            />
                          </div>
                        );
                      } else {
                        const rawText = fieldKey === 'name' 
                          ? currentDemo.fullName
                          : fieldKey === 'fatherName'
                          ? currentDemo.fatherName
                          : fieldKey === 'className'
                          ? formatClassValue(currentDemo.className, cfg.classDisplayFormat)
                          : currentDemo.rollNumber;

                        const autoFontSize = calculateAutoFitFontSize(rawText, cfg.width, cfg.fontSize, 380);

                        displayContent = (
                          <div
                            className="w-full h-full flex items-center overflow-hidden"
                            style={{
                              justifyContent: cfg.textAlign === 'center' ? 'center' : cfg.textAlign === 'right' ? 'flex-end' : 'flex-start',
                              textAlign: cfg.textAlign,
                              color: cfg.color,
                              fontSize: `${autoFontSize}px`,
                              fontWeight: cfg.fontWeight === 'extrabold' ? 900 : cfg.fontWeight === 'bold' ? 700 : cfg.fontWeight === 'semibold' ? 600 : cfg.fontWeight === 'medium' ? 500 : 400,
                              lineHeight: 1.1,
                            }}
                          >
                            <span className="truncate block select-none">
                              {cfg.prefix ? `${cfg.prefix} ` : ''}{rawText}
                            </span>
                          </div>
                        );
                      }

                      const isProfile = fieldKey === 'profilePicture';
                      const isCircleProfile = isProfile && cfg.shape === 'circle';
                      const isSquareProfile = isProfile && cfg.shape === 'square';
                      const isRoundedProfile = isProfile && cfg.shape === 'rounded';
                      const is1to1Profile = isProfile && (isCircleProfile || isSquareProfile || isRoundedProfile);
                      const cardAspect = editingTemplate.aspectRatio || 0.625;
                      const calculatedHeight = is1to1Profile
                        ? `${cfg.width * cardAspect}%`
                        : `${cfg.height}%`;
                      const computedBorderRadius = isCircleProfile 
                        ? '9999px' 
                        : isRoundedProfile 
                        ? `${cfg.borderRadius ?? 16}px` 
                        : isSquareProfile
                        ? '0px'
                        : undefined;

                      return (
                        <div
                          key={fieldKey}
                          onMouseDown={(e) => handleFrontFieldMouseDown(e, fieldKey)}
                          className={`absolute cursor-move transition-shadow z-20 group ${
                            isCircleProfile ? 'rounded-full aspect-square' : is1to1Profile ? 'aspect-square' : ''
                          } ${
                            isSelected
                              ? `ring-2 ring-[#FFF000] ring-offset-1 ring-offset-black/40 bg-[#FFF000]/10 ${isCircleProfile ? 'rounded-full' : ''}`
                              : `hover:ring-1 hover:ring-cyan-400/80 ${isCircleProfile ? 'rounded-full' : ''}`
                          }`}
                          style={{
                            left: `${cfg.x}%`,
                            top: `${cfg.y}%`,
                            width: `${cfg.width}%`,
                            height: calculatedHeight,
                            aspectRatio: is1to1Profile ? '1 / 1' : undefined,
                            borderRadius: computedBorderRadius,
                          }}
                        >
                          {displayContent}

                          {/* Selected Field Indicator Tag & Resize Handle */}
                          {isSelected && (
                            <>
                              <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#20216B] text-[#FFF000] text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-xs">
                                {FRONT_FIELD_METADATA[fieldKey].label} ({cfg.x.toFixed(1)}%, {cfg.y.toFixed(1)}%)
                              </div>

                              {/* Bottom-Right Corner Resize Grip Handle */}
                              <div
                                onMouseDown={(e) => handleFrontResizeMouseDown(e, fieldKey)}
                                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#FFF000] border-2 border-[#20216B] rounded-full cursor-se-resize shadow-md z-30 flex items-center justify-center hover:scale-125 transition-transform"
                                title="Drag to Resize"
                              >
                                <div className="w-1.5 h-1.5 bg-[#20216B] rounded-full" />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] font-mono text-stone-400 text-center">
                  💡 Click any element on canvas to select. Drag to reposition, or use the bottom-right yellow handle to resize.
                </p>
              </div>

              {/* Right Column: Front Field Property Controls */}
              <div className="lg:col-span-5 bg-[#0F1426] border-2 border-[#20216B] rounded-2xl p-5 space-y-4 shadow-xl text-white">
                
                {/* Field Selector Pills */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FFF000] block">
                    Select Field to Position & Style
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(['profilePicture', 'name', 'fatherName', 'className', 'rollNumber'] as TemplateFieldKey[]).map((fKey) => {
                      const isSel = selectedFrontField === fKey;
                      return (
                        <button
                          key={fKey}
                          type="button"
                          onClick={() => setSelectedFrontField(fKey)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer truncate ${
                            isSel
                              ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37] shadow-md'
                              : 'bg-[#171D36] text-slate-300 hover:text-white border border-[#263352]'
                          }`}
                        >
                          {FRONT_FIELD_METADATA[fKey].icon}
                          <span className="truncate">{FRONT_FIELD_METADATA[fKey].label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Field Customization Box */}
                <div className="bg-[#141A32] rounded-xl p-4 border border-[#243050] space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#243050] pb-2">
                    <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                      {FRONT_FIELD_METADATA[selectedFrontField].icon}
                      <span>{FRONT_FIELD_METADATA[selectedFrontField].label} Controls</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300">
                      X: {selectedFrontConfig.x}% · Y: {selectedFrontConfig.y}%
                    </span>
                  </div>

                  {/* Nudge Arrow Directional Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 block">Fine-Tune Position (Nudge)</label>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => nudgeFrontField(selectedFrontField, -0.5, 0)}
                          className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                          title="Left 0.5%"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgeFrontField(selectedFrontField, 0.5, 0)}
                          className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                          title="Right 0.5%"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgeFrontField(selectedFrontField, 0, -0.5)}
                          className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                          title="Up 0.5%"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => nudgeFrontField(selectedFrontField, 0, 0.5)}
                          className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                          title="Down 0.5%"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reset Field Position to Default */}
                      <button
                        type="button"
                        onClick={() => {
                          const def = DEFAULT_TEMPLATE.fields[selectedFrontField];
                          updateFrontFieldProp(selectedFrontField, 'x', def.x);
                          updateFrontFieldProp(selectedFrontField, 'y', def.y);
                          updateFrontFieldProp(selectedFrontField, 'width', def.width);
                          updateFrontFieldProp(selectedFrontField, 'height', def.height);
                        }}
                        className="text-[10px] font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Coordinates</span>
                      </button>
                    </div>
                  </div>

                  {/* Front Field Position & Size Sliders */}
                  <div className="bg-[#141A32] rounded-xl p-3.5 border border-[#243050] space-y-2.5">
                    <label className="text-[10px] font-mono text-[#FFF000] font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{FRONT_FIELD_METADATA[selectedFrontField].label} Position & Size Sliders</span>
                    </label>

                    {/* Horizontal Position (X) Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Left / Right (X Position)</span>
                        <span className="text-white">{selectedFrontConfig.x.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="0.5"
                        value={selectedFrontConfig.x}
                        onChange={(e) => updateFrontFieldProp(selectedFrontField, 'x', parseFloat(e.target.value))}
                        className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                      />
                    </div>

                    {/* Vertical Position (Y) Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Up / Down (Y Position)</span>
                        <span className="text-white">{selectedFrontConfig.y.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="90"
                        step="0.5"
                        value={selectedFrontConfig.y}
                        onChange={(e) => updateFrontFieldProp(selectedFrontField, 'y', parseFloat(e.target.value))}
                        className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                      />
                    </div>

                    {/* Size / Width Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Resize (Width / Size)</span>
                        <span className="text-white">{selectedFrontConfig.width.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="95"
                        step="0.5"
                        value={selectedFrontConfig.width}
                        onChange={(e) => {
                          const newW = parseFloat(e.target.value);
                          updateFrontFieldProp(selectedFrontField, 'width', Math.round(newW * 10) / 10);
                          if (selectedFrontField === 'profilePicture') {
                            const cardAspect = editingTemplate.aspectRatio || 0.625;
                            const newH = (selectedFrontConfig.shape === 'circle' || selectedFrontConfig.shape === 'square' || selectedFrontConfig.shape === 'rounded') 
                              ? newW * cardAspect 
                              : newW * (1.15 * cardAspect);
                            updateFrontFieldProp('profilePicture', 'height', Math.round(newH * 10) / 10);
                          }
                        }}
                        className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Profile Picture Specific Properties */}
                  {selectedFrontField === 'profilePicture' ? (
                    <div className="space-y-3 pt-2 border-t border-[#243050]">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono text-slate-400 block">Avatar Shape</label>
                          <span className="text-[9px] font-mono text-[#FFF000] bg-[#20216B] px-1.5 py-0.5 rounded border border-[#D4AF37]/50 font-bold">
                            {selectedFrontConfig.shape === 'circle' ? '1:1 Circular Ratio' : selectedFrontConfig.shape === 'square' ? '1:1 Square Ratio' : '1:1 Smooth Rounded Square'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['square', 'rounded', 'circle'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                updateFrontFieldProp('profilePicture', 'shape', s);
                                const cardAspect = editingTemplate.aspectRatio || 0.625;
                                if (s === 'circle') {
                                  updateFrontFieldProp('profilePicture', 'borderRadius', 9999);
                                  updateFrontFieldProp('profilePicture', 'height', Math.round(selectedFrontConfig.width * cardAspect * 10) / 10);
                                } else if (s === 'square') {
                                  updateFrontFieldProp('profilePicture', 'borderRadius', 0);
                                  updateFrontFieldProp('profilePicture', 'height', Math.round(selectedFrontConfig.width * cardAspect * 10) / 10);
                                } else if (s === 'rounded') {
                                  const curR = selectedFrontConfig.borderRadius;
                                  const safeRadius = (typeof curR === 'number' && curR > 0 && curR <= 50) ? curR : 16;
                                  updateFrontFieldProp('profilePicture', 'borderRadius', safeRadius);
                                  updateFrontFieldProp('profilePicture', 'height', Math.round(selectedFrontConfig.width * cardAspect * 10) / 10);
                                }
                              }}
                              className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                                selectedFrontConfig.shape === s
                                  ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37]'
                                  : 'bg-[#1C2546] text-slate-300 hover:text-white'
                              }`}
                            >
                              {s === 'rounded' ? 'Rounded' : s}
                            </button>
                          ))}
                        </div>

                        {/* Snap to Perfect 1:1 Circle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const cardAspect = editingTemplate.aspectRatio || 0.625;
                            updateFrontFieldProp('profilePicture', 'shape', 'circle');
                            updateFrontFieldProp('profilePicture', 'borderRadius', 9999);
                            updateFrontFieldProp('profilePicture', 'borderWidth', selectedFrontConfig.borderWidth ?? 3);
                            updateFrontFieldProp('profilePicture', 'height', Math.round(selectedFrontConfig.width * cardAspect * 10) / 10);
                          }}
                          className="w-full mt-1.5 py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold bg-[#20216B] hover:bg-[#2C2E85] text-[#FFF000] border border-[#D4AF37]/70 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#FFF000]" />
                          <span>Snap to Perfect 1:1 Circle Frame</span>
                        </button>
                      </div>

                      {/* Corner Roundness Slider (Shown specifically when 'rounded' is chosen) */}
                      {selectedFrontConfig.shape === 'rounded' && (
                        <div className="p-3 bg-[#171D36] rounded-xl border border-[#3A4B75] space-y-2.5 animate-in fade-in">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[#FFF000] font-bold flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-[#FFF000]" />
                              <span>Corner Roundness (Border Radius)</span>
                            </span>
                            <span className="text-white font-bold bg-[#0B0E1B] px-2 py-0.5 rounded border border-[#3A4B75]">
                              {selectedFrontConfig.borderRadius ?? 16}px
                            </span>
                          </div>

                          <input
                            type="range"
                            min="2"
                            max="50"
                            step="1"
                            value={selectedFrontConfig.borderRadius ?? 16}
                            onChange={(e) => updateFrontFieldProp('profilePicture', 'borderRadius', parseInt(e.target.value, 10))}
                            className="w-full accent-[#FFF000] bg-[#0B0E1B] cursor-pointer"
                          />

                          {/* Quick Corner Presets */}
                          <div className="flex items-center justify-between gap-1 pt-0.5">
                            {[
                              { label: 'Slight', val: 6 },
                              { label: 'Smooth', val: 14 },
                              { label: 'Medium', val: 22 },
                              { label: 'Soft Pill', val: 32 },
                            ].map((preset) => (
                              <button
                                key={preset.val}
                                type="button"
                                onClick={() => updateFrontFieldProp('profilePicture', 'borderRadius', preset.val)}
                                className={`flex-1 py-1 px-1.5 text-[10px] font-mono rounded transition-colors cursor-pointer text-center ${
                                  (selectedFrontConfig.borderRadius ?? 16) === preset.val
                                    ? 'bg-[#FFF000] text-[#0B0E1B] font-bold shadow-xs'
                                    : 'bg-[#141A32] text-slate-300 hover:text-white border border-[#263352]'
                                }`}
                              >
                                {preset.label} ({preset.val}px)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Border Width & Color */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block">Border Width (px)</label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={selectedFrontConfig.borderWidth ?? 3}
                            onChange={(e) => updateFrontFieldProp('profilePicture', 'borderWidth', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block">Border Radius (px)</label>
                          <input
                            type="number"
                            min="0"
                            max="40"
                            value={selectedFrontConfig.borderRadius ?? 14}
                            onChange={(e) => updateFrontFieldProp('profilePicture', 'borderRadius', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text Fields Customization (Name, Father, Class, Roll) */
                    <div className="space-y-3 pt-2 border-t border-[#243050]">
                      {/* Font Size & Weight */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block">Font Size (px)</label>
                          <input
                            type="number"
                            min="8"
                            max="48"
                            value={selectedFrontConfig.fontSize}
                            onChange={(e) => updateFrontFieldProp(selectedFrontField, 'fontSize', parseInt(e.target.value, 10) || 14)}
                            className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-400 block">Font Weight</label>
                          <select
                            value={selectedFrontConfig.fontWeight}
                            onChange={(e) => updateFrontFieldProp(selectedFrontField, 'fontWeight', e.target.value as any)}
                            className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                          >
                            <option value="normal">Normal (400)</option>
                            <option value="medium">Medium (500)</option>
                            <option value="semibold">Semibold (600)</option>
                            <option value="bold">Bold (700)</option>
                            <option value="extrabold">Extra Bold (900)</option>
                          </select>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 block">Text Alignment</label>
                        <div className="grid grid-cols-3 gap-1">
                          {(['left', 'center', 'right'] as const).map((a) => (
                            <button
                              key={a}
                              type="button"
                              onClick={() => updateFrontFieldProp(selectedFrontField, 'textAlign', a)}
                              className={`py-1 rounded text-xs font-mono flex items-center justify-center gap-1 capitalize cursor-pointer ${
                                selectedFrontConfig.textAlign === a
                                  ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37]'
                                  : 'bg-[#1C2546] text-slate-300'
                              }`}
                            >
                              {a === 'left' && <AlignLeft className="w-3 h-3" />}
                              {a === 'center' && <AlignCenter className="w-3 h-3" />}
                              {a === 'right' && <AlignRight className="w-3 h-3" />}
                              <span>{a}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Class Format Selector (Only when Class is selected) */}
                      {selectedFrontField === 'className' && (
                        <div className="space-y-1 p-2 bg-[#1C2546] rounded-lg border border-[#2D3A5D]">
                          <label className="text-[10px] font-mono text-[#FFF000] block">Class Display Format</label>
                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                            <button
                              type="button"
                              onClick={() => updateFrontFieldProp('className', 'classDisplayFormat', 'number-only')}
                              className={`py-1 px-1.5 rounded text-center cursor-pointer ${
                                selectedFrontConfig.classDisplayFormat === 'number-only'
                                  ? 'bg-[#20216B] text-[#FFF000] font-bold border border-[#D4AF37]'
                                  : 'text-slate-400'
                              }`}
                            >
                              Number Only (e.g. 6)
                            </button>
                            <button
                              type="button"
                              onClick={() => updateFrontFieldProp('className', 'classDisplayFormat', 'full-name')}
                              className={`py-1 px-1.5 rounded text-center cursor-pointer ${
                                selectedFrontConfig.classDisplayFormat === 'full-name'
                                  ? 'bg-[#20216B] text-[#FFF000] font-bold border border-[#D4AF37]'
                                  : 'text-slate-400'
                              }`}
                            >
                              Full (Class 6)
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text Color Chips Palette */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 block">Text Color</label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {BRAND_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => updateFrontFieldProp(selectedFrontField, 'color', c)}
                              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                                selectedFrontConfig.color === c ? 'scale-125 border-[#FFF000]' : 'border-black/40'
                              }`}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedFrontConfig.color}
                            onChange={(e) => updateFrontFieldProp(selectedFrontField, 'color', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                            title="Custom Hex Picker"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STUDIO TAB B: BACK SIDE EDITOR (PERMANENT QR PLACEMENT) */}
          {/* ========================================================================= */}
          {activeEditorSide === 'back' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Back Canvas Stage */}
              <div className="lg:col-span-7 bg-[#0B0E1B] border-2 border-[#20216B] rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-4">
                
                {/* Stage Header */}
                <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-[#1E293B]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-white font-bold">BACK SIDE CANVAS (QR CODE POSITIONING)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetBackToDefaultSvg}
                      className="px-2 py-1 bg-[#171D36] hover:bg-[#20274A] text-slate-300 rounded-lg text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Reset to Default Back
                    </button>
                    <button
                      type="button"
                      onClick={() => backFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-[#20216B] hover:bg-[#2C2E85] text-[#FFF000] rounded-lg text-[11px] font-bold flex items-center gap-1 border border-[#D4AF37]/40 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Back Image</span>
                    </button>
                  </div>
                </div>

                {/* Back Canvas */}
                <div className="w-full max-w-[360px] sm:max-w-[380px] mx-auto">
                  <div
                    ref={backCanvasRef}
                    className="relative w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-[#20216B] select-none bg-[#0A0D18] transition-all"
                    style={{ aspectRatio: `${editingTemplate.aspectRatio || 0.625}` }}
                  >
                    {/* Back Background Image */}
                    <img
                      src={editingTemplate.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL}
                      alt="Back Card Template"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Draggable & Resizable QR Code Box */}
                    {backQrConfig.visible !== false && (
                      <div
                        onMouseDown={handleBackQrMouseDown}
                        className="absolute cursor-move transition-shadow z-20 ring-2 ring-[#FFF000] ring-offset-1 ring-offset-black/40 group"
                        style={{
                          left: `${backQrConfig.x}%`,
                          top: `${backQrConfig.y}%`,
                          width: `${backQrConfig.width}%`,
                          height: `${backQrConfig.height}%`,
                        }}
                      >
                        {/* QR Box Frame with Quiet Zone */}
                        <div
                          className="w-full h-full bg-white shadow-xl flex flex-col items-center justify-center transition-all overflow-hidden relative"
                          style={{
                            padding: `${backQrConfig.quietZone ?? 8}px`,
                            borderRadius: `${backQrConfig.borderRadius ?? 16}px`,
                            border: `${backQrConfig.borderWidth ?? 2}px solid ${backQrConfig.borderColor ?? '#D4AF37'}`,
                          }}
                        >
                          <img
                            src={DEMO_QR_IMAGE}
                            alt="Sample QR Code"
                            className="w-full h-full object-contain pointer-events-none block"
                          />
                        </div>

                        {/* Optional Instruction Label Below */}
                        {backQrConfig.showLabel && backQrConfig.label && (
                          <div className="mt-1 text-center w-full pointer-events-none">
                            <span className="text-[8px] sm:text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#FFF000] drop-shadow-md bg-black/70 px-1.5 py-0.5 rounded-full inline-block whitespace-nowrap">
                              {backQrConfig.label}
                            </span>
                          </div>
                        )}

                        {/* Coordinate Badge & Corner Resize Handle */}
                        <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#20216B] text-[#FFF000] text-[9px] font-mono font-bold whitespace-nowrap pointer-events-none shadow-xs">
                          QR Code ({backQrConfig.x.toFixed(1)}%, {backQrConfig.y.toFixed(1)}%)
                        </div>

                        <div
                          onMouseDown={handleBackQrResizeMouseDown}
                          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#FFF000] border-2 border-[#20216B] rounded-full cursor-se-resize shadow-md z-30 flex items-center justify-center hover:scale-125 transition-transform"
                          title="Drag to Resize QR Code"
                        >
                          <div className="w-1.5 h-1.5 bg-[#20216B] rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] font-mono text-stone-400 text-center">
                  💡 Drag the permanent QR Code box anywhere on the back template. The student's real QR identity will be rendered automatically.
                </p>
              </div>

              {/* Right Column: Back QR Property Controls */}
              <div className="lg:col-span-5 bg-[#0F1426] border-2 border-[#20216B] rounded-2xl p-5 space-y-4 shadow-xl text-white">
                
                <div className="flex items-center gap-2 border-b border-[#243050] pb-2.5">
                  <div className="p-2 rounded-lg bg-[#20216B] text-[#FFF000]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-base font-bold text-white">
                      Permanent QR Code Placement
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">
                      Coordinates: X: {backQrConfig.x}% · Y: {backQrConfig.y}% · W: {backQrConfig.width}%
                    </p>
                  </div>
                </div>

                {/* Nudge Directional Pad */}
                <div className="bg-[#141A32] rounded-xl p-3.5 border border-[#243050] space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 block">Fine-Tune Position (Nudge)</label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => nudgeBackQr(-0.5, 0)}
                        className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                        title="Left 0.5%"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeBackQr(0.5, 0)}
                        className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                        title="Right 0.5%"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeBackQr(0, -0.5)}
                        className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                        title="Up 0.5%"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => nudgeBackQr(0, 0.5)}
                        className="p-1.5 bg-[#1C2546] hover:bg-[#253052] rounded text-slate-200 cursor-pointer"
                        title="Down 0.5%"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateBackQrProp('x', 22.5);
                        updateBackQrProp('y', 25.0);
                        updateBackQrProp('width', 55.0);
                        updateBackQrProp('height', 34.375);
                      }}
                      className="text-[10px] font-mono text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Center QR Box</span>
                    </button>
                  </div>
                </div>

                {/* QR Positioning & Size Sliders */}
                <div className="bg-[#141A32] rounded-xl p-4 border border-[#243050] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono text-[#FFF000] font-bold flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>QR Position & Size Sliders</span>
                    </label>
                    <span className="text-[10px] font-mono text-cyan-300">
                      W: {backQrConfig.width.toFixed(1)}%
                    </span>
                  </div>

                  {/* Horizontal Position (X) Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Left / Right (X Position)</span>
                      <span className="text-white">{backQrConfig.x.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="0.5"
                      value={backQrConfig.x}
                      onChange={(e) => updateBackQrProp('x', parseFloat(e.target.value))}
                      className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                    />
                  </div>

                  {/* Vertical Position (Y) Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Up / Down (Y Position)</span>
                      <span className="text-white">{backQrConfig.y.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="0.5"
                      value={backQrConfig.y}
                      onChange={(e) => updateBackQrProp('y', parseFloat(e.target.value))}
                      className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                    />
                  </div>

                  {/* Size / Width Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Resize QR (Larger / Smaller)</span>
                      <span className="text-white">{backQrConfig.width.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      step="0.5"
                      value={backQrConfig.width}
                      onChange={(e) => {
                        const newW = parseFloat(e.target.value);
                        const cardAspect = editingTemplate.aspectRatio || 0.625;
                        const newH = newW * cardAspect;
                        updateBackQrProp('width', Math.round(newW * 10) / 10);
                        updateBackQrProp('height', Math.round(newH * 10) / 10);
                      }}
                      className="w-full accent-[#FFF000] bg-[#1C2546] cursor-pointer"
                    />
                  </div>
                </div>

                {/* QR Box Styling Controls */}
                <div className="bg-[#141A32] rounded-xl p-4 border border-[#243050] space-y-3">
                  {/* Quiet Zone & Border Radius */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block">Quiet Zone Padding (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={backQrConfig.quietZone ?? 8}
                        onChange={(e) => updateBackQrProp('quietZone', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block">Frame Corner Radius (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="32"
                        value={backQrConfig.borderRadius ?? 16}
                        onChange={(e) => updateBackQrProp('borderRadius', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                      />
                    </div>
                  </div>

                  {/* Border Width & Color */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block">Frame Border Width (px)</label>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        value={backQrConfig.borderWidth ?? 2}
                        onChange={(e) => updateBackQrProp('borderWidth', parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2 py-1 text-xs font-mono text-white rounded outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-slate-400 block">Frame Border Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={backQrConfig.borderColor ?? '#D4AF37'}
                          onChange={(e) => updateBackQrProp('borderColor', e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-300">{backQrConfig.borderColor ?? '#D4AF37'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Instruction Label Text */}
                  <div className="space-y-1.5 pt-2 border-t border-[#243050]">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-slate-400 block">Instruction Label Below QR</label>
                      <input
                        type="checkbox"
                        checked={backQrConfig.showLabel ?? true}
                        onChange={(e) => updateBackQrProp('showLabel', e.target.checked)}
                        className="rounded cursor-pointer"
                      />
                    </div>
                    {backQrConfig.showLabel !== false && (
                      <input
                        type="text"
                        value={backQrConfig.label ?? 'SCAN TO VERIFY STUDENT'}
                        onChange={(e) => updateBackQrProp('label', e.target.value)}
                        className="w-full bg-[#1C2546] border border-[#2D3A5D] px-2.5 py-1.5 text-xs font-mono text-[#FFF000] font-bold rounded outline-none uppercase"
                        placeholder="SCAN TO VERIFY STUDENT"
                      />
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1C2546] border border-[#2D3A5D] text-[11px] font-mono text-stone-300 leading-relaxed space-y-1">
                  <div className="text-[#FFF000] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Permanent QR Identity Guaranteed</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    The QR code uses the student's unique permanent token created upon registration. Scanning immediately resolves student profile & future E-Attendance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: FULL HIGH-RESOLUTION PREVIEW MODAL */}
      {/* ========================================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F1426] border-2 border-[#20216B] rounded-2xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[94vh] overflow-y-auto text-white">
            
            {/* Modal Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#FFF000] font-bold uppercase tracking-wider block">
                  HIGH-RESOLUTION CARD SIMULATION
                </span>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-white">
                  {previewTemplate.name}
                </h3>
              </div>

              {/* Sample Student Selector & Side Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={demoStudentIndex}
                  onChange={(e) => setDemoStudentIndex(parseInt(e.target.value, 10))}
                  className="bg-[#171D36] border border-[#2B385C] px-2.5 py-1 text-xs font-mono text-white rounded-lg outline-none cursor-pointer"
                >
                  {DEMO_STUDENTS.map((st, idx) => (
                    <option key={st.id} value={idx}>
                      Demo Student: {st.fullName}
                    </option>
                  ))}
                </select>

                <div className="inline-flex p-0.5 bg-[#171D36] rounded-lg border border-[#2B385C]">
                  <button
                    type="button"
                    onClick={() => setPreviewSide('both')}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded cursor-pointer ${
                      previewSide === 'both' ? 'bg-[#20216B] text-[#FFF000]' : 'text-slate-400'
                    }`}
                  >
                    Both Sides
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSide('front')}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded cursor-pointer ${
                      previewSide === 'front' ? 'bg-[#20216B] text-[#FFF000]' : 'text-slate-400'
                    }`}
                  >
                    Front Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSide('back')}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded cursor-pointer ${
                      previewSide === 'back' ? 'bg-[#20216B] text-[#FFF000]' : 'text-slate-400'
                    }`}
                  >
                    Back Only
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-[#171D36] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulation Preview Stage */}
            <div className="py-4 flex flex-wrap items-center justify-center gap-6">
              {/* FRONT SIDE PREVIEW */}
              {(previewSide === 'both' || previewSide === 'front') && (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-mono font-bold text-[#FFF000] uppercase tracking-wider">
                    FRONT SIDE (STUDENT DATA)
                  </span>
                  <div
                    className="relative w-[280px] sm:w-[320px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#20216B] bg-white"
                    style={{ aspectRatio: `${previewTemplate.aspectRatio || 0.625}` }}
                  >
                    <img
                      src={previewTemplate.frontTemplateUrl || previewTemplate.templateUrl || DEFAULT_TEMPLATE_SVG_DATA_URL}
                      alt="Front"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Front Dynamic Fields */}
                    {(['profilePicture', 'name', 'fatherName', 'className', 'rollNumber'] as TemplateFieldKey[]).map((fKey) => {
                      const cfg = (previewTemplate.frontFields || previewTemplate.fields)[fKey];
                      if (cfg.visible === false) return null;

                      if (fKey === 'profilePicture') {
                        const shapeClass = cfg.shape === 'circle' ? 'rounded-full' : cfg.shape === 'rounded' ? 'rounded-xl' : 'rounded-none';
                        return (
                          <div
                            key={fKey}
                            className={`absolute overflow-hidden ${shapeClass}`}
                            style={{
                              left: `${cfg.x}%`,
                              top: `${cfg.y}%`,
                              width: `${cfg.width}%`,
                              height: `${cfg.height}%`,
                              borderRadius: cfg.shape === 'circle' ? '9999px' : `${cfg.borderRadius ?? 14}px`,
                              border: `${cfg.borderWidth ?? 3}px solid ${cfg.borderColor ?? '#20216B'}`,
                            }}
                          >
                            <img
                              src={currentDemo.profileImageUrl}
                              alt="Student"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      }

                      const text = fKey === 'name'
                        ? currentDemo.fullName
                        : fKey === 'fatherName'
                        ? currentDemo.fatherName
                        : fKey === 'className'
                        ? formatClassValue(currentDemo.className, cfg.classDisplayFormat)
                        : currentDemo.rollNumber;

                      const autoFontSize = calculateAutoFitFontSize(text, cfg.width, cfg.fontSize, 320);

                      return (
                        <div
                          key={fKey}
                          className="absolute flex items-center overflow-hidden"
                          style={{
                            left: `${cfg.x}%`,
                            top: `${cfg.y}%`,
                            width: `${cfg.width}%`,
                            height: `${cfg.height}%`,
                            justifyContent: cfg.textAlign === 'center' ? 'center' : cfg.textAlign === 'right' ? 'flex-end' : 'flex-start',
                            textAlign: cfg.textAlign,
                            color: cfg.color,
                            fontSize: `${autoFontSize}px`,
                            fontWeight: cfg.fontWeight === 'extrabold' ? 900 : cfg.fontWeight === 'bold' ? 700 : cfg.fontWeight === 'semibold' ? 600 : cfg.fontWeight === 'medium' ? 500 : 400,
                            lineHeight: 1.1,
                          }}
                        >
                          <span className="truncate block">
                            {cfg.prefix ? `${cfg.prefix} ` : ''}{text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* BACK SIDE PREVIEW */}
              {(previewSide === 'both' || previewSide === 'back') && (
                <div className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-mono font-bold text-[#FFF000] uppercase tracking-wider">
                    BACK SIDE (PERMANENT QR CODE)
                  </span>
                  <div
                    className="relative w-[280px] sm:w-[320px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#20216B] bg-[#0A0D18]"
                    style={{ aspectRatio: `${previewTemplate.aspectRatio || 0.625}` }}
                  >
                    <img
                      src={previewTemplate.backTemplateUrl || DEFAULT_BACK_TEMPLATE_SVG_DATA_URL}
                      alt="Back"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* QR Code Element */}
                    {(() => {
                      const qr = previewTemplate.backFields?.qrCode || DEFAULT_TEMPLATE.backFields!.qrCode;
                      if (qr.visible === false) return null;
                      return (
                        <div
                          className="absolute z-20 flex flex-col items-center justify-center"
                          style={{
                            left: `${qr.x}%`,
                            top: `${qr.y}%`,
                            width: `${qr.width}%`,
                            height: `${qr.height}%`,
                          }}
                        >
                          <div
                            className="w-full h-full bg-white shadow-xl flex flex-col items-center justify-center overflow-hidden"
                            style={{
                              padding: `${qr.quietZone ?? 8}px`,
                              borderRadius: `${qr.borderRadius ?? 16}px`,
                              border: `${qr.borderWidth ?? 2}px solid ${qr.borderColor ?? '#D4AF37'}`,
                            }}
                          >
                            <img
                              src={DEMO_QR_IMAGE}
                              alt="QR Code"
                              className="w-full h-full object-contain block"
                            />
                          </div>
                          {qr.showLabel && qr.label && (
                            <div className="mt-1 text-center w-full">
                              <span className="text-[8px] sm:text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#FFF000] drop-shadow-md bg-black/60 px-1.5 py-0.5 rounded-full inline-block">
                                {qr.label}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1E293B]">
              <div className="text-xs font-mono text-slate-400">
                Created: {previewTemplate.createdAt ? new Date(previewTemplate.createdAt).toLocaleDateString() : 'System Default'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#171D36] hover:bg-[#20274A] text-slate-200 text-xs font-mono font-bold rounded-xl border border-[#2B385C] flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFF000]" />
                  <span>Print Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleEditTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-[#20216B] hover:bg-[#2C2E85] text-[#FFF000] text-xs font-mono font-bold rounded-xl border border-[#D4AF37] cursor-pointer"
                >
                  Open in Studio
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0F1426] border-2 border-rose-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative text-white">
            
            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#1E293B] pb-4">
              <div className="p-3 rounded-2xl bg-rose-950 text-rose-400 border border-rose-700/80 shadow-md">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                  PERMANENT DELETION CONFIRMATION
                </span>
                <h3 className="font-editorial text-lg font-bold text-white">
                  Delete Template?
                </h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              <p className="text-sm font-sans text-stone-200 leading-relaxed">
                Are you sure you want to permanently delete template <strong className="text-[#FFF000] font-mono">{templateToDelete.name}</strong>?
              </p>

              {(templateToDelete.isActive || activeTemplate.id === templateToDelete.id) && (
                <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-600/60 text-xs font-mono text-amber-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-400 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Currently Active Template Notice</span>
                  </span>
                  <p className="text-[11px] text-amber-100/90 leading-relaxed">
                    This card is currently ACTIVE for all students. Deleting it will automatically reset the active card back to the Default Institutional Template.
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-[11px] font-mono text-rose-300">
                ⚠️ This document will be permanently deleted from Firestore and cannot be recovered.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setTemplateToDelete(null)}
                disabled={isDeletingTemplate}
                className="px-4 py-2 bg-[#171D36] hover:bg-[#20274A] disabled:opacity-50 text-slate-300 text-xs font-mono font-bold rounded-xl border border-[#2B385C] transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={executeDeleteTemplate}
                disabled={isDeletingTemplate}
                className="px-5 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-xl border border-rose-500 shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isDeletingTemplate ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
                <span>{isDeletingTemplate ? 'Deleting...' : 'Yes, Delete Template'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
