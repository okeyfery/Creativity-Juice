/**
 * Creativity Juice — AdminPanel Component
 * Manages the state of projects and photos with full CRUD forms (Create, Edit, Delete).
 * Rendered conditionally based on the authentication state with an integrated PIN gate.
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
  isAdminAuthenticated,
  setAdminAuthenticated,
  verifyAdminPin,
  CJ_STUDIO_DATA_EVENT,
} from './adminStore';
import {
  LayoutDashboard,
  FolderKanban,
  Image as ImageIcon,
  CalendarDays,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Search,
  Upload,
  RefreshCw,
  Download,
  Eye,
  Layers,
  Sparkles,
  ArrowRight,
  Monitor,
  Film,
  Lock,
  Key,
  X,
  FileCode,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Briefcase,
  Users,
  StickyNote,
  Laptop,
} from 'lucide-react';
import { MediaPickerModal } from './admin/MediaPickerModal';
import { ServicesTab } from './admin/ServicesTab';
import { TeamManifestoTab } from './admin/TeamManifestoTab';
import { NotesTab } from './admin/NotesTab';

export interface AdminPanelProps {
  onExit?: () => void;
  onLockAndExit?: () => void;
  onSetWallpaper?: (url: string) => void;
  initialTab?: 'overview' | 'projects' | 'photos' | 'services' | 'team' | 'notes' | 'calendar' | 'settings';
}

type AdminTab = 'overview' | 'projects' | 'photos' | 'services' | 'team' | 'notes' | 'calendar' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onExit,
  onLockAndExit,
  onSetWallpaper,
  initialTab = 'projects',
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  // Data States
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<StudioSettings>(getStudioSettings());

  // Search & Category Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('all');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');

  // Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Media Picker Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'cover' | 'gallery'>('cover');

  // UI Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Project Form State
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
  const [galleryUrlInput, setGalleryUrlInput] = useState('');

  // Photo / Media Form State
  const [photoForm, setPhotoForm] = useState<{
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

  // File Upload Refs
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // Laptop File Upload Handlers (Cover & Gallery)
  // -------------------------------------------------------------
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setProjectForm((prev) => ({ ...prev, coverImage: dataUrl }));
        addMediaItem({
          title: `کاور پروژه ${projectForm.title || 'جدید'}`,
          url: dataUrl,
          category: 'projects',
          tags: ['کاور', 'پروژه', 'لپ‌تاپ'],
          aspectRatio: projectForm.cinemaRatio ? '21:9' : '16:9',
        });
        showToast('تصویر کاور پروژه با موفقیت از لپ‌تاپ بارگذاری شد.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imgFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imgFiles.length === 0) {
      showToast('لطفاً فایل‌های تصویری انتخاب نمایید.');
      return;
    }

    let completed = 0;
    const addedUrls: string[] = [];

    imgFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (loadEv) => {
        const dataUrl = loadEv.target?.result as string;
        if (dataUrl) {
          addedUrls.push(dataUrl);
          addMediaItem({
            title: `گالری ${projectForm.title || 'پروژه'}`,
            url: dataUrl,
            category: 'projects',
            tags: ['گالری', 'پروژه', 'لپ‌تاپ'],
            aspectRatio: '16:9',
          });
        }
        completed++;
        if (completed === imgFiles.length) {
          setProjectForm((prev) => ({
            ...prev,
            galleryImages: [...(prev.galleryImages || []), ...addedUrls],
          }));
          showToast(`${addedUrls.length} تصویر با موفقیت از لپ‌تاپ به گالری پروژه اضافه شد.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOpenMediaPicker = (target: 'cover' | 'gallery') => {
    setMediaPickerTarget(target);
    setIsMediaPickerOpen(true);
  };

  const handleSelectFromMediaPicker = (url: string) => {
    if (mediaPickerTarget === 'cover') {
      setProjectForm((prev) => ({ ...prev, coverImage: url }));
      showToast('تصویر کاور پروژه از کتابخانه انتخاب شد.');
    } else {
      setProjectForm((prev) => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), url],
      }));
      showToast('تصویر به گالری پروژه اضافه شد.');
    }
  };

  // Load latest data from store
  const refreshData = () => {
    setProjects(getProjects());
    setMediaItems(getMediaItems());
    setSettings(getStudioSettings());
    setIsAuthenticated(isAdminAuthenticated());
  };

  useEffect(() => {
    refreshData();
    const handleStoreChange = () => refreshData();
    window.addEventListener(CJ_STUDIO_DATA_EVENT, handleStoreChange);
    return () => window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleStoreChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setTimeout(() => pinInputRef.current?.focus(), 150);
    }
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // Authentication Handlers
  // -------------------------------------------------------------
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAuthenticated(true);
      setAuthError('');
      setPinInput('');
      showToast('احراز هویت مدیر با موفقیت انجام شد.');
    } else {
      setAuthError('پین‌کد وارد شده صحیح نمی‌باشد (رمز پیش‌فرض: 1234)');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
    if (onLockAndExit) {
      onLockAndExit();
    } else if (onExit) {
      onExit();
    }
  };

  // -------------------------------------------------------------
  // Project CRUD Handlers
  // -------------------------------------------------------------
  const handleOpenCreateProject = () => {
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
      badge: 'پرونده جدید استودیو',
      challenge: '',
      solution: '',
      metrics: '',
      deliverables: ['استراتژی و دی‌ان‌ای برند', 'دیزاین سیستم بصری'],
      tags: ['هویت برند', 'معماری'],
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

  const handleSaveProjectEntry = (e: React.FormEvent) => {
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

    const projectData: ProjectItem = {
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
      challenge: projectForm.challenge || 'ارتقای استانداردهای بصری متناسب با پرسونای مدرن.',
      solution: projectForm.solution || 'رویکرد مونوکروم و فرم‌محور، خلق هویت باوقار و زبان بصری ماندگار.',
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

    saveProject(projectData);
    setIsProjectModalOpen(false);
    showToast(editingProject ? 'پروژه با موفقیت به‌روزرسانی شد.' : 'پروژه جدید با موفقیت اضافه شد.');
  };

  const handleDeleteProjectEntry = (id: string, title: string) => {
    deleteProject(id);
    showToast(`پروژه «${title}» به سطل زباله منتقل شد.`);
  };

  const handleDuplicateProject = (item: ProjectItem) => {
    const duplicated: ProjectItem = {
      ...item,
      id: `proj-${Date.now()}`,
      title: `${item.title} (کپی)`,
      titleEn: `${item.titleEn} (Copy)`,
      createdAt: 'امروز',
      updatedAt: 'امروز',
    };
    saveProject(duplicated);
    showToast(`نسخه جدیدی از «${item.title}» ایجاد شد.`);
  };

  // -------------------------------------------------------------
  // Photo / Media Handlers
  // -------------------------------------------------------------
  const handleOpenAddPhoto = () => {
    setPhotoForm({
      title: '',
      url: '',
      category: 'projects',
      tags: '',
      aspectRatio: '16:9',
    });
    setIsPhotoModalOpen(true);
  };

  const handleSavePhotoEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title.trim() || !photoForm.url.trim()) {
      showToast('لطفاً عنوان و آدرس تصویر را مشخص نمایید.');
      return;
    }

    const tagsArray = photoForm.tags
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    addMediaItem({
      title: photoForm.title,
      url: photoForm.url,
      category: photoForm.category,
      tags: tagsArray.length > 0 ? tagsArray : ['تصویر', 'استودیو'],
      aspectRatio: photoForm.aspectRatio,
      dimensions: photoForm.aspectRatio === '21:9' ? '3840 × 1645' : '2560 × 1440',
      size: '1.8 MB',
    });

    setIsPhotoModalOpen(false);
    showToast('تصویر به کتابخانه رسانه‌ها اضافه شد.');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setPhotoForm((prev) => ({
          ...prev,
          url: dataUrl,
          title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
        }));
        showToast('تصویر دستگاه با موفقیت بارگذاری شد.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('آدرس مستقیم تصویر کپی شد.');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSetWallpaper = (url: string) => {
    saveStudioSettings({ activeWallpaper: url });
    if (onSetWallpaper) onSetWallpaper(url);
    showToast('والپیپر دسکتاپ استودیو به‌روزرسانی شد.');
  };

  const handleDeletePhotoEntry = (id: string, title: string) => {
    deleteMediaItem(id);
    showToast(`تصویر «${title}» به سطل زباله منتقل شد.`);
  };

  // -------------------------------------------------------------
  // Settings & Database Backup Handlers
  // -------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudioSettings(settings);
    showToast('تنظیمات استودیو با موفقیت ذخیره شد.');
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

  const filteredPhotos = useMemo(() => {
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

  // -------------------------------------------------------------
  // CONDITIONAL RENDERING: AUTHENTICATION GATE
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div
        dir="rtl"
        className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-sans select-none"
      >
        <div className="w-full max-w-sm bg-[#161619] border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-white text-right space-y-4 animate-window-pop relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-amber-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="font-black text-lg text-white">ورود امن به پنل مدیریت (AdminPanel)</h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              این بخش کاملاً از رابط کاربری بازدیدکنندگان تفکیک شده است. برای مدیریت پروژه‌ها و عکس‌ها، رمز عبور را وارد کنید:
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-3.5">
            <div>
              <div className="relative">
                <input
                  ref={pinInputRef}
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="••••"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-amber-500 shadow-inner"
                />
                <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {authError && (
                <p className="text-[11px] text-rose-400 text-center mt-1.5 font-medium">{authError}</p>
              )}
            </div>

            <div className="flex gap-2">
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  بازگشت به سایت
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                تایید و ورود به پنل
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-neutral-800 text-[10px] text-neutral-500 text-center space-y-1">
            <div>
              رمز پیش‌فرض مدیر: <span className="font-mono text-amber-400 font-bold">1234</span>
            </div>
            <div>
              کلید میانبر در هر لحظه: <span className="font-mono text-neutral-300">Ctrl + Shift + A</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL VIEW
  // -------------------------------------------------------------
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] bg-[#0E0E10] text-[#E4E4E7] flex flex-col font-sans select-none overflow-hidden"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-amber-500 text-neutral-950 font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-400 text-xs sm:text-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="h-14 bg-[#141417]/95 border-b border-[#27272A] px-4 sm:px-6 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-black text-black text-base shadow-lg shadow-amber-500/20">
            CJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white">پنل مدیریت استودیو (AdminPanel)</span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>احراز هویت شده</span>
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              کنترل کامل پروژه‌ها، کتابخانه عکس‌ها و تفکیک از محیط کاربری
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-red-950/70 text-neutral-300 hover:text-red-300 border border-neutral-700/80 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-medium transition cursor-pointer"
            title="خروج از حساب مدیریت و قفل کردن دسترسی"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">قفل و خروج از ادمین</span>
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              title="خروج از پنل مدیریت و بازگشت به دسکتاپ تعاملی سایت"
            >
              <Monitor className="w-4 h-4" />
              <span>مشاهده سایت اصلی (پیش‌نمایش زنده)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-20 sm:w-64 bg-[#121214] border-l border-[#27272A] flex flex-col justify-between shrink-0">
          <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider hidden sm:block">
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
              onClick={() => setActiveTab('photos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'photos'
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
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">خدمات و دپارتمان‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">تیم و مانیفست استودیو</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <StickyNote className="w-4 h-4 shrink-0 text-amber-500" />
              <span className="hidden sm:inline">یادداشت‌ها و ایده‌های کارفرما</span>
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

          {/* Quick Backup Action at Sidebar Bottom */}
          <div className="p-3 sm:p-4 border-t border-[#27272A] hidden sm:block bg-neutral-950/40">
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs transition cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              <span>دانلود بکاپ دیتابیس</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0E0E10] p-4 sm:p-6 lg:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Overview Banner */}
              <div className="bg-gradient-to-r from-neutral-900 to-[#18181B] border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                      خوش آمدید، {settings.adminName}
                    </h1>
                    <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      مدیریت کامل و تفکیک‌شده پروژه‌ها، پرونده‌های استودیو، تصاویر و والپیپرها. تغییرات اعمال‌شده در این پنل بلافاصله در سایت اصلی و گالری آثار نمایش داده می‌شوند.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleOpenCreateProject}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer shadow-md shadow-amber-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن پروژه جدید</span>
                    </button>
                    <button
                      onClick={handleOpenAddPhoto}
                      className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>آپلود تصویر</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>پروژه‌های ثبت‌شده</span>
                    <FolderKanban className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">{projects.length}</div>
                  <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                    <span>آماده نمایش در گالری</span>
                  </div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>کتابخانه عکس‌ها</span>
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">{mediaItems.length}</div>
                  <div className="text-[11px] text-amber-400 mt-2">
                    <span>والپیپرها و پرونده‌ها</span>
                  </div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>حالت امنیتی</span>
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-base font-bold text-white mt-1">فعال با پین‌کد</div>
                  <div className="text-[11px] text-emerald-400 mt-2">مخفی از دید بازدیدکنندگان</div>
                </div>

                <div className="bg-[#141417] border border-[#27272A] p-5 rounded-xl">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
                    <span>وضعیت سینک دیتابیس</span>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>همگام بلادرنگ</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-2">ذخیره‌سازی ایمن لوکال</div>
                </div>
              </div>

              {/* Recent Projects Overview */}
              <div className="bg-[#141417] border border-[#27272A] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-amber-500" />
                    <h2 className="font-bold text-sm text-white">آخرین پروژه‌ها</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    مدیریت همه پروژه‌ها ({projects.length})
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
                            <span>•</span>
                            <span className="text-neutral-500 font-mono">{p.categoryLabel}</span>
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
                          onClick={() => handleDeleteProjectEntry(p.id, p.title)}
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
            </div>
          )}

          {/* TAB 2: PROJECTS MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-6 h-6 text-amber-500" />
                    <span>مدیریت پروژه‌ها و نمونه‌کارها (Projects CMS)</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    فرم‌های ایجاد، ویرایش و حذف پرونده‌های استودیو با اعمال بلادرنگ در گالری عمومی.
                  </p>
                </div>

                <button
                  onClick={handleOpenCreateProject}
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
                      {/* Cover Image */}
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

                      {/* Content */}
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

                    {/* Actions Toolbar */}
                    <div className="p-3 border-t border-[#27272A] bg-neutral-950/40 flex items-center justify-between">
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {p.galleryImages?.length || 1} تصویر
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDuplicateProject(p)}
                          className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded transition cursor-pointer"
                          title="تکثیر پروژه"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditProject(p)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProjectEntry(p.id, p.title)}
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
                  <p className="text-sm">پروژه‌ای مطابق با فیلتر یا جستجو یافت نشد.</p>
                  <button
                    onClick={handleOpenCreateProject}
                    className="text-xs text-amber-400 underline font-semibold cursor-pointer"
                  >
                    افزودن پروژه جدید
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PHOTOS & MEDIA MANAGEMENT */}
          {activeTab === 'photos' && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-6 h-6 text-amber-500" />
                    <span>کتابخانه عکس‌ها و رسانه‌ها (Photos Management)</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    آپلود تصاویر جدید، تنظیم والپیپرهای دسکتاپ، کپی لینک مستقیم و تفکیک بر اساس دسته‌بندی.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddPhoto}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>آپلود تصویر جدید</span>
                </button>
              </div>

              {/* Photo Filters */}
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
                    placeholder="جستجو در عنوان عکس یا تگ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPhotos.map((m) => (
                  <div
                    key={m.id}
                    className="group bg-[#141417] border border-[#27272A] rounded-xl overflow-hidden hover:border-neutral-600 transition flex flex-col justify-between"
                  >
                    <div
                      className="relative aspect-video overflow-hidden bg-neutral-900 cursor-pointer"
                      onClick={() => setPreviewPhotoUrl(m.url)}
                    >
                      <img
                        src={m.url}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-black/70 text-amber-400 px-2 py-0.5 rounded font-mono">
                            {m.aspectRatio || '16:9'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhotoEntry(m.id, m.title);
                            }}
                            className="p-1 bg-red-950/80 hover:bg-red-800 text-red-200 rounded transition"
                            title="انتقال به سطل زباله"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetWallpaper(m.url);
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

          {/* TAB 4: CALENDAR OVERVIEW */}
          {activeTab === 'calendar' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-amber-500" />
                    <span>تقویم محتوا و شبکه‌های اجتماعی استودیو</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                    مدیریت رویدادها، زمان‌بندی اینستاگرام و لینکدین سینک‌شده با تقویم خورشیدی و میلادی.
                  </p>
                </div>
              </div>

              <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-sm font-bold text-white">تقویم فعال شمسی و وضعیت انتشار</span>
                  <span className="text-xs font-mono text-emerald-400">سینک خودکار با دسکتاپ</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  رویدادهای محتوایی و شبکه‌های اجتماعی در استور مرکزی ثبت می‌شوند. همچنین برای سهولت کارفرما، پنجره کامل تقویم به صورت جداگانه در دسکتاپ قابل بازگشایی است.
                </p>
                {onExit && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onExit}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                    >
                      <span>باز کردن پنجره تقویم در دسکتاپ</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS & PIN CODE */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-amber-500" />
                  <span>تنظیمات استودیو و امنیت پنل مدیریت</span>
                </h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  پیکربندی پین‌کد امنیتی، اطلاعات استودیو و پشتیبان‌گیری دیتابیس.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-5">
                <h2 className="font-bold text-sm sm:text-base text-white border-b border-neutral-800 pb-3">
                  اطلاعات برندینگ استودیو
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-medium">نام استودیو (فارسی)</label>
                    <input
                      type="text"
                      value={settings.studioName}
                      onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-medium">نام انگلیسی</label>
                    <input
                      type="text"
                      value={settings.studioNameEn}
                      onChange={(e) => setSettings({ ...settings, studioNameEn: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-400 mb-1 font-medium">شعار و تیتر استودیو</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-medium">ایمیل ارتباطی</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-medium">شماره تماس دفتر</label>
                    <input
                      type="text"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Security PIN Section */}
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
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    ذخیره تنظیمات استودیو
                  </button>
                </div>
              </form>

              {/* Database Backup & Restore */}
              <div className="bg-[#141417] border border-[#27272A] p-6 rounded-2xl space-y-4">
                <h2 className="font-bold text-sm sm:text-base text-white border-b border-neutral-800 pb-3">
                  پشتیبان‌گیری و بازیابی دیتابیس (JSON)
                </h2>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-500" />
                    <span>دانلود بکاپ دیتابیس (JSON)</span>
                  </button>

                  <label className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>بازیابی اطلاعات از فایل JSON</span>
                    <input
                      ref={backupFileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (window.confirm('آیا از بازنشانی کلیه داده‌ها به حالت پیش‌فرض کارخانه اطمینان دارید؟')) {
                        resetStudioToDefaults();
                        showToast('اطلاعات به وضعیت پیش‌فرض بازنشانی شد.');
                      }
                    }}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-red-950/60 text-red-400 border border-red-900/40 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer mr-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>بازنشانی به پیش‌فرض کارخانه</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SERVICES & TRACKS CMS TAB */}
          {activeTab === 'services' && (
            <ServicesTab showToast={showToast} />
          )}

          {/* TEAM & MANIFESTO CMS TAB */}
          {activeTab === 'team' && (
            <TeamManifestoTab mediaItems={mediaItems} showToast={showToast} />
          )}

          {/* CLIENT IDEAS & NOTES CMS TAB */}
          {activeTab === 'notes' && (
            <NotesTab showToast={showToast} />
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PROJECT FORM */}
      {/* ------------------------------------------------------------- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {editingProject ? 'ویرایش پروژه و پرونده استودیو' : 'ایجاد پروژه جدید در استودیو'}
                </h2>
              </div>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProjectEntry} className="flex-1 overflow-y-auto p-6 space-y-5">
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

              {/* Cover Image Section with Laptop Upload & Library Picker */}
              <div className="space-y-2 bg-[#121214] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-neutral-300 font-bold">
                    تصویر کاور اصلی پروژه (Cover Image) *
                  </label>
                  <span className="text-[10px] text-amber-500 font-mono">
                    {projectForm.cinemaRatio ? 'نسبت ۲۱:۹ سینمایی' : 'نسبت ۱۶:۹ افقی'}
                  </span>
                </div>

                {/* Upload Trigger Buttons */}
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold cursor-pointer transition shadow-sm active:scale-95"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>آپلود عکس از روی لپ‌تاپ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('cover')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition border border-neutral-700"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>انتخاب از کتابخانه تصاویر استودیو</span>
                  </button>
                </div>

                {/* Preview or URL */}
                {projectForm.coverImage ? (
                  <div className="relative rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950 aspect-video max-h-48 group">
                    <img
                      src={projectForm.coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="px-2.5 py-1.5 bg-neutral-900/90 text-white hover:bg-amber-500 hover:text-black rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Laptop className="w-3.5 h-3.5" />
                        تغییر عکس از لپ‌تاپ
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectForm({ ...projectForm, coverImage: '' })}
                        className="px-2.5 py-1.5 bg-red-950/90 text-red-200 hover:bg-red-800 rounded text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        حذف
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-neutral-950/40 space-y-1.5"
                  >
                    <Upload className="w-6 h-6 text-amber-500 mx-auto" />
                    <p className="text-xs text-neutral-300 font-medium">
                      کلیک کنید تا عکس کاور را مستقیماً از روی لپ‌تاپ خود انتخاب و آپلود کنید
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">JPG, PNG, WEBP — با بالاترین کیفیت</p>
                  </div>
                )}

                {/* Secondary Direct URL Option */}
                <div className="pt-1">
                  <input
                    type="url"
                    value={projectForm.coverImage || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, coverImage: e.target.value })}
                    placeholder="یا وارد کردن مستقیم آدرس اینترنتی عکس: https://..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">چالش اولیه کارفرما</label>
                  <textarea
                    rows={3}
                    value={projectForm.challenge || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, challenge: e.target.value })}
                    placeholder="مسئله یا نیاز بنیادین برند قبل از ورود استودیو..."
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

              {/* Deliverables List */}
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

              {/* Additional Photos for Gallery with Laptop Multi-Upload & Picker */}
              <div className="space-y-2 bg-[#121214] p-4 rounded-xl border border-neutral-800">
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-neutral-300 font-bold">
                    تصاویر تکمیلی گالری پروژه (Gallery Images)
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {(projectForm.galleryImages || []).length} تصویر اضافه شده
                  </span>
                </div>

                {/* Upload Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold cursor-pointer transition border border-neutral-700 active:scale-95"
                  >
                    <Laptop className="w-4 h-4" />
                    <span>آپلود عکس‌ها از روی لپ‌تاپ (انتخاب چندتایی)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenMediaPicker('gallery')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition border border-neutral-700"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    <span>انتخاب از کتابخانه تصاویر</span>
                  </button>
                </div>

                {/* Secondary URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={galleryUrlInput}
                    onChange={(e) => setGalleryUrlInput(e.target.value)}
                    placeholder="یا افزودن از طریق لینک عکس: https://..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
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
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition cursor-pointer"
                  >
                    افزودن لینک
                  </button>
                </div>

                {/* Gallery Thumbnails Grid */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(projectForm.galleryImages || []).map((imgUrl, idx) => (
                    <div key={idx} className="relative w-20 h-14 rounded-lg border border-neutral-700 overflow-hidden group bg-neutral-950">
                      <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setProjectForm({
                            ...projectForm,
                            galleryImages: (projectForm.galleryImages || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute inset-0 bg-red-950/85 text-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[11px] font-bold cursor-pointer"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>

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
      {/* MODAL: ADD PHOTO FORM */}
      {/* ------------------------------------------------------------- */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">افزودن تصویر به کتابخانه رسانه</h2>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePhotoEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان یا نام تصویر *</label>
                <input
                  type="text"
                  required
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  placeholder="مثال: والپیپر آتلیه معماری و بتن"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-neutral-400 font-medium">روش بارگذاری تصویر *</label>

                <div className="p-4 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 rounded-xl bg-neutral-950/40 text-center space-y-2 transition">
                  <Upload className="w-6 h-6 text-amber-500 mx-auto" />
                  <div className="text-xs text-neutral-300">
                    تصویر را از دستگاه خود انتخاب کنید:
                  </div>
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
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
                  value={photoForm.url}
                  onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />

                {photoForm.url && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-neutral-700 mt-2">
                    <img src={photoForm.url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">دسته‌بندی</label>
                  <select
                    value={photoForm.category}
                    onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value as any })}
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
                    value={photoForm.aspectRatio}
                    onChange={(e) => setPhotoForm({ ...photoForm, aspectRatio: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="16:9">۱۶:۹ (افقی استاندارد)</option>
                    <option value="21:9">۲۱:۹ (سینمایی آنامورفیک)</option>
                    <option value="1:1">۱:۱ (مربعی)</option>
                    <option value="4:5">۴:۵ (پرتره)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">برچسب‌ها (با کاما جدا کنید)</label>
                <input
                  type="text"
                  value={photoForm.tags}
                  onChange={(e) => setPhotoForm({ ...photoForm, tags: e.target.value })}
                  placeholder="مثال: آتلیه، معماری، والپیپر"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
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
      {/* MODAL: PHOTO FULLSCREEN PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
            <img src={previewPhotoUrl} alt="Fullscreen View" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-3 right-3 bg-black/80 text-white p-2 rounded-full hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: STUDIO MEDIA PICKER */}
      {/* ------------------------------------------------------------- */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mediaItems={mediaItems}
        onSelectPhoto={handleSelectFromMediaPicker}
        title={mediaPickerTarget === 'cover' ? 'انتخاب تصویر کاور پروژه از کتابخانه' : 'افزودن تصویر به گالری پروژه'}
        subtitle="روی هر تصویر کلیک کنید تا در پروژه اعمال شود"
      />
    </div>
  );
};

export default AdminPanel;
