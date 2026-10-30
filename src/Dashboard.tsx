import React, { useState, useEffect, useMemo } from 'react';
import { getProjects, ProjectItem, CJ_STUDIO_DATA_EVENT } from './adminStore';
import {
  getClientWorkspaces,
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore';
import {
  ClientWorkspace,
  ClientMilestone,
  ClientDeliverable,
} from './data/clientPortalData';

export type ProjectOSStatus = 'in-production' | 'post-production' | 'review' | 'completed';

export interface ProjectTimelinePhase {
  id: string;
  stepNumber: number;
  title: string;
  titleEn: string;
  status: 'completed' | 'in-progress' | 'pending';
  dateLabel: string;
}

export interface OSProjectRecord {
  id: string;
  project: ProjectItem;
  workspace?: ClientWorkspace;
  deliverable?: ClientDeliverable;
  isMasterProject?: boolean;
  status: ProjectOSStatus;
  progressPercent: number;
  projectLead: string;
  projectLeadRole: string;
  startDate: string;
  deliveryDate: string;
  currentPhaseTitle: string;
  phases: ProjectTimelinePhase[];
  priority: 'high' | 'normal' | 'flagship';
}

interface StatusOverride {
  status?: ProjectOSStatus;
  progressPercent?: number;
  completedSteps?: number;
}

const STORAGE_KEY_OS_OVERRIDES = 'cj_os_project_status_overrides_v1';

const STATUS_META: Record<
  ProjectOSStatus,
  {
    label: string;
    labelEn: string;
    dotClass: string;
    textClass: string;
    barClass: string;
    subtleBg: string;
  }
> = {
  'in-production': {
    label: 'در حال پروداکشن',
    labelEn: 'ACTIVE PRODUCTION',
    dotClass: 'bg-amber-500 animate-pulse',
    textClass: 'text-amber-800',
    barClass: 'bg-amber-500',
    subtleBg: 'bg-amber-50/70',
  },
  'post-production': {
    label: 'تدوین و پست‌پروداکشن',
    labelEn: 'POST-PRODUCTION',
    dotClass: 'bg-sky-500',
    textClass: 'text-sky-800',
    barClass: 'bg-sky-500',
    subtleBg: 'bg-sky-50/70',
  },
  review: {
    label: 'بازبینی و تایید کارفرما',
    labelEn: 'CLIENT REVIEW',
    dotClass: 'bg-violet-500',
    textClass: 'text-violet-800',
    barClass: 'bg-violet-500',
    subtleBg: 'bg-violet-50/70',
  },
  completed: {
    label: 'تکمیل و لانچ شده',
    labelEn: 'COMPLETED & LIVE',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-800',
    barClass: 'bg-emerald-600',
    subtleBg: 'bg-emerald-50/70',
  },
};

const WORKSPACE_TO_PROJECT_IDS: Record<string, string[]> = {
  'client-yousefzadeh': ['yousefzadeh-real-estate'],
  'client-dr-peiravi': ['dr-sadegh-peiravi'],
  'client-ermia-teb': ['ermia-teb-medical'],
  'client-soleil-penthouse': ['soleil-luxury-penthouse'],
  'client-noora-clinic': ['noora-beauty-clinic'],
  'client-rosegold-perfume': ['rosegold-atelier-perfume'],
};

function buildStandardPhases(
  progressPercent: number,
  startDate: string,
  deliveryDate: string,
  workspaceMilestones?: ClientMilestone[]
): ProjectTimelinePhase[] {
  if (workspaceMilestones && workspaceMilestones.length >= 4) {
    return workspaceMilestones.slice(0, 4).map((m, idx) => ({
      id: m.id,
      stepNumber: idx + 1,
      title: m.title,
      titleEn: `PHASE 0${idx + 1}`,
      status: m.status,
      dateLabel: m.date,
    }));
  }

  const step1Done = progressPercent >= 30;
  const step2Done = progressPercent >= 60;
  const step3Done = progressPercent >= 88;
  const step4Done = progressPercent >= 100;

  const rawPhases = [
    {
      title: 'کشف، عارضه‌یابی و استراتژی',
      titleEn: '01 / DISCOVERY',
      date: startDate,
      done: step1Done,
    },
    {
      title: 'معماری هویت و سناریونویسی',
      titleEn: '02 / PRE-PRODUCTION',
      date: 'فاز دوم',
      done: step2Done,
    },
    {
      title: 'پروداکشن و کارگردانی هنری',
      titleEn: '03 / PRODUCTION',
      date: 'فاز سوم',
      done: step3Done,
    },
    {
      title: 'پست‌پروداکشن، تدوین و لانچ',
      titleEn: '04 / LAUNCH',
      date: deliveryDate,
      done: step4Done,
    },
  ];

  let foundInProgress = false;
  return rawPhases.map((item, idx) => {
    let status: 'completed' | 'in-progress' | 'pending' = 'pending';
    if (item.done) {
      status = 'completed';
    } else if (!foundInProgress) {
      status = 'in-progress';
      foundInProgress = true;
    }
    return {
      id: `phase-${idx + 1}`,
      stepNumber: idx + 1,
      title: item.title,
      titleEn: item.titleEn,
      status,
      dateLabel: item.date,
    };
  });
}

export interface DashboardProps {
  activeClient?: ClientWorkspace | null;
  onClose?: () => void;
  onSelectProject?: (project: ProjectItem) => void;
  onOpenBrief?: (prefilledScope?: string) => void;
  onOpenCalendar?: () => void;
  onApproveDeliverable?: (deliverableId: string, title: string) => void;
  onRequestRevision?: (deliverable: ClientDeliverable) => void;
  onSwitchTab?: (tab: 'milestones' | 'deliverables' | 'calendar' | 'chat' | 'brief') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeClient,
  onSelectProject,
  onOpenCalendar,
  onApproveDeliverable,
  onRequestRevision,
  onSwitchTab,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>(() => getProjects());
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(() => getClientWorkspaces());
  const [overrides, setOverrides] = useState<Record<string, StatusOverride>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY_OS_OVERRIDES);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Filtering & View states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectOSStatus>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'timeline'>('grid');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncData = () => {
      setProjects(getProjects());
      setWorkspaces(getClientWorkspaces());
    };
    window.addEventListener(CJ_STUDIO_DATA_EVENT, syncData);
    window.addEventListener(CLIENT_PORTAL_EVENT, syncData);
    window.addEventListener('projects-updated', syncData);
    return () => {
      window.removeEventListener(CJ_STUDIO_DATA_EVENT, syncData);
      window.removeEventListener(CLIENT_PORTAL_EVENT, syncData);
      window.removeEventListener('projects-updated', syncData);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const saveOverrides = (next: Record<string, StatusOverride>) => {
    setOverrides(next);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_OS_OVERRIDES, JSON.stringify(next));
      } catch (e) {
        console.error('Failed saving OS project overrides', e);
      }
    }
  };

  // Build OS Project Records scoped strictly to the activeClient when inside Client Portal
  const osRecords: OSProjectRecord[] = useMemo(() => {
    if (activeClient) {
      const clientRecords: OSProjectRecord[] = [];
      const mappedIds = WORKSPACE_TO_PROJECT_IDS[activeClient.id] || [];

      // 1. Find studio projects belonging to this specific client
      const clientStudioProjects = projects.filter(
        (proj) =>
          mappedIds.includes(proj.id) ||
          proj.title.includes(activeClient.brandName) ||
          activeClient.brandName.includes(proj.client) ||
          proj.id.includes(activeClient.slug)
      );

      if (clientStudioProjects.length > 0) {
        clientStudioProjects.forEach((proj) => {
          const overrideKey = `${activeClient.id}__${proj.id}`;
          const userOverride = overrides[overrideKey] || overrides[proj.id];
          const progressPercent =
            userOverride?.progressPercent !== undefined
              ? userOverride.progressPercent
              : activeClient.progressPercent || 80;

          const status: ProjectOSStatus =
            userOverride?.status ||
            (progressPercent >= 100
              ? 'completed'
              : progressPercent >= 88
              ? 'review'
              : 'in-production');

          const phases = buildStandardPhases(
            progressPercent,
            activeClient.contractDate,
            activeClient.deliveryDate,
            activeClient.milestones
          );
          const activePhase =
            phases.find((p) => p.status === 'in-progress') || phases[phases.length - 1];

          clientRecords.push({
            id: overrideKey,
            project: proj,
            workspace: activeClient,
            isMasterProject: true,
            status,
            progressPercent,
            projectLead: activeClient.projectLead,
            projectLeadRole: activeClient.projectLeadRole,
            startDate: activeClient.contractDate,
            deliveryDate: activeClient.deliveryDate,
            currentPhaseTitle: activePhase ? activePhase.title : 'تحویل نهایی',
            phases,
            priority: 'flagship',
          });
        });
      } else {
        // Synthesize master project card for personal brands or custom client workspaces
        const masterId = `${activeClient.id}__master`;
        const userOverride = overrides[masterId];
        const progressPercent =
          userOverride?.progressPercent !== undefined
            ? userOverride.progressPercent
            : activeClient.progressPercent || 55;

        const status: ProjectOSStatus =
          userOverride?.status ||
          (progressPercent >= 100 ? 'completed' : 'in-production');

        const phases = buildStandardPhases(
          progressPercent,
          activeClient.contractDate,
          activeClient.deliveryDate,
          activeClient.milestones
        );
        const activePhase =
          phases.find((p) => p.status === 'in-progress') || phases[phases.length - 1];

        const defaultCover =
          activeClient.deliverables[0]?.thumbnail ||
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=85';

        const synthesizedProject: ProjectItem = {
          id: masterId,
          title: `معماری برند و پروداکشن جامع ${activeClient.brandName}`,
          titleEn: `${activeClient.slug.toUpperCase()} MASTER PROJECT`,
          subtitle: activeClient.scopeSummary,
          category: 'branding',
          categoryLabel: activeClient.category || 'استراتژی و تولید محتوا',
          client: activeClient.ownerName || activeClient.brandName,
          year: '۱۴۰۳',
          trackCode: 'CLIENT WORKSPACE // MASTER',
          coverImage: defaultCover,
          galleryImages: [defaultCover],
          badge: activeClient.isPersonalBrand ? 'پرسونال برند اختصاصی' : 'پروژه رسمی استودیو',
          challenge: activeClient.scopeSummary,
          solution: activeClient.brandTone || 'طراحی هویت بصری و تقویم محتوای سینمایی',
          metrics: `${progressPercent}% پیشرفت کل نقشه راه`,
          deliverables: activeClient.deliverables.map((d) => d.title),
          tags: [activeClient.category || 'اینستاگرام'],
          colorAccent: '#F59E0B',
          createdAt: activeClient.contractDate,
          updatedAt: activeClient.deliveryDate,
        };

        clientRecords.push({
          id: masterId,
          project: synthesizedProject,
          workspace: activeClient,
          isMasterProject: true,
          status,
          progressPercent,
          projectLead: activeClient.projectLead,
          projectLeadRole: activeClient.projectLeadRole,
          startDate: activeClient.contractDate,
          deliveryDate: activeClient.deliveryDate,
          currentPhaseTitle: activePhase ? activePhase.title : 'در حال اجرا',
          phases,
          priority: 'flagship',
        });
      }

      // 2. Map each Deliverable / Active Sprint of this client into a dedicated Project OS Card
      activeClient.deliverables.forEach((del, idx) => {
        const delKey = `${activeClient.id}__del__${del.id}`;
        const userOverride = overrides[delKey];

        const mappedStatus: ProjectOSStatus =
          userOverride?.status ||
          (del.status === 'approved'
            ? 'completed'
            : del.status === 'pending-review'
            ? 'review'
            : del.status === 'revision-requested'
            ? 'post-production'
            : 'in-production');

        const defaultDelProgress =
          mappedStatus === 'completed'
            ? 100
            : mappedStatus === 'review'
            ? 90
            : mappedStatus === 'post-production'
            ? 75
            : 55;

        const progressPercent =
          userOverride?.progressPercent !== undefined
            ? userOverride.progressPercent
            : defaultDelProgress;

        const delPhases = buildStandardPhases(
          progressPercent,
          del.dateUploaded || activeClient.contractDate,
          activeClient.deliveryDate
        );
        const activePhase =
          delPhases.find((p) => p.status === 'in-progress') || delPhases[delPhases.length - 1];

        const typeLabel =
          del.type === 'video' || del.type === 'reels'
            ? 'سینما و ریلز • Video Production'
            : del.type === 'strategy' || del.type === 'branding'
            ? 'سند استراتژی و هویت برند'
            : 'طراحی بصری و آرت‌دایرکشن';

        const deliverableProject: ProjectItem = {
          id: delKey,
          title: del.title,
          titleEn: `${del.version} • ${del.format}`,
          subtitle:
            del.clientFeedback ||
            `خروجی اختصاصی پروژه «${activeClient.brandName}» با فرمت ${del.format} (${del.fileSize}) آماده بررسی و تایید در پورتال کارفرما.`,
          category: del.type === 'strategy' || del.type === 'branding' ? 'branding' : 'cinema',
          categoryLabel: typeLabel,
          client: activeClient.brandName,
          year: del.version,
          trackCode: `SPRINT 0${idx + 1} // ${del.format}`,
          coverImage: del.thumbnail,
          galleryImages: [del.thumbnail],
          badge: del.version,
          challenge: activeClient.scopeSummary,
          solution: del.title,
          metrics: `${del.fileSize} • ${del.format}`,
          deliverables: [
            `نسخه فعلی: ${del.version}`,
            `فرمت فایل: ${del.format} (${del.fileSize})`,
            `تاریخ بارگذاری: ${del.dateUploaded}`,
          ],
          tags: [del.format, del.version],
          colorAccent: '#F59E0B',
          createdAt: del.dateUploaded,
          updatedAt: activeClient.deliveryDate,
        };

        clientRecords.push({
          id: delKey,
          project: deliverableProject,
          workspace: activeClient,
          deliverable: del,
          isMasterProject: false,
          status: mappedStatus,
          progressPercent,
          projectLead: activeClient.projectLead,
          projectLeadRole: activeClient.projectLeadRole,
          startDate: del.dateUploaded || activeClient.contractDate,
          deliveryDate: activeClient.deliveryDate,
          currentPhaseTitle: activePhase ? activePhase.title : 'تحویل نسخه',
          phases: delPhases,
          priority: idx === 0 ? 'high' : 'normal',
        });
      });

      return clientRecords;
    }

    // Fallback if no activeClient is provided
    return projects.map((proj) => {
      const matchedWorkspace = workspaces.find(
        (w) =>
          proj.title.includes(w.brandName) ||
          w.brandName.includes(proj.client) ||
          proj.id.includes(w.slug)
      );
      const userOverride = overrides[proj.id];
      const status: ProjectOSStatus = userOverride?.status || 'in-production';
      const progressPercent =
        userOverride?.progressPercent ?? matchedWorkspace?.progressPercent ?? 75;
      const startDate = matchedWorkspace?.contractDate || proj.createdAt || '۱۴۰۳/۰۷/۰۱';
      const deliveryDate = matchedWorkspace?.deliveryDate || proj.updatedAt || '۱۴۰۳/۱۲/۲۸';
      const phases = buildStandardPhases(
        progressPercent,
        startDate,
        deliveryDate,
        matchedWorkspace?.milestones
      );
      const activePhase =
        phases.find((p) => p.status === 'in-progress') || phases[phases.length - 1];

      return {
        id: proj.id,
        project: proj,
        workspace: matchedWorkspace,
        isMasterProject: true,
        status,
        progressPercent,
        projectLead: matchedWorkspace?.projectLead || proj.role || 'فریدون یوسف‌زاده / مهدی لقمانی',
        projectLeadRole: matchedWorkspace?.projectLeadRole || 'هدایت هنری و پروداکشن',
        startDate,
        deliveryDate,
        currentPhaseTitle: activePhase ? activePhase.title : 'تحویل نهایی',
        phases,
        priority: proj.featured ? 'flagship' : 'normal',
      };
    });
  }, [activeClient, projects, workspaces, overrides]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return osRecords.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        rec.project.title.toLowerCase().includes(q) ||
        rec.project.subtitle.toLowerCase().includes(q) ||
        rec.project.categoryLabel.toLowerCase().includes(q) ||
        rec.projectLead.toLowerCase().includes(q)
      );
    });
  }, [osRecords, statusFilter, searchQuery]);

  // OS Summary Metrics for this Client
  const stats = useMemo(() => {
    const total = osRecords.length;
    const activeCount = osRecords.filter(
      (r) => r.status === 'in-production' || r.status === 'post-production'
    ).length;
    const reviewCount = osRecords.filter((r) => r.status === 'review').length;
    const completedCount = osRecords.filter((r) => r.status === 'completed').length;
    const avgProgress =
      total > 0
        ? Math.round(osRecords.reduce((acc, r) => acc + r.progressPercent, 0) / total)
        : 0;

    return { total, activeCount, reviewCount, completedCount, avgProgress };
  }, [osRecords]);

  // Interactive Handlers
  const handleStatusChange = (recordId: string, projectTitle: string, nextStatus: ProjectOSStatus) => {
    const defaultProgressByStatus: Record<ProjectOSStatus, number> = {
      'in-production': 60,
      'post-production': 80,
      review: 92,
      completed: 100,
    };
    const nextProgress =
      nextStatus === 'completed'
        ? 100
        : overrides[recordId]?.progressPercent ?? defaultProgressByStatus[nextStatus];

    saveOverrides({
      ...overrides,
      [recordId]: {
        ...overrides[recordId],
        status: nextStatus,
        progressPercent: nextProgress,
      },
    });
    showToast(`وضعیت «${projectTitle}» به «${STATUS_META[nextStatus].label}» تغییر یافت.`);
  };

  const handlePhaseClick = (rec: OSProjectRecord, stepNumber: number) => {
    const progressMap: Record<number, { progress: number; status: ProjectOSStatus }> = {
      1: { progress: 35, status: 'in-production' },
      2: { progress: 65, status: 'in-production' },
      3: { progress: 85, status: 'post-production' },
      4: { progress: 100, status: 'completed' },
    };
    const target = progressMap[stepNumber] || { progress: 75, status: 'in-production' };
    saveOverrides({
      ...overrides,
      [rec.id]: {
        status: target.status,
        progressPercent: target.progress,
        completedSteps: stepNumber,
      },
    });
    showToast(
      `فاز ${stepNumber} برای «${rec.project.title}» به‌روزرسانی شد (${target.progress}% پیشرفت).`
    );
  };

  return (
    <div
      className="flex flex-col h-full bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right"
      dir="rtl"
    >
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="bg-neutral-950 text-amber-300 text-xs font-bold px-5 py-2.5 flex items-center justify-between gap-3 border-b border-amber-500/30 shrink-0 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top OS Command Header & Telemetry Strip (Scoped to Active Client) */}
      <div className="bg-white border-b border-neutral-200 px-5 py-3.5 shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>CREATIVITY JUICE PROJECT OS</span>
              <span aria-hidden="true">·</span>
              <span>
                {activeClient
                  ? `WORKSPACE: ${activeClient.slug.toUpperCase()}`
                  : 'DEDICATED CLIENT PIPELINE'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight mt-0.5">
              {activeClient
                ? `داشبورد پروژه‌ها و تایم‌لاین اجرایی «${activeClient.brandName}»`
                : 'داشبورد پروژه‌ها و تایم‌لاین پروداکشن'}
            </h2>
          </div>

          {/* Unboxed Telemetry Metrics Strip */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 text-right border-r border-neutral-200 pr-4">
            <div>
              <span className="block text-[10px] text-neutral-500">پروژه‌ها و اسپرینت‌های شما</span>
              <span className="text-base font-black text-neutral-950 font-mono tabular-nums">
                {stats.total}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500">در حال تولید و تدوین</span>
              <span className="text-base font-black text-amber-600 font-mono tabular-nums">
                {stats.activeCount}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500">منتظر تایید شما</span>
              <span className="text-base font-black text-violet-700 font-mono tabular-nums">
                {stats.reviewCount}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500">تکمیل و تایید شده</span>
              <span className="text-base font-black text-emerald-700 font-mono tabular-nums">
                {stats.completedCount}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-neutral-500">میانگین پیشرفت</span>
              <span className="text-base font-black text-neutral-950 font-mono tabular-nums">
                {stats.avgProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls, Search & View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-neutral-100">
          {/* Interactive Status Filter Segmented Controls */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200/70">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              همه ({osRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('in-production')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'in-production'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>در حال پروداکشن</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('post-production')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'post-production'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>تدوین و پست‌پروداکشن</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('review')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'review'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>بازبینی کارفرما</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'completed'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>تکمیل شده</span>
            </button>
          </div>

          {/* Search & Layout Switcher */}
          <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
            <div className="relative min-w-[180px] sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در پروژه‌های این برند..."
                className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 bg-neutral-50/70 focus:bg-white focus:border-neutral-900 text-xs text-neutral-900 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200/80">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                نمای گرید
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('timeline')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'timeline'
                    ? 'bg-white text-neutral-950 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                نمای تایم‌لاین
              </button>
            </div>

            {onOpenCalendar && (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
              >
                تقویم انتشار
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Grid Layout or Timeline Matrix */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredRecords.length === 0 ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl border border-neutral-200 text-center space-y-3">
            <h3 className="text-sm font-black text-neutral-900">
              موردی با فیلتر انتخابی یافت نشد
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              فیلتر وضعیت را روی «همه» قرار دهید تا تمام پروژه‌ها و خروجی‌های اختصاصی برند شما نمایش داده شوند.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer hover:bg-neutral-800"
            >
              نمایش همه پروژه‌های من
            </button>
          </div>
        ) : layoutMode === 'grid' ? (
          /* =========================================================
             PROJECT-MANAGEMENT OS GRID LAYOUT (CLIENT-SCOPED)
             ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredRecords.map((rec) => {
              const meta = STATUS_META[rec.status];
              const isExpanded = expandedProjectId === rec.id;
              const isApprovedDeliverable = rec.deliverable?.status === 'approved';

              return (
                <article
                  key={rec.id}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    rec.isMasterProject
                      ? 'border-amber-300/90 ring-1 ring-amber-400/20 shadow-xs'
                      : 'border-neutral-200/90 hover:border-neutral-400'
                  }`}
                >
                  <div>
                    {/* Cover Visual & Live Status Header */}
                    <div className="relative h-44 bg-neutral-900 overflow-hidden group">
                      <img
                        src={rec.project.coverImage}
                        alt={rec.project.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                      {/* Top Status & Quick Status Switcher */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-bold">
                          <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                          <span>{meta.label}</span>
                        </div>

                        <select
                          value={rec.status}
                          onChange={(e) =>
                            handleStatusChange(
                              rec.id,
                              rec.project.title,
                              e.target.value as ProjectOSStatus
                            )
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="bg-black/70 hover:bg-black/90 backdrop-blur-md text-neutral-200 text-[10px] font-bold px-2 py-1 rounded-lg border border-white/15 outline-none cursor-pointer"
                          title="به‌روزرسانی وضعیت پروژه"
                        >
                          <option value="in-production">وضعیت: در حال پروداکشن</option>
                          <option value="post-production">وضعیت: تدوین و پست‌پروداکشن</option>
                          <option value="review">وضعیت: بازبینی کارفرما</option>
                          <option value="completed">وضعیت: تکمیل و لانچ شده</option>
                        </select>
                      </div>

                      {/* Bottom Title & Category Kicker over Cover */}
                      <div className="absolute bottom-3 inset-x-3 text-white">
                        <div className="flex items-center gap-1.5 text-[10px] text-amber-300/95 font-medium mb-0.5">
                          <span>
                            {rec.isMasterProject ? '★ پرونده اصلی برند' : rec.project.categoryLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{rec.project.year}</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-black leading-snug line-clamp-1">
                          {rec.project.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body: Metadata, Lead, and Interactive Project Timeline */}
                    <div className="p-4 space-y-4">
                      {/* Client & Lead Metadata Row */}
                      <div className="space-y-1">
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {rec.project.subtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500 pt-1">
                          <span>
                            مسئول اجرایی: <strong className="text-neutral-800">{rec.projectLead}</strong>
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>
                            برند: <strong className="text-neutral-700">{rec.project.client}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Project Timeline & Phase Progress Block */}
                      <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-800 truncate max-w-[75%]">
                            فاز جاری: {rec.currentPhaseTitle}
                          </span>
                          <span className="font-mono font-black text-neutral-950 tabular-nums">
                            {rec.progressPercent}%
                          </span>
                        </div>

                        {/* Interactive 4-Segment Timeline Track */}
                        <div
                          className="grid grid-cols-4 gap-1.5"
                          title="برای تغییر فاز پروژه روی هر مرحله کلیک کنید"
                        >
                          {rec.phases.map((phase) => {
                            const isDone = phase.status === 'completed';
                            const isCurrent = phase.status === 'in-progress';
                            return (
                              <button
                                key={phase.id}
                                type="button"
                                onClick={() => handlePhaseClick(rec, phase.stepNumber)}
                                className="group/step text-right space-y-1 cursor-pointer focus:outline-none"
                              >
                                <div className="h-2 w-full rounded-sm bg-neutral-100 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      isDone
                                        ? meta.barClass
                                        : isCurrent
                                        ? 'bg-amber-400 animate-pulse'
                                        : 'bg-neutral-200 group-hover/step:bg-neutral-300'
                                    }`}
                                    style={{ width: '100%' }}
                                  />
                                </div>
                                <span
                                  className={`block text-[10px] truncate ${
                                    isCurrent
                                      ? 'font-black text-neutral-900'
                                      : isDone
                                      ? 'font-medium text-neutral-600'
                                      : 'text-neutral-400'
                                  }`}
                                >
                                  {phase.stepNumber}. {phase.title.split(' ')[0]}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Timeline Dates Row */}
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-0.5">
                          <span>شروع: {rec.startDate}</span>
                          <span>تحویل: {rec.deliveryDate}</span>
                        </div>
                      </div>

                      {/* Expandable Timeline & Deliverables Breakdown */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-neutral-200 space-y-3 animate-fade-in">
                          <div className="space-y-1.5">
                            <span className="block text-[11px] font-black text-neutral-900">
                              مراحل تایم‌لاین پروژه (کلیک جهت تغییر فاز):
                            </span>
                            <div className="space-y-1.5">
                              {rec.phases.map((ph) => {
                                const isDone = ph.status === 'completed';
                                const isCurrent = ph.status === 'in-progress';
                                return (
                                  <button
                                    key={ph.id}
                                    type="button"
                                    onClick={() => handlePhaseClick(rec, ph.stepNumber)}
                                    className={`w-full px-2.5 py-1.5 rounded-lg border text-right flex items-center justify-between text-xs transition-all cursor-pointer ${
                                      isCurrent
                                        ? 'bg-amber-50/90 border-amber-300 text-neutral-950 font-bold'
                                        : isDone
                                        ? 'bg-neutral-50 border-neutral-200 text-neutral-700'
                                        : 'bg-white border-neutral-100 text-neutral-400 hover:border-neutral-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          isDone
                                            ? 'bg-emerald-600 text-white'
                                            : isCurrent
                                            ? 'bg-amber-500 text-neutral-950'
                                            : 'bg-neutral-200 text-neutral-600'
                                        }`}
                                      >
                                        {isDone ? '✓' : ph.stepNumber}
                                      </span>
                                      <span className="truncate">{ph.title}</span>
                                    </div>
                                    <span className="text-[10px] font-mono shrink-0 mr-2">
                                      {ph.dateLabel}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {rec.project.deliverables && rec.project.deliverables.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-neutral-100">
                              <span className="block text-[11px] font-black text-neutral-900">
                                جزئیات و خروجی‌های این کارت:
                              </span>
                              <ul className="space-y-1 text-[11px] text-neutral-600 pr-3 list-disc">
                                {rec.project.deliverables.slice(0, 4).map((del, i) => (
                                  <li key={i}>{del}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Action Bar */}
                  <div className="px-4 py-3 bg-neutral-50/80 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {rec.deliverable ? (
                        <>
                          {onApproveDeliverable && (
                            <button
                              type="button"
                              disabled={isApprovedDeliverable}
                              onClick={() => {
                                onApproveDeliverable(rec.deliverable!.id, rec.deliverable!.title);
                                handleStatusChange(rec.id, rec.project.title, 'completed');
                              }}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isApprovedDeliverable
                                  ? 'bg-emerald-100 text-emerald-700 opacity-65 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {isApprovedDeliverable ? '✓ تایید شده' : '✓ تایید نسخه'}
                            </button>
                          )}
                          {onRequestRevision && (
                            <button
                              type="button"
                              onClick={() => onRequestRevision(rec.deliverable!)}
                              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              ثبت اصلاحیه
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {onSelectProject && !rec.project.id.includes('__master') && (
                            <button
                              type="button"
                              onClick={() => onSelectProject(rec.project)}
                              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              پرونده کامل پروژه
                            </button>
                          )}
                          {onSwitchTab && (
                            <button
                              type="button"
                              onClick={() => onSwitchTab('brief')}
                              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              بریف برند
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedProjectId(isExpanded ? null : rec.id)}
                      className="px-2.5 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'بستن تایم‌لاین ▲' : 'جزئیات تایم‌لاین ▼'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* =========================================================
             PROJECT TIMELINE & ROADMAP MATRIX VIEW (CLIENT-SCOPED)
             ========================================================= */
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-12 bg-neutral-100 border-b border-neutral-200 px-4 py-3 text-xs font-black text-neutral-700">
              <div className="col-span-12 lg:col-span-4">عنوان پروژه / اسپرینت اختصاصی</div>
              <div className="hidden lg:block lg:col-span-2">وضعیت و پیشرفت</div>
              <div className="col-span-12 lg:col-span-4 mt-2 lg:mt-0">
                تایم‌لاین ۴ فازه پروداکشن (کشف ← سناریو ← تولید ← لانچ)
              </div>
              <div className="hidden lg:block lg:col-span-2 text-left">زمان‌بندی و عملیات</div>
            </div>

            <div className="divide-y divide-neutral-200">
              {filteredRecords.map((rec) => {
                const meta = STATUS_META[rec.status];
                return (
                  <div
                    key={rec.id}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-4 hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* Col 1: Project Identity */}
                    <div className="col-span-12 lg:col-span-4 flex items-center gap-3">
                      <img
                        src={rec.project.coverImage}
                        alt={rec.project.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-200"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <span>{rec.project.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{rec.project.year}</span>
                        </div>
                        <h3 className="text-sm font-black text-neutral-950 truncate">
                          {rec.project.title}
                        </h3>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          مسئول: <strong className="text-neutral-800">{rec.projectLead}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Col 2: Status & Progress */}
                    <div className="col-span-6 lg:col-span-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                        <span className={meta.textClass}>{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${meta.barClass}`}
                            style={{ width: `${rec.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-neutral-800 tabular-nums">
                          {rec.progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Col 3: 4-Stage Visual Timeline */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="grid grid-cols-4 gap-2">
                        {rec.phases.map((ph) => {
                          const isDone = ph.status === 'completed';
                          const isCurrent = ph.status === 'in-progress';
                          return (
                            <button
                              key={ph.id}
                              type="button"
                              onClick={() => handlePhaseClick(rec, ph.stepNumber)}
                              className={`p-2 rounded-xl border text-right transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-50 border-amber-400 text-neutral-950 font-bold'
                                  : isDone
                                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                  : 'bg-neutral-50 border-neutral-200/70 text-neutral-400 hover:border-neutral-300'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                                <span>0{ph.stepNumber}</span>
                                <span>{isDone ? '✓' : isCurrent ? '●' : '○'}</span>
                              </div>
                              <div className="text-[10px] truncate">{ph.title}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Col 4: Dates & Actions */}
                    <div className="col-span-6 lg:col-span-2 flex flex-col items-end justify-center gap-1.5 text-left">
                      <span className="text-[11px] font-mono text-neutral-500">
                        تحویل: {rec.deliveryDate}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {rec.deliverable && onApproveDeliverable ? (
                          <button
                            type="button"
                            onClick={() =>
                              onApproveDeliverable(rec.deliverable!.id, rec.deliverable!.title)
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            ✓ تایید نسخه
                          </button>
                        ) : (
                          onSelectProject &&
                          !rec.project.id.includes('__master') && (
                            <button
                              type="button"
                              onClick={() => onSelectProject(rec.project)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold cursor-pointer"
                            >
                              پرونده
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
