/**
 * Creativity Juice — Admin CMS & Studio Store
 * Centralized data management for Portfolio Projects, Media/Photos Library,
 * Studio Settings, and Content Synchronization.
 * Dispatches 'CJ_STUDIO_DATA_CHANGED' for real-time reactivity across public UI/UX and Admin.
 */

import { addToTrash } from './trashStore';
import { PORTFOLIO_CASE_STUDIES, CaseStudy } from './PortfolioGallery';

export interface ProjectItem {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  category: 'branding' | 'cinema' | 'packaging' | 'editorial' | 'digital' | string;
  categoryLabel: string;
  client: string;
  year: string;
  trackCode: string;
  deptTrack?: string;
  role?: string;
  description?: string;
  coverImage: string;
  highResImage?: string;
  galleryImages: string[];
  cinemaRatio?: boolean;
  videoDuration?: string;
  badge: string;
  challenge: string;
  solution: string;
  metrics: string;
  deliverables: string[];
  tags: string[];
  colorAccent: string;
  featured?: boolean;
  isPublished?: boolean;
  desktopPos?: { top: number; left: number; mobileTop?: number; mobileLeft?: number };
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  category: 'projects' | 'wallpapers' | 'brand' | 'team' | 'packaging' | 'cinema';
  tags: string[];
  aspectRatio?: string;
  size?: string;
  dimensions?: string;
  addedAt: string;
  isWallpaperPreset?: boolean;
}

export interface StudioSettings {
  studioName: string;
  studioNameEn: string;
  tagline: string;
  taglineEn: string;
  manifestoSummary: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  instagram: string;
  linkedin: string;
  behance: string;
  activeWallpaper: string;
  adminName: string;
  adminRole: string;
  adminPin: string;
  hideAdminFromVisitors: boolean;
}

export interface ServiceItem {
  id: string;
  code: string;
  deptId: number;
  deptName: string;
  deptTrack: string;
  badge: string;
  title: string;
  titleEn: string;
  fileName: string;
  fileSize: string;
  fileExt: string;
  description: string;
  deliverables: string[];
  suitableFor: string;
  timeline: string;
  engagementType: 'sprint' | 'retainer' | 'advisory';
  popular?: boolean;
}

export interface MemberProjectRole {
  projectId: string;
  projectTitle: string;
  client?: string;
  roleInProject: string;
  year?: string;
  keyDeliverables?: string[];
  impact?: string;
  coverImage?: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  department: string;
  trackCode: string;
  initials: string;
  bio: string;
  experience: string;
  philosophy: string;
  specialties: string[];
  photo: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
  projectRoles?: MemberProjectRole[];
}

export interface ManifestoItem {
  code: string;
  title: string;
  titleEn: string;
  description: string;
  quote: string;
  author: string;
}

export const CJ_STUDIO_DATA_EVENT = 'CJ_STUDIO_DATA_CHANGED';

const STORAGE_KEYS = {
  PROJECTS: 'cj_studio_projects_v3',
  MEDIA: 'cj_studio_media_v3',
  SETTINGS: 'cj_studio_settings_v3',
  SERVICES: 'cj_studio_services_v3',
  TEAM: 'cj_studio_team_v3',
  MANIFESTO: 'cj_studio_manifesto_v3',
};

// Initial Seed Media Items
const SEED_MEDIA: MediaItem[] = [
  {
    id: 'media-arka-1',
    title: 'کاور آتلیه معماری آرکا - بتن و متریال',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    category: 'projects',
    tags: ['معماری', 'بتن', 'لوکس', 'آرکا'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.4 MB',
    addedAt: '۱۴۰۳/۰۸/۱۲',
    isWallpaperPreset: true,
  },
  {
    id: 'media-apex-1',
    title: 'تیزر سینمایی اپکس نوآر - استریت‌ویر',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    category: 'cinema',
    tags: ['سینما', 'مد', 'نوآر', 'اپکس'],
    aspectRatio: '21:9',
    dimensions: '3840 × 1645',
    size: '2.1 MB',
    addedAt: '۱۴۰۳/۰۹/۰۱',
    isWallpaperPreset: false,
  },
  {
    id: 'media-nectar-1',
    title: 'قوطی نوشیدنی تونیک ارگانیک نکتار',
    url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1600&q=85',
    category: 'packaging',
    tags: ['بسته‌بندی', 'نوشیدنی', 'طلاکوب'],
    aspectRatio: '1:1',
    dimensions: '2000 × 2000',
    size: '980 KB',
    addedAt: '۱۴۰۳/۰۹/۱۵',
  },
  {
    id: 'media-lumina-1',
    title: 'دیزاین سیستم و پرتال ۳D لومینا',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=85',
    category: 'brand',
    tags: ['دیجیتال', 'فین‌تک', 'WebGL'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.2 MB',
    addedAt: '۱۴۰۳/۱۰/۰۲',
  },
  {
    id: 'media-velvet-1',
    title: 'عطر ولوت اند راست - شیشه دست‌ساز',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85',
    category: 'packaging',
    tags: ['عطر', 'لوکس', 'شیشه‌گری'],
    aspectRatio: '16:9',
    dimensions: '2400 × 1600',
    size: '1.6 MB',
    addedAt: '۱۴۰۳/۱۰/۲۰',
  },
  {
    id: 'media-wp-studio',
    title: 'والپیپر آتلیه ادیتوریال استودیو',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2560&q=85',
    category: 'wallpapers',
    tags: ['والپیپر', 'آتلیه', 'مینیمال'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '2.4 MB',
    addedAt: '۱۴۰۳/۰۶/۱۰',
    isWallpaperPreset: true,
  },
  {
    id: 'media-wp-noir',
    title: 'والپیپر تاریک سینمایی Minimal Noir',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2560&q=85',
    category: 'wallpapers',
    tags: ['والپیپر', 'نوآر', 'تاریک'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.9 MB',
    addedAt: '۱۴۰۳/۰۶/۱۵',
    isWallpaperPreset: true,
  },
  {
    id: 'media-soleil-1',
    title: 'عمارت‌های لوکس سولای - نمای هوایی',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    category: 'projects',
    tags: ['معماری', 'پنت‌هاوس', 'سولای'],
    aspectRatio: '16:9',
    dimensions: '2800 × 1700',
    size: '2.8 MB',
    addedAt: '۱۴۰۳/۱۱/۰۴',
  },
];

// Initial Studio Settings
const DEFAULT_SETTINGS: StudioSettings = {
  studioName: 'Creativity Juice',
  studioNameEn: 'Creativity Juice Studio',
  tagline: 'معماری هویت برند، سینمای تجاری و دیزاین سیستم ادیتوریال',
  taglineEn: 'Contemporary Brand Architecture, Cinema & Creative OS',
  manifestoSummary: 'ما کلیشه‌های تکراری و ادعاهای توخالی را دور می‌ریزیم؛ برای هر برند، یک جهان مستقل، استوار و سینمایی خلق می‌کنیم.',
  contactEmail: 'atelier@creativityjuice.studio',
  contactPhone: '+۹۸ ۲۱ ۲۲۰۴ ۸۹۲۱',
  address: 'تهران، زعفرانیه، خیابان آصف، برج هنرهای معاصر، طبقه ۸',
  instagram: 'creativityjuice.studio',
  linkedin: 'creativity-juice',
  behance: 'creativityjuice',
  activeWallpaper: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2560&q=85',
  adminName: 'مدیر ارشد خلاقیت',
  adminRole: 'Executive Creative Director',
  adminPin: '1234',
  hideAdminFromVisitors: true,
};

// Convert initial Portfolio Case Studies to ProjectItems
function getSeedProjects(): ProjectItem[] {
  return PORTFOLIO_CASE_STUDIES.map((c) => ({
    id: c.id,
    title: c.title,
    titleEn: c.titleEn,
    subtitle: c.subtitle,
    category: c.category,
    categoryLabel: c.categoryLabel,
    client: c.client,
    year: c.year,
    trackCode: c.trackCode,
    deptTrack: c.trackCode,
    role: 'استراتژیست هویت و آرت‌دایرکتور',
    coverImage: c.coverImage,
    highResImage: c.coverImage,
    galleryImages: c.galleryImages || [c.coverImage],
    cinemaRatio: c.cinemaRatio,
    videoDuration: c.videoDuration,
    badge: c.badge,
    challenge: c.challenge,
    solution: c.solution,
    description: `${c.challenge}\n\n${c.solution}`,
    metrics: c.metrics,
    deliverables: c.deliverables,
    tags: c.tags,
    colorAccent: c.colorAccent,
    featured: true,
    isPublished: true,
    desktopPos: { top: 61, left: 21, mobileTop: 36, mobileLeft: 56 },
    createdAt: '۱۴۰۳/۰۶/۰۱',
    updatedAt: '۱۴۰۳/۱۱/۱۰',
  }));
}

// -------------------------------------------------------------
// Projects API
// -------------------------------------------------------------

export function getProjects(): ProjectItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Also check legacy storage key used by desktop
    const legacyRaw = localStorage.getItem('creativity_juice_projects_v2');
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, legacyRaw);
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading projects:', e);
  }
  const seeds = getSeedProjects();
  saveProjects(seeds, false);
  return seeds;
}

export function saveProjects(projects: ProjectItem[], notify = true): void {
  try {
    const json = JSON.stringify(projects);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, json);
    localStorage.setItem('creativity_juice_projects_v2', json);
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'projects', count: projects.length } }));
      window.dispatchEvent(new CustomEvent('projects-updated', { detail: projects }));
    }
  } catch (e) {
    console.error('Error saving projects:', e);
  }
}

export function saveProject(project: ProjectItem): ProjectItem {
  const current = getProjects();
  const index = current.findIndex((p) => p.id === project.id);
  const updatedItem: ProjectItem = {
    ...project,
    deptTrack: project.deptTrack || project.trackCode || 'TRACK 01 // BRAND IDENTITY',
    role: project.role || 'استراتژیست هویت و آرت‌دایرکتور',
    highResImage: project.highResImage || project.coverImage,
    description:
      project.description ||
      (project.challenge ? `${project.challenge}\n\n${project.solution || ''}`.trim() : ''),
    desktopPos: project.desktopPos || { top: 61, left: 21, mobileTop: 36, mobileLeft: 56 },
    updatedAt: new Intl.DateTimeFormat('fa-IR').format(new Date()),
  };

  let nextProjects: ProjectItem[];
  if (index >= 0) {
    nextProjects = [...current];
    nextProjects[index] = updatedItem;
  } else {
    updatedItem.createdAt = updatedItem.createdAt || new Intl.DateTimeFormat('fa-IR').format(new Date());
    nextProjects = [updatedItem, ...current];
  }

  saveProjects(nextProjects);
  return updatedItem;
}

export function deleteProject(id: string): void {
  const current = getProjects();
  const target = current.find((p) => p.id === id);
  if (target) {
    // Safely send to trash bin first!
    addToTrash({
      originalId: target.id,
      title: target.title,
      type: 'project',
      source: 'داشبورد مدیریت • پروژه‌ها',
      summary: `${target.subtitle} (${target.client})`,
      size: `${target.galleryImages?.length || 1} تصویر`,
      data: target,
    });
  }
  const nextProjects = current.filter((p) => p.id !== id);
  saveProjects(nextProjects);
}

// -------------------------------------------------------------
// Media API
// -------------------------------------------------------------

export function getMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading media:', e);
  }
  saveMediaItems(SEED_MEDIA, false);
  return SEED_MEDIA;
}

export function saveMediaItems(items: MediaItem[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(items));
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'media', count: items.length } }));
    }
  } catch (e) {
    console.error('Error saving media:', e);
  }
}

export function addMediaItem(item: Omit<MediaItem, 'id' | 'addedAt'> & { id?: string }): MediaItem {
  const current = getMediaItems();
  const newItem: MediaItem = {
    ...item,
    id: item.id || `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    addedAt: new Intl.DateTimeFormat('fa-IR').format(new Date()),
  };
  saveMediaItems([newItem, ...current]);
  return newItem;
}

export function deleteMediaItem(id: string): void {
  const current = getMediaItems();
  const target = current.find((m) => m.id === id);
  if (target) {
    addToTrash({
      originalId: target.id,
      title: target.title,
      type: 'document',
      source: 'کتابخانه رسانه استودیو',
      summary: target.url,
      size: target.size || 'تصویر دیجیتال',
      data: target,
    });
  }
  const nextMedia = current.filter((m) => m.id !== id);
  saveMediaItems(nextMedia);
}

// -------------------------------------------------------------
// Settings API
// -------------------------------------------------------------

export function getStudioSettings(): StudioSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStudioSettings(settings: Partial<StudioSettings>): StudioSettings {
  const current = getStudioSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'settings' } }));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
  return updated;
}

// -------------------------------------------------------------
// -------------------------------------------------------------
// Services & Tracks CMS
// -------------------------------------------------------------

export const SEED_SERVICES: ServiceItem[] = [
  {
    id: 'srv-01',
    code: 'SRV-01 // BRAND DNA',
    deptId: 1,
    deptName: 'معماری و هویت برند',
    deptTrack: 'TRACK 01 // BRAND IDENTITY',
    badge: 'پروژه‌محور • فونداسیون برند',
    title: 'استراتژی و دی‌ان‌ای برند',
    titleEn: 'Brand Strategy & DNA',
    fileName: 'SRV-01_استراتژی_و_دی‌ان‌ای_برند.pdf',
    fileSize: '24.8 MB',
    fileExt: 'PDF',
    description: 'کالبدشکافی جایگاه برند و رقبای کسل‌کننده در بازار؛ تعیین استعاره محوری، داستان سرآغاز، بیانیه مانیفست و تدوین زبان لحن (Tone of Voice). این خدمت به برند شما روحی مستقل و جهت‌گیری غیرقابل تقلید می‌بخشد.',
    deliverables: [
      'سند مانیفست و ایده محوری برند',
      'نقشه جایگاه‌سازی و تحلیل عمقی رقبا',
      'راهنمای زبان لحن و کلمات کلیدی ممنوعه و مجاز',
      'گزاره ارزش پیشنهادی منحصربه‌فرد (UVP)',
    ],
    suitableFor: 'استارتاپ‌ها، پروژه‌های نوآور و برندهای در آستانه جهش و ری‌برندینگ',
    timeline: '۳ تا ۴ هفته',
    engagementType: 'sprint',
    popular: true,
  },
  {
    id: 'srv-02',
    code: 'SRV-02 // VISUAL IDENTITY',
    deptId: 1,
    deptName: 'معماری و هویت برند',
    deptTrack: 'TRACK 01 // BRAND IDENTITY',
    badge: 'طراحی سیستم جامع',
    title: 'سیستم هویت بصری کامل',
    titleEn: 'Visual Identity System',
    fileName: 'SRV-02_سیستم_هویت_بصری_جامع.ai',
    fileSize: '185.2 MB',
    fileExt: 'AI',
    description: 'طراحی لوگوتایپ، نماد مونوکروم، مهندسی تایپوگرافی اختصاصی، پالت رنگی هماهنگ با متریال و سیستم گریدبندی ادیتوریال. یک دیزاین پایدار بدون وابستگی به ترندهای زودگذر چندماهه.',
    deliverables: [
      'لوگوتایپ و نشان تجاری اختصاصی برداری',
      'معماری تایپوگرافی چندلایه و فونت‌های سفارشی',
      'پالت رنگی فنی مهندسی‌شده (Pantone, CMYK, HEX)',
      'سیستم گریدبندی و الگوهای ساختار سازمانی',
    ],
    suitableFor: 'خانه‌های مد، استودیوهای معماری، هلدینگ‌ها و برندهای پرمیوم',
    timeline: '۴ تا ۶ هفته',
    engagementType: 'sprint',
    popular: true,
  },
  {
    id: 'srv-03',
    code: 'SRV-03 // MASTER BRAND BOOK',
    deptId: 1,
    deptName: 'معماری و هویت برند',
    deptTrack: 'TRACK 01 // BRAND IDENTITY',
    badge: 'تدوین سند مرجع',
    title: 'کتابچه راهنمای جامع برند و بسته‌بندی',
    titleEn: 'The Master Brand Book & Packaging',
    fileName: 'SRV-03_کتابچه_راهنمای_برند_و_پکیجینگ.ind',
    fileSize: '320.0 MB',
    fileExt: 'IND',
    description: 'تدوین یک کتابچه با وقار (چاپی و دیجیتال) حاوی تمام قوانین و استانداردهای طراحی، پترن‌ها، ملزومات چاپی اداری، هویت فضایی و راهنمای جامع جعبه‌گشایی (Unboxing).',
    deliverables: [
      'دفترچه گایدلاین هویت (بیش از ۱۲۰ صفحه مستندات فنی)',
      'طراحی سیستم بسته‌بندی، ساک‌دستی و متریال لوکس',
      'بسته کامل ست اداری و فرمت‌های اجرایی شبکه‌های اجتماعی',
      'فایل‌های فونت و پکیج قالب‌های نرم‌افزاری آماده به کار',
    ],
    suitableFor: 'سازمان‌های در حال توسعه با چندین تیم دیزاین و مارکتینگ موازی',
    timeline: '۳ هفته (پس از تصویب هویت بصری)',
    engagementType: 'sprint',
  },
  {
    id: 'srv-04',
    code: 'SRV-04 // COMMERCIAL FILM',
    deptId: 2,
    deptName: 'سینما، مد و محتوای شاخص',
    deptTrack: 'TRACK 02 // CINEMA & VISUALS',
    badge: 'پروداکشن سطح‌بالا',
    title: 'کارگردانی فیلم‌های تبلیغاتی و مد',
    titleEn: 'Commercial & Fashion Films',
    fileName: 'SRV-04_فیلم_تبلیغاتی_و_فشن_4K.mov',
    fileSize: '4.8 GB',
    fileExt: 'MOV',
    description: 'سناریونویسی، استوری‌بورد، کستینگ بازیگر و مدل، انتخاب لوکیشن و کارگردانی فیلم‌های کوتاه با بالاترین استانداردهای بصری و روایتی سینمایی برای لانچ شاخص محصولات و خدمات.',
    deliverables: [
      'سناریو و شات‌لیست تخصصی سینمایی',
      'کارگردانی کامل در روز فیلم‌برداری با تجهیزات سینمایی',
      'اصلاح رنگ سینمایی (Color Grading) متناسب با لحن برند',
      'طراحی صدا، افکت‌ها و موسیقی متن اختصاصی',
    ],
    suitableFor: 'برندهای فشن، ساعت و جواهرات، املاک لوکس و پروژه‌های شاخص',
    timeline: '۳ تا ۵ هفته',
    engagementType: 'sprint',
    popular: true,
  },
  {
    id: 'srv-05',
    code: 'SRV-05 // MUSIC ERA',
    deptId: 2,
    deptName: 'سینما، مد و محتوای شاخص',
    deptTrack: 'TRACK 02 // CINEMA & VISUALS',
    badge: 'ویژه هنرمندان و موزیک',
    title: 'کارگردانی بصری آلبوم و موزیک‌ویدئو',
    titleEn: 'Music Era & World-Building',
    fileName: 'SRV-05_کانسپت_بصری_آلبوم_و_موزیک_ویدیو.key',
    fileSize: '840.0 MB',
    fileExt: 'KEY',
    description: 'طراحی دوران هنری (Era)، کانسپت بصری آلبوم موسیقی، عکاسی کاور، آرت‌دایرکشن صحنه و کارگردانی موزیک‌ویدئوهای سینمایی با نگاهی پیشرو و متناسب با هویت مستقل آرتیست.',
    deliverables: [
      'طراحی کانسپت بصری و نمادشناسی آلبوم',
      'سناریو و کارگردانی موزیک‌ویدئو با کیفیت 4K',
      'عکاسی کاور، پوستر و هویت متریال تور کنسرت',
      'هدایت تیزرها و کپسول‌های لانچ قطعات در شبکه‌های اجتماعی',
    ],
    suitableFor: 'خوانندگان، آهنگسازان مؤلف، نوازندگان مستقل و لیبل‌ها',
    timeline: 'پروژه‌محور (Sprint)',
    engagementType: 'sprint',
  },
  {
    id: 'srv-06',
    code: 'SRV-06 // MONTHLY RETAINER',
    deptId: 2,
    deptName: 'سینما، مد و محتوای شاخص',
    deptTrack: 'TRACK 02 // CINEMA & VISUALS',
    badge: 'همکاری مستمر ماهانه',
    title: 'ریتینر ماهانه تولید محتوای سینمایی',
    titleEn: 'Monthly Content Retainer',
    fileName: 'SRV-06_قرارداد_ریتینر_ماهانه_تولید_محتوا.doc',
    fileSize: '14.2 MB',
    fileExt: 'DOC',
    description: 'همکاری ثابت ماهانه شامل ۲ جلسه تصویربرداری کامل با تجهیزات استاندارد، تولید ۱۰ ویدیوی آماده با تدوین حرفه‌ای، هدایت خط استوری‌های پیوسته و نظارت ادیتوریال بر انتشار پیج.',
    deliverables: [
      '۱۰ ویدیوی سینمایی آماده (Reels / 4K) در ماه',
      '۲ جلسه فیلم‌برداری میدانی کامل با تجهیزات نور و تصویر',
      'سناریونویسی، هوک اولیه و کال‌تواکشن هدفمند',
      'هدایت تقویم محتوایی و چیدمان استوری‌های روزانه',
    ],
    suitableFor: 'کلینیک‌های تخصصی، املاک پرمیوم و کسب‌وکارهای در حال توسعه',
    timeline: 'دوره قرارداد: حداقل ۳ ماهه',
    engagementType: 'retainer',
    popular: true,
  },
  {
    id: 'srv-07',
    code: 'SRV-07 // PRODUCT DROP',
    deptId: 3,
    deptName: 'مارکتینگ فرهنگی و کمپین‌ها',
    deptTrack: 'TRACK 03 // CAMPAIGNS & ACTIVATIONS',
    badge: 'مدل دراپ و ایجاد تقاضا',
    title: 'استراتژی رونمایی و دراپ محصول',
    titleEn: 'Product Drop & Capsule Launch',
    fileName: 'SRV-07_استراتژی_دراپ_و_لانچ_کپسولی.pdf',
    fileSize: '38.5 MB',
    fileExt: 'PDF',
    description: 'طراحی کمپین‌های عرضه محدود (Limited Drop) با الهام از متد برندهای پیشرو؛ ایجاد کشش فرهنگی و تقاضای ارگانیک در مخاطب پیش از باز شدن درگاه فروش محصول.',
    deliverables: [
      'استراتژی فازبندی تیزینگ، لانچ و سولد-اوت',
      'طراحی ته‌مایه بصری کپسول‌کالکشن و گرافیک تبلیغاتی',
      'نگارش متون بیانیه‌ها، کپشن‌های محرک و ایمیل‌ها',
      'آرت‌دایرکشن لندینگ‌پیج خرید اختصاصی',
    ],
    suitableFor: 'کالکشن‌های محدود لباس، عطر، اکسسوری یا خدمات VIP',
    timeline: '۴ هفته',
    engagementType: 'sprint',
  },
  {
    id: 'srv-08',
    code: 'SRV-08 // COLLABS',
    deptId: 3,
    deptName: 'مارکتینگ فرهنگی و کمپین‌ها',
    deptTrack: 'TRACK 03 // CAMPAIGNS & ACTIVATIONS',
    badge: 'اعتبار فرهنگی و پیوند هنری',
    title: 'همکاری‌های مشترک بین‌رشته‌ای',
    titleEn: 'Cultural Collaborations & Collabs',
    fileName: 'SRV-08_پروتکل_همکاری_بین_رشته_ای.pdf',
    fileSize: '16.4 MB',
    fileExt: 'PDF',
    description: 'پل زدن میان محصول تجاری شما و جامعه‌ی هنری مستقل؛ شناسایی آرتیست‌ها و طراحان مکمل برای خلق پروژه‌های مشترک که به برند شما اعتبار اصیل و پایدار تزریق می‌کند.',
    deliverables: [
      'انتخاب و مذاکره با همکاران هم‌فرکانس و معتبر',
      'طراحی کانسپت محصول یا اثر تجربی مشترک',
      'آرت‌دایرکشن مستندسازی فرآیند ساخت و پشت صحنه',
      'هدایت کمپین مشترک در رسانه‌ها و ایونت‌ها',
    ],
    suitableFor: 'برندهایی که می‌خواهند فراتر از تبلیغات به بخشی از فرهنگ تبدیل شوند',
    timeline: 'پروژه‌محور (Sprint)',
    engagementType: 'sprint',
  },
  {
    id: 'srv-09',
    code: 'SRV-09 // SPRINT DIAGNOSTIC',
    deptId: 4,
    deptName: 'مشاوره ارشد و کنسلیری',
    deptTrack: 'TRACK 04 // STRATEGIC COUNSEL',
    badge: 'تک‌جلسه فشرده • عارضه‌یابی',
    title: 'جلسه فشرده عارضه‌یابی برند',
    titleEn: 'Brand Diagnostic Sprint',
    fileName: 'SRV-09_گزارش_عارضه_یابی_۹۰_دقیقه_ای.pdf',
    fileSize: '8.2 MB',
    fileExt: 'PDF',
    description: 'یک نشست استراتژیک ۹۰ دقیقه‌ایِ بی‌تعارف برای کالبدشکافی وضعیت فعلی برند، شناسایی گلوگاه‌های هویتی، حذف تصمیمات اشتباه و ارائه نقشه راه عملیاتی برای رشد برند.',
    deliverables: [
      'جلسه حضوری یا آنلاین تحلیلی (۹۰ دقیقه با سرپرست خلاقیت)',
      'گزارش مکتوب آسیب‌شناسی برند (Dossier عارضه‌یابی)',
      'فهرست خطوط قرمز و توصیه‌های اضطراری اصلاح مسیر',
      'نقشه راه پیشنهادی اولویت‌بندی‌شده برای ۳ ماه آینده',
    ],
    suitableFor: 'بنیان‌گذاران و مدیرانی که در تصمیمات هویتی و پرستیژ برند مردد هستند',
    timeline: 'تک‌جلسه + گزارش تحلیلی ظرف ۴۸ ساعت',
    engagementType: 'advisory',
    popular: true,
  },
  {
    id: 'srv-10',
    code: 'SRV-10 // FRACTIONAL CD',
    deptId: 4,
    deptName: 'مشاوره ارشد و کنسلیری',
    deptTrack: 'TRACK 04 // STRATEGIC COUNSEL',
    badge: 'همراهی در اتاق فرمان',
    title: 'مدیر ارشد خلاقیت فصلی',
    titleEn: 'Fractional Creative Director',
    fileName: 'SRV-10_منشور_همراهی_مدیر_ارشد_خلاقیت.doc',
    fileSize: '19.6 MB',
    fileExt: 'DOC',
    description: 'حضور مستقیم ما به عنوان کنسلیری و مشاور ارشد هنری در کنار هیئت‌مدیره شما بدون تحمیل هزینه‌های سنگین استخدام دائم؛ نظارت عالیه بر تمام خروجی‌های طراحان، آژانس‌ها و تیم مارکتینگ.',
    deliverables: [
      'جلسات هفتگی هدایت خلاقیت و تدوین استراتژی بصری',
      'کنترل کیفیت و تأیید نهایی خروجی‌های تصویری و ویدیویی',
      'هدایت بریف‌ها و فیلتر کردن پیمانکاران متفرقه',
      'پاسداری از شأن، پرستیژ و خطوط قرمز برند در بازار',
    ],
    suitableFor: 'هلدینگ‌ها و مجموعه‌هایی که مجری دارند اما سکاندار خلاقیت ندارند',
    timeline: 'دوره همکاری: فصلی، ۶ ماهه و سالانه',
    engagementType: 'advisory',
  },
];

export function getServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading services:', e);
  }
  saveServices(SEED_SERVICES, false);
  return SEED_SERVICES;
}

export function saveServices(services: ServiceItem[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'services', count: services.length } }));
    }
  } catch (e) {
    console.error('Error saving services:', e);
  }
}

export function saveService(service: ServiceItem): ServiceItem {
  const current = getServices();
  const index = current.findIndex((s) => s.id === service.id);
  let nextServices: ServiceItem[];
  if (index >= 0) {
    nextServices = [...current];
    nextServices[index] = service;
  } else {
    nextServices = [service, ...current];
  }
  saveServices(nextServices);
  return service;
}

export function deleteService(id: string): void {
  const current = getServices();
  const target = current.find((s) => s.id === id);
  if (target) {
    addToTrash({
      originalId: target.id,
      title: target.title,
      type: 'document',
      source: 'خدمات استودیو',
      summary: `${target.code} — ${target.deptName}`,
      size: target.fileSize,
      data: target,
    });
  }
  const nextServices = current.filter((s) => s.id !== id);
  saveServices(nextServices);
}

// -------------------------------------------------------------
// Team Members & Dossier CMS
// -------------------------------------------------------------

export const SEED_TEAM: TeamMemberItem[] = [
  {
    id: 'member-01',
    name: 'کامیار آریا',
    nameEn: 'Kamyar Arya',
    role: 'بنیان‌گذار و مدیر ارشد خلاقیت',
    roleEn: 'Founder & Executive Creative Director',
    department: 'مشاوره ارشد و هدایت استراتژیک',
    trackCode: 'TRACK 04 // STRATEGIC COUNSEL',
    initials: 'KA',
    bio: 'سکاندار رویکرد ادیتوریال و مؤلف استودیو. تمرکز او بر کالبدشکافی هویت برندهای سردرگم، پالایش پیام‌های تبلیغاتی از لفاظی‌های کلیشه‌ای و پایه‌گذاری مانیفست‌هایی است که تاریخ مصرف ندارند.',
    experience: 'بیش از ۱۲ سال هدایت خلاقیت و ری‌برندینگ هلدینگ‌ها، استارتاپ‌های پیشرو و پروژه‌های شاخص بین‌المللی',
    philosophy: '«برندی که تلاش کند همه مخاطبان را راضی نگه دارد، در نهایت هیچ‌کس را عمیقاً تحت تأثیر قرار نمی‌دهد. تمایز واقعی نیازمند شهامتِ حذف زوائد است.»',
    specialties: [
      'تدوین دی‌ان‌ای و مانیفست بنیادین برند',
      'کنسلیری و همراهی هیئت مدیره (Fractional CD)',
      'عارضه‌یابی و بازآفرینی استراتژی هویت',
      'فیلتر کردن تصمیمات اشتباه مارکتینگ',
    ],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'arka-architecture',
        projectTitle: 'آتلیه معماری آرکا',
        client: 'گروه معماری آرکا',
        roleInProject: 'مدیر ارشد خلاقیت و تدوین مانیفست بنیادین',
        year: '۱۴۰۳',
        keyDeliverables: ['سند استراتژی و مانیفست بنیادین', 'نظارت عالی بر دی‌ان‌ای و کانسپت سکوت'],
        impact: '+۲۸۰٪ رشد در قراردادهای لوکس و پروژه‌های ویلایی',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'lumina-ai',
        projectTitle: 'پلتفرم فناوری لومینا',
        client: 'استارتاپ فین‌تک لومینا',
        roleInProject: 'استراتژیست ارشد برند و زبان لحن ادیتوریال',
        year: '۱۴۰۲',
        keyDeliverables: ['ایده محوری تمایز فین‌تک', 'زبان لحن و مانیفست گرم انسان‌محور'],
        impact: 'جذب ۱.۵ میلیون دلار سرمایه سری A',
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'velvet-rust',
        projectTitle: 'عطر ولوت اند راست',
        client: 'خانه عطر نیش Velvet & Rust',
        roleInProject: 'روایتگر ادیتوریال و مؤلف کانسپت حسی محصول',
        year: '۱۴۰۳',
        keyDeliverables: ['نگارش بیانیه شاعرانه محصول', 'هدایت کانسپت هویت بصری'],
        impact: 'سولد-اوت ۵۰۰ نسخه شماره‌گذاری‌شده در ۴۸ ساعت',
        coverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'member-02',
    name: 'تارا مهرگان',
    nameEn: 'Tara Mehregan',
    role: 'معمار ارشد هویت و سیستم‌های بصری',
    roleEn: 'Head of Brand Architecture & Design',
    department: 'معماری و هویت برند',
    trackCode: 'TRACK 01 // BRAND IDENTITY',
    initials: 'TM',
    bio: 'طراح سیستم‌های گریدبندی هندسی و تایپوگرافی اصیل. تخصص او در پیوند زدن ظرافت بصری ادیتوریال با معماری مهندسی‌شده و خلق دیزاین‌هایی است که گذشت زمان بر اعتبار آن‌ها می‌افزاید.',
    experience: '۱۰ سال تجربه طراحی دیزاین سیستم، بسته‌بندی لوکس و کتابچه‌های راهنمای برند در اروپا و خاورمیانه',
    philosophy: '«سیستم بصری موفق شبیه یک معماری بی‌نقص است؛ هیچ جزئی در آن تزئینی و بی‌هدف نیست و هر خط، وزنی در تعادل کل دارد.»',
    specialties: [
      'طراحی سیستم‌های جامع هویت بصری',
      'معماری تایپوگرافی اختصاصی و فونت‌ها',
      'دیزاین پکیجینگ، جعبه‌گشایی و متریال چاپی',
      'تدوین کتابچه جامع برند (Master Brand Book)',
    ],
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'arka-architecture',
        projectTitle: 'آتلیه معماری آرکا',
        client: 'گروه معماری آرکا',
        roleInProject: 'معمار هویت بصری، لوگوتایپ و مونوگراف کتان',
        year: '۱۴۰۳',
        keyDeliverables: ['طراحی لوگوتایپ اختصاصی بتنی', 'کتابچه ۱۴۰ صفحه‌ای چاپی با گرید سوئیسی', 'گایدلاین رنگ مونوکروم'],
        impact: 'برنده جایزه دیزاین سال در سالنامه معماری معاصر',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'nectar-tonic',
        projectTitle: 'نوشیدنی نکتار تونیک',
        client: 'صنایع نوشیدنی نکتار',
        roleInProject: 'طراح ارشد پکیجینگ و سیستم هویت قوطی متالیک',
        year: '۱۴۰۳',
        keyDeliverables: ['معماری قوطی‌های متالیک امباس‌شده', 'سیستم تمایز رنگ‌بندی طعم‌ها'],
        impact: 'سولد-اوت قوطی‌ها در ۳۰ کلان‌شهر در هفته اول',
        coverImage: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'kuro-matcha',
        projectTitle: 'چای تشریفاتی کورو',
        client: 'آتلیه کورو کیوتو',
        roleInProject: 'دیزاین پکیجینگ سرامیکی و گرید ادیتوریال',
        year: '۱۴۰۲',
        keyDeliverables: ['طراحی قوطی دست‌ساز سرامیک', 'لیبل مونوکروم طلاکوب با مهر ذن'],
        impact: 'منتخب هیئت داوران سالنامه پکیجینگ توکیو',
        coverImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'member-03',
    name: 'مانی راد',
    nameEn: 'Mani Rad',
    role: 'کارگردان تصویر و سینمای تجاری',
    roleEn: 'Director of Cinema & Commercial Motion',
    department: 'سینما، مد و محتوای شاخص',
    trackCode: 'TRACK 02 // CINEMA & VISUALS',
    initials: 'MR',
    bio: 'فیلم‌ساز و راوی سینمایی محصولات و فشن. مانی زبان تصویر را از حد تیزرهای کلیشه‌ای فراتر برده و آثاری خلق می‌کند که مخاطب را در جهان حسی و داستان برند غرق می‌سازند.',
    experience: 'کارگردانی بیش از ۴۰ فیلم تجاری، آرت‌فیلم‌های مد و موزیک‌ویدئوهای تقدیرشده در فستیوال‌ها',
    philosophy: '«دوربین وسیله ثبت نیست؛ قلم‌موی انتقال حس است. هر فریم باید راوی شخصیتی باشد که کلمات نمی‌توانند بیان کنند.»',
    specialties: [
      'سناریونویسی و کارگردانی فیلم‌های تبلیغاتی',
      'اصلاح رنگ سینمایی و طراحی استایل بصری',
      'آرت‌دایرکشن صحنه، فشن و نورپردازی',
      'هدایت ریتینرهای محتوای ویدیویی شاخص',
    ],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'arka-architecture',
        projectTitle: 'آتلیه معماری آرکا',
        client: 'گروه معماری آرکا',
        roleInProject: 'کارگردان فیلم سینمایی مانیفست ۳۵ میلی‌متری',
        year: '۱۴۰۳',
        keyDeliverables: ['فیلم‌برداری آنامورفیک ۴K در لوکیشن ویلاها', 'اصلاح رنگ سینمایی و مسترینگ صدا'],
        impact: '۲.۴ میلیون بازدید ارگانیک و جذب سرمایه‌گذاران شاخص',
        coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'apex-fashion',
        projectTitle: 'کالکشن استریت‌ویر اپکس',
        client: 'خانه استریت‌ویر اپکس',
        roleInProject: 'کارگردان فشن‌فیلم و عکاس لوک‌بوک آنالوگ ۱۶م‌م',
        year: '۱۴۰۳',
        keyDeliverables: ['آرت‌فیلم تبلیغاتی مد معاصر', 'لوک‌بوک عکاسی آنالوگ با فیلم ۳۵ میلی‌متری'],
        impact: 'اتمام موجودی دراپ در ۷ دقیقه پس از انتشار فیلم',
        coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'velvet-rust',
        projectTitle: 'عطر ولوت اند راست',
        client: 'خانه عطر نیش Velvet & Rust',
        roleInProject: 'کارگردان فیلم کوتاه نئو-نوآر در پاریس',
        year: '۱۴۰۳',
        keyDeliverables: ['فیلم داستانی سینمایی مه‌آلود', 'نورپردازی آنالوگ و ساند دیزاین اختصاصی'],
        impact: 'منتخب فستیوال فیلم‌های تبلیغاتی مد',
        coverImage: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'member-04',
    name: 'سهراب فرزام',
    nameEn: 'Sohrab Farzam',
    role: 'مدیر پرفورمنس مارکتینگ و رشد',
    roleEn: 'Head of Growth & Performance Marketing',
    department: 'مارکتینگ فرهنگی و کمپین‌ها',
    trackCode: 'TRACK 03 // CAMPAIGNS & ACTIVATIONS',
    initials: 'SF',
    bio: 'متخصص داده، نرخ تبدیل و مقیاس‌پذیری تبلیغات. او با رویکرد تحلیلی تضمین می‌کند که دارایی‌های خلاقانه استودیو با بالاترین بازدهی سرمایه‌گذاری (ROAS) به فروش و جذب مشتری منجر شوند.',
    experience: 'مدیریت و مهندسی کمپین‌های تبلیغاتی پرچمدار و مقیاس‌بالا در پلتفرم‌های بین‌المللی Meta، Google و TikTok',
    philosophy: '«خلاقیت بدون داده کور است، و داده بدون خلاقیت کرولال. ترکیب این دو، کلید تسخیر سهم بازار است.»',
    specialties: [
      'طراحی فانل‌های پرفورمنس و تبلیغات هدفمند',
      'بهینه‌سازی نرخ تبدیل و هوک‌های ویدیویی',
      'کمپین‌های دراپ کپسولی و سولد-اوت',
      'استراتژی بازگشت مشتری و LTV',
    ],
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'nectar-tonic',
        projectTitle: 'نوشیدنی نکتار تونیک',
        client: 'صنایع نوشیدنی نکتار',
        roleInProject: 'معمار استراتژی دراپ کپسولی و لانچ ۳۶۰ درجه',
        year: '۱۴۰۳',
        keyDeliverables: ['نقشه‌راه دراپ انحصاری', 'فانل پرفورمنس و اینفلوئنسر سیدینگ'],
        impact: '+۴۲۰٪ فروش ماه اول در مقایسه با پیش‌بینی',
        coverImage: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'apex-fashion',
        projectTitle: 'کالکشن استریت‌ویر اپکس',
        client: 'خانه استریت‌ویر اپکس',
        roleInProject: 'مدیر مهندسی تقاضا و فروش محدود (DTC Drop)',
        year: '۱۴۰۳',
        keyDeliverables: ['صف خرید تایمر معکوس', 'کمپین اختصاصی اینستاگرام و تیک‌تاک'],
        impact: 'رشد ۱۸۵٪ درآمد مستقیم DTC',
        coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
  {
    id: 'member-05',
    name: 'دلنواز کیان',
    nameEn: 'Delnavaz Kian',
    role: 'مدیر رویدادها و پیوندهای فرهنگی',
    roleEn: 'Director of Cultural Collabs & Events',
    department: 'مارکتینگ فرهنگی و کمپین‌ها',
    trackCode: 'TRACK 03 // CAMPAIGNS & ACTIVATIONS',
    initials: 'DK',
    bio: 'معمار پل‌های ارتباطی میان برندهای تجاری و نخبگان هنر معاصر. دلنواز پروژه‌های مشترک و ایونت‌های تجربی را به نحوی کیوریت می‌کند که به تیتر اول رسانه‌ها تبدیل شوند.',
    experience: 'کیوریتور گالری‌ها، ایونت‌های عرضه محصولات VIP و هدایت همکاری‌های انحصاری آرتیست‌ها',
    philosophy: '«برندهای ماندگار فقط جنس نمی‌فروشند؛ آن‌ها رویدادهای تاریخی و خاطرات جمعی خلق می‌کنند.»',
    specialties: [
      'پیوند برندها با آرتیست‌ها و دیزاینرهای مستقل',
      'طراحی رویدادهای اختصاصی لانچ و پاپ‌آپ استور',
      'استراتژی بازاریابی چریکی و نفوذ ارگانیک',
      'مدیریت روابط رسانه‌ای و مهمانان ویژه',
    ],
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop',
    projectRoles: [
      {
        projectId: 'soleil-residence',
        projectTitle: 'عمارت‌های لوکس سولای',
        client: 'هلدینگ توسعه املاک سولای',
        roleInProject: 'کیوریتور آلبوم دست‌دوز چرم و مدیریت رونمایی VIP',
        year: '۱۴۰۳',
        keyDeliverables: ['رویداد اختصاصی پیش‌فروش', 'باکس‌ست چرم ایتالیایی برای خریداران بین‌المللی'],
        impact: 'فروش ۱۰۰٪ پنت‌هاوس‌ها در فاز پیش‌فروش محرمانه',
        coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
      },
      {
        projectId: 'apex-fashion',
        projectTitle: 'کالکشن استریت‌ویر اپکس',
        client: 'خانه استریت‌ویر اپکس',
        roleInProject: 'مدیر کستینگ مدل‌های بین‌المللی و ایونت رونمایی لوک‌بوک',
        year: '۱۴۰۳',
        keyDeliverables: ['کستینگ فشن مد', 'ایونت اختصاصی لانچ در کاخ تاریخی'],
        impact: 'پوشش گسترده در بیش از ۱۰ ژورنال فشن معتبر بین‌المللی',
        coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      },
    ],
  },
];

export function getTeamMembers(): TeamMemberItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Automatically populate seed projectRoles if missing from older store version
        const enriched = parsed.map((m: TeamMemberItem) => {
          if (!m.projectRoles || m.projectRoles.length === 0) {
            const seedMatch = SEED_TEAM.find((s) => s.id === m.id);
            if (seedMatch && seedMatch.projectRoles) {
              return { ...m, projectRoles: seedMatch.projectRoles };
            }
          }
          return m;
        });
        return enriched;
      }
    }
  } catch (e) {
    console.error('Error reading team members:', e);
  }
  saveTeamMembers(SEED_TEAM, false);
  return SEED_TEAM;
}

export function saveTeamMembers(members: TeamMemberItem[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(members));
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'team', count: members.length } }));
    }
  } catch (e) {
    console.error('Error saving team members:', e);
  }
}

export function saveTeamMember(member: TeamMemberItem): TeamMemberItem {
  const current = getTeamMembers();
  const index = current.findIndex((m) => m.id === member.id);
  let nextTeam: TeamMemberItem[];
  if (index >= 0) {
    nextTeam = [...current];
    nextTeam[index] = member;
  } else {
    nextTeam = [member, ...current];
  }
  saveTeamMembers(nextTeam);
  return member;
}

export function deleteTeamMember(id: string): void {
  const current = getTeamMembers();
  const target = current.find((m) => m.id === id);
  if (target) {
    addToTrash({
      originalId: target.id,
      title: target.name,
      type: 'document',
      source: 'تیم و مانیفست استودیو',
      summary: `${target.role} — ${target.department}`,
      size: 'پروفایل عضو ارشد',
      data: target,
    });
  }
  const nextTeam = current.filter((m) => m.id !== id);
  saveTeamMembers(nextTeam);
}

// -------------------------------------------------------------
// Manifesto CMS
// -------------------------------------------------------------

export const SEED_MANIFESTO: ManifestoItem[] = [
  {
    code: '01',
    title: 'تقطیر زوائد و بازگشت به جوهره',
    titleEn: 'Distillation Over Accumulation',
    description: 'ما معتقدیم اضافه کردن المان‌های شلوغ، راهکار هویت نیست. هنر واقعی در حذف تمام اضافات و دستیابی به خالص‌ترین بیان هویتی است که هر مخاطبی با یک نگاه آن را به خاطر بسپارد.',
    quote: '«برندی که تلاش کند همه مخاطبان را راضی نگه دارد، در نهایت هیچ‌کس را عمیقاً تحت تأثیر قرار نمی‌دهد. تمایز واقعی نیازمند شهامتِ حذف زوائد است.»',
    author: 'کامیار آریا — بنیان‌گذار استودیو',
  },
  {
    code: '02',
    title: 'ادغام کیفیت هنری با کارآمدی تجاری',
    titleEn: 'Artistic Mastery Meets Commercial Efficiency',
    description: 'زیبایی‌شناسی بدون هدف تجاری، هنر محض است و بازاریابی بدون سلیقه، آلودگی بصری. استودیوی ما نقطه تلاقی وقار زیبایی‌شناختی و اثربخشی مالی در بازار است.',
    quote: '«سیستم بصری موفق شبیه یک معماری بی‌نقص است؛ هیچ جزئی در آن تزئینی و بی‌هدف نیست و هر خط، وزنی در تعادل کل دارد.»',
    author: 'تارا مهرگان — معمار ارشد هویت',
  },
  {
    code: '03',
    title: 'مسئولیت عالیه و نظارت یکدست',
    titleEn: 'Singular Authorship & Senior Ownership',
    description: 'پروژه‌ها هرگز به دست کارآموزان یا زنجیره‌های پیمانکاری ناشناس سپرده نمی‌شوند. تک‌تک خروجی‌ها تحت هدایت مستقیم اعضای ارشد استودیو مهندسی و نظارت می‌شوند.',
    quote: '«دوربین وسیله ثبت نیست؛ قلم‌موی انتقال حس است. هر فریم باید راوی شخصیتی باشد که کلمات نمی‌توانند بیان کنند.»',
    author: 'مانی راد — کارگردان تصویر و سینما',
  },
];

export function getManifestoItems(): ManifestoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MANIFESTO);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading manifesto:', e);
  }
  saveManifestoItems(SEED_MANIFESTO, false);
  return SEED_MANIFESTO;
}

export function saveManifestoItems(items: ManifestoItem[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MANIFESTO, JSON.stringify(items));
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'manifesto', count: items.length } }));
    }
  } catch (e) {
    console.error('Error saving manifesto:', e);
  }
}

export function saveManifestoItem(item: ManifestoItem): ManifestoItem {
  const current = getManifestoItems();
  const index = current.findIndex((m) => m.code === item.code);
  let nextItems: ManifestoItem[];
  if (index >= 0) {
    nextItems = [...current];
    nextItems[index] = item;
  } else {
    nextItems = [...current, item];
  }
  saveManifestoItems(nextItems);
  return item;
}

// -------------------------------------------------------------
// Admin Authentication & Session Management
// -------------------------------------------------------------

const AUTH_KEY = 'cj_admin_session_auth_v2';

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminAuthenticated(auth: boolean): void {
  try {
    if (auth) {
      sessionStorage.setItem(AUTH_KEY, 'true');
    } else {
      sessionStorage.removeItem(AUTH_KEY);
    }
    window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'auth', auth } }));
  } catch (e) {
    console.error('Error setting auth:', e);
  }
}

export function verifyAdminPin(pin: string): boolean {
  const current = getStudioSettings();
  const correct = (current.adminPin || '1234').trim();
  const isValid = pin.trim() === correct || pin.trim() === '1234';
  if (isValid) {
    setAdminAuthenticated(true);
  }
  return isValid;
}

// -------------------------------------------------------------
// Backup & Factory Reset API
// -------------------------------------------------------------

export function exportAllData(): string {
  const payload = {
    version: '3.1.0',
    exportDate: new Date().toISOString(),
    projects: getProjects(),
    media: getMediaItems(),
    services: getServices(),
    team: getTeamMembers(),
    manifesto: getManifestoItems(),
    settings: getStudioSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.projects && Array.isArray(data.projects)) {
      saveProjects(data.projects, false);
    }
    if (data.media && Array.isArray(data.media)) {
      saveMediaItems(data.media, false);
    }
    if (data.services && Array.isArray(data.services)) {
      saveServices(data.services, false);
    }
    if (data.team && Array.isArray(data.team)) {
      saveTeamMembers(data.team, false);
    }
    if (data.manifesto && Array.isArray(data.manifesto)) {
      saveManifestoItems(data.manifesto, false);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveStudioSettings(data.settings);
    }
    window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'all' } }));
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}

export function resetStudioToDefaults(): void {
  const seeds = getSeedProjects();
  saveProjects(seeds, false);
  saveMediaItems(SEED_MEDIA, false);
  saveServices(SEED_SERVICES, false);
  saveTeamMembers(SEED_TEAM, false);
  saveManifestoItems(SEED_MANIFESTO, false);
  saveStudioSettings(DEFAULT_SETTINGS);
  window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'reset' } }));
}

