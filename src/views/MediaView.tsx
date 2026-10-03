import React, { useState, useEffect } from 'react';
import { PageId, GallerySlide, DocumentDownload } from '../types';
import { NEWS_DATA, DOWNLOADS_DATA } from '../data/mockData';
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  Calendar, 
  ArrowRight, 
  Search, 
  ExternalLink,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { LazyImage } from '../components/LazyImage';
import { 
  fetchHomepageGallery, 
  subscribeHomepageGallery, 
  DEFAULT_GALLERY_SLIDES,
  fetchDocuments,
  subscribeDocuments
} from '../services/firebaseService';

interface MediaViewProps {
  initialTab?: 'news' | 'gallery' | 'downloads';
  onNavigate: (page: PageId) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({
  initialTab = 'news',
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'gallery' | 'downloads'>(initialTab);
  const [galleryFilter, setGalleryFilter] = useState<string>('All');
  const [downloadSearch, setDownloadSearch] = useState<string>('');
  const [firebaseSlides, setFirebaseSlides] = useState<GallerySlide[]>(DEFAULT_GALLERY_SLIDES);
  const [documentsList, setDocumentsList] = useState<DocumentDownload[]>(DOWNLOADS_DATA);
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);

  // Default institutional showcase items
  const defaultGalleryItems = [
    {
      id: 'gal-01',
      title: 'Main Academic Block & Central Quadrangle',
      category: 'Campus',
      date: 'March 2026',
      image: '/src/assets/images/campus_main_building_1790434904126.jpg',
      thumbnailUrl: '',
      description: 'The administrative heart of DAR - E - ARQAM featuring the central assembly arena and academic chambers.',
    },
    {
      id: 'gal-02',
      title: 'Senior Physics & Applied Chemistry Laboratory',
      category: 'Academic Activities',
      date: 'February 2026',
      image: '/src/assets/images/campus_science_lab_1790434931736.jpg',
      thumbnailUrl: '',
      description: 'Fully equipped practical workstations designed in strict accordance with Board of Intermediate & Secondary Education specifications.',
    },
    {
      id: 'gal-03',
      title: 'Central Reference Library & Independent Study Hall',
      category: 'Student Activities',
      date: 'January 2026',
      image: '/src/assets/images/campus_library_hall_1790434944628.jpg',
      thumbnailUrl: '',
      description: 'Quiet scholarly environment offering access to thousands of educational volumes, encyclopedias, and reference journals.',
    },
    {
      id: 'gal-04',
      title: 'Executive Council Room & Academic Directorate',
      category: 'Campus',
      date: 'December 2025',
      image: '/src/assets/images/campus_main_building_1790434904126.jpg',
      thumbnailUrl: '',
      description: 'Chambers dedicated to periodic board consultations and academic steering committees.',
    },
    {
      id: 'gal-05',
      title: 'Inter-House Annual Sports Olympiad & Physical Fitness Trials',
      category: 'Sports',
      date: 'November 2025',
      image: '/src/assets/images/campus_science_lab_1790434931736.jpg',
      thumbnailUrl: '',
      description: 'Annual competitive athletic championship covering sprint relays, cricket, and physical drills.',
    },
    {
      id: 'gal-06',
      title: 'Annual Seerat Conference & Quranic Tajweed Recitations',
      category: 'Events',
      date: 'October 2025',
      image: '/src/assets/images/campus_library_hall_1790434944628.jpg',
      thumbnailUrl: '',
      description: 'Scholarly presentations and Husn-e-Qirat competitions held in the central institutional auditorium.',
    }
  ];

  // Subscribe to live Firebase Gallery slides
  useEffect(() => {
    fetchHomepageGallery().then(data => {
      if (data.slides && data.slides.length > 0) {
        setFirebaseSlides(data.slides);
      }
    });

    const unsub = subscribeHomepageGallery(data => {
      if (data.slides && data.slides.length > 0) {
        setFirebaseSlides(data.slides);
      }
    });

    return () => unsub();
  }, []);

  // Subscribe to live Firebase Documents & Downloads
  useEffect(() => {
    fetchDocuments().then((docs) => {
      if (docs && docs.length > 0) {
        setDocumentsList(docs);
      }
    }).catch(() => {});

    const unsubDocs = subscribeDocuments((docs) => {
      if (docs && docs.length > 0) {
        setDocumentsList(docs);
      }
    });

    return () => unsubDocs();
  }, []);

  // Map Firebase slides into unified gallery items
  const liveFirebaseItems = firebaseSlides
    .filter(s => s.enabled)
    .map(s => ({
      id: s.id,
      title: s.title || 'Institutional Visual Exhibit',
      category: s.category || 'Campus',
      date: s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Verified Archive',
      image: s.url,
      thumbnailUrl: s.thumbnailUrl,
      description: s.caption || 'State-of-the-art campus facilities and scholastic learning environments.',
    }));

  // Combined gallery items (Live Firebase items + Defaults if distinct)
  const combinedGallery = liveFirebaseItems.length > 0 ? liveFirebaseItems : defaultGalleryItems;

  const galleryCategories = ['All', 'Campus', 'Academic Activities', 'Events', 'Sports', 'Student Activities', 'Campus Infrastructure'];

  const filteredGallery = combinedGallery.filter(item => {
    if (galleryFilter === 'All') return true;
    return item.category?.toLowerCase() === galleryFilter.toLowerCase();
  });

  const filteredDownloads = documentsList.filter(doc =>
    doc.title.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    doc.category.toLowerCase().includes(downloadSearch.toLowerCase()) ||
    doc.refNo.toLowerCase().includes(downloadSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Banner */}
      <div className="pb-4 border-b border-[#CBD5E1]">
        <div className="text-xs font-semibold text-[#20216B] tracking-wider uppercase mb-1">
          Institutional Archives & Media
        </div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0F1035]">
          Media, News & Document Downloads
        </h1>
        <p className="text-xs sm:text-sm text-[#334155] mt-1 max-w-2xl font-prose-serif">
          Public statements, photo documentation of campus life, and official institutional documents for parents and scholars.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#EEF2F8] p-1 rounded-md flex flex-wrap gap-1 border border-[#CBD5E1]">
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'news'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Institutional News
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Campus Gallery ({combinedGallery.length} Photos)
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-4 py-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
            activeTab === 'downloads'
              ? 'bg-[#20216B] text-[#FFF000] font-bold shadow-xs'
              : 'text-[#1E293B] hover:text-stone-950 hover:bg-[#E2E8F0]'
          }`}
        >
          Official Downloads Repository
        </button>
      </div>

      {/* 1. NEWS TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {NEWS_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#CBD5E1] rounded-lg p-6 space-y-3 hover:border-[#292A86] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs text-[#475569] font-medium">
                  <span className="font-semibold text-[#20216B]">{item.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#0F1035] leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#1E293B] font-prose-serif leading-relaxed">
                  {item.content}
                </p>

                <div className="text-[11px] text-[#475569] pt-2 border-t border-stone-100">
                  Published by: Office of Institutional Public Relations · DAR - E - ARQAM
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GALLERY TAB with IntersectionObserver Lazy Loading */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Gallery Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EEF2F8] rounded-md border border-[#CBD5E1]">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors cursor-pointer ${
                  galleryFilter === cat
                    ? 'bg-[#20216B] text-white font-semibold shadow-xs'
                    : 'text-[#1E293B] hover:text-[#0F1035] hover:bg-[#E2E8F0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid with Intersection Observer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((gal, idx) => (
              <div
                key={gal.id}
                onClick={() => setSelectedLightboxIndex(idx)}
                className="bg-white border border-[#CBD5E1] rounded-xl overflow-hidden shadow-2xs group hover:border-[#292A86] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-52 sm:h-56 bg-[#0E1324] overflow-hidden">
                  {/* Native IntersectionObserver Lazy Image */}
                  <LazyImage
                    src={gal.image}
                    alt={gal.title}
                    thumbnailUrl={gal.thumbnailUrl}
                    rootMargin="200px 0px"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                  />
                  
                  {/* Category Tag */}
                  {gal.category && (
                    <div className="absolute top-2.5 right-2.5 z-20 bg-stone-950/85 backdrop-blur-xs text-[#FFF000] text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm border border-[#FFF000]/30 shadow-sm">
                      {gal.category}
                    </div>
                  )}

                  {/* Expand Overlay Icon */}
                  <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-3 py-1.5 rounded-full bg-black/80 border border-[#FFF000] text-[#FFF000] text-xs font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>View Full Image</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="text-[11px] text-[#475569] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{gal.date}</span>
                    </div>
                    <h3 className="font-editorial text-sm sm:text-base font-bold text-[#0F1035] leading-snug group-hover:text-[#20216B] transition-colors">
                      {gal.title}
                    </h3>
                    <p className="text-xs text-[#334155] font-prose-serif leading-relaxed line-clamp-2">
                      {gal.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DOWNLOADS TAB */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search download files, forms, rules..."
                value={downloadSearch}
                onChange={(e) => setDownloadSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#94A3B8] rounded-md bg-[#F8FAFC]"
              />
            </div>
            <div className="text-xs text-[#475569]">
              Showing {filteredDownloads.length} authorized institutional documents
            </div>
          </div>

          {/* Document Rows */}
          <div className="bg-white border border-[#CBD5E1] rounded-lg divide-y divide-stone-200 shadow-2xs">
            {filteredDownloads.map((doc) => (
              <div
                key={doc.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC]/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#475569]">
                    <span className="font-semibold text-[#20216B]">{doc.category}</span>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-stone-400">Ref: {doc.refNo}</span>
                    <span>·</span>
                    <span>{doc.date}</span>
                  </div>
                  <div className="font-editorial text-sm sm:text-base font-bold text-[#0F1035]">
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Format: {doc.fileType || 'PDF'} · Size: {doc.fileSize}
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => alert(`Downloading official document: ${doc.title} (${doc.refNo})`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2F8] hover:bg-[#20216B] text-[#20216B] hover:text-[#FFF000] border border-[#CBD5E1] hover:border-[#20216B] rounded-sm text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Fullscreen Lightbox Modal for Campus Gallery */}
      {selectedLightboxIndex !== null && filteredGallery[selectedLightboxIndex] && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image Fullscreen Lightbox"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#20216B] text-[#FFF000] border border-[#D4AF37]/50 text-xs font-mono font-bold">
                {String(selectedLightboxIndex + 1).padStart(2, '0')} / {String(filteredGallery.length).padStart(2, '0')}
              </span>
              <div className="font-editorial text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                {filteredGallery[selectedLightboxIndex]?.title}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedLightboxIndex(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white hover:text-[#FFF000] transition-colors cursor-pointer"
              aria-label="Close fullscreen modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Image Center */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <LazyImage
              src={filteredGallery[selectedLightboxIndex]?.image}
              alt={filteredGallery[selectedLightboxIndex]?.title}
              thumbnailUrl={filteredGallery[selectedLightboxIndex]?.thumbnailUrl}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
              containerClassName="max-w-full max-h-[80vh] flex items-center justify-center bg-transparent"
            />

            {/* Prev & Next in Lightbox */}
            {filteredGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedLightboxIndex((selectedLightboxIndex - 1 + filteredGallery.length) % filteredGallery.length)}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer shadow-xl"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLightboxIndex((selectedLightboxIndex + 1) % filteredGallery.length)}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white hover:text-[#FFF000] border border-white/20 transition-all cursor-pointer shadow-xl"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Caption */}
          {filteredGallery[selectedLightboxIndex]?.description && (
            <div className="max-w-3xl mx-auto text-center text-xs sm:text-sm text-stone-300 font-prose-serif pt-2 pb-1">
              {filteredGallery[selectedLightboxIndex].description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
