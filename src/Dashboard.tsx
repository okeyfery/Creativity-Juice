import React, { useState, useEffect, useMemo } from 'react';
import {
  getProjects,
  getTeamMembers,
  ProjectItem,
  TeamMemberItem,
  CJ_STUDIO_DATA_EVENT,
} from './adminStore';
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
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  dateLabel: string;
}

export interface ProjectRepositoryFile {
  id: string;
  name: string;
  fileNameCode: string;
  category: 'video' | 'document' | 'design' | 'audio';
  format: string;
  size: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'approved' | 'pending-review' | 'revision-requested' | 'master-archive';
  notes?: string;
  deliverableRef?: ClientDeliverable;
  previewUrl?: string;
}

export interface AssignedTeamMember {
  member: TeamMemberItem;
  projectSpecificRole: string;
  responsibility: string;
  isLead?: boolean;
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
  extraMemberIds?: string[];
  customFiles?: ProjectRepositoryFile[];
}

const STORAGE_KEY_OS_OVERRIDES = 'cj_os_project_status_overrides_v2';

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
      description: m.description,
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
      description: 'تحلیل بازار هدف، تدوین بریف استراتژیک، تعیین لحن برند و معماری پیام‌های کلیدی.',
      date: startDate,
      done: step1Done,
    },
    {
      title: 'معماری هویت و سناریونویسی',
      titleEn: '02 / PRE-PRODUCTION',
      description: 'نگارش سناریوهای قلاب‌دار، طراحی استوری‌بورد، دکوپاژ بصری و انتخاب لوکیشن و تجهیزات.',
      date: 'فاز دوم',
      done: step2Done,
    },
    {
      title: 'پروداکشن و کارگردانی هنری',
      titleEn: '03 / PRODUCTION',
      description: 'فیلم‌برداری سینمایی 4K، نورپردازی اختصاصی صحنه، ضبط نریشن و اجرای طراحی‌های گرافیکی.',
      date: 'فاز سوم',
      done: step3Done,
    },
    {
      title: 'پست‌پروداکشن، تدوین و لانچ',
      titleEn: '04 / LAUNCH',
      description: 'تدوین ریتمیک، اصلاح رنگ سینمایی (Color Grading)، مسترینگ صدا و تحویل نهایی در پورتال.',
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
      description: item.description,
      status,
      dateLabel: item.date,
    };
  });
}

function resolveAssignedTeam(
  rec: OSProjectRecord,
  allMembers: TeamMemberItem[],
  extraMemberIds: string[] = []
): AssignedTeamMember[] {
  const assigned: AssignedTeamMember[] = [];
  const usedIds = new Set<string>();

  const addMember = (
    member: TeamMemberItem | undefined,
    role: string,
    responsibility: string,
    isLead = false
  ) => {
    if (!member || usedIds.has(member.id)) return;
    usedIds.add(member.id);
    assigned.push({
      member,
      projectSpecificRole: role,
      responsibility,
      isLead,
    });
  };

  const fereydoun = allMembers.find((m) => m.id === 'fereydoun-yousefzadeh');
  const mehdi = allMembers.find((m) => m.id === 'mehdi-loghmani');
  const esmaeil = allMembers.find((m) => m.id === 'esmaeil-samanipour');
  const mohammad = allMembers.find((m) => m.id === 'mohammad-mehdipour');
  const harry = allMembers.find((m) => m.id === 'harry');
  const alireza = allMembers.find((m) => m.id === 'alireza-shiehzadeh');

  // Check if any member has an explicit projectRole matching this project
  allMembers.forEach((m) => {
    const matchedRole = m.projectRoles?.find(
      (pr) =>
        pr.projectId === rec.project.id ||
        rec.project.title.includes(pr.client || '')
    );
    if (matchedRole) {
      addMember(
        m,
        matchedRole.roleInProject,
        matchedRole.keyDeliverables?.join(' • ') || m.role,
        assigned.length === 0
      );
    }
  });

  // Ensure core team members based on lead / category
  if (rec.projectLead.includes('فریدون')) {
    addMember(
      fereydoun,
      'کارگردان هنری ارشد و تدوینگر ادیتوریال',
      'هدایت بصری پروژه، تدوین مستر، اصلاح رنگ سینمایی و نظارت کیفی خروجی‌ها',
      assigned.length === 0
    );
  }
  if (rec.projectLead.includes('مهدی')) {
    addMember(
      mehdi,
      'مدیر پروژه، استراتژیست برند و مهندس صدا',
      'مدیریت تایم‌لاین اجرایی، تدوین استراتژی محتوا، هماهنگی جلسات و سونیک برندینگ',
      assigned.length === 0
    );
  }
  if (rec.projectLead.includes('اسماعیل')) {
    addMember(
      esmaeil,
      'کارگردان و مدیر تصویربرداری سینمایی',
      'دکوپاژ صحنه، نورپردازی تخصصی و تصویربرداری با تجهیزات سینمایی 4K',
      assigned.length === 0
    );
  }

  // Guarantee at least 3 key specialists for every project card
  addMember(
    fereydoun,
    'مدیر هنری و سرپرست تدوین (Art Director)',
    'نظارت بر یکپارچگی هویت بصری، ریتم تدوین و استانداردهای سینمایی استودیو',
    assigned.length === 0
  );
  addMember(
    mehdi,
    'مدیر پروژه و استراتژیست کسب‌وکار',
    'برنامه‌ریزی فازهای اجرایی، کنترل ددلاین‌ها و هم‌راستاسازی خروجی با اهداف تجاری کارفرما'
  );

  if (rec.project.category === 'cinema' || rec.deliverable?.type === 'video' || rec.deliverable?.type === 'reels') {
    addMember(
      esmaeil,
      'مدیر تصویربرداری و کارگردان صحنه',
      'ضبط نماهای حرکتی، نورپردازی لوکیشن و صدابرداری سر صحنه'
    );
    addMember(
      mohammad,
      'کارگردان تیزر و طراح هوک‌های بصری',
      'اجرای قاب‌های ریتمیک و کارگردانی ویدیوهای کوتاه با نرخ تعامل بالا'
    );
  } else {
    addMember(
      alireza,
      'طراح ارشد گرافیک، UI/UX و هویت بصری',
      'طراحی کتابچه هویت بصری، سیستم تایپوگرافی، کاورها و قالب‌های سوشال مدیا'
    );
    addMember(
      harry,
      'مهندس پورتال دیجیتال و زیرساخت وب',
      'پیاده‌سازی پورتال تعاملی، لندینگ‌پیج اختصاصی و بهینه‌سازی دارایی‌های دیجیتال'
    );
  }

  // Add any extra members manually assigned by user in the modal
  extraMemberIds.forEach((id) => {
    const found = allMembers.find((m) => m.id === id);
    if (found) {
      addMember(found, found.role, found.specialties.slice(0, 2).join(' • '));
    }
  });

  return assigned;
}

function buildRepositoryFiles(
  rec: OSProjectRecord,
  customFiles: ProjectRepositoryFile[] = []
): ProjectRepositoryFile[] {
  const files: ProjectRepositoryFile[] = [...customFiles];

  // If this card represents a specific Deliverable, put that deliverable first as the primary file
  if (rec.deliverable) {
    const d = rec.deliverable;
    files.push({
      id: `repo-del-${d.id}`,
      name: d.title,
      fileNameCode: `/deliverables/${d.id}_${d.version.replace(/\s+/g, '_')}.${d.format.split(' ')[0].toLowerCase()}`,
      category:
        d.type === 'video' || d.type === 'reels'
          ? 'video'
          : d.type === 'audio'
          ? 'audio'
          : d.type === 'branding'
          ? 'design'
          : 'document',
      format: d.format,
      size: d.fileSize,
      version: d.version,
      uploadedAt: d.dateUploaded,
      uploadedBy: rec.projectLead.split('/')[0].trim(),
      status: d.status,
      notes: d.clientFeedback,
      deliverableRef: d,
      previewUrl: d.thumbnail,
    });
  } else if (rec.workspace && rec.workspace.deliverables.length > 0) {
    // Master project card: include all client deliverables in the repository
    rec.workspace.deliverables.forEach((d) => {
      files.push({
        id: `repo-ws-del-${d.id}`,
        name: d.title,
        fileNameCode: `/deliverables/${d.id}_${d.version.replace(/\s+/g, '_')}.${d.format.split(' ')[0].toLowerCase()}`,
        category:
          d.type === 'video' || d.type === 'reels'
            ? 'video'
            : d.type === 'audio'
            ? 'audio'
            : d.type === 'branding'
            ? 'design'
            : 'document',
        format: d.format,
        size: d.fileSize,
        version: d.version,
        uploadedAt: d.dateUploaded,
        uploadedBy: rec.projectLead.split('/')[0].trim(),
        status: d.status,
        notes: d.clientFeedback,
        deliverableRef: d,
        previewUrl: d.thumbnail,
      });
    });
  }

  // Add granular studio production & source repository files for this project
  const slug = rec.workspace?.slug || rec.project.id.slice(0, 14);
  files.push(
    {
      id: `repo-brief-${rec.id}`,
      name: `سند استراتژی، دکوپاژ و بریف جامع «${rec.project.title}»`,
      fileNameCode: `/strategy/${slug}_Master_Strategy_Dossier_v2.pdf`,
      category: 'document',
      format: 'PDF Document',
      size: '18.4 MB',
      version: 'v2.0 Final',
      uploadedAt: rec.startDate,
      uploadedBy: 'مهدی لقمانی',
      status: 'approved',
      notes: 'نسخه مصوب جلسه استراتژی و نقشه راه تولید محتوا.',
    },
    {
      id: `repo-lut-${rec.id}`,
      name: `پروفایل اصلاح رنگ سینمایی و هویت بصری (Color LUTs & Styleguide)`,
      fileNameCode: `/assets/${slug}_Cinema_Grade_Package.zip`,
      category: 'design',
      format: 'ZIP / CUBE / AI',
      size: '142.0 MB',
      version: 'v1.4 Master',
      uploadedAt: rec.startDate,
      uploadedBy: 'فریدون یوسف‌زاده',
      status: 'master-archive',
      notes: 'شامل پالت رنگی اختصاصی برند، فونت‌ها و جدول رنگ ویدئوها.',
    },
    {
      id: `repo-audio-${rec.id}`,
      name: `پکیج مسترینگ صدا، نریشن و هویت شنیداری (Sonic Branding)`,
      fileNameCode: `/audio/${slug}_Sonic_Master_24bit.wav`,
      category: 'audio',
      format: 'WAV 48kHz',
      size: '64.5 MB',
      version: 'v1.2 Studio',
      uploadedAt: rec.deliveryDate,
      uploadedBy: 'مهدی لقمانی',
      status: 'approved',
      notes: 'مسترینگ استاندارد برای پلتفرم‌های اینستاگرام، یوتیوب و تیزر.',
    }
  );

  return files;
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
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(() => getTeamMembers());
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

  // Expandable Project Detail Modal State
  const [selectedModalRecordId, setSelectedModalRecordId] = useState<string | null>(null);
  const [isModalMaximized, setIsModalMaximized] = useState<boolean>(false);
  const [modalActiveTab, setModalActiveTab] = useState<'overview' | 'team' | 'files'>('overview');
  const [fileCategoryFilter, setFileCategoryFilter] = useState<'all' | 'video' | 'document' | 'design' | 'audio'>('all');
  const [fileSearchQuery, setFileSearchQuery] = useState('');

  // New File Upload / Registration inside Modal Repository
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileFormat, setNewFileFormat] = useState('MP4 4K');
  const [newFileVersion, setNewFileVersion] = useState('v1.0 Final');
  const [newFileCategory, setNewFileCategory] = useState<'video' | 'document' | 'design' | 'audio'>('video');

  useEffect(() => {
    const syncData = () => {
      setProjects(getProjects());
      setTeamMembers(getTeamMembers());
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

  // Currently selected record for the Expandable Modal View
  const selectedModalRecord = useMemo(() => {
    if (!selectedModalRecordId) return null;
    return osRecords.find((r) => r.id === selectedModalRecordId) || null;
  }, [selectedModalRecordId, osRecords]);

  // Assigned Team Members for the Modal
  const modalAssignedTeam = useMemo(() => {
    if (!selectedModalRecord) return [];
    const extraIds = overrides[selectedModalRecord.id]?.extraMemberIds || [];
    return resolveAssignedTeam(selectedModalRecord, teamMembers, extraIds);
  }, [selectedModalRecord, teamMembers, overrides]);

  // File Repository List for the Modal
  const modalRepositoryFiles = useMemo(() => {
    if (!selectedModalRecord) return [];
    const customFiles = overrides[selectedModalRecord.id]?.customFiles || [];
    const allFiles = buildRepositoryFiles(selectedModalRecord, customFiles);
    return allFiles.filter((f) => {
      if (fileCategoryFilter !== 'all' && f.category !== fileCategoryFilter) return false;
      if (!fileSearchQuery.trim()) return true;
      const q = fileSearchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        f.fileNameCode.toLowerCase().includes(q) ||
        f.format.toLowerCase().includes(q) ||
        f.uploadedBy.toLowerCase().includes(q)
      );
    });
  }, [selectedModalRecord, overrides, fileCategoryFilter, fileSearchQuery]);

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
        ...overrides[rec.id],
        status: target.status,
        progressPercent: target.progress,
        completedSteps: stepNumber,
      },
    });
    showToast(
      `فاز ${stepNumber} برای «${rec.project.title}» به‌روزرسانی شد (${target.progress}% پیشرفت).`
    );
  };

  const handleToggleExtraTeamMember = (recordId: string, memberId: string, memberName: string) => {
    const currentExtra = overrides[recordId]?.extraMemberIds || [];
    const exists = currentExtra.includes(memberId);
    const nextExtra = exists
      ? currentExtra.filter((id) => id !== memberId)
      : [...currentExtra, memberId];

    saveOverrides({
      ...overrides,
      [recordId]: {
        ...overrides[recordId],
        extraMemberIds: nextExtra,
      },
    });
    showToast(
      exists
        ? `عضویت «${memberName}» از تیم این پروژه برداشته شد.`
        : `«${memberName}» به تیم اجرایی این پروژه اضافه شد.`
    );
  };

  const handleAddRepositoryFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModalRecord || !newFileName.trim()) return;

    const ext = newFileFormat.split(' ')[0].toLowerCase();
    const newFile: ProjectRepositoryFile = {
      id: `custom-file-${Date.now()}`,
      name: newFileName.trim(),
      fileNameCode: `/uploads/${newFileName.trim().replace(/\s+/g, '_')}_${newFileVersion.replace(/\s+/g, '')}.${ext}`,
      category: newFileCategory,
      format: newFileFormat,
      size: '42.8 MB',
      version: newFileVersion || 'v1.0',
      uploadedAt: new Intl.DateTimeFormat('fa-IR').format(new Date()),
      uploadedBy: activeClient?.ownerName || 'مدیریت پروژه',
      status: 'pending-review',
      notes: 'بارگذاری شده در مخزن اختصاصی پروژه جهت بررسی.',
    };

    const currentFiles = overrides[selectedModalRecord.id]?.customFiles || [];
    saveOverrides({
      ...overrides,
      [selectedModalRecord.id]: {
        ...overrides[selectedModalRecord.id],
        customFiles: [newFile, ...currentFiles],
      },
    });

    setNewFileName('');
    setIsAddFileOpen(false);
    showToast(`فایل «${newFile.name}» با موفقیت به مخزن پروژه اضافه شد.`);
  };

  const openProjectModal = (
    rec: OSProjectRecord,
    initialTab: 'overview' | 'team' | 'files' = 'overview'
  ) => {
    setSelectedModalRecordId(rec.id);
    setModalActiveTab(initialTab);
    setFileCategoryFilter('all');
    setFileSearchQuery('');
    setIsAddFileOpen(false);
  };

  return (
    <div
      className="flex flex-col h-full bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right relative"
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
              const cardTeamPreview = resolveAssignedTeam(
                rec,
                teamMembers,
                overrides[rec.id]?.extraMemberIds || []
              );
              const cardFilesCount = buildRepositoryFiles(
                rec,
                overrides[rec.id]?.customFiles || []
              ).length;

              return (
                <article
                  key={rec.id}
                  onClick={() => openProjectModal(rec, 'overview')}
                  className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer group/card ${
                    rec.isMasterProject
                      ? 'border-amber-300/90 ring-1 ring-amber-400/20 shadow-xs hover:border-amber-500'
                      : 'border-neutral-200/90 hover:border-neutral-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Cover Visual & Live Status Header */}
                    <div className="relative h-44 bg-neutral-900 overflow-hidden group">
                      <img
                        src={rec.project.coverImage}
                        alt={rec.project.title}
                        className="w-full h-full object-cover opacity-90 group-hover/card:scale-105 transition-transform duration-500"
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
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(
                              rec.id,
                              rec.project.title,
                              e.target.value as ProjectOSStatus
                            );
                          }}
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
                        <h3 className="text-sm sm:text-base font-black leading-snug line-clamp-1 group-hover/card:text-amber-300 transition-colors">
                          {rec.project.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body: Metadata, Assigned Team Avatars, and Interactive Project Timeline */}
                    <div className="p-4 space-y-4">
                      {/* Client & Lead Metadata Row */}
                      <div className="space-y-2">
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {rec.project.subtitle}
                        </p>

                        {/* Assigned Team Avatar Stack + File Repo Count */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                              {cardTeamPreview.slice(0, 4).map((item) => (
                                <img
                                  key={item.member.id}
                                  src={item.member.photo}
                                  alt={item.member.name}
                                  title={`${item.member.name} — ${item.projectSpecificRole}`}
                                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-neutral-500">
                              {cardTeamPreview.length} عضو تیم
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-neutral-500 tabular-nums">
                            {cardFilesCount} فایل در مخزن
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
                          onClick={(e) => e.stopPropagation()}
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

                      {/* Expandable Inline Timeline Preview */}
                      {isExpanded && (
                        <div
                          className="pt-3 border-t border-neutral-200 space-y-3 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Action Bar */}
                  <div
                    className="px-4 py-3 bg-neutral-50/80 border-t border-neutral-200/80 flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openProjectModal(rec, 'overview')}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        باز کردن جزئیات و مخزن فایل
                      </button>

                      {rec.deliverable && onApproveDeliverable && !isApprovedDeliverable && (
                        <button
                          type="button"
                          onClick={() => {
                            onApproveDeliverable(rec.deliverable!.id, rec.deliverable!.title);
                            handleStatusChange(rec.id, rec.project.title, 'completed');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          ✓ تایید
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedProjectId(isExpanded ? null : rec.id)}
                      className="px-2 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'بستن ▲' : 'فازها ▼'}
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
                    onClick={() => openProjectModal(rec, 'overview')}
                    className="grid grid-cols-12 items-center gap-4 px-4 py-4 hover:bg-neutral-50/80 transition-colors cursor-pointer"
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
                    <div
                      className="col-span-12 lg:col-span-4"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                    <div
                      className="col-span-6 lg:col-span-2 flex flex-col items-end justify-center gap-1.5 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] font-mono text-neutral-500">
                        تحویل: {rec.deliveryDate}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openProjectModal(rec, 'overview')}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold cursor-pointer"
                        >
                          پرونده و فایل‌ها
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          EXPANDABLE PROJECT DETAIL MODAL VIEW
          (Granular Details + Assigned Team Members + Detailed File Repository)
          ===================================================================== */}
      {selectedModalRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in"
          onClick={() => setSelectedModalRecordId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`bg-[#FAF8F5] border border-neutral-300 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isModalMaximized
                ? 'w-full h-full rounded-none'
                : 'w-full max-w-5xl h-[88vh] rounded-3xl'
            }`}
          >
            {/* Modal Top OS Window Header */}
            <div className="bg-neutral-950 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-neutral-800">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedModalRecord.project.coverImage}
                  alt={selectedModalRecord.project.title}
                  className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400">
                    <span>{selectedModalRecord.project.trackCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedModalRecord.project.year}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {selectedModalRecord.project.title}
                  </h3>
                </div>
              </div>

              {/* Header Status Control + Expand/Collapse Toggle + Close */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedModalRecord.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedModalRecord.id,
                      selectedModalRecord.project.title,
                      e.target.value as ProjectOSStatus
                    )
                  }
                  className="bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-neutral-700 outline-none cursor-pointer"
                >
                  <option value="in-production">وضعیت: در حال پروداکشن</option>
                  <option value="post-production">وضعیت: تدوین و پست‌پروداکشن</option>
                  <option value="review">وضعیت: بازبینی کارفرما</option>
                  <option value="completed">وضعیت: تکمیل و لانچ شده</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsModalMaximized(!isModalMaximized)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title={isModalMaximized ? 'بازگشت به اندازه استاندارد' : 'بزرگ‌نمایی تمام‌صفحه'}
                >
                  <span>{isModalMaximized ? '⤡' : '⤢'}</span>
                  <span className="hidden sm:inline">
                    {isModalMaximized ? 'اندازه استاندارد' : 'بزرگ‌نمایی کامل'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModalRecordId(null)}
                  className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-rose-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                  title="بستن پنجره"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Sub-Header: Quick Telemetry & Section Navigation Tabs */}
            <div className="bg-white border-b border-neutral-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
              {/* Section Switcher Tabs */}
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl border border-neutral-200/80">
                <button
                  type="button"
                  onClick={() => setModalActiveTab('overview')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modalActiveTab === 'overview'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  ۱. جزئیات عمیق و تایم‌لاین پروژه
                </button>
                <button
                  type="button"
                  onClick={() => setModalActiveTab('team')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalActiveTab === 'team'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <span>۲. تیم اجرایی تخصیص‌یافته</span>
                  <span className="font-mono text-[11px] opacity-80">
                    ({modalAssignedTeam.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalActiveTab('files')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    modalActiveTab === 'files'
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950'
                  }`}
                >
                  <span>۳. مخزن فایل‌ها (File Repository)</span>
                  <span className="font-mono text-[11px] opacity-80">
                    ({buildRepositoryFiles(selectedModalRecord, overrides[selectedModalRecord.id]?.customFiles || []).length})
                  </span>
                </button>
              </div>

              {/* Key Telemetry Metrics */}
              <div className="flex items-center gap-5 text-xs">
                <div>
                  <span className="text-neutral-400 ml-1.5">پیشرفت کل:</span>
                  <strong className="font-mono font-black text-neutral-950 tabular-nums">
                    {selectedModalRecord.progressPercent}%
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 ml-1.5">شروع:</span>
                  <strong className="font-mono text-neutral-800">
                    {selectedModalRecord.startDate}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 ml-1.5">تحویل نهایی:</span>
                  <strong className="font-mono text-neutral-800">
                    {selectedModalRecord.deliveryDate}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {modalActiveTab === 'overview' && (
                /* =========================================================
                   TAB 1: GRANULAR PROJECT DETAILS, TIMELINE & QUICK PREVIEWS
                   ========================================================= */
                <div className="space-y-6">
                  {/* Top Split: Cover + Strategic Challenge & Creative Solution */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-5 bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 relative min-h-[220px] flex flex-col justify-end p-4 text-white">
                      <img
                        src={selectedModalRecord.project.coverImage}
                        alt={selectedModalRecord.project.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      <div className="relative z-10 space-y-1.5">
                        <span className="text-[11px] font-mono text-amber-300 block">
                          {selectedModalRecord.project.categoryLabel}
                        </span>
                        <h4 className="text-base font-black leading-snug">
                          {selectedModalRecord.project.title}
                        </h4>
                        <p className="text-xs text-neutral-300">
                          کارفرما: {selectedModalRecord.project.client} • مدیر مسئول: {selectedModalRecord.projectLead}
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-amber-700 block mb-1">
                            01 // CHALLENGE & STRATEGIC OBJECTIVE
                          </span>
                          <h4 className="text-sm font-black text-neutral-950 mb-1">
                            مسئله محوری و هدف استراتژیک پروژه
                          </h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {selectedModalRecord.project.challenge || selectedModalRecord.project.subtitle}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-neutral-100">
                          <span className="text-[11px] font-mono font-bold text-emerald-700 block mb-1">
                            02 // CREATIVE DIRECTION & EXECUTION
                          </span>
                          <h4 className="text-sm font-black text-neutral-950 mb-1">
                            راه‌حل خلاقانه و معماری اجرایی استودیو
                          </h4>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            {selectedModalRecord.project.solution || selectedModalRecord.project.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-neutral-500">
                          شاخص کلیدی: <strong className="text-neutral-900">{selectedModalRecord.project.metrics}</strong>
                        </span>
                        {onSelectProject && !selectedModalRecord.project.id.includes('__master') && !selectedModalRecord.deliverable && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetProj = selectedModalRecord.project;
                              setSelectedModalRecordId(null);
                              onSelectProject(targetProj);
                            }}
                            className="text-amber-700 hover:text-amber-900 font-bold cursor-pointer"
                          >
                            مشاهده گالری کامل پروژه ⟵
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Granular 4-Stage Interactive Project Timeline */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-neutral-950">
                          تایم‌لاین اجرایی ۴ مرحله‌ای پروژه (Interactive Production Pipeline)
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          با کلیک روی هر فاز، وضعیت پیشرفت پروژه در سیستم به‌روزرسانی می‌شود.
                        </p>
                      </div>
                      <span className="text-xs font-mono font-black text-neutral-900 tabular-nums">
                        پیشرفت فعلی: {selectedModalRecord.progressPercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {selectedModalRecord.phases.map((ph) => {
                        const isDone = ph.status === 'completed';
                        const isCurrent = ph.status === 'in-progress';
                        return (
                          <button
                            key={ph.id}
                            type="button"
                            onClick={() => handlePhaseClick(selectedModalRecord, ph.stepNumber)}
                            className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-400/30'
                                : isDone
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-neutral-50 border-neutral-200/80 hover:border-neutral-300'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold text-neutral-500">
                                  {ph.titleEn}
                                </span>
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isDone
                                      ? 'bg-emerald-600 text-white'
                                      : isCurrent
                                      ? 'bg-amber-500 text-neutral-950'
                                      : 'bg-neutral-200 text-neutral-600'
                                  }`}
                                >
                                  {isDone ? '✓' : ph.stepNumber}
                                </span>
                              </div>
                              <h5 className="text-xs font-black text-neutral-950">
                                {ph.title}
                              </h5>
                              <p className="text-[11px] text-neutral-600 leading-relaxed">
                                {ph.description}
                              </p>
                            </div>

                            <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                              <span>{ph.dateLabel}</span>
                              <span className="font-sans font-bold">
                                {isDone ? 'تکمیل شد' : isCurrent ? 'در حال اجرا' : 'در نوبت'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Summary of Assigned Team & File Repository inside Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Assigned Team Preview Box */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-neutral-950">
                          اعضای تیم اجرایی این پروژه ({modalAssignedTeam.length} نفر)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setModalActiveTab('team')}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                        >
                          مدیریت و جزئیات تیم ⟵
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {modalAssignedTeam.slice(0, 3).map((item) => (
                          <div
                            key={item.member.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.member.photo}
                                alt={item.member.name}
                                className="w-9 h-9 rounded-xl object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-black text-neutral-900 truncate">
                                  {item.member.name}
                                </h5>
                                <p className="text-[11px] text-neutral-500 truncate">
                                  {item.projectSpecificRole}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                              {item.member.initials}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* File Repository Quick Box */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-neutral-950">
                          مخزن فایل‌ها و خروجی‌های پروژه ({modalRepositoryFiles.length} فایل)
                        </h4>
                        <button
                          type="button"
                          onClick={() => setModalActiveTab('files')}
                          className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                        >
                          باز کردن مخزن کامل فایل‌ها ⟵
                        </button>
                      </div>
                      <div className="space-y-2.5">
                        {modalRepositoryFiles.slice(0, 3).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70"
                          >
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-neutral-900 truncate">
                                {file.name}
                              </h5>
                              <p className="text-[10px] font-mono text-neutral-500 truncate" dir="ltr">
                                {file.format} • {file.size} • {file.version}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                showToast(`فایل «${file.name}» (${file.version}) آماده دریافت است.`)
                              }
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold shrink-0 cursor-pointer"
                            >
                              دریافت
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalActiveTab === 'team' && (
                /* =========================================================
                   TAB 2: TEAM MEMBERS ASSIGNED TO THIS PROJECT
                   ========================================================= */
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-neutral-950">
                        تیم اجرایی و متخصصین تخصیص‌یافته به «{selectedModalRecord.project.title}»
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        اعضای کلیدی استودیو که مسئولیت مستقیم کارگردانی، استراتژی، تدوین و اجرای این پروژه را بر عهده دارند.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-700 tabular-nums">
                      {modalAssignedTeam.length} متخصص فعال روی پروژه
                    </span>
                  </div>

                  {/* Assigned Team Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modalAssignedTeam.map((item) => (
                      <div
                        key={item.member.id}
                        className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={item.member.photo}
                            alt={item.member.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-neutral-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono text-amber-700 font-bold">
                                {item.member.trackCode}
                              </span>
                              {item.isLead && (
                                <span className="text-[10px] font-bold text-neutral-950 bg-amber-300/80 px-2 py-0.5 rounded-md">
                                  سرپرست پروژه
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-black text-neutral-950 mt-0.5">
                              {item.member.name}
                            </h5>
                            <p className="text-xs font-bold text-neutral-700 mt-0.5">
                              نقش در پروژه: {item.projectSpecificRole}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs">
                          <p className="text-neutral-600 leading-relaxed">
                            <strong className="text-neutral-900">شرح مسئولیت در این پرونده: </strong>
                            {item.responsibility}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-neutral-500">
                            <span>تخصص‌ها:</span>
                            {item.member.specialties.slice(0, 3).map((sp, i) => (
                              <span key={i} className="text-neutral-700">
                                {sp}
                                {i < 2 ? ' · ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assign / Toggle Additional Studio Members */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
                    <h5 className="text-xs font-black text-neutral-900">
                      تخصیص یا تغییر اعضای کمکی استودیو برای این پروژه:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => {
                        const isAssigned = modalAssignedTeam.some((a) => a.member.id === member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() =>
                              handleToggleExtraTeamMember(
                                selectedModalRecord.id,
                                member.id,
                                member.name
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              isAssigned
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span>{member.name}</span>
                            <span>{isAssigned ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {modalActiveTab === 'files' && (
                /* =========================================================
                   TAB 3: DETAILED FILE REPOSITORY LIST
                   ========================================================= */
                <div className="space-y-4">
                  {/* Repository Toolbar: Category Filter + Search + Add New File */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200/70">
                      <button
                        type="button"
                        onClick={() => setFileCategoryFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          fileCategoryFilter === 'all'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        همه فایل‌ها
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileCategoryFilter('video')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          fileCategoryFilter === 'video'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        ویدیو و مستر 4K
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileCategoryFilter('document')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          fileCategoryFilter === 'document'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        اسناد و سناریو
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileCategoryFilter('design')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          fileCategoryFilter === 'design'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        هویت بصری و سورس
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileCategoryFilter('audio')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                          fileCategoryFilter === 'audio'
                            ? 'bg-neutral-900 text-white'
                            : 'text-neutral-600 hover:text-neutral-950'
                        }`}
                      >
                        صدا و موسیقی
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={fileSearchQuery}
                        onChange={(e) => setFileSearchQuery(e.target.value)}
                        placeholder="جستجوی نام فایل یا فرمت..."
                        className="px-3 py-1.5 rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white text-xs text-neutral-900 outline-none w-48"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddFileOpen(!isAddFileOpen)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-colors cursor-pointer"
                      >
                        + ثبت فایل جدید در مخزن
                      </button>
                    </div>
                  </div>

                  {/* Inline Add File Form */}
                  {isAddFileOpen && (
                    <form
                      onSubmit={handleAddRepositoryFile}
                      className="bg-amber-50/70 rounded-2xl border border-amber-300 p-4 space-y-3 animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-neutral-950">
                          افزودن فایل یا دارایی جدید به مخزن این پروژه
                        </h5>
                        <button
                          type="button"
                          onClick={() => setIsAddFileOpen(false)}
                          className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
                        >
                          انصراف ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                          type="text"
                          required
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          placeholder="عنوان فایل (مثال: راش‌های روز اول فیلم‌برداری)"
                          className="sm:col-span-2 px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 outline-none"
                        />
                        <select
                          value={newFileCategory}
                          onChange={(e) => {
                            const cat = e.target.value as any;
                            setNewFileCategory(cat);
                            if (cat === 'video') setNewFileFormat('MP4 4K');
                            if (cat === 'document') setNewFileFormat('PDF Document');
                            if (cat === 'design') setNewFileFormat('ZIP / AI');
                            if (cat === 'audio') setNewFileFormat('WAV 24bit');
                          }}
                          className="px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-800 outline-none"
                        >
                          <option value="video">دسته: ویدیو و رندر</option>
                          <option value="document">دسته: سند و سناریو</option>
                          <option value="design">دسته: طراحی و سورس</option>
                          <option value="audio">دسته: صدا و موسیقی</option>
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newFileVersion}
                            onChange={(e) => setNewFileVersion(e.target.value)}
                            placeholder="نسخه (v1.0)"
                            className="w-24 px-2.5 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-mono text-neutral-900 outline-none"
                            dir="ltr"
                          />
                          <button
                            type="submit"
                            className="flex-1 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
                          >
                            ثبت فایل
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Detailed File Repository Table */}
                  <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-neutral-100 border-b border-neutral-200 px-4 py-3 text-[11px] font-black text-neutral-700">
                      <div className="col-span-12 lg:col-span-5">نام فایل و مسیر مخزن (Repository Path)</div>
                      <div className="hidden lg:block lg:col-span-2">فرمت، حجم و نسخه</div>
                      <div className="hidden lg:block lg:col-span-2">وضعیت و بارگذاری‌کننده</div>
                      <div className="col-span-12 lg:col-span-3 text-left mt-2 lg:mt-0">
                        عملیات و تاییدیه کارفرما
                      </div>
                    </div>

                    <div className="divide-y divide-neutral-200">
                      {modalRepositoryFiles.map((file) => {
                        const isApproved = file.status === 'approved';
                        const isPending = file.status === 'pending-review';
                        const isRevision = file.status === 'revision-requested';

                        return (
                          <div
                            key={file.id}
                            className="grid grid-cols-12 items-center gap-3 px-4 py-3.5 hover:bg-neutral-50/90 transition-colors"
                          >
                            {/* File Name & Path */}
                            <div className="col-span-12 lg:col-span-5 flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 font-mono text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                                {file.format.split(' ')[0].slice(0, 4)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs sm:text-sm font-black text-neutral-950 truncate">
                                  {file.name}
                                </h5>
                                <p
                                  className="text-[11px] font-mono text-neutral-400 truncate mt-0.5"
                                  dir="ltr"
                                >
                                  {file.fileNameCode}
                                </p>
                                {file.notes && (
                                  <p className="text-[11px] text-neutral-600 mt-1 line-clamp-1">
                                    یادداشت: {file.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Format, Size & Version */}
                            <div className="col-span-6 lg:col-span-2 text-xs font-mono space-y-0.5">
                              <div className="font-bold text-neutral-900 tabular-nums">
                                {file.version} • {file.size}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {file.format}
                              </div>
                            </div>

                            {/* Status & Uploader */}
                            <div className="col-span-6 lg:col-span-2 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isApproved
                                      ? 'bg-emerald-500'
                                      : isPending
                                      ? 'bg-amber-500 animate-pulse'
                                      : isRevision
                                      ? 'bg-rose-500'
                                      : 'bg-sky-500'
                                  }`}
                                />
                                <span
                                  className={
                                    isApproved
                                      ? 'text-emerald-800'
                                      : isPending
                                      ? 'text-amber-800'
                                      : isRevision
                                      ? 'text-rose-800'
                                      : 'text-sky-800'
                                  }
                                >
                                  {isApproved
                                    ? 'تایید نهایی شده'
                                    : isPending
                                    ? 'منتظر بررسی کارفرما'
                                    : isRevision
                                    ? 'نیاز به اصلاحیه'
                                    : 'آرشیو مستر استودیو'}
                                </span>
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                توسط {file.uploadedBy} • <span className="font-mono">{file.uploadedAt}</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-12 lg:col-span-3 flex flex-wrap items-center justify-end gap-1.5">
                              {file.deliverableRef && onApproveDeliverable && !isApproved && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onApproveDeliverable(
                                      file.deliverableRef!.id,
                                      file.deliverableRef!.title
                                    );
                                    handleStatusChange(
                                      selectedModalRecord.id,
                                      selectedModalRecord.project.title,
                                      'completed'
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                                >
                                  ✓ تایید فایل
                                </button>
                              )}

                              {file.deliverableRef && onRequestRevision && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const delRef = file.deliverableRef!;
                                    setSelectedModalRecordId(null);
                                    onRequestRevision(delRef);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 text-xs font-bold cursor-pointer"
                                >
                                  ثبت اصلاحیه
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  showToast(
                                    `لینک دریافت مستقیم فایل مستر «${file.name}» (${file.size}) آماده شد.`
                                  )
                                }
                                className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold cursor-pointer"
                              >
                                دانلود فایل
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="bg-white border-t border-neutral-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center gap-2 text-neutral-500">
                <span>فضای اختصاصی کارفرما:</span>
                <strong className="text-neutral-900">
                  {activeClient?.brandName || selectedModalRecord.project.client}
                </strong>
                <span aria-hidden="true">·</span>
                <span>رمزنگاری و تفکیک کامل داده‌ها</span>
              </div>

              <div className="flex items-center gap-2">
                {onSwitchTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModalRecordId(null);
                      onSwitchTab('chat');
                    }}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold cursor-pointer"
                  >
                    ارسال پیام به مدیر پروژه
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedModalRecordId(null)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold cursor-pointer"
                >
                  بستن نمای جزئیات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
