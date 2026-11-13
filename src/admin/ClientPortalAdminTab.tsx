import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ClientWorkspace,
  ClientDeliverable,
  ProjectBriefSubmission,
} from '../data/clientPortalData';
import {
  getClientWorkspaces,
  getAllArchivedBriefs,
  saveClientProfileByAdmin,
  deleteClientWorkspace,
  updateBriefStatus,
  updateDeliverableApproval,
  addDeliverableByAdmin,
  deleteDeliverableByAdmin,
  setActiveClientId,
  submitAndArchiveProjectBrief,
  CLIENT_PORTAL_EVENT,
} from '../clientPortalStore';
import { getStudioSettings, saveStudioSettings } from '../adminStore';
import { pullStateFromServer, buildBriefForwardLinks } from '../serverSync';
import {
  Key,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Search,
  ShieldCheck,
  FileCode,
  Users,
  FolderArchive,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Eye,
  Film,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface ClientPortalAdminTabProps {
  onShowToast: (msg: string) => void;
  onExitToPortal?: () => void;
}

export const ClientPortalAdminTab: React.FC<ClientPortalAdminTabProps> = ({
  onShowToast,
  onExitToPortal,
}) => {
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(() => getClientWorkspaces());
  const [briefs, setBriefs] = useState<ProjectBriefSubmission[]>(() => getAllArchivedBriefs());
  const [subTab, setSubTab] = useState<'unified' | 'profiles' | 'briefs' | 'files'>('unified');
  const [searchQuery, setSearchQuery] = useState('');
  const [briefStatusFilter, setBriefStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'in-production'>('all');
  const [fileStatusFilter, setFileStatusFilter] = useState<'all' | 'approved' | 'pending-review' | 'revision-requested'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Selected Workspace in Unified View
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(() => {
    const init = getClientWorkspaces();
    return init[0]?.id || '';
  });

  // Create / Edit Client Profile Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [brandName, setBrandName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('معماری هویت برند و تولید محتوا');
  const [trackingCode, setTrackingCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projectLead, setProjectLead] = useState('مهدی لقمانی');
  const [progressPercent, setProgressPercent] = useState(25);
  const [scopeSummary, setScopeSummary] = useState('');
  const [logoBadge, setLogoBadge] = useState('💼');

  // Add Archived File / Deliverable Modal State
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileTargetWorkspaceId, setFileTargetWorkspaceId] = useState<string>('');
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileType, setNewFileType] = useState<ClientDeliverable['type']>('branding');
  const [newFileFormat, setNewFileFormat] = useState('PDF • Master Archive');
  const [newFileSize, setNewFileSize] = useState('32.5 MB');
  const [newFileVersion, setNewFileVersion] = useState('v1.0 Final');
  const [newFileThumbnail, setNewFileThumbnail] = useState('');
  const [newFileDownloadUrl, setNewFileDownloadUrl] = useState('');
  const localFileInputRef = useRef<HTMLInputElement>(null);

  // Expanded Brief Detail State
  const [selectedBrief, setSelectedBrief] = useState<ProjectBriefSubmission | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [unifiedNotesMap, setUnifiedNotesMap] = useState<Record<string, string>>({});

  // File Preview Modal State
  const [previewFile, setPreviewFile] = useState<{
    file: ClientDeliverable;
    workspace: ClientWorkspace;
  } | null>(null);

  // Server Sync & WhatsApp/Email Brief Notification Settings
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [lastServerSyncTime, setLastServerSyncTime] = useState<string>(() =>
    new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
  );
  const [adminWhatsapp, setAdminWhatsapp] = useState<string>(() => getStudioSettings().adminWhatsapp || '');
  const [adminEmail, setAdminEmail] = useState<string>(() => getStudioSettings().contactEmail || 'youthefzadeh@gmail.com');
  const [showImportBriefModal, setShowImportBriefModal] = useState(false);
  const [manualBriefBrand, setManualBriefBrand] = useState('');
  const [manualBriefOwner, setManualBriefOwner] = useState('');
  const [manualBriefText, setManualBriefText] = useState('');

  const handleManualServerSync = async () => {
    setIsSyncingServer(true);
    try {
      await pullStateFromServer(true);
      refreshAll();
      setLastServerSyncTime(
        new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
      );
      onShowToast('✓ آخرین بریف‌ها و اطلاعات پروژه‌ها از سرور مرکزی استودیو دریافت و همگام‌سازی شد.');
    } finally {
      setIsSyncingServer(false);
    }
  };

  const handleSaveForwardSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveStudioSettings({
      adminWhatsapp: adminWhatsapp.trim(),
      contactEmail: adminEmail.trim() || 'youthefzadeh@gmail.com',
    });
    onShowToast('✓ شماره واتساپ و ایمیل دریافت کپی بریف‌ها روی سرور ذخیره شد.');
  };

  const handleManualImportBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBriefBrand.trim() || !manualBriefText.trim()) {
      onShowToast('لطفاً نام برند و متن بریف را وارد کنید.');
      return;
    }
    const res = submitAndArchiveProjectBrief({
      clientName: manualBriefBrand.trim(),
      ownerName: manualBriefOwner.trim() || manualBriefBrand.trim(),
      selectedTrack: 'دپارتمان برندینگ و مارکتینگ',
      marketTier: 'اختصاصی استودیو',
      problem: manualBriefText.trim().slice(0, 220),
      fullSummaryText: manualBriefText.trim(),
    });
    refreshAll();
    setSelectedWorkspaceId(res.workspace.id);
    setManualBriefBrand('');
    setManualBriefOwner('');
    setManualBriefText('');
    setShowImportBriefModal(false);
    onShowToast(`✓ بریف «${res.brief.brandName}» با کد رهگیری ${res.brief.trackingCode} ثبت و در سرور ذخیره شد.`);
  };

  const refreshAll = () => {
    const updatedWs = getClientWorkspaces();
    setWorkspaces(updatedWs);
    setBriefs(getAllArchivedBriefs());
    if (!selectedWorkspaceId && updatedWs.length > 0) {
      setSelectedWorkspaceId(updatedWs[0].id);
    }
  };

  useEffect(() => {
    window.addEventListener(CLIENT_PORTAL_EVENT, refreshAll);
    return () => window.removeEventListener(CLIENT_PORTAL_EVENT, refreshAll);
  }, []);

  const filteredWorkspaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter(
      (w) =>
        w.brandName.toLowerCase().includes(q) ||
        w.ownerName.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        (w.trackingCode && w.trackingCode.toLowerCase().includes(q)) ||
        (w.username && w.username.toLowerCase().includes(q))
    );
  }, [workspaces, searchQuery]);

  const activeUnifiedWorkspace = useMemo(() => {
    return (
      filteredWorkspaces.find((w) => w.id === selectedWorkspaceId) ||
      filteredWorkspaces[0] ||
      workspaces[0] ||
      null
    );
  }, [filteredWorkspaces, workspaces, selectedWorkspaceId]);

  const filteredBriefs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return briefs.filter((b) => {
      const matchesStatus = briefStatusFilter === 'all' || b.status === briefStatusFilter;
      const matchesSearch =
        !q ||
        b.brandName.toLowerCase().includes(q) ||
        b.trackingCode.toLowerCase().includes(q) ||
        b.problem.toLowerCase().includes(q) ||
        b.selectedTrack.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [briefs, searchQuery, briefStatusFilter]);

  // Flatten all archived files across all workspaces
  const allArchivedFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list: Array<{ file: ClientDeliverable; workspace: ClientWorkspace }> = [];
    workspaces.forEach((ws) => {
      (ws.deliverables || []).forEach((del) => {
        const matchesStatus = fileStatusFilter === 'all' || del.status === fileStatusFilter;
        const matchesSearch =
          !q ||
          del.title.toLowerCase().includes(q) ||
          del.format.toLowerCase().includes(q) ||
          ws.brandName.toLowerCase().includes(q) ||
          (ws.trackingCode && ws.trackingCode.toLowerCase().includes(q));
        if (matchesStatus && matchesSearch) {
          list.push({ file: del, workspace: ws });
        }
      });
    });
    return list;
  }, [workspaces, searchQuery, fileStatusFilter]);

  // Global KPI stats
  const stats = useMemo(() => {
    const totalProjects = workspaces.length;
    const totalBriefs = briefs.length;
    const newBriefs = briefs.filter((b) => b.status === 'new').length;
    const inProdBriefs = briefs.filter((b) => b.status === 'in-production').length;
    let totalFiles = 0;
    let approvedFiles = 0;
    let pendingFiles = 0;
    workspaces.forEach((ws) => {
      (ws.deliverables || []).forEach((d) => {
        totalFiles++;
        if (d.status === 'approved') approvedFiles++;
        if (d.status === 'pending-review') pendingFiles++;
      });
    });
    return { totalProjects, totalBriefs, newBriefs, inProdBriefs, totalFiles, approvedFiles, pendingFiles };
  }, [workspaces, briefs]);

  const handleOpenCreateModal = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setEditingId(undefined);
    setBrandName('');
    setOwnerName('');
    setCategory('معماری هویت برند و تولید محتوا');
    setTrackingCode(`CJ-${rand}`);
    setUsername(`client-${rand}`);
    setPassword(`cj${rand}`);
    setProjectLead('مهدی لقمانی');
    setProgressPercent(20);
    setScopeSummary('');
    setLogoBadge('💼');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ws: ClientWorkspace) => {
    setEditingId(ws.id);
    setBrandName(ws.brandName);
    setOwnerName(ws.ownerName);
    setCategory(ws.category);
    setTrackingCode(ws.trackingCode || `CJ-${ws.pinCode}`);
    setUsername(ws.username || ws.slug);
    setPassword(ws.password || ws.pinCode);
    setProjectLead(ws.projectLead);
    setProgressPercent(ws.progressPercent);
    setScopeSummary(ws.scopeSummary);
    setLogoBadge(ws.logoBadge || '💼');
    setIsModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !trackingCode.trim() || !password.trim()) {
      onShowToast('لطفاً نام پروژه، کد رهگیری و رمز عبور اختصاصی را وارد کنید.');
      return;
    }

    const saved = saveClientProfileByAdmin({
      id: editingId,
      brandName,
      ownerName: ownerName || brandName,
      category,
      trackingCode,
      username: username || trackingCode.toLowerCase(),
      password,
      projectLead,
      progressPercent,
      scopeSummary,
      logoBadge,
    });

    refreshAll();
    setSelectedWorkspaceId(saved.id);
    setIsModalOpen(false);
    onShowToast(
      editingId
        ? `اطلاعات و رمز دسترسی «${saved.brandName}» (${saved.trackingCode}) به‌روزرسانی شد.`
        : `پروفایل اختصاصی «${saved.brandName}» با کد رهگیری ${saved.trackingCode} ایجاد شد.`
    );
  };

  const handleDeleteProfile = (ws: ClientWorkspace) => {
    deleteClientWorkspace(ws.id);
    refreshAll();
    onShowToast(`پروفایل «${ws.brandName}» حذف گردید.`);
  };

  const handleCopyCredentials = (ws: ClientWorkspace) => {
    const text = `پورتال اختصاصی کارفرما — Creativity Juice\nپروژه: ${ws.brandName}\nکد رهگیری یکتا: ${ws.trackingCode || `CJ-${ws.pinCode}`}\nنام کاربری: ${ws.username || ws.slug}\nرمز عبور اختصاصی: ${ws.password || ws.pinCode}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(ws.id);
    onShowToast(`اطلاعات ورود «${ws.brandName}» کپی شد.`);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleEnterClientPortal = (ws: ClientWorkspace) => {
    setActiveClientId(ws.id);
    onShowToast(`در حال ورود به پورتال اختصاصی «${ws.brandName}»...`);
    if (onExitToPortal) {
      onExitToPortal();
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-client-portal-window'));
    }, 120);
  };

  const handleUpdateBrief = (
    brief: ProjectBriefSubmission,
    status: 'new' | 'reviewed' | 'in-production',
    customNote?: string
  ) => {
    const noteToSave =
      customNote !== undefined
        ? customNote.trim()
        : adminNoteInput.trim() || brief.adminNotes;
    updateBriefStatus(brief.id, status, noteToSave);
    refreshAll();
    onShowToast(`وضعیت بریف پروژه (${brief.trackingCode}) به «${status === 'in-production' ? 'در حال تولید' : status === 'reviewed' ? 'بررسی‌شده' : 'جدید'}» تغییر یافت.`);
    if (selectedBrief && selectedBrief.id === brief.id) {
      setSelectedBrief({
        ...brief,
        status,
        adminNotes: noteToSave,
      });
    }
  };

  const handleDownloadBriefFile = (brief: ProjectBriefSubmission) => {
    const content = [
      `============================================================`,
      `CREATIVITY JUICE STUDIO — ARCHIVED PROJECT BRIEF DOSSIER`,
      `============================================================`,
      `کد رهگیری یکتا: ${brief.trackingCode}`,
      `نام برند / پروژه: ${brief.brandName}`,
      `نام کارفرما: ${brief.ownerName}`,
      `تاریخ ثبت: ${brief.submittedAt}`,
      `دپارتمان: ${brief.selectedTrack}`,
      `رده بازار: ${brief.marketTier}`,
      `وضعیت بررسی در استودیو: ${brief.status}`,
      `یادداشت مدیریت: ${brief.adminNotes || 'ثبت نشده'}`,
      `------------------------------------------------------------`,
      brief.fullSummaryText,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brief-${brief.trackingCode}-${brief.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`فایل آرشیو بریف (${brief.trackingCode}) دانلود شد.`);
  };

  const handleDownloadProjectArchive = (ws: ClientWorkspace) => {
    const archivePayload = {
      exportedAt: new Date().toISOString(),
      studio: 'Creativity Juice Studio',
      trackingCode: ws.trackingCode || `CJ-${ws.pinCode}`,
      username: ws.username || ws.slug,
      brandName: ws.brandName,
      ownerName: ws.ownerName,
      category: ws.category,
      projectLead: ws.projectLead,
      progressPercent: ws.progressPercent,
      scopeSummary: ws.scopeSummary,
      archivedBriefs: ws.archivedBriefs || [],
      archivedDeliverables: ws.deliverables || [],
      milestones: ws.milestones || [],
    };
    const blob = new Blob([JSON.stringify(archivePayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-archive-${ws.trackingCode || ws.slug}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`پکیج آرشیو کامل پروژه «${ws.brandName}» دانلود شد.`);
  };

  const handleOpenAddFileModal = (wsId: string) => {
    setFileTargetWorkspaceId(wsId);
    setNewFileTitle('');
    setNewFileType('branding');
    setNewFileFormat('PDF • Master Archive');
    setNewFileSize('28.4 MB');
    setNewFileVersion('v1.0 Final');
    setNewFileThumbnail('');
    setNewFileDownloadUrl('');
    setIsFileModalOpen(true);
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setNewFileSize(`${sizeMB === '0.0' ? '0.4' : sizeMB} MB`);
    if (!newFileTitle.trim()) {
      setNewFileTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    setNewFileFormat(`${ext} • Master Archive`);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setNewFileThumbnail(dataUrl);
          setNewFileDownloadUrl(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    onShowToast(`فایل «${file.name}» از سیستم انتخاب شد.`);
  };

  const handleSaveNewDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTargetWorkspaceId || !newFileTitle.trim()) {
      onShowToast('لطفاً عنوان فایل آرشیوی را وارد کنید.');
      return;
    }

    const updated = addDeliverableByAdmin(fileTargetWorkspaceId, {
      title: newFileTitle,
      type: newFileType,
      format: newFileFormat,
      fileSize: newFileSize,
      version: newFileVersion,
      thumbnail: newFileThumbnail || undefined,
      downloadUrl: newFileDownloadUrl || undefined,
      status: 'pending-review',
    });

    refreshAll();
    setIsFileModalOpen(false);
    if (updated) {
      onShowToast(`فایل «${newFileTitle}» به آرشیو پروژه «${updated.brandName}» اضافه شد.`);
    }
  };

  const handleToggleFileApproval = (
    wsId: string,
    file: ClientDeliverable,
    nextStatus: 'approved' | 'revision-requested'
  ) => {
    updateDeliverableApproval(
      wsId,
      file.id,
      nextStatus,
      nextStatus === 'approved'
        ? 'تأیید و ثبت در آرشیو نهایی توسط مدیریت استودیو'
        : 'نیازمند بازبینی نسخه طبق نظر مدیریت استودیو'
    );
    refreshAll();
    onShowToast(`وضعیت فایل «${file.title}» به‌روزرسانی شد.`);
  };

  const handleDeleteFile = (wsId: string, file: ClientDeliverable) => {
    deleteDeliverableByAdmin(wsId, file.id);
    refreshAll();
    onShowToast(`فایل «${file.title}» از آرشیو پروژه حذف شد.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5" dir="rtl">
      {/* Top Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#16161A] via-[#1A1A20] to-[#1E1E26] border border-amber-500/30 p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>UNIFIED ADMIN COMMAND CENTER</span>
            </span>
            <span className="text-xs text-neutral-400">
              مدیریت یکپارچه پروژه‌ها، کدهای رهگیری، وضعیت بریف‌ها و مخزن فایل‌های آرشیوشده
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white">
            مرکز فرماندهی پروژه‌های اختصاصی، بریف‌های ارسالی و فایل‌های آرشیوشده
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            در این بخش به صورت یکپارچه به لیست تمام پروژه‌ها، رمزهای ورود کارفرمایان، وضعیت بریف‌های ثبت‌شده و فایل‌های تحویلی/آرشیوشده هر پروژه دسترسی کامل دارید.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeUnifiedWorkspace && (
            <button
              onClick={() => handleOpenAddFileModal(activeUnifiedWorkspace.id)}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>افزودن فایل به آرشیو پروژه</span>
            </button>
          )}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف پروژه و کد رهگیری جدید</span>
          </button>
        </div>
      </div>

      {/* Central Server Sync & WhatsApp/Email Brief Forwarding Bar */}
      <div className="bg-[#141417] border border-emerald-500/30 rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>متصل به سرور مرکزی استودیو (دریافت خودکار بریف از تمام دستگاه‌ها)</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            آخرین همگام‌سازی: {lastServerSyncTime}
          </span>
          <button
            type="button"
            onClick={handleManualServerSync}
            disabled={isSyncingServer}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin' : ''}`} />
            <span>{isSyncingServer ? 'در حال دریافت از سرور...' : 'دریافت فوری بریف‌های جدید از سرور'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportBriefModal(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>ثبت دستی بریف دریافتی از واتساپ/ایمیل</span>
          </button>
        </div>

        <form onSubmit={handleSaveForwardSettings} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={adminWhatsapp}
            onChange={(e) => setAdminWhatsapp(e.target.value)}
            placeholder="شماره واتساپ مدیریت (مثال: 0912...)"
            dir="ltr"
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:border-amber-500 outline-none w-48"
          />
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="ایمیل دریافت بریف"
            dir="ltr"
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white placeholder-neutral-500 focus:border-amber-500 outline-none w-52"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
          >
            ذخیره واتساپ و ایمیل دریافت بریف
          </button>
        </form>
      </div>

      {/* Unified KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#141417] border border-[#27272A] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">کل پروژه‌ها و پروفایل‌ها</span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {stats.totalProjects}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">
              محافظت‌شده با کد رهگیری و رمز یکتا
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">وضعیت بریف‌های ارسالی</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{stats.totalBriefs}</span>
              {stats.newBriefs > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {stats.newBriefs} جدید
                </span>
              )}
            </div>
            <span className="text-[11px] text-sky-400 mt-0.5 block">
              {stats.inProdBriefs} پرونده در فاز تولید فعال
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <FileCode className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">فایل‌های آرشیوشده و خروجی‌ها</span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {stats.totalFiles}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">
              {stats.approvedFiles} تایید نهایی • {stats.pendingFiles} در انتظار بررسی
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FolderArchive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141417] border border-[#27272A] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block">سطح دسترسی فعلی</span>
            <span className="text-sm font-black text-amber-400 mt-1.5 block">
              مدیریت کل استودیو (Super Admin)
            </span>
            <span className="text-[11px] text-neutral-400 mt-1 block">
              مشاهده و ویرایش تمام پروژه‌ها
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Bar & Global Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141417] p-3 rounded-2xl border border-[#27272A]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubTab('unified')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'unified'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>نمای یکپارچه پروژه‌ها، بریف‌ها و فایل‌ها</span>
          </button>

          <button
            onClick={() => setSubTab('profiles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'profiles'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>کارت‌های پروژه و رمزها ({workspaces.length})</span>
          </button>

          <button
            onClick={() => setSubTab('briefs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'briefs'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>صندوق بریف‌ها ({briefs.length})</span>
            {stats.newBriefs > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setSubTab('files')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              subTab === 'files'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'bg-neutral-900 text-neutral-300 hover:text-white'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>مخزن کل فایل‌های آرشیوشده ({stats.totalFiles})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام پروژه، کد رهگیری، بریف یا فایل..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: UNIFIED MASTER COMMAND VIEW (Projects + Briefs + Archived Files)
         ===================================================================== */}
      {subTab === 'unified' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Right Column (4 cols): Master List of All Projects */}
          <div className="lg:col-span-4 bg-[#141417] border border-[#27272A] rounded-2xl p-3.5 space-y-2.5 max-h-[78vh] overflow-y-auto">
            <div className="flex items-center justify-between px-1 pb-2 border-b border-neutral-800">
              <span className="text-xs font-black text-white">
                فهرست تمام پروژه‌ها ({filteredWorkspaces.length})
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                انتخاب جهت بررسی یکپارچه
              </span>
            </div>

            {filteredWorkspaces.map((ws) => {
              const isSelected = activeUnifiedWorkspace?.id === ws.id;
              const wsBriefs = ws.archivedBriefs || [];
              const latestBrief = wsBriefs[0];
              const fileCount = (ws.deliverables || []).length;

              return (
                <div
                  key={ws.id}
                  onClick={() => setSelectedWorkspaceId(ws.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{ws.logoBadge || '💼'}</span>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-black text-white truncate">
                          {ws.brandName}
                        </h3>
                        <p className="text-[11px] text-neutral-400 truncate">
                          {ws.ownerName} • {ws.projectLead}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded bg-neutral-950 text-amber-400 font-mono text-[10px] font-black shrink-0 border border-amber-500/30"
                      dir="ltr"
                    >
                      {ws.trackingCode || `CJ-${ws.pinCode}`}
                    </span>
                  </div>

                  {/* Quick Unified Status Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-800/80 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          latestBrief?.status === 'new'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : latestBrief?.status === 'in-production'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        بریف: {latestBrief?.status === 'new' ? 'جدید' : latestBrief?.status === 'in-production' ? 'در حال تولید' : 'بررسی‌شده'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 font-mono">
                        {fileCount} فایل آرشیوی
                      </span>
                    </div>
                    <span className="font-mono font-bold text-neutral-400">
                      {ws.progressPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Column (8 cols): Unified Dossier for Selected Project */}
          <div className="lg:col-span-8 space-y-5">
            {activeUnifiedWorkspace ? (
              <>
                {/* SECTION A: Project Identity, Credentials & Direct Actions */}
                <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-amber-500/40 flex items-center justify-center text-2xl">
                        {activeUnifiedWorkspace.logoBadge || '💼'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-black text-white">
                            {activeUnifiedWorkspace.brandName}
                          </h2>
                          <span
                            className="px-2.5 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-mono text-xs font-black"
                            dir="ltr"
                          >
                            {activeUnifiedWorkspace.trackingCode || `CJ-${activeUnifiedWorkspace.pinCode}`}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          کارفرما: <strong className="text-neutral-200">{activeUnifiedWorkspace.ownerName}</strong> • سرپرست پروژه: <strong className="text-amber-400">{activeUnifiedWorkspace.projectLead}</strong> ({activeUnifiedWorkspace.category})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDownloadProjectArchive(activeUnifiedWorkspace)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="دانلود کل پرونده، بریف‌ها و لیست فایل‌های این پروژه"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>دانلود آرشیو کامل پروژه</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(activeUnifiedWorkspace)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        <span>ویرایش رمز و مشخصات</span>
                      </button>
                      <button
                        onClick={() => handleEnterClientPortal(activeUnifiedWorkspace)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                      >
                        <span>ورود به پورتال این کارفرما</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Credentials & Progress Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">کد رهگیری یکتا:</span>
                      <span className="font-mono font-black text-amber-400 text-sm" dir="ltr">
                        {activeUnifiedWorkspace.trackingCode || `CJ-${activeUnifiedWorkspace.pinCode}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">نام کاربری اختصاصی:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">
                        {activeUnifiedWorkspace.username || activeUnifiedWorkspace.slug}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">رمز عبور (پسورد):</span>
                      <span className="font-mono font-black text-rose-300 text-sm" dir="ltr">
                        {activeUnifiedWorkspace.password || activeUnifiedWorkspace.pinCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleCopyCredentials(activeUnifiedWorkspace)}
                        className="w-full py-2 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        {copiedId === activeUnifiedWorkspace.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-amber-400" />
                            <span>کپی اطلاعات ورود</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION B: Submitted Briefs Status & Dossier for This Project */}
                <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm sm:text-base font-black text-white">
                        وضعیت بریف‌های ارسالی پروژه ({(activeUnifiedWorkspace.archivedBriefs || []).length})
                      </h3>
                    </div>
                    <span className="text-[11px] text-neutral-400">
                      امکان تغییر وضعیت بررسی، ثبت پاسخ مدیریتی و دانلود فایل بریف
                    </span>
                  </div>

                  {(activeUnifiedWorkspace.archivedBriefs || []).map((brief) => {
                    const noteVal =
                      unifiedNotesMap[brief.id] !== undefined
                        ? unifiedNotesMap[brief.id]
                        : brief.adminNotes || '';

                    return (
                      <div
                        key={brief.id}
                        className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                                brief.status === 'in-production'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : brief.status === 'reviewed'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {brief.status === 'in-production' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : brief.status === 'reviewed' ? (
                                <Clock className="w-3.5 h-3.5" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                              <span>
                                وضعیت بریف:{' '}
                                {brief.status === 'in-production'
                                  ? 'تایید شده و در حال تولید'
                                  : brief.status === 'reviewed'
                                  ? 'بررسی‌شده توسط مدیریت'
                                  : 'بریف جدید (در انتظار بررسی)'}
                              </span>
                            </span>
                            <span className="text-xs text-neutral-400 font-mono">
                              تاریخ ثبت: {brief.submittedAt}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateBrief(brief, 'new', noteVal)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                brief.status === 'new'
                                  ? 'bg-amber-500 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              جدید
                            </button>
                            <button
                              onClick={() => handleUpdateBrief(brief, 'reviewed', noteVal)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                brief.status === 'reviewed'
                                  ? 'bg-sky-500 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              بررسی‌شده
                            </button>
                            <button
                              onClick={() => handleUpdateBrief(brief, 'in-production', noteVal)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                                brief.status === 'in-production'
                                  ? 'bg-emerald-500 text-neutral-950'
                                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              در حال تولید
                            </button>
                            <button
                              onClick={() => handleDownloadBriefFile(brief)}
                              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="دانلود فایل متنی این بریف"
                            >
                              <Download className="w-3 h-3" />
                              <span>دانلود بریف (.txt)</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/90 text-xs text-neutral-200 leading-relaxed space-y-1">
                          <div>
                            <strong className="text-amber-400">مسیر و رده بازار: </strong>
                            <span>{brief.selectedTrack} ({brief.marketTier})</span>
                          </div>
                          <div>
                            <strong className="text-amber-400">صورت‌مسئله و شرح بریف: </strong>
                            <span>{brief.problem}</span>
                          </div>
                        </div>

                        {/* Collapsible Full Brief Text */}
                        <details className="group bg-neutral-950/70 rounded-xl border border-neutral-800/80 p-3">
                          <summary className="text-xs font-bold text-amber-400 cursor-pointer flex items-center justify-between">
                            <span>مشاهده متن کامل پرسشنامه و جزئیات آرشیوشده بریف</span>
                            <span className="text-[10px] text-neutral-500 group-open:rotate-180 transition-transform">▼</span>
                          </summary>
                          <pre className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-300 font-sans whitespace-pre-wrap leading-relaxed overflow-x-auto">
                            {brief.fullSummaryText}
                          </pre>
                        </details>

                        {/* Admin Note / Response Input */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <input
                            type="text"
                            value={noteVal}
                            onChange={(e) =>
                              setUnifiedNotesMap((prev) => ({
                                ...prev,
                                [brief.id]: e.target.value,
                              }))
                            }
                            placeholder="ثبت یادداشت یا بازخورد مدیریت روی این بریف (قابل مشاهده در پورتال کارفرما)..."
                            className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white focus:border-amber-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateBrief(brief, brief.status, noteVal)}
                            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/40 text-xs font-bold transition cursor-pointer shrink-0"
                          >
                            ذخیره یادداشت مدیریت
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SECTION C: Archived Files & Deliverables Vault for This Project */}
                <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white">
                          فایل‌های آرشیوشده و خروجی‌های پروژه ({(activeUnifiedWorkspace.deliverables || []).length})
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          دسترسی مستقیم به فایل‌های مستر، کتابچه‌های برند، تیزرها و وضعیت تایید کارفرما
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddFileModal(activeUnifiedWorkspace.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن / آپلود فایل جدید به آرشیو</span>
                    </button>
                  </div>

                  {(activeUnifiedWorkspace.deliverables || []).length === 0 ? (
                    <div className="p-8 rounded-xl bg-neutral-900/50 border border-dashed border-neutral-800 text-center space-y-2">
                      <FolderArchive className="w-8 h-8 text-neutral-500 mx-auto" />
                      <p className="text-xs text-neutral-400">
                        هنوز فایلی در مخزن آرشیو این پروژه ثبت نشده است.
                      </p>
                      <button
                        onClick={() => handleOpenAddFileModal(activeUnifiedWorkspace.id)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-black cursor-pointer"
                      >
                        بارگذاری نخستین فایل پروژه
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(activeUnifiedWorkspace.deliverables || []).map((file) => {
                        const isApproved = file.status === 'approved';
                        const isRevision = file.status === 'revision-requested';
                        return (
                          <div
                            key={file.id}
                            className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 flex flex-col justify-between space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={file.thumbnail}
                                alt={file.title}
                                className="w-16 h-16 rounded-lg object-cover border border-neutral-700 shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                    {file.version}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400">
                                    {file.fileSize} • {file.format}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                                  {file.title}
                                </h4>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      isApproved
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : isRevision
                                        ? 'bg-rose-500/20 text-rose-300'
                                        : 'bg-amber-500/20 text-amber-300'
                                    }`}
                                  >
                                    {isApproved
                                      ? '✓ تایید نهایی'
                                      : isRevision
                                      ? 'نیازمند اصلاحیه'
                                      : 'در انتظار بررسی'}
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-mono">
                                    {file.dateUploaded}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {file.clientFeedback && (
                              <div className="p-2 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300">
                                <strong className="text-amber-400">بازخورد ثبت‌شده: </strong>
                                {file.clientFeedback}
                              </div>
                            )}

                            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setPreviewFile({ file, workspace: activeUnifiedWorkspace })
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                                  <span>پیش‌نمایش / دانلود</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleFileApproval(
                                      activeUnifiedWorkspace.id,
                                      file,
                                      isApproved ? 'revision-requested' : 'approved'
                                    )
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-[11px] font-bold cursor-pointer"
                                >
                                  {isApproved ? 'تغییر به بازبینی' : 'تایید فایل'}
                                </button>
                              </div>

                              <button
                                onClick={() => handleDeleteFile(activeUnifiedWorkspace.id, file)}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 cursor-pointer"
                                title="حذف فایل از آرشیو"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: CLIENT PROFILES & CREDENTIALS CARDS
         ===================================================================== */}
      {subTab === 'profiles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkspaces.map((ws) => {
            const briefCount = (ws.archivedBriefs || []).length;
            const fileCount = (ws.deliverables || []).length;
            return (
              <div
                key={ws.id}
                className="bg-[#141417] border border-[#27272A] hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl">
                        {ws.logoBadge || '💼'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-white">{ws.brandName}</h3>
                          {ws.isPersonalBrand && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              پرسونال برند
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          کارفرما: {ws.ownerName} • مدیر پروژه: {ws.projectLead}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(ws)}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 transition cursor-pointer"
                        title="ویرایش کد رهگیری، رمز عبور و مشخصات پروژه"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(ws)}
                        className="p-2 rounded-lg bg-neutral-900 hover:bg-rose-950 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                        title="حذف پروفایل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Credentials Box */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">کد رهگیری یکتا:</span>
                      <span className="font-mono font-black text-amber-400 text-xs sm:text-sm" dir="ltr">
                        {ws.trackingCode || `CJ-${ws.pinCode}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">نام کاربری:</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm truncate block" dir="ltr">
                        {ws.username || ws.slug}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">رمز عبور اختصاصی:</span>
                      <span className="font-mono font-black text-rose-300 text-xs sm:text-sm" dir="ltr">
                        {ws.password || ws.pinCode}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {ws.scopeSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                    <span>پیشرفت: <strong className="text-white font-mono">{ws.progressPercent}%</strong></span>
                    <span>•</span>
                    <span>بریف‌ها: <strong className="text-amber-400 font-mono">{briefCount}</strong></span>
                    <span>•</span>
                    <span>فایل‌ها: <strong className="text-emerald-400 font-mono">{fileCount}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedWorkspaceId(ws.id);
                        setSubTab('unified');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold cursor-pointer"
                    >
                      پرونده یکپارچه
                    </button>
                    <button
                      onClick={() => handleCopyCredentials(ws)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedId === ws.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>کپی رمز</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleEnterClientPortal(ws)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <span>ورود</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          VIEW 3: GLOBAL ARCHIVED BRIEFS INBOX
         ===================================================================== */}
      {subTab === 'briefs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `همه بریف‌ها (${briefs.length})` },
              { id: 'new', label: `جدید (${briefs.filter((b) => b.status === 'new').length})` },
              { id: 'reviewed', label: `بررسی‌شده (${briefs.filter((b) => b.status === 'reviewed').length})` },
              { id: 'in-production', label: `در حال تولید (${briefs.filter((b) => b.status === 'in-production').length})` },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setBriefStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  briefStatusFilter === st.id
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-[#141417] text-neutral-400 border border-[#27272A] hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {filteredBriefs.length === 0 ? (
            <div className="bg-[#141417] border border-[#27272A] rounded-2xl p-10 text-center space-y-2">
              <FileCode className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-white">هنوز بریفی در این دسته‌بندی ثبت نشده است</h3>
              <p className="text-xs text-neutral-400">
                به محض اینکه کارفرمایی فرم بریف پروژه را تکمیل کند، اطلاعات کامل به همراه کد رهگیری یکتا در این بخش آرشیو می‌شود.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBriefs.map((brief) => {
                const isSelected = selectedBrief?.id === brief.id;
                return (
                  <div
                    key={brief.id}
                    className="bg-[#141417] border border-[#27272A] rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono text-xs font-black"
                          dir="ltr"
                        >
                          {brief.trackingCode}
                        </span>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-white">
                            {brief.brandName} ({brief.ownerName})
                          </h4>
                          <p className="text-[11px] text-neutral-400">
                            {brief.selectedTrack} • {brief.marketTier} • ثبت در: {brief.submittedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            brief.status === 'in-production'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : brief.status === 'reviewed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {brief.status === 'in-production'
                            ? 'در حال تولید'
                            : brief.status === 'reviewed'
                            ? 'بررسی‌شده'
                            : 'بریف جدید'}
                        </span>

                        <button
                          onClick={() => handleDownloadBriefFile(brief)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-400 flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>دانلود بریف</span>
                        </button>

                        {(() => {
                          const links = buildBriefForwardLinks(brief);
                          return (
                            <>
                              <a
                                href={links.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                              >
                                <span>📲</span>
                                <span>واتساپ</span>
                              </a>
                              <a
                                href={links.mailtoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1 transition"
                              >
                                <span>✉️</span>
                                <span>ایمیل</span>
                              </a>
                            </>
                          );
                        })()}

                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedBrief(null);
                            } else {
                              setSelectedBrief(brief);
                              setAdminNoteInput(brief.adminNotes || '');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white transition cursor-pointer"
                        >
                          {isSelected ? 'بستن جزئیات' : 'مشاهده کامل بریف و پاسخ'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs text-neutral-200 leading-relaxed">
                      <strong className="text-amber-400">صورت‌مسئله پروژه: </strong>
                      {brief.problem}
                    </div>

                    {isSelected && (
                      <div className="pt-3 border-t border-neutral-800 space-y-4">
                        <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 font-sans whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {brief.fullSummaryText}
                        </pre>

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-neutral-300">
                            یادداشت / بازخورد مدیریت استودیو برای کارفرما (در پورتال اختصاصی کارفرما نمایش داده می‌شود):
                          </label>
                          <textarea
                            rows={2}
                            value={adminNoteInput}
                            onChange={(e) => setAdminNoteInput(e.target.value)}
                            placeholder="پاسخ استودیو، زمان جلسه کشف یا نکات اجرایی را بنویسید..."
                            className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateBrief(brief, 'reviewed')}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                              ثبت به عنوان بررسی‌شده
                            </button>
                            <button
                              onClick={() => handleUpdateBrief(brief, 'in-production')}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                            >
                              تایید و انتقال به فاز تولید
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(brief.fullSummaryText);
                              onShowToast('متن کامل بریف کپی شد.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer"
                          >
                            کپی کل متن بریف
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          VIEW 4: GLOBAL ARCHIVED FILES VAULT ACROSS ALL PROJECTS
         ===================================================================== */}
      {subTab === 'files' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `همه فایل‌های آرشیوشده (${stats.totalFiles})` },
                { id: 'approved', label: `تایید نهایی (${stats.approvedFiles})` },
                { id: 'pending-review', label: `در انتظار بررسی (${stats.pendingFiles})` },
                { id: 'revision-requested', label: 'نیازمند اصلاحیه' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setFileStatusFilter(st.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    fileStatusFilter === st.id
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-[#141417] text-neutral-400 border border-[#27272A] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allArchivedFiles.map(({ file, workspace }) => {
              const isApproved = file.status === 'approved';
              const isRevision = file.status === 'revision-requested';
              return (
                <div
                  key={`${workspace.id}-${file.id}`}
                  className="bg-[#141417] border border-[#27272A] rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                      <img
                        src={file.thumbnail}
                        alt={file.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span
                          className="px-2 py-0.5 rounded bg-black/75 text-amber-400 font-mono text-[10px] font-black"
                          dir="ltr"
                        >
                          {workspace.trackingCode || `CJ-${workspace.pinCode}`}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/75 text-white font-mono text-[10px]">
                          {file.version}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-amber-400 font-bold truncate">
                        {workspace.brandName} ({workspace.ownerName})
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                        {file.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
                        <span>{file.format}</span>
                        <span>{file.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isRevision
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isApproved ? 'تایید شده' : isRevision ? 'نیازمند اصلاحیه' : 'در انتظار بررسی'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewFile({ file, workspace })}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>مشاهده و دانلود</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Client Profile & Credentials */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[220] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-[#16161A] border border-amber-500/40 rounded-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  {editingId ? 'ویرایش پروفایل پروژه و رمز دسترسی کارفرما' : 'تعریف پروژه جدید و صدور کد رهگیری اختصاصی'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نام پروژه / برند کارفرما: *
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="مثال: گروه معماری آرکا"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نام صاحب پروژه / کارفرما:
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="مثال: مهندس رادمان"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-neutral-900/90 border border-amber-500/30">
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1">
                    کد رهگیری یکتا: *
                  </label>
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="CJ-1020"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-400 mb-1">
                    نام کاربری یکتا: *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="arka-brand"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-400 mb-1">
                    رمز عبور اختصاصی: *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز ورود کارفرما"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    حوزه خدمات پروژه:
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    مدیر پروژه در استودیو:
                  </label>
                  <input
                    type="text"
                    value={projectLead}
                    onChange={(e) => setProjectLead(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    درصد پیشرفت ({progressPercent}%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  خلاصه دامنه خدمات و توضیحات پرونده:
                </label>
                <textarea
                  rows={3}
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  placeholder="شرح خدمات، اهداف استراتژیک و خروجی‌های تعهدشده برای این کارفرما..."
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black cursor-pointer"
                >
                  ذخیره پروفایل و رمز دسترسی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add / Upload Archived Deliverable File */}
      {isFileModalOpen && (
        <div
          className="fixed inset-0 z-[220] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsFileModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#16161A] border border-emerald-500/40 rounded-2xl p-6 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  افزودن فایل جدید به آرشیو و میز تحویل پروژه
                </h3>
              </div>
              <button
                onClick={() => setIsFileModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewDeliverable} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  پروژه مقصد:
                </label>
                <select
                  value={fileTargetWorkspaceId}
                  onChange={(e) => setFileTargetWorkspaceId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white outline-none"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.trackingCode || w.pinCode}] {w.brandName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  عنوان فایل آرشیوی / خروجی تحویلی: *
                </label>
                <input
                  type="text"
                  value={newFileTitle}
                  onChange={(e) => setNewFileTitle(e.target.value)}
                  placeholder="مثال: کتابچه جامع هویت بصری نسخه نهایی یا تیزر مستر 4K"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نوع فایل:
                  </label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white outline-none"
                  >
                    <option value="branding">سند برندینگ / PDF</option>
                    <option value="video">تیزر و ویدیو 4K</option>
                    <option value="reels">ریلز سوشال مدیا</option>
                    <option value="strategy">سند استراتژی</option>
                    <option value="audio">فایل صوتی / نریشن</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    فرمت فایل:
                  </label>
                  <input
                    type="text"
                    value={newFileFormat}
                    onChange={(e) => setNewFileFormat(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نسخه و حجم:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newFileVersion}
                      onChange={(e) => setNewFileVersion(e.target.value)}
                      dir="ltr"
                      placeholder="v1.0"
                      className="w-1/2 px-2 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white outline-none"
                    />
                    <input
                      type="text"
                      value={newFileSize}
                      onChange={(e) => setNewFileSize(e.target.value)}
                      dir="ltr"
                      placeholder="24 MB"
                      className="w-1/2 px-2 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    انتخاب فایل از لپ‌تاپ یا وارد کردن لینک دانلود / تصویر کاور:
                  </span>
                  <button
                    type="button"
                    onClick={() => localFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>انتخاب فایل از دستگاه</span>
                  </button>
                  <input
                    ref={localFileInputRef}
                    type="file"
                    onChange={handleLocalFileSelect}
                    className="hidden"
                  />
                </div>
                <input
                  type="text"
                  value={newFileDownloadUrl}
                  onChange={(e) => setNewFileDownloadUrl(e.target.value)}
                  placeholder="لینک مستقیم دانلود یا پیش‌نمایش فایل (اختیاری)"
                  dir="ltr"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer"
                >
                  افزودن به آرشیو پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: File Preview & Download Dossier */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[230] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#16161A] border border-amber-500/40 rounded-2xl overflow-hidden text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-black">
              <img
                src={previewFile.file.thumbnail}
                alt={previewFile.file.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewFile(null)}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-black/80 text-amber-400 font-mono text-xs font-bold">
                  {previewFile.workspace.trackingCode || `CJ-${previewFile.workspace.pinCode}`}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-amber-500 text-neutral-950 font-mono text-xs font-black">
                  {previewFile.file.version}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs text-amber-400 font-bold">
                  پروژه: {previewFile.workspace.brandName} ({previewFile.workspace.ownerName})
                </span>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  {previewFile.file.title}
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-1">
                  Format: {previewFile.file.format} • Size: {previewFile.file.fileSize} • Uploaded: {previewFile.file.dateUploaded}
                </p>
              </div>

              {previewFile.file.clientFeedback && (
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-200">
                  <strong className="text-amber-400 block mb-1">یادداشت و بازخورد کارفرما روی این فایل:</strong>
                  {previewFile.file.clientFeedback}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
                <button
                  onClick={() => handleEnterClientPortal(previewFile.workspace)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <span>باز کردن در پورتال کارفرما</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <a
                  href={previewFile.file.downloadUrl || previewFile.file.thumbnail}
                  download={`${previewFile.file.title}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    onShowToast(`دانلود فایل آرشیوی «${previewFile.file.title}» آغاز شد.`)
                  }
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>دانلود نسخه مستر آرشیوی</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Import Brief from WhatsApp / Email */}
      {showImportBriefModal && (
        <div
          className="fixed inset-0 z-[240] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImportBriefModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#16161A] border border-emerald-500/40 rounded-2xl p-6 text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  ثبت بریف دریافتی از واتساپ یا ایمیل در سرور مرکزی
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportBriefModal(false)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualImportBrief} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نام برند / پروژه: *
                  </label>
                  <input
                    type="text"
                    value={manualBriefBrand}
                    onChange={(e) => setManualBriefBrand(e.target.value)}
                    placeholder="نام برند کارفرما"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    نام کارفرما / شماره تماس:
                  </label>
                  <input
                    type="text"
                    value={manualBriefOwner}
                    onChange={(e) => setManualBriefOwner(e.target.value)}
                    placeholder="نام یا شماره تماس"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  متن کامل بریف کپی‌شده یا شرح نیاز پروژه: *
                </label>
                <textarea
                  rows={6}
                  value={manualBriefText}
                  onChange={(e) => setManualBriefText(e.target.value)}
                  placeholder="متن بریف ارسال‌شده در واتساپ یا ایمیل را اینجا جای‌گذاری (Paste) کنید..."
                  className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportBriefModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-black cursor-pointer"
                >
                  ثبت بریف و صدور کد رهگیری در سرور
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientPortalAdminTab;
