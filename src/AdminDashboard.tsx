/**
 * Creativity Juice — Admin CMS & Studio Management Dashboard
 * Completely decoupled management panel for adding, editing, and deleting
 * projects, photos/media, calendar content, and studio configurations.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ProjectItem,
  MediaItem,
  StudioSettings,
  getProjects,
  saveProject,
  deleteProject,
  getMediaItems,
  addMediaItem,
  deleteMediaItem,
  getStudioSettings,
  saveStudioSettings,
  exportAllData,
  importAllData,
  resetStudioToDefaults,
  setAdminAuthenticated,
  CJ_STUDIO_DATA_EVENT,
} from './adminStore';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  CalendarDays,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  Search,
  Upload,
  RefreshCw,
  Download,
  Eye,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowRight,
  Monitor,
  Tag,
  Film,
  Compass,
  AlertCircle,
  X,
  Lock,
  Key,
} from 'lucide-react';

interface AdminDashboardProps {
  onExit: () => void;
  onLockAndExit?: () => void;
  onSetWallpaper?: (url: string) => void;
}

type AdminTab = 'overview' | 'projects' | 'media' | 'calendar' | 'notes' | 'settings';

export default function AdminDashboard({ onExit, onLockAndExit, onSetWallpaper }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<StudioSettings>(getStudioSettings());

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('all');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');

  // Modal / Drawer States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Form State for Project
  const [projectForm, setProjectForm] = useState<Partial<ProjectItem>>({
    title: '',
    titleEn: '',
    subtitle: '',
    category: 'branding',
    categoryLabel: 'معماری و هویت برند',
    client: '',
    year: '۱۴۰۳',
    trackCode: 'TRACK 01 // BRAND IDENTITY',
    coverImage: '',
    galleryImages: [],
    cinemaRatio: false,
    videoDuration: '',
    badge: '',
    challenge: '',
    solution: '',
    metrics: '',
    deliverables: [],
    tags: [],
    colorAccent: '#D97706',
    featured: true,
  });

  const [deliverableInput, setDeliverableInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Form State for Media
  const [mediaForm, setMediaForm] = useState<{
    title: string;
    url: string;
    category: 'projects' | 'wallpapers' | 'brand' | 'team' | 'packaging' | 'cinema';
    tags: string;
    aspectRatio: string;
  }>({
    title: '',
    url: '',
    category: 'projects',
    tags: '',
    aspectRatio: '16:9',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Load Data & Listen to Events
  const loadData = () => {
    setProjects(getProjects());
    setMediaItems(getMediaItems());
    setSettings(getStudioSettings());
  };

  useEffect(() => {
    loadData();
    const handleDataChanged = () => loadData();
    window.addEventListener(CJ_STUDIO_DATA_EVENT, handleDataChanged);
    return () => window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleDataChanged);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // Project Handlers
  // -------------------------------------------------------------
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: '',
      titleEn: '',
      subtitle: '',
      category: 'branding',
      categoryLabel: 'معماری و هویت برند',
      client: '',
      year: '۱۴۰۳',
      trackCode: 'TRACK 01 // BRAND IDENTITY',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      galleryImages: [],
      cinemaRatio: false,
      videoDuration: '',
      badge: 'پروژه جدید استودیو',
      challenge: '',
      solution: '',
      metrics: '',
      deliverables: ['استراتژی و دی‌ان‌ای برند', 'دیزاین سیستم کامل'],
      tags: ['هویت بصری', 'دیزاین'],
      colorAccent: '#D97706',
      featured: true,
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (item: ProjectItem) => {
    setEditingProject(item);
    setProjectForm({ ...item });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title?.trim() || !projectForm.coverImage?.trim()) {
      showToast('لطفاً عنوان و تصویر کاور پروژه را وارد نمایید.');
      return;
    }

    const categoryMap: Record<string, string> = {
      branding: 'معماری و هویت برند',
      cinema: 'سینمای تجاری و فیلم مد',
      packaging: 'بسته‌بندی و پکیجینگ لوکس',
      editorial: 'کارگردانی هنری و ادیتوریال',
      digital: 'دیجیتال و پرتال وب تعاملی',
    };

    const targetCategory = (projectForm.category as any) || 'branding';

    const projectToSave: ProjectItem = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title: projectForm.title || '',
      titleEn: projectForm.titleEn || projectForm.title || '',
      subtitle: projectForm.subtitle || '',
      category: targetCategory,
      categoryLabel: categoryMap[targetCategory] || 'هویت و دیزاین',
      client: projectForm.client || 'استودیو کریتیویتی جوس',
      year: projectForm.year || '۱۴۰۳',
      trackCode:
        targetCategory === 'cinema'
          ? 'TRACK 02 // CINEMA & VISUALS'
          : targetCategory === 'packaging'
          ? 'TRACK 03 // PACKAGING & DROPS'
          : 'TRACK 01 // BRAND IDENTITY',
      coverImage: projectForm.coverImage || '',
      galleryImages:
        projectForm.galleryImages && projectForm.galleryImages.length > 0
          ? projectForm.galleryImages
          : [projectForm.coverImage || ''],
      cinemaRatio: Boolean(projectForm.cinemaRatio),
      videoDuration: projectForm.videoDuration || '',
      badge: projectForm.badge || 'پرونده استودیو',
      challenge: projectForm.challenge || 'طراحی مجدد و ارتقای استاندارد بصری برند متناسب با پرسونای مدرن.',
      solution: projectForm.solution || 'رویکرد مونوکروم و فرم‌محور ادیتوریال، خلق هویت باوقار و زبان بصری ماندگار.',
      metrics: projectForm.metrics || 'ارتقای شاخص‌های جذابیت و توجه مخاطب هدف',
      deliverables:
        projectForm.deliverables && projectForm.deliverables.length > 0
          ? projectForm.deliverables
          : ['هویت بصری جامع', 'کتابچه استراتژی'],
      tags: projectForm.tags && projectForm.tags.length > 0 ? projectForm.tags : ['استودیو', 'دیزاین'],
      colorAccent: projectForm.colorAccent || '#D97706',
      featured: projectForm.featured ?? true,
      isPublished: true,
      createdAt: editingProject?.createdAt || '۱۴۰۳/۱۱/۰۱',
      updatedAt: 'امروز',
    };

    saveProject(projectToSave);
    setIsProjectModalOpen(false);
    showToast(editingProject ? 'پروژه با موفقیت به‌روزرسانی شد.' : 'پروژه جدید با موفقیت اضافه شد.');
  };

  const handleDeleteProject = (id: string, title: string) => {
    if (window.confirm(`آیا از انتقال پروژه «${title}» به سطل زباله اطمینان دارید؟`)) {
      deleteProject(id);
      showToast(`پروژه «${title}» به سطل زباله منتقل شد.`);
    }
  };

  // -------------------------------------------------------------
  // Media Handlers
  // -------------------------------------------------------------
  const handleOpenAddMedia = () => {
    setMediaForm({
      title: '',
      url: '',
      category: 'projects',
      tags: '',
      aspectRatio: '16:9',
    });
    setIsMediaModalOpen(true);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaForm.title.trim() || !mediaForm.url.trim()) {
      showToast('لطفاً عنوان و آدرس تصویر را مشخص نمایید.');
      return;
    }

    const tagsArray = mediaForm.tags
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    addMediaItem({
      title: mediaForm.title,
      url: mediaForm.url,
      category: mediaForm.category,
      tags: tagsArray.length > 0 ? tagsArray : ['تصویر', 'استودیو'],
      aspectRatio: mediaForm.aspectRatio,
      dimensions: mediaForm.aspectRatio === '21:9' ? '3840 × 1645' : '2560 × 1440',
      size: '1.8 MB',
    });

    setIsMediaModalOpen(false);
    showToast('تصویر با موفقیت به کتابخانه رسانه‌ها اضافه شد.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('فایل انتخابی باید از نوع تصویر باشد.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEv) => {
      const dataUrl = loadEv.target?.result as string;
      if (dataUrl) {
        setMediaForm((prev) => ({
          ...prev,
          url: dataUrl,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
        showToast('تصویر محلی بارگذاری شد.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('آدرس تصویر در کلیپ‌بورد کپی شد.');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSetAsWallpaper = (url: string) => {
    saveStudioSettings({ activeWallpaper: url });
    if (onSetWallpaper) onSetWallpaper(url);
    showToast('والپیپر دسکتاپ استودیو با موفقیت تغییر یافت.');
  };

  const handleDeleteMedia = (id: string, title: string) => {
    if (window.confirm(`آیا از انتقال تصویر «${title}» به سطل زباله اطمینان دارید؟`)) {
      deleteMediaItem(id);
      showToast(`تصویر «${title}» به سطل زباله منتقل شد.`);
    }
  };

  // -------------------------------------------------------------
  // Settings & Backup Handlers
  // -------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudioSettings(settings);
    showToast('تنظیمات عمومی استودیو با موفقیت ذخیره شد.');
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creativity-juice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('نسخه پشتیبان کامل دانلود شد.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content && importAllData(content)) {
        showToast('اطلاعات سایت با موفقیت بازیابی شد.');
      } else {
        showToast('خطا در بارگذاری فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('آیا از بازنشانی کلیه پروژه‌ها و تنظیمات به حالت اولیه اطمینان دارید؟')) {
      resetStudioToDefaults();
      showToast('اطلاعات به وضعیت پیش‌فرض کارخانه بازنشانی شد.');
    }
  };

  // Filtered Lists
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory =
        projectCategoryFilter === 'all' || p.category === projectCategoryFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [projects, projectCategoryFilter, searchQuery]);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((m) => {
      const matchesCategory =
        mediaCategoryFilter === 'all' || m.category === mediaCategoryFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [mediaItems, mediaCategoryFilter, searchQuery]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] bg-[#0E0E10] text-[#E4E4E7] flex flex-col font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-amber-500 text-neutral-950 font-medium px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-400 text-xs sm:text-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="h-14 bg-[#141417]/95 border-b border-[#27272A] px-4 sm:px-6 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-black text-base shadow-lg shadow-amber-500/20">
            CJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">داشبورد مدیریت استودیو</span>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                CMS v3.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              کنترل کامل و تفکیک‌شده محتوا، پروژه‌ها، تصاویر و هویت استودیو
            </p>
          </div>
        </div>

        {/* Action Controls & Exit to Public UI/UX */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>بخش مدیریت فعال است (تفکیک از UI/UX)</span>
          </div>

          <button
            onClick={() => {
              if (onLockAndExit) {
                onLockAndExit();
              } else {
                setAdminAuthenticated(false);
                onExit();
              }
            }}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-red-950/70 text-neutral-300 hover:text-red-300 border border-neutral-700/80 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            title="خروج از حساب مدیریت و قفل کردن دسترسی (مخصوص ارسال لینک به کارفرما)"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">قفل و خروج از ادمین</span>
          </button>

          <button
            onClick={onExit}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            title="خروج از پنل مدیریت و بازگشت به دسکتاپ تعاملی سایت"
          >
            <Monitor className="w-4 h-4" />
            <span>مشاهده سایت اصلی (پیش‌نمایش زنده)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 sm:w-64 bg-[#121214] border-l border-[#27272A] flex flex-col justify-between shrink-0">
          <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:block">
              بخش‌های مدیریتی
            </div>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">پیشخوان و آمار کلی</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="hidden sm:inline">مدیریت پروژه‌ها</span>
              </div>
              <span className="hidden sm:inline-block font-mono text-[11px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="hidden sm:inline">کتابخانه عکس‌ها</span>
              </div>
              <span className="hidden sm:inline-block font-mono text-[11px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                {mediaItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">تقویم محتوا و سوشال</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">یادداشت‌ها و بریف‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">تنظیمات استودیو و دیتابیس</span>
            </button>
          </div>

          {/* Quick System Status Card at Bottom of Sidebar */}
          <div className="p-3 sm:p-4 border-t border-[#27272A] hidden sm:block bg-neutral-950/40">
            <div className="text-[11px] text-neutral-400 mb-1">والپیپر جاری سایت:</div>
            <div className="text-xs text-neutral-200 truncate font-mono mb-2">
              {settings.activeWallpaper.slice(0, 32)}...
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود بکاپ دیتابیس</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0E0E10] p-4 sm:p-6 lg:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-neutral-900 to-[#18181B] border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      خوش آمدید، {settings.adminName}
                    </h1>
                    <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      این پنل اختصاصی مدیریت، کاملاً از رابط کاربری عمومی سایت تفکیک شده است. تمامی تغییرات پروژه‌ها، آپلود تصاویر، زمان‌بندی محتوا و تنظیمات استودیو در اینجا انجام می‌شود و به صورت بلادرنگ در سایت اعمال می‌گردد.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleOpenAddProject}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن پروژه جدید</span>
                    </button>
                    <button
                      onClick={handleOpenAddMedia}
                      className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>آپلود تصویر</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>پروژه‌های ثبت‌شده</span>
                    <FolderKanban className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">{projects.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <span>آماده نمایش در گالری عمومی</span>
                  </div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>تصاویر و مدیا</span>
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">{mediaItems.length}</div>
                  <div className="text-[11px] text-amber-400 mt-2">
                    <span>شامل والپیپرها و پرونده‌ها</span>
                  </div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>دپارتمان‌های فعال</span>
                    <Layers className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">۴</div>
                  <div className="text-[11px] text-neutral-400 mt-2">
                    <span>هویت برند، سینما، پکیجینگ، مارکتینگ</span>
                  </div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>وضعیت دیتابیس</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>سینک بلادرنگ با دسکتاپ</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">
                    <span>ذخیره‌سازی لوکال و ایمن</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Recent Projects */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects Table */}
                <div className="lg:col-span-2 bg-[#141417] border border-[#27272A] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-amber-500" />
                      <h2 className="font-bold text-sm text-white">آخرین پروژه‌های استودیو</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      مشاهده و ویرایش همه ({projects.length})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projects.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-700"
                          />
                          <div>
                            <div className="font-semibold text-xs sm:text-sm text-white">{p.title}</div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>{p.client}</span>
                              <span>•</span>
                              <span className="text-amber-500 font-mono">{p.year}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditProject(p)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-md transition cursor-pointer"
                            title="ویرایش پروژه"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id, p.title)}
                            className="p-1.5 bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded-md transition cursor-pointer"
                            title="انتقال به سطل زباله"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Photos / Media Strip */}
                <div className="bg-[#141417] border border-[#27272A] rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <h2 className="font-bold text-sm text-white">کتابخانه سریع تصاویر</h2>
                      </div>
                      <button
                        onClick={() => setActiveTab('media')}
                        className="text-xs text-amber-400 hover:underline cursor-pointer"
                      >
                        گالری رسانه
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {mediaItems.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-neutral-800"
                        >
                          <img
                            src={m.url}
                            alt={m.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSetAsWallpaper(m.url)}
                              className="p-1 bg-amber-500 text-black rounded text-[10px] font-bold"
                              title="تنظیم به عنوان والپیپر"
                            >
                              والپیپر
                            </button>
                            <button
                              onClick={() => handleCopyUrl(m.url)}
                              className="p-1 bg-white text-black rounded text-[10px]"
                              title="کپی لینک"
                            >
                              کپی
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAddMedia}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن عکس جدید</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS CMS */}
          {activeTab === 'projects' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-6 h-6 text-amber-500" />
                    <span>مدیریت پروژه‌ها و کیس‌استادی‌ها</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    افزودن، ویرایش و حذف پرونده‌های معماری برند، سینما و پکیجینگ با سینک مستقیم در گالری عمومی.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddProject}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن پروژه جدید</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141417] p-3 rounded-xl border border-[#27272A]">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'همه پرونده‌ها' },
                    { id: 'branding', label: 'معماری و هویت برند' },
                    { id: 'cinema', label: 'سینمای تجاری و مد' },
                    { id: 'packaging', label: 'بسته‌بندی لوکس' },
                    { id: 'editorial', label: 'ادیتوریال' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setProjectCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        projectCategoryFilter === cat.id
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در عنوان، کارفرما یا تگ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#141417] border border-[#27272A] rounded-xl overflow-hidden hover:border-neutral-700 transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* Cover Thumbnail with category pill */}
                      <div className="relative aspect-video overflow-hidden bg-neutral-900">
                        <img
                          src={p.coverImage}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-medium text-amber-400 border border-amber-500/30">
                          {p.categoryLabel}
                        </div>
                        {p.cinemaRatio && (
                          <div className="absolute bottom-2.5 right-2.5 bg-neutral-950/80 px-2 py-0.5 rounded text-[10px] text-neutral-300 font-mono flex items-center gap-1">
                            <Film className="w-3 h-3 text-amber-500" />
                            <span>۲۱:۹ سینمایی</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-amber-500 font-mono">{p.client}</span>
                          <span className="text-[11px] text-neutral-400 font-mono">{p.year}</span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition">
                          {p.title}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                          {p.subtitle || p.challenge}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {p.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 border-t border-[#27272A] bg-neutral-950/40 flex items-center justify-between">
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {p.galleryImages?.length || 1} تصویر
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProject(p)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id, p.title)}
                          className="p-1 bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 rounded transition cursor-pointer"
                          title="انتقال به سطل زباله"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-16 bg-[#141417] border border-[#27272A] rounded-xl text-neutral-400 space-y-3">
                  <FolderKanban className="w-10 h-10 mx-auto text-neutral-600" />
                  <p className="text-sm">هیچ پروژه‌ای مطابق با فیلتر یا جستجو یافت نشد.</p>
                  <button
                    onClick={handleOpenAddProject}
                    className="text-xs text-amber-400 underline font-semibold cursor-pointer"
                  >
                    افزودن اولین پروژه جدید
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-amber-500" />
                    <span>کتابخانه تصاویر و عکس‌های استودیو</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    مدیریت عکس‌های باکیفیت، والپیپرهای دسکتاپ، تیزرها و پکیجینگ؛ با قابلیت کپی مستقیم آدرس و تنظیم والپیپر.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddMedia}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>افزودن تصویر جدید</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141417] p-3 rounded-xl border border-[#27272A]">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                  {[
                    { id: 'all', label: 'همه عکس‌ها' },
                    { id: 'projects', label: 'پروژه‌ها و معماری' },
                    { id: 'wallpapers', label: 'والپیپرهای دسکتاپ' },
                    { id: 'cinema', label: 'سینما و فشن' },
                    { id: 'packaging', label: 'بسته‌بندی و محصول' },
                    { id: 'brand', label: 'هویت بصری' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMediaCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                        mediaCategoryFilter === cat.id
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در نام عکس یا تگ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedia.map((m) => (
                  <div
                    key={m.id}
                    className="group bg-[#141417] border border-[#27272A] rounded-xl overflow-hidden hover:border-neutral-600 transition flex flex-col justify-between"
                  >
                    {/* Image Preview with Hover Actions */}
                    <div className="relative aspect-video overflow-hidden bg-neutral-900 cursor-pointer" onClick={() => setPreviewImage(m.url)}>
                      <img
                        src={m.url}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-black/70 text-amber-400 px-2 py-0.5 rounded font-mono">
                            {m.aspectRatio || '16:9'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(m.id, m.title);
                            }}
                            className="p-1 bg-red-950/80 hover:bg-red-800 text-red-200 rounded transition"
                            title="حذف و انتقال به سطل زباله"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetAsWallpaper(m.url);
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded text-xs font-bold transition flex items-center gap-1"
                          >
                            <Monitor className="w-3 h-3" />
                            <span>تنظیم والپیپر</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(m.url);
                            }}
                            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition flex items-center gap-1"
                          >
                            {copiedUrl === m.url ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>کپی لینک</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3 space-y-1">
                      <div className="font-semibold text-xs text-white truncate" title={m.title}>
                        {m.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                        <span>{m.dimensions || '2560 × 1440'}</span>
                        <span>{m.addedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CALENDAR CMS */}
          {activeTab === 'calendar' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-amber-500" />
                    <span>تقویم محتوایی و برنامه‌ریزی شبکه‌های اجتماعی</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    برنامه‌ریزی، زمان‌بندی و مدیریت موضوعات کانتنت اینستاگرام، لینکدین و یوتیوب کارفرما و استودیو.
                  </p>
                </div>
              </div>

              <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-white">تقویم دوگانه فعال (شمسی ۱۴۰۳ + میلادی ۲۰۲۵)</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">سینک خودکار با دسکتاپ</span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  تقویم محتوایی استودیو به طور کامل با تقویم شمسی هماهنگ است و امکان ثبت سناریوهای پست، استوری، ریلز و آرت‌دایرکشن را به کارفرما می‌دهد. تمامی رویدادها در استور مرکزی ذخیره شده و پس از حذف، در سطل زباله نگهداری می‌شوند.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                    <div className="text-xs text-neutral-400">پلتفرم‌های پشتیبانی‌شده</div>
                    <div className="text-sm font-bold text-white mt-1">اینستاگرام • لینکدین • یوتیوب • X</div>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                    <div className="text-xs text-neutral-400">سیستم تاریخ</div>
                    <div className="text-sm font-bold text-white mt-1">هجری شمسی همگام با روزهای هفته</div>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                    <div className="text-xs text-neutral-400">وضعیت‌های انتشار</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">ایده، در تولید، تایید شده، منتشر شده</div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={onExit}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    <span>باز کردن تقویم کامل در محیط دسکتاپ</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTES & BRIEFS */}
          {activeTab === 'notes' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-amber-500" />
                  <span>یادداشت‌ها، ایده‌ها و بریف‌های کارفرما</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  دفترچه یادداشت دیجیتال، سناریوهای خلاقه و اطلاعات ثبت‌شده توسط کارفرما.
                </p>
              </div>

              <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-bold text-white">دفترچه یادداشت کارفرما و تیم</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">ذخیره ایمن و دسته‌بندی‌شده</span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  هر ایده، سناریوی ویدئویی، بریف پروژه و پیشنهاداتی که کارفرما در دفترچه یادداشت دسکتاپ می‌نویسد، در حافظه استودیو نگهداری می‌شود. شما می‌توانید از طریق محیط دسکتاپ یا فرم زیر ایده‌های جدید بنویسید.
                </p>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={onExit}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    <span>مشاهده و نگارش در دفترچه یادداشت</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & BACKUP */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-amber-500" />
                  <span>تنظیمات استودیو و مدیریت دیتابیس</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  شخصی‌سازی مشخصات استودیو، پشتیبان‌گیری کامل (JSON) و بازنشانی اطلاعات.
                </p>
              </div>

              {/* Studio Info Form */}
              <form onSubmit={handleSaveSettings} className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <h2 className="font-bold text-sm sm:text-base text-white border-b border-neutral-800 pb-3">
                  مشخصات بنیادین استودیو
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">نام استودیو (فارسی)</label>
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">نام انگلیسی</label>
                    <input
                      type="text"
                      value={settings.studioNameEn}
                      onChange={(e) => setSettings({ ...settings, studioNameEn: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">شعار و تیتر استودیو</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">ایمیل ارتباطی</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">شماره تماس دفتر</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">نشانی آتلیه و دفتر کار</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">آیدی اینستاگرام</label>
                    <input
                      type="text"
                      value={settings.instagram}
                      onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1.5 font-medium">لینکدین استودیو</label>
                    <input
                      type="text"
                      value={settings.linkedin}
                      onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* Security & PIN Code for Admin */}
                  <div className="sm:col-span-2 pt-4 border-t border-neutral-800">
                    <h3 className="font-bold text-xs sm:text-sm text-amber-400 mb-1.5 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      <span>امنیت و رمز عبور ورود به پنل مدیریت (مخصوص کارفرما و مهمانان)</span>
                    </h3>
                    <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                      هنگامی که این پورتفولیو را برای مشتریان ارسال می‌کنید، به صورت خودکار در «حالت مهمان» باز می‌شود و تمامی دکمه‌های مدیریت و ویرایش پنهان هستند. تنها شما با وارد کردن این پین‌کد یا با کلید میانبر می‌توانید وارد پنل شوید.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
                      <div>
                        <label className="block text-xs text-neutral-300 mb-1.5 font-medium flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          <span>پین‌کد ورود ادمین (پیش‌فرض: 1234)</span>
                        </label>
                        <input
                          type="text"
                          value={settings.adminPin || '1234'}
                          onChange={(e) => setSettings({ ...settings, adminPin: e.target.value })}
                          placeholder="1234"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center font-bold"
                        />
                      </div>

                      <div className="flex flex-col justify-center">
                        <label className="flex items-center gap-2.5 text-xs text-neutral-200 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={settings.hideAdminFromVisitors ?? true}
                            onChange={(e) => setSettings({ ...settings, hideAdminFromVisitors: e.target.checked })}
                            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                          />
                          <span className="font-medium">مخفی‌سازی کامل دکمه مدیریت برای بازدیدکنندگان ناشناس</span>
                        </label>
                        <span className="text-[10px] text-neutral-500 mt-1 mr-6">
                          کلید میانبر باز کردن قفل برای شما: <span className="font-mono text-amber-400">Ctrl + Shift + A</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    ذخیره مشخصات استودیو
                  </button>
                </div>
              </form>

              {/* Database Backup & Restore */}
              <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <h2 className="font-bold text-sm sm:text-base text-white border-b border-neutral-800 pb-3">
                  پشتیبان‌گیری و ایمپورت دیتابیس
                </h2>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                  می‌توانید تمامی پرونده‌ها، عکس‌ها و تنظیمات وبسایت را در قالب یک فایل استاندارد JSON دانلود کرده و در هر زمان یا روی هر دستگاه دیگری بازیابی کنید.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>دانلود بکاپ دیتابیس (JSON)</span>
                  </button>

                  <label className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>بازیابی دیتابیس از فایل JSON</span>
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleResetDefaults}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-red-950/60 text-red-400 border border-red-900/40 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer mr-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>بازنشانی به پیش‌فرض کارخانه</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT PROJECT */}
      {/* ------------------------------------------------------------- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {editingProject ? 'ویرایش پروژه و پرونده استودیو' : 'افزودن پروژه جدید به استودیو'}
                </h2>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان پروژه (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="مثال: آتلیه معماری آرکا"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان انگلیسی</label>
                  <input
                    type="text"
                    value={projectForm.titleEn || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, titleEn: e.target.value })}
                    placeholder="Arka Architecture Atelier"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">کارفرما / برند</label>
                  <input
                    type="text"
                    value={projectForm.client || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                    placeholder="مثال: گروه ساختمانی آرکا"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">سال تولید</label>
                  <input
                    type="text"
                    value={projectForm.year || '۱۴۰۳'}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                    placeholder="۱۴۰۳"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">دسته‌بندی تخصصی</label>
                  <select
                    value={projectForm.category || 'branding'}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="branding">معماری و هویت برند (Branding)</option>
                    <option value="cinema">سینمای تجاری و مد (Cinema & Fashion)</option>
                    <option value="packaging">بسته‌بندی و دراپ محصول (Packaging)</option>
                    <option value="editorial">کارگردانی هنری و ادیتوریال (Editorial)</option>
                    <option value="digital">پرتال وب تعاملی و ۳D (Digital)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نشان افتخار یا دستاورد (Badge)</label>
                  <input
                    type="text"
                    value={projectForm.badge || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, badge: e.target.value })}
                    placeholder="مثال: برنده سالنامه معماری معاصر"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">
                  آدرس تصویر کاور اصلی (Cover Image URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={projectForm.coverImage || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, coverImage: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  {projectForm.coverImage && (
                    <img
                      src={projectForm.coverImage}
                      alt="Cover Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-neutral-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Subtitle / Narrative */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">زیرعنوان و خلاصه روایت</label>
                <input
                  type="text"
                  value={projectForm.subtitle || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, subtitle: e.target.value })}
                  placeholder="مثال: ری‌برندینگ جامع، کتابچه مانیفست و فیلم مستند سینمایی ۳۵ میلی‌متری"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">چالش پروژه</label>
                  <textarea
                    rows={3}
                    value={projectForm.challenge || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, challenge: e.target.value })}
                    placeholder="مسئله یا نیاز بنیادین کارفرما قبل از ورود استودیو..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">راه‌حل استراتژیک و دیزاین</label>
                  <textarea
                    rows={3}
                    value={projectForm.solution || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, solution: e.target.value })}
                    placeholder="رویکرد خلق هویت و تولید محتوای استودیو..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">نتایج و شاخص‌های موفقیت (Metrics)</label>
                <input
                  type="text"
                  value={projectForm.metrics || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, metrics: e.target.value })}
                  placeholder="مثال: +۲۸۰٪ رشد پرونده‌های لوکس • سولد-اوت در هفته اول"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">خروجی‌ها و اقلام تحویل‌شده</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="مثال: کتابچه مانیفست کتان چاپی"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (deliverableInput.trim()) {
                          setProjectForm({
                            ...projectForm,
                            deliverables: [...(projectForm.deliverables || []), deliverableInput.trim()],
                          });
                          setDeliverableInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (deliverableInput.trim()) {
                        setProjectForm({
                          ...projectForm,
                          deliverables: [...(projectForm.deliverables || []), deliverableInput.trim()],
                        });
                        setDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(projectForm.deliverables || []).map((del, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    >
                      <span>{del}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            deliverables: (projectForm.deliverables || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="text-neutral-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Gallery Images */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">
                  تصاویر تکمیلی گالری پروژه (Gallery URLs)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    placeholder="آدرس عکس اضافی..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (galleryUrlInput.trim()) {
                          setProjectForm({
                            ...projectForm,
                            galleryImages: [...(projectForm.galleryImages || []), galleryUrlInput.trim()],
                          });
                          setGalleryUrlInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (galleryUrlInput.trim()) {
                        setProjectForm({
                          ...projectForm,
                          galleryImages: [...(projectForm.galleryImages || []), galleryUrlInput.trim()],
                        });
                        setGalleryUrlInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition"
                  >
                    افزودن به گالری
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(projectForm.galleryImages || []).map((imgUrl, idx) => (
                    <div key={idx} className="relative w-16 h-12 rounded border border-neutral-700 overflow-hidden group">
                      <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            galleryImages: (projectForm.galleryImages || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute inset-0 bg-red-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingProject ? 'ذخیره تغییرات پروژه' : 'انتشار پروژه در استودیو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD MEDIA / PHOTO */}
      {/* ------------------------------------------------------------- */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">افزودن تصویر به کتابخانه رسانه</h2>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedia} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان یا نام تصویر *</label>
                <input
                  type="text"
                  required
                  value={mediaForm.title}
                  onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                  placeholder="مثال: عکس آتلیه و والپیپر سینمایی"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Upload or URL */}
              <div className="space-y-2">
                <label className="block text-xs text-neutral-400 font-medium">روش بارگذاری تصویر *</label>

                <div className="p-4 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl bg-neutral-950/40 text-center space-y-2 transition">
                  <Upload className="w-6 h-6 text-amber-500 mx-auto" />
                  <div className="text-xs text-neutral-300">
                    تصویر را از کامپیوتر یا موبایل انتخاب کنید:
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                  />
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-neutral-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase">یا وارد کردن لینک مستقیم</span>
                  <div className="flex-grow border-t border-neutral-800"></div>
                </div>

                <input
                  type="url"
                  value={mediaForm.url}
                  onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />

                {mediaForm.url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-700 mt-2">
                    <img src={mediaForm.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">دسته‌بندی</label>
                  <select
                    value={mediaForm.category}
                    onChange={(e) => setMediaForm({ ...mediaForm, category: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="projects">پروژه‌ها و معماری</option>
                    <option value="wallpapers">والپیپرهای دسکتاپ</option>
                    <option value="cinema">سینما و فشن</option>
                    <option value="packaging">بسته‌بندی و محصول</option>
                    <option value="brand">هویت بصری</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نسبت ابعاد</label>
                  <select
                    value={mediaForm.aspectRatio}
                    onChange={(e) => setMediaForm({ ...mediaForm, aspectRatio: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="16:9">۱۶:۹ (افقی استاندارد)</option>
                    <option value="21:9">۲۱:۹ (سینمایی آنامورفیک)</option>
                    <option value="1:1">۱:۱ (مربعی)</option>
                    <option value="4:5">۴:۵ (پرتره اینستاگرام)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={mediaForm.tags}
                  onChange={(e) => setMediaForm({ ...mediaForm, tags: e.target.value })}
                  placeholder="مثال: آتلیه، معماری، والپیپر، بتن"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  افزودن به کتابخانه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: IMAGE FULLSCREEN PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
            <img src={previewImage} alt="Fullscreen View" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/80 text-white p-2 rounded-full hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
