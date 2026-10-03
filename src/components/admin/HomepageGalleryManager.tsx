import React, { useState, useEffect, useRef } from 'react';
import { GallerySlide, GallerySettings } from '../../types';
import { 
  fetchHomepageGallery, 
  saveHomepageGallery, 
  subscribeHomepageGallery,
  DEFAULT_GALLERY_SETTINGS, 
  DEFAULT_GALLERY_SLIDES,
  HomepageGalleryState 
} from '../../services/firebaseService';
import { uploadImageToCloudinary, deleteFromCloudinary } from '../../services/cloudinaryService';
import { 
  Upload, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Image as ImageIcon,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle,
  Zap,
  Check,
  RefreshCw
} from 'lucide-react';

interface HomepageGalleryManagerProps {
  onSuccessNotification?: (msg: string) => void;
}

export const HomepageGalleryManager: React.FC<HomepageGalleryManagerProps> = ({
  onSuccessNotification
}) => {
  const [slides, setSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [settings, setSettings] = useState<GallerySettings>(DEFAULT_GALLERY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // New slide form state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Campus Life');
  const [newCaption, setNewCaption] = useState('');
  
  // Upload status & progress
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStageText, setUploadStageText] = useState<string>('');
  const [uploadStage, setUploadStage] = useState<'idle' | 'processing' | 'uploading' | 'completed' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit slide modal
  const [editingSlide, setEditingSlide] = useState<GallerySlide | null>(null);

  // Live preview interactive state
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPaused, setPreviewPaused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch initial data & subscribe to real-time changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchHomepageGallery().then((data) => {
      if (isMounted) {
        setSlides(data.slides || DEFAULT_GALLERY_SLIDES);
        setSettings(data.settings || DEFAULT_GALLERY_SETTINGS);
        setIsLoading(false);
      }
    });

    const unsubscribe = subscribeHomepageGallery((data) => {
      if (isMounted && data.slides && data.slides.length > 0) {
        setSlides(data.slides);
        if (data.settings) setSettings(data.settings);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Save changes to Firestore
  const handleSaveAll = async (newSlides = slides, newSettings = settings) => {
    setIsSaving(true);
    try {
      await saveHomepageGallery({
        slides: newSlides,
        settings: newSettings,
      });
      setSaveSuccess(true);
      if (onSuccessNotification) {
        onSuccessNotification('Homepage gallery synchronized to Firebase successfully!');
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save gallery:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Direct upload of original files without client-side compression or processing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setUploadError(null);

    // Validate size and format
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const f of fileList) {
      if (f.size > 25 * 1024 * 1024) {
        rejectedFiles.push(`${f.name} (exceeds 25MB limit)`);
      } else if (!f.type.startsWith('image/') && !f.name.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
        rejectedFiles.push(`${f.name} (unsupported format)`);
      } else {
        validFiles.push(f);
      }
    }

    if (rejectedFiles.length > 0 && validFiles.length === 0) {
      setUploadError(`Upload rejected: ${rejectedFiles.join(', ')}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploadingFiles(true);
    setUploadStage('uploading');
    setUploadProgress(0);

    const newUploadedSlides: GallerySlide[] = [];
    const total = validFiles.length;
    const itemErrors: string[] = [];

    try {
      for (let i = 0; i < total; i++) {
        const file = validFiles[i];
        const stepBase = Math.round((i / total) * 100);
        setUploadProgress(stepBase);
        setUploadStageText(`Uploading original file (${i + 1}/${total}): ${file.name}`);

        try {
          const res = await uploadImageToCloudinary(file, 'gallery', {
            customFolder: 'dare_arqam_gallery',
            onProgress: (percent) => {
              const currentOverall = Math.round(stepBase + (percent / total));
              setUploadProgress(Math.min(currentOverall, 99));
            }
          });
          if (!res.success || !res.url) {
            throw new Error(res.error || 'Cloudinary upload failed');
          }

          const newSlide: GallerySlide = {
            id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            url: res.url,
            publicId: res.publicId,
            width: res.width || 1920,
            height: res.height || 1080,
            aspectRatio: res.width && res.height ? Number((res.width / res.height).toFixed(4)) : 1.7778,
            fileSizeKB: res.bytes ? Math.round(res.bytes / 1024) : Math.round(file.size / 1024),
            format: res.format || file.type.split('/')[1] || 'jpeg',
            title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            category: 'Campus Infrastructure',
            caption: 'Institutional facilities and scholastic activities at DAR - E - ARQAM.',
            order: slides.length + newUploadedSlides.length + 1,
            enabled: true,
            createdAt: new Date().toISOString(),
          };

          newUploadedSlides.push(newSlide);
          setUploadProgress(Math.round(((i + 1) / total) * 100));
        } catch (itemErr: any) {
          console.error(`Error uploading ${file.name} to Cloudinary:`, itemErr);
          itemErrors.push(`${file.name}: ${itemErr?.message || 'Upload failed'}`);
        }
      }

      if (newUploadedSlides.length > 0) {
        setUploadStageText('Saving updates to Firestore...');
        const combined = [...slides, ...newUploadedSlides];
        setSlides(combined);
        await handleSaveAll(combined, settings);
        setUploadStage('completed');
        setUploadStageText(`Successfully uploaded ${newUploadedSlides.length} image${newUploadedSlides.length > 1 ? 's' : ''}!`);
        
        setTimeout(() => {
          setUploadStage('idle');
          setUploadStageText('');
        }, 3500);
      }

      if (itemErrors.length > 0) {
        setUploadError(`Some files had errors: ${itemErrors.join('; ')}`);
      }
    } catch (globalErr: any) {
      console.error('Fatal batch upload error:', globalErr);
      setUploadStage('error');
      setUploadError(globalErr?.message || 'Upload process encountered an error. Please try again.');
    } finally {
      setIsUploadingFiles(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add slide directly via URL without processing
  const handleAddViaUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    setIsUploadingFiles(true);
    setUploadStage('uploading');
    setUploadStageText('Saving image URL to gallery...');
    setUploadError(null);

    try {
      const newSlide: GallerySlide = {
        id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        url: newImageUrl.trim(),
        title: newTitle.trim() || 'Institutional Facility Showcase',
        category: newCategory.trim() || 'Campus Facilities',
        caption: newCaption.trim() || 'Modern academic and infrastructure facilities.',
        order: slides.length + 1,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const updated = [...slides, newSlide];
      setSlides(updated);
      setNewImageUrl('');
      setNewTitle('');
      setNewCaption('');

      await handleSaveAll(updated, settings);
      setUploadStage('completed');
      setUploadStageText('Image added to gallery successfully!');
      setTimeout(() => {
        setUploadStage('idle');
        setUploadStageText('');
      }, 3500);
    } catch (err: any) {
      console.error('Failed to add image via URL:', err);
      setUploadStage('error');
      setUploadError(err?.message || 'Failed to save image URL. Please try again.');
    } finally {
      setIsUploadingFiles(false);
    }
  };

  // Reordering helpers
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...slides];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Refresh order index
    const normalized = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(normalized);
    await handleSaveAll(normalized, settings);
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const reordered = [...slides];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    const normalized = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSlides(normalized);
    await handleSaveAll(normalized, settings);
  };

  // Toggle slide visibility
  const handleToggleEnable = async (id: string) => {
    const updated = slides.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSlides(updated);
    await handleSaveAll(updated, settings);
  };

  // Delete slide state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Delete slide
  const handleDeleteSlide = async (id: string) => {
    setDeletingId(id);
    try {
      const slideToDelete = slides.find(s => s.id === id);
      const updated = slides.filter(s => s.id !== id);
      // Re-index remaining
      const normalized = updated.map((s, idx) => ({ ...s, order: idx + 1 }));
      setSlides(normalized);
      await handleSaveAll(normalized, settings);

      if (slideToDelete?.publicId) {
        deleteFromCloudinary(slideToDelete.publicId).catch(() => {});
      }

      if (onSuccessNotification) {
        onSuccessNotification('Image removed from gallery and synchronized successfully.');
      }
    } catch (err) {
      console.error('Failed to delete slide:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Save edited slide
  const handleSaveEditModal = async () => {
    if (!editingSlide) return;
    const updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
    setSlides(updated);
    setEditingSlide(null);
    await handleSaveAll(updated, settings);
  };

  // Reset to default sample slides
  const handleResetDefaults = async () => {
    setSlides(DEFAULT_GALLERY_SLIDES);
    setSettings(DEFAULT_GALLERY_SETTINGS);
    await handleSaveAll(DEFAULT_GALLERY_SLIDES, DEFAULT_GALLERY_SETTINGS);
    if (onSuccessNotification) {
      onSuccessNotification('Gallery reset to institutional default images.');
    }
  };

  // Active slides for preview
  const activeSlides = slides.filter(s => s.enabled);
  const currentPreviewSlide = activeSlides[previewIndex] || activeSlides[0] || slides[0];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Actions */}
      <div className="bg-gradient-to-r from-[#0F1424] via-[#141A35] to-[#1C244B] border border-[#263352] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 shadow-xs">
            <Sparkles className="w-3 h-3 text-[#FFF000]" />
            <span>REALTIME FIREBASE SHOWCASE</span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
            Homepage Horizontal Gallery Manager
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-prose-serif max-w-2xl">
            Upload and manage the horizontal visual archive at the bottom of the public homepage. 
            All changes sync in realtime across all visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving || isUploadingFiles}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-[#161B30] hover:bg-[#1E2540] border border-[#263352] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reset gallery to default verified photos"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll(slides, settings)}
            disabled={isSaving || isUploadingFiles}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] active:scale-95 border border-[#D4AF37] transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Firebase...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-800" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Slide Duration & Carousel Controls Card */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-5 shadow-md">
        <div className="border-b border-[#1E293B] pb-3">
          <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FFF000]" />
            <span>Slider Timing & Display Settings</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Configure how fast images rotate and how user interaction behaves on the homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Slide Rotation Interval */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352]">
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Auto-Slide Duration</span>
              </span>
              <span className="font-mono text-[#FFF000] text-xs">
                {(settings.autoSlideInterval || 4000) / 1000}s per slide
              </span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[2000, 3000, 4000, 5000, 7000].map((ms) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => {
                    const updated = { ...settings, autoSlideInterval: ms };
                    setSettings(updated);
                    handleSaveAll(slides, updated);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    (settings.autoSlideInterval || 4000) === ms
                      ? 'bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/60 shadow-xs'
                      : 'bg-[#0F1424] text-stone-400 hover:text-white border border-[#263352]'
                  }`}
                >
                  {ms / 1000}s
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400">
              Default is 4.0s for comfortable reading of titles and captions.
            </p>
          </div>

          {/* Pause on Hover Option */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352] flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Eye className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Pause on Hover & Touch</span>
              </label>
              <p className="text-[11px] text-stone-400">
                Temporarily pause rotation when visitor hovers or touches carousel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const updated = { ...settings, pauseOnHover: !settings.pauseOnHover };
                setSettings(updated);
                handleSaveAll(slides, updated);
              }}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                settings.pauseOnHover
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50'
                  : 'bg-stone-900 text-stone-400 border border-stone-800'
              }`}
            >
              <span>{settings.pauseOnHover ? 'Enabled (Recommended)' : 'Disabled'}</span>
              <span className={`w-2 h-2 rounded-full ${settings.pauseOnHover ? 'bg-emerald-400 animate-pulse' : 'bg-stone-600'}`} />
            </button>
          </div>

          {/* Controls & Indicator Visibility */}
          <div className="space-y-2.5 bg-[#161B30] p-4 rounded-xl border border-[#263352] flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#FFF000]" />
                <span>Navigation & Indicator Dots</span>
              </label>
              <p className="text-[11px] text-stone-400">
                Display interactive next/prev chevrons and progress dots.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...settings, showNavigation: !settings.showNavigation };
                  setSettings(updated);
                  handleSaveAll(slides, updated);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                  settings.showNavigation
                    ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]/60'
                    : 'bg-[#0F1424] text-stone-400 border-[#263352]'
                }`}
              >
                Chevrons: {settings.showNavigation ? 'On' : 'Off'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...settings, showIndicators: !settings.showIndicators };
                  setSettings(updated);
                  handleSaveAll(slides, updated);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                  settings.showIndicators
                    ? 'bg-[#20216B] text-[#FFF000] border-[#D4AF37]/60'
                    : 'bg-[#0F1424] text-stone-400 border-[#263352]'
                }`}
              >
                Dots: {settings.showIndicators ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Upload & Add Images Card */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-6 shadow-md">
        <div className="border-b border-[#1E293B] pb-3">
          <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#FFF000]" />
            <span>Upload Unlimited Images to Firebase</span>
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Select one or multiple high-resolution photos from your computer or provide direct web image links.
          </p>
        </div>

        {/* Global Error Banner */}
        {uploadError && (
          <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="p-1 text-stone-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drag & Drop Multi-file Uploader */}
          <div 
            onClick={() => {
              if (!isUploadingFiles) fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 group ${
              isUploadingFiles
                ? 'border-[#FFF000]/60 bg-[#161B30] cursor-wait'
                : 'border-[#D4AF37]/50 hover:border-[#FFF000] bg-[#161B30]/60 hover:bg-[#161B30] cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
              multiple
              disabled={isUploadingFiles}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-[#20216B] group-hover:bg-[#2B2D8C] text-[#FFF000] border border-[#D4AF37]/50 flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
              {isUploadingFiles ? (
                <RefreshCw className="w-6 h-6 animate-spin text-[#FFF000]" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="text-sm font-bold text-white group-hover:text-[#FFF000] transition-colors">
                {isUploadingFiles ? 'Processing & Uploading...' : 'Click or Drop Multiple Images Here'}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                Supports JPG, PNG, WEBP (Max 25MB per photo)
              </div>
            </div>

            {isUploadingFiles && (
              <div className="w-full max-w-xs space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-[#FFF000] font-mono">
                  <span className="truncate max-w-[200px]">{uploadStageText || 'Processing batch...'}</span>
                  <span>{uploadProgress || 0}%</span>
                </div>
                <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FFF000] transition-all duration-200"
                    style={{ width: `${uploadProgress || 0}%` }}
                  />
                </div>
              </div>
            )}

            {uploadStage === 'completed' && !isUploadingFiles && (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{uploadStageText || 'Upload completed successfully!'}</span>
              </div>
            )}
          </div>

          {/* Direct URL Form */}
          <form onSubmit={handleAddViaUrl} className="bg-[#161B30] p-4 sm:p-5 rounded-2xl border border-[#263352] space-y-3.5">
            <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>Or Add Image via Web / Cloud URL</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Image URL *</label>
              <input
                type="url"
                required
                disabled={isUploadingFiles}
                placeholder="https://example.com/images/campus-event.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000] disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1">Slide Title</label>
                <input
                  type="text"
                  disabled={isUploadingFiles}
                  placeholder="e.g. Science Exhibition 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1">Category</label>
                <input
                  type="text"
                  disabled={isUploadingFiles}
                  placeholder="e.g. Campus Facilities"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000] disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1">Caption Description</label>
              <input
                type="text"
                disabled={isUploadingFiles}
                placeholder="Brief summary of what this photo depicts"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1424] border border-[#263352] rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-[#FFF000] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isUploadingFiles}
              className="w-full py-2.5 rounded-xl bg-[#20216B] hover:bg-[#2A2C8A] border border-[#D4AF37]/50 text-[#FFF000] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isUploadingFiles ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding Image...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image to Gallery</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 4. Manage Uploaded Slides List (Reorder, Edit, Toggle, Delete) */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FFF000]" />
              <span>Uploaded Slides ({slides.length} Photos)</span>
            </h3>
            <p className="text-xs text-stone-400">
              Use the arrow buttons to reorder slides. The order here matches the sequence on the public homepage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allEnabled = slides.map(s => ({ ...s, enabled: true }));
                setSlides(allEnabled);
                handleSaveAll(allEnabled, settings);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#161B30] hover:bg-[#1E2540] text-emerald-400 border border-emerald-500/30 rounded-lg cursor-pointer"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={() => {
                const allDisabled = slides.map(s => ({ ...s, enabled: false }));
                setSlides(allDisabled);
                handleSaveAll(allDisabled, settings);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold bg-[#161B30] hover:bg-[#1E2540] text-stone-400 border border-stone-700 rounded-lg cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {slides.length === 0 ? (
          <div className="p-8 text-center bg-[#161B30] rounded-xl border border-dashed border-[#263352] text-stone-400 text-xs">
            No gallery images found. Upload photos or click "Reset Defaults" above.
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  slide.enabled
                    ? 'bg-[#14192D] border-[#2A3756] hover:border-[#D4AF37]/60'
                    : 'bg-[#0E121E] border-[#1C2438] opacity-60'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Order Badge & Reorder Arrows */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="w-6 h-6 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded bg-[#161B30] hover:bg-[#202642] text-stone-300 hover:text-[#FFF000] disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === slides.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded bg-[#161B30] hover:bg-[#202642] text-stone-300 hover:text-[#FFF000] disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-white/20 bg-black shrink-0">
                    <img
                      src={slide.url}
                      alt={slide.title || "Gallery thumbnail"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-editorial text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                        {slide.title || "Untitled Image"}
                      </h4>
                      {slide.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/40 font-semibold">
                          {slide.category}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        slide.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-stone-800 text-stone-400'
                      }`}>
                        {slide.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 line-clamp-1 max-w-xl font-prose-serif">
                      {slide.caption || "No description provided."}
                    </p>

                    {slide.fileSizeKB && (
                      <div className="text-[10px] text-stone-400 font-mono">
                        Optimized: {slide.format?.toUpperCase()} · {slide.fileSizeKB} KB {slide.width ? `(${slide.width}×${slide.height})` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => handleToggleEnable(slide.id)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      slide.enabled
                        ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/50'
                        : 'bg-stone-800 text-stone-400 hover:text-white'
                    }`}
                    title={slide.enabled ? 'Disable slide' : 'Enable slide'}
                  >
                    {slide.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit Metadata */}
                  <button
                    type="button"
                    onClick={() => setEditingSlide(slide)}
                    className="p-2 bg-[#161B30] hover:bg-[#1E2540] text-stone-300 hover:text-[#FFF000] border border-[#263352] rounded-lg transition-colors cursor-pointer text-xs"
                    title="Edit title & caption"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    disabled={deletingId === slide.id}
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/60 active:scale-95 text-red-300 hover:text-red-100 border border-red-800/40 rounded-lg transition-all cursor-pointer text-xs flex items-center justify-center disabled:opacity-50"
                    title="Delete image from gallery"
                    aria-label="Delete image from gallery"
                  >
                    {deletingId === slide.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-300" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Live Simulator Preview Card */}
      <div className="bg-[#0F1424] border border-[#263352] rounded-2xl p-5 sm:p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div>
            <h3 className="font-editorial text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#FFF000]" />
              <span>Live Website Gallery Simulator</span>
            </h3>
            <p className="text-xs text-stone-400">
              Interactive preview matching the exact presentation shown to visitors on the homepage.
            </p>
          </div>

          {activeSlides.length > 1 && (
            <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
              <button
                type="button"
                onClick={() => setPreviewIndex((previewIndex - 1 + activeSlides.length) % activeSlides.length)}
                className="p-1.5 rounded-lg bg-[#161B30] hover:bg-[#1E2540] text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>{previewIndex + 1} / {activeSlides.length}</span>
              <button
                type="button"
                onClick={() => setPreviewIndex((previewIndex + 1) % activeSlides.length)}
                className="p-1.5 rounded-lg bg-[#161B30] hover:bg-[#1E2540] text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {currentPreviewSlide ? (
          <div className="relative bg-gradient-to-br from-[#0B0F1F] via-[#141A35] to-[#1C244B] border-2 border-[#D4AF37]/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[300px]">
              <div className="lg:col-span-8 relative h-60 sm:h-72 bg-[#0D1120] overflow-hidden flex items-center justify-center">
                <img
                  src={currentPreviewSlide.url}
                  alt={currentPreviewSlide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1F] via-transparent to-transparent" />
                {currentPreviewSlide.category && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#171852]/90 border border-[#D4AF37]/60 text-[#FFF000] text-[10px] font-mono font-bold uppercase">
                    {currentPreviewSlide.category}
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 p-5 flex flex-col justify-center space-y-3 bg-[#0F1428]/95 border-t lg:border-t-0 lg:border-l border-[#263352]">
                <div className="text-[11px] text-[#D4AF37] font-mono font-bold uppercase">
                  Verified Showcase
                </div>
                <h4 className="font-editorial text-lg font-bold text-white leading-snug">
                  {currentPreviewSlide.title || "Institutional Facility Showcase"}
                </h4>
                <div className="w-10 h-0.5 bg-[#FFF000]" />
                <p className="text-xs text-stone-300 font-prose-serif leading-relaxed">
                  {currentPreviewSlide.caption || "Empowering students through high standard educational facilities."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-400 text-xs bg-[#161B30] rounded-xl">
            No active slides to display in preview.
          </div>
        )}
      </div>

      {/* 6. Edit Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F1424] border border-[#263352] rounded-2xl p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
              <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
                <span>Edit Slide Metadata</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="p-1 rounded text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Slide Title</label>
                <input
                  type="text"
                  value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Category Badge</label>
                <input
                  type="text"
                  value={editingSlide.category || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Caption / Description</label>
                <textarea
                  rows={3}
                  value={editingSlide.caption || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, caption: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editingSlide.url}
                  onChange={(e) => setEditingSlide({ ...editingSlide, url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#161B30] border border-[#263352] rounded-xl text-xs text-white font-mono focus:outline-hidden focus:border-[#FFF000]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white bg-[#161B30] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditModal}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#171852] bg-[#FFF000] hover:bg-[#F5D900] cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
