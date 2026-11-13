import React, { useState, useEffect, useMemo } from 'react';
import {
  ClientWorkspace,
  ClientDeliverable,
} from './data/clientPortalData';
import {
  getClientWorkspaces,
  getActiveClientId,
  setActiveClientId,
  getClientById,
  authenticateClient,
  updateDeliverableApproval,
  addClientMessage,
  createPersonalBrandWorkspace,
  deleteClientWorkspace,
  submitAndArchiveProjectBrief,
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore';
import { ProjectItem, isAdminAuthenticated, CJ_STUDIO_DATA_EVENT } from './adminStore';
import { Dashboard } from './Dashboard';
import { buildBriefForwardLinks } from './serverSync';

interface ClientPortalWindowProps {
  onClose?: () => void;
  isAdminAuth?: boolean;
  onSelectProject?: (project: ProjectItem) => void;
  onOpenBrief?: (prefilledScope?: string) => void;
  onOpenCalendar?: () => void;
}

export const ClientPortalWindow: React.FC<ClientPortalWindowProps> = ({
  onClose,
  isAdminAuth = false,
  onSelectProject,
  onOpenBrief,
}) => {
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(getClientWorkspaces);
  const [activeClientId, setLocalActiveId] = useState<string | null>(getActiveClientId);
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => isAdminAuth || isAdminAuthenticated());

  // Two-field Private Login State
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Strict isolated workspace: never fall back to workspaces[0]
  const activeClient = useMemo(() => {
    if (!activeClientId) return null;
    return getClientById(activeClientId) || null;
  }, [activeClientId, workspaces]);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'milestones' | 'deliverables' | 'calendar' | 'chat' | 'brief'>('milestones');

  // Revision Modal State
  const [revisionModalItem, setRevisionModalItem] = useState<ClientDeliverable | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  // Approval Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Message input state
  const [newMessageText, setNewMessageText] = useState('');

  // In-Profile Brief Submission Form State
  const [isBriefFormOpen, setIsBriefFormOpen] = useState(false);
  const [briefTrack, setBriefTrack] = useState('دپارتمان برندینگ');
  const [briefTier, setBriefTier] = useState('لوکس و پرمیوم / دارایی‌محور (High-Ticket)');
  const [briefProblem, setBriefProblem] = useState('');
  const [briefDeliverables, setBriefDeliverables] = useState('');
  const [briefDeadline, setBriefDeadline] = useState('');
  const [briefBenchmarks, setBriefBenchmarks] = useState('');

  // Personal Brand Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newCategory, setNewCategory] = useState('سلامت، زیبایی و پزشکی');
  const [newGoal, setNewGoal] = useState('جذب کلاینت‌ها و مشتریان لوکس و باکیفیت');
  const [newTone, setNewTone] = useState('سینمایی و فاخر (Creativity Juice Style)');
  const [newPlatforms] = useState<string[]>(['اینستاگرام']);
  const [newLogo, setNewLogo] = useState('🌟');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    setAdminUnlocked(isAdminAuth || isAdminAuthenticated());
  }, [isAdminAuth]);

  // Sync with store events
  useEffect(() => {
    const handleSync = () => {
      setWorkspaces(getClientWorkspaces());
      setLocalActiveId(getActiveClientId());
      setAdminUnlocked(isAdminAuth || isAdminAuthenticated());
    };
    window.addEventListener(CLIENT_PORTAL_EVENT, handleSync);
    window.addEventListener(CJ_STUDIO_DATA_EVENT, handleSync);
    return () => {
      window.removeEventListener(CLIENT_PORTAL_EVENT, handleSync);
      window.removeEventListener(CJ_STUDIO_DATA_EVENT, handleSync);
    };
  }, [isAdminAuth]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4200);
  };

  // Handle Private Login by Tracking Code / Username + Password
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifierInput.trim()) {
      setLoginError('لطفاً کد رهگیری یکتا یا نام کاربری پروژه خود را وارد نمایید.');
      return;
    }
    if (!passwordInput.trim()) {
      setLoginError('لطفاً رمز عبور (پسورد) اختصاصی پروژه خود را وارد نمایید.');
      return;
    }

    const matched = authenticateClient(identifierInput, passwordInput);
    if (matched) {
      setActiveClientId(matched.id);
      setLocalActiveId(matched.id);
      setIdentifierInput('');
      setPasswordInput('');
      setLoginError(null);
      showToast(`خوش آمدید! به فضای کار اختصاصی «${matched.brandName}» وارد شدید.`);
    } else {
      setLoginError(
        'کد رهگیری / نام کاربری یا رمز عبور اشتباه است. هر کارفرما تنها به پروفایل اختصاصی خود دسترسی دارد.'
      );
    }
  };

  const handleAdminDirectLogin = (client: ClientWorkspace) => {
    if (!adminUnlocked) return;
    setActiveClientId(client.id);
    setLocalActiveId(client.id);
    setLoginError(null);
    showToast(`[دسترسی مدیریت] وارد پروفایل «${client.brandName}» شدید.`);
  };

  const handleLogout = () => {
    setActiveClientId(null);
    setLocalActiveId(null);
    setActiveTab('milestones');
  };

  const handleCreatePersonalBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('لطفاً نام یا عنوان پرسونال برند خود را وارد کنید.');
      return;
    }
    if (!newPassword.trim()) {
      showToast('لطفاً یک رمز عبور اختصاصی برای محافظت از پروفایل خود تعیین کنید.');
      return;
    }

    const created = createPersonalBrandWorkspace({
      name: newName.trim(),
      position: newPosition.trim() || 'تولیدکننده محتوا و متخصص',
      category: newCategory.trim() || 'سوشال مدیا',
      goal: newGoal || 'جذب کلاینت و ارتقای اعتبار',
      tone: newTone || 'سینمایی و حرفه‌ای',
      platforms: newPlatforms.length > 0 ? newPlatforms : ['اینستاگرام'],
      logoBadge: newLogo || '🌟',
      username: newUsername.trim() || undefined,
      password: newPassword.trim(),
    });

    setWorkspaces(getClientWorkspaces());
    setLocalActiveId(created.id);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewPosition('');
    setNewUsername('');
    setNewPassword('');
    showToast(
      `🎉 پروفایل «${created.brandName}» با کد رهگیری یکتا ${created.trackingCode} و رمز عبور اختصاصی شما ایجاد شد.`
    );
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    if (!adminUnlocked && activeClient?.id !== id) return;
    deleteClientWorkspace(id);
    setWorkspaces(getClientWorkspaces());
    setLocalActiveId(null);
    showToast(`فضای کاربری «${name}» حذف شد.`);
  };

  // Handle Deliverable Approval
  const handleApprove = (deliverableId: string, title: string) => {
    if (!activeClient) return;
    updateDeliverableApproval(activeClient.id, deliverableId, 'approved', 'نسخه توسط کارفرما تایید شد.');
    setWorkspaces(getClientWorkspaces());
    showToast(`✓ نسخه «${title}» با موفقیت تأیید شد و جهت انتشار نهایی ثبت گردید.`);
  };

  // Open Revision Modal
  const handleOpenRevision = (item: ClientDeliverable) => {
    setRevisionModalItem(item);
    setRevisionNote(item.clientFeedback || '');
  };

  // Submit Revision
  const handleSubmitRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !revisionModalItem || !revisionNote.trim()) return;

    updateDeliverableApproval(activeClient.id, revisionModalItem.id, 'revision-requested', revisionNote.trim());
    setWorkspaces(getClientWorkspaces());
    setRevisionModalItem(null);
    setRevisionNote('');
    showToast(`درخواست اصلاحیه برای تیم استودیو ارسال و ثبت شد.`);
  };

  // Send Direct Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !newMessageText.trim()) return;

    addClientMessage(activeClient.id, activeClient.ownerName || 'کارفرما', newMessageText.trim(), 'client');
    setWorkspaces(getClientWorkspaces());
    setNewMessageText('');
  };

  // Submit & Archive Brief from inside Client Profile
  const handleSubmitProfileBrief = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient || !briefProblem.trim()) {
      showToast('لطفاً شرح نیاز و صورت‌مسئله پروژه را وارد نمایید.');
      return;
    }

    const fullText = [
      `=== بریف ثبت‌شده از داخل پورتال اختصاصی کارفرما ===`,
      `• نام برند: ${activeClient.brandName}`,
      `• صاحب پروژه: ${activeClient.ownerName}`,
      `• کد رهگیری پروژه: ${activeClient.trackingCode || activeClient.pinCode}`,
      `• دپارتمان انتخابی: ${briefTrack}`,
      `• رده بازار: ${briefTier}`,
      `• صورت‌مسئله و هدف پروژه: ${briefProblem}`,
      `• خروجی‌های مورد نیاز: ${briefDeliverables || '-'}`,
      `• ددلاین و زمان‌بندی: ${briefDeadline || '-'}`,
      `• مراجع سلیقه‌ای و توضیحات تکمیلی: ${briefBenchmarks || '-'}`,
    ].join('\n');

    submitAndArchiveProjectBrief({
      clientId: activeClient.id,
      existingTrackingCode: activeClient.trackingCode,
      clientName: activeClient.brandName,
      ownerName: activeClient.ownerName,
      selectedTrack: briefTrack,
      marketTier: briefTier,
      problem: briefProblem.trim(),
      brandingDeliverables: briefDeliverables ? [briefDeliverables] : [],
      deadline: briefDeadline,
      benchmarks: briefBenchmarks,
      fullSummaryText: fullText,
    });

    setWorkspaces(getClientWorkspaces());
    setBriefProblem('');
    setBriefDeliverables('');
    setBriefDeadline('');
    setBriefBenchmarks('');
    setIsBriefFormOpen(false);
    showToast(
      `✓ بریف جدید در آرشیو پروژه (${activeClient.trackingCode}) ذخیره شد و برای مدیریت استودیو ارسال گردید.`
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-neutral-950 text-amber-300 text-xs font-bold px-4 py-2.5 flex items-center justify-between gap-3 shadow-md border-b border-amber-500/30 shrink-0 animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">✨</span>
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* If Not Logged In: Private Client Gate (No Public Listing of Other Projects) */}
      {!activeClient ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start max-w-4xl mx-auto w-full space-y-6">
          {/* Private Client Login Card */}
          <div className="w-full max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-5 mt-2">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-neutral-900 text-amber-400 font-mono text-[10px] font-black tracking-wider">
                    PRIVATE CLIENT GATE
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    🔒 دسترسی کاملاً خصوصی
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-950 pt-1">
                  ورود به پروفایل اختصاصی پروژه
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  هر کارفرما تنها با کد رهگیری یکتا (یا نام کاربری) و رمز عبور اختصاصی خود به پرونده پروژه، فایل‌های تحویلی و بریف‌های آرشیوشده دسترسی دارد.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-neutral-950 text-amber-400 flex items-center justify-center text-xl shadow-xs shrink-0">
                🔐
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  کد رهگیری پروژه یا نام کاربری یکتا:
                </label>
                <input
                  type="text"
                  value={identifierInput}
                  onChange={(e) => {
                    setIdentifierInput(e.target.value);
                    setLoginError(null);
                  }}
                  placeholder="مثال: CJ-1001 یا نام کاربری اختصاصی شما"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 bg-neutral-50/70 focus:bg-white font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  رمز عبور (پسورد اختصاصی):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs sm:text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 bg-neutral-50/70 focus:bg-white font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer px-1.5 py-0.5 rounded bg-neutral-100"
                  >
                    {showPassword ? 'مخفی' : 'نمایش'}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2 leading-relaxed">
                  <span className="shrink-0">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 active:scale-[0.99] text-amber-400 font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <span>ورود به پروفایل اختصاصی من</span>
                <span>⟵</span>
              </button>
            </form>

            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
              <span>🛡️ حریم خصوصی کارفرمایان؛ عدم نمایش سایر پروژه‌ها در پورتال</span>
              <span>پشتیبانی استودیو Creativity Juice</span>
            </div>
          </div>

          {/* Action Cards: New Brief (Auto Tracking Code) & Public Portfolio Link */}
          <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                  NEW PROJECT BRIEF
                </span>
                <h3 className="text-xs sm:text-sm font-black text-neutral-950 pt-0.5">
                  پروژه جدید دارید؟ بریف خود را ثبت کنید
                </h3>
                <p className="text-[11px] text-neutral-700 leading-relaxed">
                  با تکمیل فرم بریف، به صورت خودکار کد رهگیری یکتا و پسورد اختصاصی پورتال برای شما صادر شده و بریف برای مدیریت استودیو ارسال می‌شود.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenBrief) {
                    onOpenBrief('ثبت بریف پروژه جدید و دریافت کد رهگیری پورتال');
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>🚀</span>
                <span>ثبت بریف و دریافت کد رهگیری</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-neutral-200 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                  PUBLIC PORTFOLIO
                </span>
                <h3 className="text-xs sm:text-sm font-black text-neutral-950 pt-0.5">
                  مشاهده نمونه کارهای عمومی استودیو
                </h3>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  سایر پروژه‌ها و پرونده‌های استودیو به منظور حفظ محرمانگی کارفرمایان فقط در بخش عمومی «نمونه کارها» قابل مشاهده هستند.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-gallery-window'));
                    if (onClose) onClose();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all cursor-pointer text-center"
                >
                  مشاهده نمونه کارها
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
                  title="ساخت پروفایل پرسونال برند شخصی با رمز اختصاصی"
                >
                  + برند شخصی
                </button>
              </div>
            </div>
          </div>

          {/* ADMIN-ONLY OVERVIEW (Strictly hidden unless authenticated in Studio Admin Gate) */}
          {adminUnlocked && (
            <div className="w-full max-w-3xl bg-neutral-900 text-white p-5 rounded-3xl border border-amber-500/40 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-mono text-[10px] font-black">
                    STUDIO ADMIN ACCESS ONLY
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-amber-300">
                    لیست مدیریتی پروژه‌ها و کدهای رهگیری (فقط قابل مشاهده برای مدیر استودیو)
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400">
                  تعداد کل پروفایل‌ها: {workspaces.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {workspaces.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleAdminDirectLogin(client)}
                    className="p-3 rounded-2xl bg-neutral-800/90 hover:bg-neutral-800 border border-neutral-700 hover:border-amber-400 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span>{client.logoBadge}</span>
                        <h4 className="text-xs font-bold text-white truncate">{client.brandName}</h4>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-300 mt-1 flex flex-wrap items-center gap-2">
                        <span className="bg-neutral-950 px-1.5 py-0.5 rounded text-amber-400">
                          کد: {client.trackingCode || `CJ-${client.pinCode}`}
                        </span>
                        <span className="bg-neutral-950 px-1.5 py-0.5 rounded text-emerald-400">
                          کاربر: {client.username || client.slug}
                        </span>
                        <span className="bg-neutral-950 px-1.5 py-0.5 rounded text-rose-300">
                          پسورد: {client.password || client.pinCode}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 shrink-0">
                      ورود مدیر ⟵
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Logged In Active Workspace View (Strictly Isolated to Authenticated Client) */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Brand Identity Bar */}
          <div className="px-4 py-3 bg-white border-b border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-xl shadow-xs">
                {activeClient.logoBadge}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-neutral-950">
                    {activeClient.brandName}
                  </h2>
                  <span
                    className="px-2 py-0.5 rounded-md bg-neutral-900 text-amber-400 font-mono text-[10px] font-black"
                    dir="ltr"
                  >
                    {activeClient.trackingCode || `CJ-${activeClient.pinCode}`}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      activeClient.isPersonalBrand
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                    }`}
                  >
                    {activeClient.isPersonalBrand ? '🌟 پرسونال برند اختصاصی' : '💼 پروژه رسمی استودیو'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>
                    کارفرما: <strong className="text-neutral-700">{activeClient.ownerName}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    نام کاربری: <strong className="font-mono text-neutral-800">{activeClient.username || activeClient.slug}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    {activeClient.isPersonalBrand ? 'مشاور برندینگ:' : 'مدیر پروژه:'}{' '}
                    <strong className="text-neutral-900 font-bold">{activeClient.projectLead}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('brief');
                  setIsBriefFormOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span>📋</span>
                <span>ثبت بریف جدید در پرونده</span>
              </button>

              {/* Progress Summary Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <span className="text-neutral-600 font-medium">پیشرفت:</span>
                <span className="font-mono font-black text-neutral-900">{activeClient.progressPercent}%</span>
                <div className="w-14 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${activeClient.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Client Switcher ONLY for Authenticated Studio Admin */}
              {adminUnlocked && (
                <select
                  value={activeClient.id}
                  onChange={(e) => {
                    const target = workspaces.find((w) => w.id === e.target.value);
                    if (target) handleAdminDirectLogin(target);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-amber-400 bg-amber-50 text-neutral-900 text-xs font-bold outline-none cursor-pointer max-w-[190px] truncate"
                  title="سوییچ مدیریتی بین پروژه‌ها (فقط ادمین)"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      [{w.trackingCode || w.pinCode}] {w.brandName.slice(0, 20)}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="خروج امن از پروفایل اختصاصی"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">خروج از حساب</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="px-4 bg-[#F5F2EB] border-b border-neutral-200 flex items-center justify-between overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1 py-1.5">
              <button
                onClick={() => setActiveTab('milestones')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'milestones'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <span>🗂️</span>
                <span>داشبورد پروژه من و تایم‌لاین</span>
              </button>

              <button
                onClick={() => setActiveTab('deliverables')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 relative ${
                  activeTab === 'deliverables'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <span>📦</span>
                <span>میز تحویل و تایید فایل‌ها ({activeClient.deliverables.length})</span>
                {activeClient.deliverables.some((d) => d.status === 'pending-review') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <span>🗓️</span>
                <span>تقویم انتشار اختصاصی ({activeClient.calendar.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <span>💬</span>
                <span>مکاتبات با استودیو ({activeClient.feedbacks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('brief')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'brief'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                }`}
              >
                <span>📋</span>
                <span>بریف‌های آرشیوشده و اطلاعات پروژه ({(activeClient.archivedBriefs || []).length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Dedicated Client Project OS Dashboard & Timelines */}
          {activeTab === 'milestones' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <Dashboard
                activeClient={activeClient}
                onSelectProject={onSelectProject}
                onOpenBrief={onOpenBrief}
                onOpenCalendar={() => setActiveTab('calendar')}
                onApproveDeliverable={handleApprove}
                onRequestRevision={handleOpenRevision}
                onSwitchTab={setActiveTab}
              />
            </div>
          )}

          {/* Tab 2: Deliverables & Approvals Hub */}
          {activeTab === 'deliverables' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-neutral-900 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">💎</span>
                  <span className="font-bold">
                    میز بازبینی خروجی‌ها: فایل‌های بارگذاری شده را بررسی نموده و تأییدیه یا درخواست اصلاحیه خود را ثبت فرمایید.
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  تأییدیه مستقیم کارفرما
                </span>
              </div>

              {activeClient.deliverables.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200 space-y-2">
                  <span className="text-3xl">📦</span>
                  <h4 className="text-sm font-black text-neutral-900">
                    فایل‌های خروجی پروژه در حال آماده‌سازی در استودیو هستند
                  </h4>
                  <p className="text-xs text-neutral-500">
                    به محض بارگذاری نخستین نسخه توسط مدیر پروژه، در این بخش قابل مشاهده و تایید خواهد بود.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeClient.deliverables.map((item) => {
                    const isApproved = item.status === 'approved';
                    const isRevision = item.status === 'revision-requested';

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-video bg-neutral-900 overflow-hidden group">
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                                {item.format}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
                                {item.fileSize}
                              </span>
                            </div>

                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-mono text-[10px] font-black">
                                {item.version}
                              </span>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform">
                                {item.type === 'video' || item.type === 'reels' ? '▶' : '👁️'}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-black text-neutral-900 leading-snug">
                                {item.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : isRevision
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isApproved ? 'bg-emerald-500' : isRevision ? 'bg-rose-500' : 'bg-amber-500'
                                  }`}
                                />
                                {isApproved ? 'تأیید نهایی شده' : isRevision ? 'درخواست اصلاحیه ثبت شده' : 'در انتظار بررسی کارفرما'}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono">
                                {item.dateUploaded}
                              </span>
                            </div>

                            {item.clientFeedback && (
                              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-700 leading-relaxed">
                                <strong className="text-neutral-900 block mb-0.5">یادداشت ثبت شده:</strong>
                                {item.clientFeedback}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-50 border-t border-neutral-200/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(item.id, item.title)}
                              disabled={isApproved}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-700 opacity-60 cursor-default'
                                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xs active:scale-95'
                              }`}
                            >
                              <span>✓</span>
                              <span>{isApproved ? 'تایید شد' : 'تایید نسخه'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenRevision(item)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-white text-neutral-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <span>✏️</span>
                              <span>ثبت اصلاحیه</span>
                            </button>
                          </div>

                          <button
                            onClick={() => showToast(`لینک دانلود نسخه مستر ${item.title} برای شما آماده شد.`)}
                            className="px-2.5 py-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 text-xs font-bold transition-colors cursor-pointer"
                            title="دانلود فایل باکیفیت"
                          >
                            📥 دانلود
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Dedicated Content Calendar */}
          {activeTab === 'calendar' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-neutral-900">
                    تقویم انتشار اختصاصی {activeClient.brandName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    برنامه‌ریزی، زمان‌بندی و کپشن‌های آماده شده توسط تیم استودیو (کاملاً مجزا برای این پروفایل)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-calendar-window'))}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>🗓️</span>
                  <span>باز کردن تقویم کامل دسکتاپ</span>
                </button>
              </div>

              {activeClient.calendar.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200/90 shadow-2xs space-y-2">
                  <div className="text-3xl">🗓️</div>
                  <h4 className="text-sm font-black text-neutral-900">
                    تقویم محتوای این ماه در حال تدوین توسط استراتژیست است
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    پست‌ها و ریلزهای جدید پس از تایید سناریوها در این بخش قرار خواهند گرفت.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeClient.calendar.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          {post.platform === 'instagram' ? 'اینستاگرام • ریلز' : post.platform}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          آماده انتشار
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                        {post.title}
                      </h4>

                      <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600 leading-relaxed font-sans">
                        <strong className="block text-neutral-800 text-[11px] mb-1">پیش‌نویس کپشن و سناریو:</strong>
                        {post.captionDraft}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-[10px] text-neutral-500 font-mono">
                        <span>تاریخ انتشار: <strong className="text-neutral-800">{post.persianDate}</strong></span>
                        <span>{post.scheduledDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Messages & Direct Feedback */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6">
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-white rounded-2xl border border-neutral-200 mb-3 shadow-2xs">
                {activeClient.feedbacks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-2">
                    <span className="text-3xl">💬</span>
                    <p className="text-xs">
                      هنوز پیامی بین شما و تیم استودیو رد و بدل نشده است. می‌توانید نخستین یادداشت را بنویسید.
                    </p>
                  </div>
                ) : (
                  activeClient.feedbacks.map((msg) => {
                    const isClient = msg.role === 'client';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
                          isClient ? 'mr-auto items-end' : 'ml-auto items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 mb-1 px-1">
                          <span>{msg.author}</span>
                          <span>•</span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isClient
                              ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-xs shadow-2xs'
                              : 'bg-neutral-100 text-neutral-800 rounded-tl-xs'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`ارسال پیام مستقیم به مدیر پروژه (${activeClient.projectLead})...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none bg-white shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                >
                  ارسال پیام
                </button>
              </form>
            </div>
          )}

          {/* Tab 5: Briefs Archive & Scope */}
          {activeTab === 'brief' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Project Credentials & Core Scope */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="border-b border-neutral-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        PROJECT DOSSIER // {activeClient.trackingCode || `CJ-${activeClient.pinCode}`}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        نام کاربری: {activeClient.username || activeClient.slug}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-neutral-900 mt-1">
                      خلاصه توافقات، کد رهگیری و آرشیو بریف‌های پروژه
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBriefFormOpen((prev) => !prev)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>+</span>
                      <span>ثبت بریف جدید برای این پروژه</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-notes-window'))}
                      className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>📝</span>
                      <span>یادداشت‌های اختصاصی برند</span>
                    </button>
                  </div>
                </div>

                {/* Inline New Brief Form inside Client Profile */}
                {isBriefFormOpen && (
                  <form
                    onSubmit={handleSubmitProfileBrief}
                    className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-black text-neutral-950">
                        فرم ثبت و آرشیو بریف جدید برای پروژه «{activeClient.brandName}»
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                        ارسال مستقیم به مدیریت استودیو
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          دپارتمان و مسیر مورد نیاز:
                        </label>
                        <select
                          value={briefTrack}
                          onChange={(e) => setBriefTrack(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-900 outline-none"
                        >
                          <option value="دپارتمان برندینگ">دپارتمان برندینگ (هویت بصری و استراتژی)</option>
                          <option value="دپارتمان مارکتینگ و تولید محتوا">دپارتمان مارکتینگ و تولید محتوا</option>
                          <option value="هر دو دپارتمان (پکیج جامع استودیو)">هر دو دپارتمان (پکیج جامع استودیو)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          رده بازار هدف:
                        </label>
                        <select
                          value={briefTier}
                          onChange={(e) => setBriefTier(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-900 outline-none"
                        >
                          <option value="لوکس و پرمیوم / دارایی‌محور (High-Ticket)">لوکس و پرمیوم / دارایی‌محور</option>
                          <option value="میان‌رده باکیفیت (Mid-Tier Standard)">میان‌رده باکیفیت</option>
                          <option value="اقتصادی و عمومی (Mass Market)">اقتصادی و عمومی</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-800 mb-1">
                        شرح نیاز، هدف کمپین یا صورت‌مسئله جدید: <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={briefProblem}
                        onChange={(e) => setBriefProblem(e.target.value)}
                        placeholder="جزئیات درخواست، هدف پروژه یا فاز جدید مد نظر خود را بنویسید..."
                        className="w-full p-3 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          خروجی‌های مورد انتظار:
                        </label>
                        <input
                          type="text"
                          value={briefDeliverables}
                          onChange={(e) => setBriefDeliverables(e.target.value)}
                          placeholder="مثال: تیزر 4K، ریلز، ری‌برندینگ"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          ددلاین یا زمان‌بندی مد نظر:
                        </label>
                        <input
                          type="text"
                          value={briefDeadline}
                          onChange={(e) => setBriefDeadline(e.target.value)}
                          placeholder="مثال: پایان ماه جاری"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-neutral-800 mb-1">
                          مراجع سلیقه‌ای / توضیحات:
                        </label>
                        <input
                          type="text"
                          value={briefBenchmarks}
                          onChange={(e) => setBriefBenchmarks(e.target.value)}
                          placeholder="مثال: مینیمال، سینمایی"
                          className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white text-xs text-neutral-900 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsBriefFormOpen(false)}
                        className="px-4 py-2 rounded-xl border border-neutral-300 bg-white text-xs font-bold text-neutral-700 cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-amber-400 text-xs font-black cursor-pointer shadow-xs"
                      >
                        ثبت در آرشیو پروژه و ارسال به مدیریت
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 text-xs leading-relaxed text-neutral-700">
                  <strong className="block text-neutral-900 text-sm">چشم‌انداز و دامنه خدمات پروژه:</strong>
                  <p className="whitespace-pre-line">{activeClient.scopeSummary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">
                      کد رهگیری و نام کاربری اختصاصی:
                    </span>
                    <p className="text-xs font-mono font-black text-neutral-900">
                      {activeClient.trackingCode || `CJ-${activeClient.pinCode}`}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-500">
                      User: {activeClient.username || activeClient.slug}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">
                      {activeClient.isPersonalBrand ? 'مشاور ارشد برندسازی:' : 'تیم اجرایی تخصیص‌یافته:'}
                    </span>
                    <p className="text-xs font-bold text-neutral-900">{activeClient.projectLead}</p>
                    <p className="text-[11px] text-neutral-500">{activeClient.projectLeadRole}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">زمان‌بندی و دوره‌ها:</span>
                    <p className="text-xs font-bold text-neutral-900">ثبت پرونده: {activeClient.contractDate}</p>
                    <p className="text-[11px] text-neutral-500">وضعیت: {activeClient.deliveryDate}</p>
                  </div>
                </div>
              </div>

              {/* Archived Briefs List for This Project */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-neutral-900">
                      آرشیو بریف‌های ثبت‌شده برای این پروژه ({(activeClient.archivedBriefs || []).length})
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      تمامی بریف‌های تکمیل‌شده برای این کد رهگیری در این بخش آرشیو شده و در پنل مدیریت استودیو ثبت گردیده‌اند.
                    </p>
                  </div>
                </div>

                {(!activeClient.archivedBriefs || activeClient.archivedBriefs.length === 0) ? (
                  <div className="p-6 rounded-2xl bg-neutral-50 border border-dashed border-neutral-200 text-center space-y-2">
                    <p className="text-xs text-neutral-500">
                      هنوز بریف جداگانه‌ای در آرشیو این پروفایل ثبت نشده است.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsBriefFormOpen(true)}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold cursor-pointer"
                    >
                      ثبت نخستین بریف پروژه
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeClient.archivedBriefs.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-400 font-mono text-[10px] font-bold">
                              {b.trackingCode}
                            </span>
                            <span className="text-xs font-black text-neutral-900">
                              {b.selectedTrack}
                            </span>
                            <span className="text-[11px] text-neutral-500">({b.marketTier})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'in-production'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'reviewed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {b.status === 'in-production'
                                ? 'در حال اجرا در استودیو'
                                : b.status === 'reviewed'
                                ? 'بررسی‌شده توسط مدیریت'
                                : 'ارسال‌شده برای مدیریت استودیو'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">{b.submittedAt}</span>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-800 leading-relaxed">
                          <strong className="text-neutral-950">صورت‌مسئله: </strong>
                          {b.problem}
                        </p>

                        {b.adminNotes && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                            <strong>پاسخ / یادداشت مدیریت استودیو: </strong>
                            {b.adminNotes}
                          </div>
                        )}

                        {(() => {
                          const links = buildBriefForwardLinks(b);
                          return (
                            <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-emerald-700">
                                ✓ همگام‌سازی‌شده با سرور مرکزی و پنل مدیریت استودیو
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <a
                                  href={links.whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                                >
                                  <span>📲</span>
                                  <span>ارسال کپی بریف به واتساپ مدیریت</span>
                                </a>
                                <a
                                  href={links.mailtoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition"
                                >
                                  <span>✉️</span>
                                  <span>ارسال کپی با ایمیل</span>
                                </a>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision Request Modal */}
      {revisionModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setRevisionModalItem(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-neutral-200 space-y-4 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-neutral-950">
                  ثبت اصلاحیه و بازخورد نسخه
                </h3>
                <span className="text-xs text-neutral-500">
                  فایل: {revisionModalItem.title} ({revisionModalItem.version})
                </span>
              </div>
              <button
                onClick={() => setRevisionModalItem(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  توضیحات دقیق اصلاحیه (مثلاً ثانیه ویدیو، رنگ، فونت یا نریشن):
                </label>
                <textarea
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="لطفاً تغییرات مورد نظر خود را با ذکر جزئیات بنویسید..."
                  className="w-full p-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setRevisionModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-black shadow-sm cursor-pointer active:scale-95"
                >
                  ارسال اصلاحیه به تیم استودیو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Personal Brand Creator Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-neutral-200 space-y-4 text-right max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-950">
                    ساخت پروفایل اختصاصی پرسونال برند
                  </h3>
                  <p className="text-xs text-neutral-500">
                    با تعیین نام کاربری و رمز عبور اختصاصی، فضای کار خصوصی شما ایجاد می‌شود
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePersonalBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  نام شما یا عنوان پرسونال برند: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: دکتر کیوان راد ، سارا رستمی ، یا نام برند شما"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    نام کاربری یکتا (جهت ورود):
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: keyvan-rad (اختیاری)"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm text-neutral-900 outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    رمز عبور اختصاصی (پسورد): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="حداقل ۴ کاراکتر"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 bg-white text-xs sm:text-sm text-neutral-900 outline-none font-mono"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    پوزیشن و عنوان تخصصی:
                  </label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="مثال: مشاور املاک لوکس ، مدرس بازارهای مالی"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    حوزه فعالیت و صنعت:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="سلامت، زیبایی و پزشکی">سلامت، زیبایی و پزشکی</option>
                    <option value="املاک، سرمایه‌گذاری و معماری">املاک، سرمایه‌گذاری و معماری</option>
                    <option value="فایننس، اقتصاد، کریپتو و بازارهای مالی">فایننس، اقتصاد و بازارهای مالی</option>
                    <option value="تکنولوژی، هوش مصنوعی و نرم‌افزار">تکنولوژی و هوش مصنوعی</option>
                    <option value="کوچینگ، آموزش و توسعه فردی">کوچینگ و آموزش</option>
                    <option value="هنر، سینما و تولید محتوای خلاق">هنر، سینما و تولید محتوا</option>
                    <option value="فشن، فیتنس و سبک زندگی لوکس">فشن، فیتنس و سبک زندگی</option>
                    <option value="مشاوره حقوقی، کسب‌وکار و B2B">مشاوره حقوقی و کسب‌وکار</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    هدف محوری در سوشال مدیا:
                  </label>
                  <select
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="جذب کلاینت‌ها و مشتریان لوکس و باکیفیت">جذب کلاینت‌ها و مشتریان لوکس و باکیفیت</option>
                    <option value="تثبیت جایگاه به عنوان مرجع و آتوریتی در بازار">تثبیت جایگاه به عنوان مرجع و آتوریتی در بازار</option>
                    <option value="فروش دوره‌ها، خدمات مشاوره و کارگاه‌های آموزشی">فروش دوره‌ها و خدمات مشاوره</option>
                    <option value="رشد ارگانیک و جذب اسپانسرهای معتبر">رشد ارگانیک و جذب اسپانسر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    لحن و استایل محتوا:
                  </label>
                  <select
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none bg-white cursor-pointer"
                  >
                    <option value="سینمایی و فاخر (Creativity Juice Style)">سینمایی و فاخر (Creativity Juice)</option>
                    <option value="جدی، علمی، موقر و موثق (Authority)">جدی، علمی و موثق (Authority)</option>
                    <option value="گرم، صمیمی، پویا و انگیزشی">گرم، صمیمی و پویا</option>
                    <option value="مینیمال، لوکس و گزیده‌گو (Quiet Luxury)">مینیمال، لوکس و گزیده‌گو</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  نشان و آیکون برند:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['🌟', '🚀', '👑', '💎', '🎯', '🎙️', '💡', '🎬', '💼', '🔬', '⚡', '🔮'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewLogo(emoji)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        newLogo === emoji
                          ? 'bg-amber-400 border-amber-500 scale-110 shadow-xs'
                          : 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-black shadow-md cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <span>✨</span>
                  <span>ایجاد پروفایل خصوصی و دریافت کد رهگیری</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientPortalWindow;
