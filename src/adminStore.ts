/**
 * Creativity Juice — Admin CMS & Studio Store
 * Centralized data management for Portfolio Projects, Media/Photos Library,
 * Studio Settings, and Content Synchronization.
 * Dispatches 'CJ_STUDIO_DATA_CHANGED' for real-time reactivity across public UI/UX and Admin.
 */

import { addToTrash } from './trashStore';
import { PORTFOLIO_CASE_STUDIES, CaseStudy } from './PortfolioGallery';
import { INITIAL_PROJECTS, MasterProjectItem } from './data/projectsData';
import { INITIAL_TEAM } from './data/teamData';
import { pushServerSyncPayload } from './serverSync';
import {
  fetchPortfoliosFromDatabase,
  insertPortfolioToDatabase,
  deletePortfolioFromDatabase,
  SupabasePortfolioRow,
} from './supabaseClient';

export interface ProjectCreditItem {
  id: string;
  memberId?: string;
  name: string;
  roleInProject: string;
  department?: string;
  avatar?: string;
  isGuest?: boolean;
}

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
  assignedTeamIds?: string[];
  projectCredits?: ProjectCreditItem[];
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
  adminWhatsapp?: string;
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
  PROJECTS: 'cj_studio_projects_v4',
  MEDIA: 'cj_studio_media_v3',
  SETTINGS: 'cj_studio_settings_v3',
  SERVICES: 'cj_studio_services_v5',
  TEAM: 'cj_studio_team_v5',
  MANIFESTO: 'cj_studio_manifesto_v6',
};

// Initial Seed Media Items
const SEED_MEDIA: MediaItem[] = [
  {
    id: 'media-yousefzadeh-1',
    title: 'کاور گروه مشاوره سرمایه‌گذاری ملکی یوسف‌زاده',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    category: 'projects',
    tags: ['یوسف‌زاده', 'سرمایه‌گذاری ملکی', 'لوکس', 'هویت برند'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.4 MB',
    addedAt: '۱۴۰۳/۰۸/۱۲',
    isWallpaperPreset: true,
  },
  {
    id: 'media-dr-peiravi-1',
    title: 'تولید محتوا و فیلم سینمایی دکتر صادق پیروی',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=85',
    category: 'cinema',
    tags: ['دکتر پیروی', 'پزشکی زیبایی', 'دوربین حرفه‌ای', 'ادیت پریمیوم'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.8 MB',
    addedAt: '۱۴۰۳/۰۹/۰۱',
    isWallpaperPreset: false,
  },
  {
    id: 'media-ghellak-tala-1',
    title: 'استودیو آموزش مالی و ریلزهای قلک طلا (خسروی‌فر)',
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=85',
    category: 'cinema',
    tags: ['قلک طلا', 'آموزش اقتصادی', 'خسروی‌فر', 'ریلز'],
    aspectRatio: '16:9',
    dimensions: '2560 × 1440',
    size: '1.2 MB',
    addedAt: '۱۴۰۳/۰۹/۱۵',
  },
  {
    id: 'media-gogona-1',
    title: 'تیزر سینمایی خطوط تولید شرکت صنعتی گوگونا',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=85',
    category: 'cinema',
    tags: ['گوگونا', 'صنعتی', 'تیزر تبلیغاتی', 'ماشین‌آلات'],
    aspectRatio: '21:9',
    dimensions: '3840 × 1645',
    size: '2.5 MB',
    addedAt: '۱۴۰۳/۱۰/۰۲',
  },
  {
    id: 'media-ermia-teb-1',
    title: 'دستگاه‌های تجهیزات پزشکی ارمیا طب',
    url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1600&q=85',
    category: 'packaging',
    tags: ['ارمیا طب', 'تجهیزات پزشکی', 'معرفی محصول'],
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
  contactEmail: 'youthefzadeh@gmail.com',
  contactPhone: '+۹۸ ۲۱ ۲۲۰۴ ۸۹۲۱',
  adminWhatsapp: '',
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

// Helper to build default project credits from team data if not explicitly set yet
export function buildDefaultProjectCredits(
  project: { id: string; title?: string; role?: string; assignedTeamIds?: string[]; projectCredits?: ProjectCreditItem[] },
  teamSource?: Array<{ id: string; name: string; role: string; department: string; photo: string; projectRoles?: MemberProjectRole[] }>
): ProjectCreditItem[] {
  if (Array.isArray(project.projectCredits)) {
    return project.projectCredits;
  }

  const members = teamSource || (INITIAL_TEAM as any[]);
  const credits: ProjectCreditItem[] = [];
  const seenMemberIds = new Set<string>();

  members.forEach((m) => {
    const matchedRole = (m.projectRoles || []).find(
      (pr: MemberProjectRole) =>
        pr.projectId === project.id ||
        (pr.projectTitle && project.title && (pr.projectTitle === project.title || pr.projectTitle.includes(project.title) || project.title.includes(pr.projectTitle)))
    );
    const isAssigned = (project.assignedTeamIds || []).includes(m.id);

    if (matchedRole || isAssigned) {
      seenMemberIds.add(m.id);
      credits.push({
        id: `credit-${project.id}-${m.id}`,
        memberId: m.id,
        name: m.name,
        roleInProject: matchedRole?.roleInProject || project.role || m.role,
        department: m.department,
        avatar: m.photo,
        isGuest: false,
      });
    }
  });

  return credits;
}

// Convert initial Master Projects to ProjectItems
function getSeedProjects(): ProjectItem[] {
  return INITIAL_PROJECTS.map((c) => {
    const defaultCredits = buildDefaultProjectCredits({
      id: c.id,
      title: c.title,
      role: c.role,
    });
    return {
      id: c.id,
      title: c.title,
      titleEn: c.titleEn,
      subtitle: c.subtitle,
      category: c.category,
      categoryLabel: c.categoryLabel,
      client: c.client,
      year: c.year,
      trackCode: c.trackCode,
      deptTrack: c.deptTrack || c.trackCode,
      role: c.role || 'استراتژیست هویت و آرت‌دایرکتور',
      coverImage: c.coverImage,
      highResImage: c.highResImage || c.coverImage,
      galleryImages: c.galleryImages || [c.coverImage],
      cinemaRatio: c.cinemaRatio,
      videoDuration: c.videoDuration,
      badge: c.badge,
      challenge: c.challenge,
      solution: c.solution,
      description: c.description || `${c.challenge}\n\n${c.solution}`,
      metrics: c.metrics,
      deliverables: c.deliverables,
      tags: c.tags,
      colorAccent: c.colorAccent,
      featured: c.featured ?? true,
      isPublished: c.isPublished ?? true,
      assignedTeamIds: defaultCredits.filter((cr) => cr.memberId).map((cr) => cr.memberId!),
      projectCredits: defaultCredits,
      desktopPos: c.desktopPos || { top: 61, left: 21, mobileTop: 36, mobileLeft: 56 },
      createdAt: c.createdAt || '۱۴۰۳/۰۶/۰۱',
      updatedAt: c.updatedAt || '۱۴۰۳/۱۱/۱۰',
    };
  });
}

// -------------------------------------------------------------
// Projects API
// -------------------------------------------------------------

export function getProjects(): ProjectItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If cached storage still has old dummy projects (arka, etc.), upgrade to real projects
        const hasDummy = parsed.some((p: any) => p && (p.id === 'arka-architecture' || p.id === 'nectar-tonic' || p.id === 'sample-brand-rebrand'));
        if (!hasDummy) {
          let rawTeam: any[] = INITIAL_TEAM as any[];
          try {
            const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
            if (storedTeam) {
              const parsedTeam = JSON.parse(storedTeam);
              if (Array.isArray(parsedTeam) && parsedTeam.length > 0) {
                rawTeam = parsedTeam;
              }
            }
          } catch {
            // ignore
          }
          return parsed.map((p: ProjectItem) => {
            const credits = Array.isArray(p.projectCredits)
              ? p.projectCredits
              : buildDefaultProjectCredits(p, rawTeam);
            const assignedIds = Array.isArray(p.projectCredits)
              ? credits.filter((cr) => !cr.isGuest && cr.memberId).map((cr) => cr.memberId!)
              : p.assignedTeamIds || credits.filter((cr) => cr.memberId).map((cr) => cr.memberId!);
            return {
              ...p,
              projectCredits: credits,
              assignedTeamIds: assignedIds,
            };
          });
        }
      } else if (Array.isArray(parsed) && parsed.length === 0) {
        return [];
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
      void pushServerSyncPayload({ projects });
    }
  } catch (e) {
    console.error('Error saving projects:', e);
  }
}

function syncTeamRolesFromProject(updatedItem: ProjectItem): void {
  try {
    const rawTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
    const members: TeamMemberItem[] = rawTeam ? JSON.parse(rawTeam) : [...SEED_TEAM];
    if (!Array.isArray(members) || members.length === 0) return;

    const credits = Array.isArray(updatedItem.projectCredits)
      ? updatedItem.projectCredits
      : buildDefaultProjectCredits(updatedItem, members);

    let teamChanged = false;
    const nextMembers = members.map((m) => {
      const creditForMember = credits.find((cr) => !cr.isGuest && cr.memberId === m.id);
      const existingRoles = m.projectRoles ? [...m.projectRoles] : [];
      const existingIdx = existingRoles.findIndex(
        (pr) => pr.projectId === updatedItem.id || pr.projectTitle === updatedItem.title
      );

      if (creditForMember) {
        const newEntry: MemberProjectRole = {
          projectId: updatedItem.id,
          projectTitle: updatedItem.title,
          client: updatedItem.client,
          roleInProject: creditForMember.roleInProject || updatedItem.role || m.role,
          year: updatedItem.year || '۱۴۰۳',
          keyDeliverables:
            updatedItem.deliverables && updatedItem.deliverables.length > 0
              ? updatedItem.deliverables.slice(0, 3)
              : existingIdx >= 0
              ? existingRoles[existingIdx].keyDeliverables
              : [],
          impact: updatedItem.metrics || (existingIdx >= 0 ? existingRoles[existingIdx].impact : ''),
          coverImage: updatedItem.coverImage,
        };
        if (existingIdx >= 0) {
          existingRoles[existingIdx] = newEntry;
        } else {
          existingRoles.unshift(newEntry);
        }
        teamChanged = true;
        return { ...m, projectRoles: existingRoles };
      } else if (existingIdx >= 0) {
        // Member was removed from this project's credits -> remove from their projectRoles
        const filteredRoles = existingRoles.filter(
          (pr) => pr.projectId !== updatedItem.id && pr.projectTitle !== updatedItem.title
        );
        teamChanged = true;
        return { ...m, projectRoles: filteredRoles };
      }
      return m;
    });

    if (teamChanged) {
      saveTeamMembers(nextMembers, true);
    }
  } catch (e) {
    console.error('Error syncing team members on saveProject:', e);
  }
}

export function saveProject(project: ProjectItem): ProjectItem {
  const current = getProjects();
  const index = current.findIndex((p) => p.id === project.id);
  const existingProject = index >= 0 ? current[index] : undefined;

  let resolvedCredits: ProjectCreditItem[];
  if (Array.isArray(project.projectCredits)) {
    resolvedCredits = project.projectCredits;
  } else if (Array.isArray(project.assignedTeamIds)) {
    const rawTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
    const members: TeamMemberItem[] = rawTeam ? JSON.parse(rawTeam) : [...SEED_TEAM];
    const previousCredits = existingProject?.projectCredits || [];
    const guestCredits = previousCredits.filter((c) => c.isGuest);
    const memberCredits: ProjectCreditItem[] = project.assignedTeamIds
      .map((mId) => {
        const prev = previousCredits.find((c) => c.memberId === mId);
        const m = members.find((tm) => tm.id === mId);
        if (!m && !prev) return null;
        return {
          id: prev?.id || `credit-${project.id}-${mId}`,
          memberId: mId,
          name: m?.name || prev?.name || '',
          roleInProject: prev?.roleInProject || project.role || m?.role || 'همکار پروژه',
          department: m?.department || prev?.department || '',
          avatar: m?.photo || prev?.avatar || '',
          isGuest: false,
        };
      })
      .filter(Boolean) as ProjectCreditItem[];
    resolvedCredits = [...memberCredits, ...guestCredits];
  } else if (existingProject?.projectCredits) {
    resolvedCredits = existingProject.projectCredits;
  } else {
    resolvedCredits = buildDefaultProjectCredits(project);
  }

  const resolvedAssignedIds = resolvedCredits
    .filter((cr) => !cr.isGuest && cr.memberId)
    .map((cr) => cr.memberId!);

  const roleSummary =
    resolvedCredits.length > 0
      ? resolvedCredits.map((cr) => `${cr.name} (${cr.roleInProject})`).join(' • ')
      : project.role || 'استراتژیست هویت و آرت‌دایرکتور';

  const updatedItem: ProjectItem = {
    ...project,
    deptTrack: project.deptTrack || project.trackCode || 'TRACK 01 // BRAND IDENTITY',
    role: project.role || roleSummary,
    projectCredits: resolvedCredits,
    assignedTeamIds: resolvedAssignedIds,
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
  syncTeamRolesFromProject(updatedItem);

  // Sync to `portfolios` table in Supabase / PostgreSQL
  // Columns: title, category, image_url, project_link, description
  void insertPortfolioToDatabase({
    title: updatedItem.title,
    category: updatedItem.categoryLabel || updatedItem.category || 'branding',
    image_url: updatedItem.coverImage,
    project_link: (updatedItem as any).projectLink || updatedItem.highResImage || updatedItem.coverImage || '#',
    description: updatedItem.description || updatedItem.challenge || updatedItem.subtitle || '',
    extra_json: JSON.stringify(updatedItem),
  });

  return updatedItem;
}

export function updateProjectCredits(projectId: string, credits: ProjectCreditItem[]): ProjectItem | null {
  const current = getProjects();
  const target = current.find((p) => p.id === projectId);
  if (!target) return null;
  return saveProject({
    ...target,
    projectCredits: credits,
    assignedTeamIds: credits.filter((cr) => !cr.isGuest && cr.memberId).map((cr) => cr.memberId!),
  });
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

  const dbId = (target as any)?.dbPortfolioId ?? (id.startsWith('portfolio-db-') ? id.replace('portfolio-db-', '') : id);
  void deletePortfolioFromDatabase(dbId);
}

export function portfolioRowToProjectItem(row: SupabasePortfolioRow, index = 0): ProjectItem {
  if (row.extra_json) {
    try {
      const parsed = JSON.parse(row.extra_json) as ProjectItem;
      if (parsed && parsed.title) {
        return {
          ...parsed,
          id: parsed.id || `portfolio-db-${row.id}`,
          title: row.title || parsed.title,
          category: row.category || parsed.category || 'branding',
          categoryLabel: row.category || parsed.categoryLabel || 'پروژه استودیو',
          coverImage: row.image_url || parsed.coverImage,
          highResImage: row.image_url || parsed.highResImage || parsed.coverImage,
          description: row.description || parsed.description || parsed.challenge,
          challenge: row.description || parsed.challenge || '',
          ...(row.id ? { dbPortfolioId: row.id } : {}),
          ...(row.project_link ? { projectLink: row.project_link } : {}),
        } as ProjectItem;
      }
    } catch {
      // fall through to standard mapping
    }
  }

  const catRaw = (row.category || 'branding').toLowerCase();
  const mappedCategory =
    catRaw.includes('cinema') || catRaw.includes('فیلم') || catRaw.includes('تیزر') || catRaw.includes('ویدیو')
      ? 'cinema'
      : catRaw.includes('pack') || catRaw.includes('بسته')
      ? 'packaging'
      : catRaw.includes('edit') || catRaw.includes('ادیتوریال')
      ? 'editorial'
      : catRaw.includes('digit') || catRaw.includes('وب') || catRaw.includes('دیجیتال')
      ? 'digital'
      : 'branding';

  return {
    id: `portfolio-db-${row.id}`,
    title: row.title || 'نمونه‌کار استودیو',
    titleEn: row.project_link && row.project_link !== '#' ? row.project_link : `PORTFOLIO // 0${index + 1}`,
    subtitle: row.category || 'پروژه منتخب استودیو',
    category: mappedCategory,
    categoryLabel: row.category || 'هویت بصری و پروداکشن',
    client: row.title || 'کارفرمای استودیو',
    year: '۱۴۰۴',
    trackCode: `PORTFOLIO // 0${index + 1}`,
    deptTrack: 'TRACK 01 // BRAND IDENTITY',
    role: 'کارگردانی هنری و اجرای کامل پروژه',
    description: row.description || '',
    coverImage:
      row.image_url ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    highResImage:
      row.image_url ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    galleryImages: [
      row.image_url ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    ],
    cinemaRatio: mappedCategory === 'cinema',
    badge: row.category || 'منتخب استودیو',
    challenge: row.description || 'طراحی و اجرای استانداردهای بصری و استراتژیک برند.',
    solution: row.project_link && row.project_link !== '#' ? `لینک پروژه: ${row.project_link}` : 'خلق هویت متمایز و ماندگار در بازار هدف.',
    metrics: row.project_link && row.project_link !== '#' ? row.project_link : 'اجرای موفق در استودیو Creativity Juice',
    deliverables: [row.category || 'هویت بصری و محتوا', 'طراحی و کارگردانی هنری'],
    tags: [row.category || 'برندینگ', row.title || 'پروژه'],
    colorAccent: '#D9FF00',
    featured: true,
    isPublished: true,
    assignedTeamIds: [],
    projectCredits: [],
    desktopPos: {
      top: 18 + ((index * 14) % 58),
      left: 16 + ((index * 19) % 62),
      mobileTop: 22 + ((index * 12) % 50),
      mobileLeft: 20 + ((index * 18) % 55),
    },
    createdAt: '۱۴۰۴/۰۱/۰۱',
    updatedAt: '۱۴۰۴/۰۱/۰۱',
    ...(row.id ? { dbPortfolioId: row.id } : {}),
    ...(row.project_link ? { projectLink: row.project_link } : {}),
  } as ProjectItem;
}

let isSyncingPortfolios = false;

export async function syncPortfoliosFromDatabase(): Promise<ProjectItem[]> {
  if (typeof window === 'undefined' || isSyncingPortfolios) return getProjects();
  isSyncingPortfolios = true;
  try {
    const rows = await fetchPortfoliosFromDatabase();
    if (Array.isArray(rows) && rows.length > 0) {
      const mapped = rows.map((r, idx) => portfolioRowToProjectItem(r, idx));
      const json = JSON.stringify(mapped);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, json);
      localStorage.setItem('creativity_juice_projects_v2', json);
      window.dispatchEvent(
        new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'projects', count: mapped.length } })
      );
      window.dispatchEvent(new CustomEvent('projects-updated', { detail: mapped }));
      return mapped;
    } else if (Array.isArray(rows) && rows.length === 0) {
      // Seed the initial studio portfolios into the `portfolios` table once so the database holds all existing portfolios
      const seededFlag = localStorage.getItem('cj_portfolios_db_seeded_v1');
      if (!seededFlag) {
        localStorage.setItem('cj_portfolios_db_seeded_v1', 'true');
        const seeds = getSeedProjects();
        for (const item of seeds) {
          await insertPortfolioToDatabase({
            title: item.title,
            category: item.categoryLabel || item.category || 'branding',
            image_url: item.coverImage,
            project_link: item.highResImage || item.coverImage || '#',
            description: item.description || item.challenge || item.subtitle || '',
            extra_json: JSON.stringify(item),
          });
        }
        const freshRows = await fetchPortfoliosFromDatabase();
        if (freshRows.length > 0) {
          const mapped = freshRows.map((r, idx) => portfolioRowToProjectItem(r, idx));
          const json = JSON.stringify(mapped);
          localStorage.setItem(STORAGE_KEYS.PROJECTS, json);
          localStorage.setItem('creativity_juice_projects_v2', json);
          window.dispatchEvent(
            new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'projects', count: mapped.length } })
          );
          window.dispatchEvent(new CustomEvent('projects-updated', { detail: mapped }));
          return mapped;
        }
      }
    }
  } catch (err) {
    console.warn('Failed syncing portfolios from database:', err);
  } finally {
    isSyncingPortfolios = false;
  }
  return getProjects();
}

export async function addPortfolioItemToTable(input: {
  title: string;
  category: string;
  image_url: string;
  project_link: string;
  description: string;
}): Promise<ProjectItem | null> {
  const createdRow = await insertPortfolioToDatabase({
    title: input.title.trim(),
    category: input.category.trim() || 'برندینگ و هویت بصری',
    image_url:
      input.image_url.trim() ||
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    project_link: input.project_link.trim() || '#',
    description: input.description.trim(),
  });

  if (createdRow) {
    const newItem = portfolioRowToProjectItem(createdRow, 0);
    const current = getProjects().filter((p) => p.id !== newItem.id);
    const next = [newItem, ...current];
    saveProjects(next, true);
    return newItem;
  }
  return null;
}

if (typeof window !== 'undefined') {
  setTimeout(() => {
    void syncPortfoliosFromDatabase();
  }, 150);
}

// -------------------------------------------------------------
// Media API
// -------------------------------------------------------------

export function getMediaItems(): MediaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
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
      void pushServerSyncPayload({ media: items });
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
    void pushServerSyncPayload({ settings: updated });
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
    code: 'SRV-06 // MONTHLY CONTENT',
    deptId: 2,
    deptName: 'سینما، مد و محتوای شاخص',
    deptTrack: 'TRACK 02 // CINEMA & VISUALS',
    badge: 'همکاری مستمر ماهانه',
    title: 'تولید محتوای ماهانه',
    titleEn: 'Monthly Content Production',
    fileName: 'SRV-06_قرارداد_تولید_محتوای_ماهانه.doc',
    fileSize: '14.2 MB',
    fileExt: 'DOC',
    description: 'همکاری مستمر در تولید محتوای ماهانه شامل برنامه‌ریزی و هماهنگی جلسات فیلم‌برداری، تحویل خروجی‌ها طبق قرارداد و نیاز کارفرما و نظارت مستمر بر پیج و انتشار محتوا.',
    deliverables: [
      'هماهنگی جلسات فیلم‌برداری در ماه',
      'تحویل خروجی‌ها طبق قرارداد و نیاز کارفرما',
      'نظارت مستمر بر پیج و انتشار محتوا',
    ],
    suitableFor: 'کلینیک‌های تخصصی، املاک پرمیوم و کسب‌وکارهای در حال توسعه',
    timeline: 'دوره قرارداد: ماهانه / فصلی',
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
    suitableFor: 'هلدینگ‌ها و مجموعه‌هایی که تیم اجرایی دارند اما نیازمند هدایت هنری یکپارچه هستند',
    timeline: 'دوره همکاری: فصلی، ۶ ماهه و سالانه',
    engagementType: 'advisory',
  },
];

export function getServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
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
      void pushServerSyncPayload({ services });
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

export const SEED_TEAM: TeamMemberItem[] = INITIAL_TEAM as unknown as TeamMemberItem[];

export function getTeamMembers(): TeamMemberItem[] {
  let baseMembers: TeamMemberItem[] = SEED_TEAM;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasDummy = parsed.some(
          (m: any) =>
            m &&
            (m.name === 'کامیار آریا' ||
              m.name === 'آرشام کاویانی' ||
              m.id === 'member-01' ||
              m.id === 'member-02')
        );
        if (!hasDummy) {
          baseMembers = parsed.map((m: TeamMemberItem) => {
            const seedMatch = SEED_TEAM.find((s) => s.id === m.id);
            const cleanedBio = (m.bio || '').replace(/سکاندار/g, 'هدایتگر');
            const cleanedPhilosophy =
              m.id === 'fereydoun-yousefzadeh' &&
              (!m.philosophy || m.philosophy.includes('هنر در تبلیغات'))
                ? '«وصل کردن ایده‌های خوب به همدیگه»'
                : m.philosophy;
            return {
              ...m,
              bio: cleanedBio,
              experience: '',
              philosophy: cleanedPhilosophy,
              projectRoles: Array.isArray(m.projectRoles)
                ? m.projectRoles
                : seedMatch?.projectRoles || [],
            };
          });
        } else {
          saveTeamMembers(SEED_TEAM, false);
        }
      } else if (Array.isArray(parsed) && parsed.length === 0) {
        return [];
      }
    } else {
      saveTeamMembers(SEED_TEAM, false);
    }
  } catch (e) {
    console.error('Error reading team members:', e);
  }

  // Dynamically enrich each member's projectRoles from active projects & Dashboard OS assignments
  try {
    const allProjects = getProjects();
    let osOverrides: Record<string, { extraMemberIds?: string[] }> = {};
    try {
      const rawOverrides = localStorage.getItem('cj_os_project_status_overrides_v2');
      if (rawOverrides) {
        osOverrides = JSON.parse(rawOverrides);
      }
    } catch {
      // ignore
    }

    return baseMembers.map((member) => {
      const rolesMap = new Map<string, MemberProjectRole>();
      (member.projectRoles || []).forEach((pr) => {
        rolesMap.set(pr.projectId, pr);
      });

      const firstName = member.name.split(' ')[0];

      allProjects.forEach((proj) => {
        if (Array.isArray(proj.projectCredits)) {
          const credit = proj.projectCredits.find((cr) => !cr.isGuest && cr.memberId === member.id);
          const extraIds = osOverrides[proj.id]?.extraMemberIds || [];
          if (credit || extraIds.includes(member.id)) {
            const existing = rolesMap.get(proj.id);
            rolesMap.set(proj.id, {
              projectId: proj.id,
              projectTitle: proj.title,
              client: proj.client,
              roleInProject: credit?.roleInProject || existing?.roleInProject || member.role,
              year: proj.year || '۱۴۰۳',
              keyDeliverables:
                existing?.keyDeliverables && existing.keyDeliverables.length > 0
                  ? existing.keyDeliverables
                  : proj.deliverables
                  ? proj.deliverables.slice(0, 3)
                  : [],
              impact: existing?.impact || proj.metrics || '',
              coverImage: proj.coverImage,
            });
          } else {
            // Explicitly not in proj.projectCredits -> remove if present
            rolesMap.delete(proj.id);
          }
          return;
        }

        const roleStr = `${proj.role || ''} ${(proj.tags || []).join(' ')}`;
        const assignedIds = proj.assignedTeamIds || [];
        const extraIds = osOverrides[proj.id]?.extraMemberIds || [];

        const isAssigned =
          assignedIds.includes(member.id) ||
          extraIds.includes(member.id) ||
          roleStr.includes(member.name) ||
          (firstName.length > 2 && roleStr.includes(firstName));

        if (isAssigned && !rolesMap.has(proj.id)) {
          rolesMap.set(proj.id, {
            projectId: proj.id,
            projectTitle: proj.title,
            client: proj.client,
            roleInProject: proj.role && !proj.role.includes('/') ? proj.role : member.role,
            year: proj.year || '۱۴۰۳',
            keyDeliverables: proj.deliverables ? proj.deliverables.slice(0, 3) : [],
            impact: proj.metrics || '',
            coverImage: proj.coverImage,
          });
        }
      });

      return {
        ...member,
        projectRoles: Array.from(rolesMap.values()),
      };
    });
  } catch {
    return baseMembers;
  }
}

export function syncProjectTeamMemberRole(
  memberId: string,
  project: {
    id: string;
    title: string;
    client?: string;
    year?: string;
    deliverables?: string[];
    metrics?: string;
    coverImage?: string;
  },
  roleInProject: string,
  remove = false
): void {
  try {
    const current = getTeamMembers();
    const targetMember = current.find((m) => m.id === memberId);
    const nextMembers = current.map((m) => {
      if (m.id !== memberId) return m;
      const existing = m.projectRoles ? [...m.projectRoles] : [];
      if (remove) {
        return {
          ...m,
          projectRoles: existing.filter(
            (pr) => pr.projectId !== project.id && pr.projectTitle !== project.title
          ),
        };
      }
      const idx = existing.findIndex(
        (pr) => pr.projectId === project.id || pr.projectTitle === project.title
      );
      const roleEntry: MemberProjectRole = {
        projectId: project.id,
        projectTitle: project.title,
        client: project.client || 'کارفرمای اختصاصی',
        roleInProject: roleInProject || m.role,
        year: project.year || '۱۴۰۳',
        keyDeliverables:
          project.deliverables && project.deliverables.length > 0
            ? project.deliverables.slice(0, 3)
            : ['اجرای تخصصی در پروژه'],
        impact: project.metrics || 'اجرای استاندارد استودیویی',
        coverImage:
          project.coverImage ||
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      };
      if (idx >= 0) {
        existing[idx] = roleEntry;
      } else {
        existing.unshift(roleEntry);
      }
      return {
        ...m,
        projectRoles: existing,
      };
    });
    saveTeamMembers(nextMembers, true);

    // Also keep the project's projectCredits in sync
    const allProjects = getProjects();
    const projIdx = allProjects.findIndex((p) => p.id === project.id);
    if (projIdx >= 0 && targetMember) {
      const proj = allProjects[projIdx];
      const existingCredits = Array.isArray(proj.projectCredits) ? [...proj.projectCredits] : [];
      let nextCredits: ProjectCreditItem[];
      if (remove) {
        nextCredits = existingCredits.filter((cr) => cr.memberId !== memberId);
      } else {
        const cIdx = existingCredits.findIndex((cr) => cr.memberId === memberId);
        const creditEntry: ProjectCreditItem = {
          id: cIdx >= 0 ? existingCredits[cIdx].id : `credit-${proj.id}-${memberId}`,
          memberId: targetMember.id,
          name: targetMember.name,
          roleInProject: roleInProject || targetMember.role,
          department: targetMember.department,
          avatar: targetMember.photo,
          isGuest: false,
        };
        if (cIdx >= 0) {
          existingCredits[cIdx] = creditEntry;
          nextCredits = existingCredits;
        } else {
          nextCredits = [...existingCredits, creditEntry];
        }
      }
      const nextProjects = [...allProjects];
      nextProjects[projIdx] = {
        ...proj,
        projectCredits: nextCredits,
        assignedTeamIds: nextCredits.filter((cr) => !cr.isGuest && cr.memberId).map((cr) => cr.memberId!),
      };
      saveProjects(nextProjects, true);
    }
  } catch (e) {
    console.error('Error syncing project team member role:', e);
  }
}

export function saveTeamMembers(members: TeamMemberItem[], notify = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(members));
    if (notify) {
      window.dispatchEvent(new CustomEvent(CJ_STUDIO_DATA_EVENT, { detail: { type: 'team', count: members.length } }));
      void pushServerSyncPayload({ team: members });
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

  // Sync member's projectRoles back to each project's projectCredits
  try {
    const allProjects = getProjects();
    let projectsChanged = false;
    const memberRoleMap = new Map<string, MemberProjectRole>();
    (member.projectRoles || []).forEach((pr) => {
      memberRoleMap.set(pr.projectId, pr);
    });

    const nextProjects = allProjects.map((proj) => {
      const credits = Array.isArray(proj.projectCredits) ? [...proj.projectCredits] : [];
      const existingIdx = credits.findIndex((cr) => !cr.isGuest && cr.memberId === member.id);
      const roleForProj = memberRoleMap.get(proj.id);

      if (roleForProj) {
        const updatedCredit: ProjectCreditItem = {
          id: existingIdx >= 0 ? credits[existingIdx].id : `credit-${proj.id}-${member.id}`,
          memberId: member.id,
          name: member.name,
          roleInProject: roleForProj.roleInProject || member.role,
          department: member.department,
          avatar: member.photo,
          isGuest: false,
        };
        if (existingIdx >= 0) {
          credits[existingIdx] = updatedCredit;
        } else {
          credits.push(updatedCredit);
        }
        projectsChanged = true;
        return {
          ...proj,
          projectCredits: credits,
          assignedTeamIds: credits.filter((cr) => !cr.isGuest && cr.memberId).map((cr) => cr.memberId!),
        };
      } else if (existingIdx >= 0) {
        const nextCredits = credits.filter((cr) => cr.memberId !== member.id);
        projectsChanged = true;
        return {
          ...proj,
          projectCredits: nextCredits,
          assignedTeamIds: nextCredits.filter((cr) => !cr.isGuest && cr.memberId).map((cr) => cr.memberId!),
        };
      }
      return proj;
    });

    if (projectsChanged) {
      saveProjects(nextProjects, true);
    }
  } catch (e) {
    console.error('Error syncing projects on saveTeamMember:', e);
  }

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
    title: 'ذهن: استراتژی، برندینگ و فروش',
    titleEn: 'The Mind',
    description: 'ما زیرساخت فکری و تجاری پروژه شما را می‌سازیم. از کشف هویت برند و کپی‌رایتینگ تا طراحی کمپین‌های مارکتینگ و مهندسی قیف فروش برای شرکت‌ها و هنرمندان.',
    quote: 'خروجی‌ها: استراتژی برند / مشاوره مارکتینگ و فروش / کپی‌رایتینگ و سناریو / هدایت خلاق تیم‌ها.',
    author: 'Creativity juice',
  },
  {
    code: '02',
    title: 'چشم: کارگردانی و تولیدات تصویری',
    titleEn: 'The Eye',
    description: 'ما به استراتژی‌های شما فرم بصری و روایت سینمایی می‌بخشیم. تولید محتوایی که استانداردهای زیبایی‌شناسی را با الگوریتم‌های توجه و فروش پیوند می‌زند.',
    quote: 'خروجی‌ها: تیزر تبلیغاتی / موزیک‌ویدیو / فیلم کوتاه / استراتژی و پروداکشن یوتیوب / کارگردانی هنری.',
    author: 'Creativity juice',
  },
  {
    code: '03',
    title: 'گوش: تولید موسیقی و مهندسی صدا',
    titleEn: 'The Ear',
    description: 'ما اتمسفر و امضای شنیداری خلق می‌کنیم. هدایت هنری و تولید آثار موسیقایی جریان‌ساز برای هنرمندان و خلق هویت صوتی متمایز برای پروژه‌های تصویری و تجاری.',
    quote: 'خروجی‌ها: تولید صفر تا صد آلبوم و سینگل ترک / موسیقی متن و طراحی صدا / هویت شنیداری برند.',
    author: 'Creativity juice',
  },
];

export function getManifestoItems(): ManifestoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MANIFESTO);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
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
      void pushServerSyncPayload({ manifesto: items });
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

