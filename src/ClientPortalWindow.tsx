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
  findClientByPinOrSlug,
  updateDeliverableApproval,
  addClientMessage,
  createPersonalBrandWorkspace,
  deleteClientWorkspace,
  CLIENT_PORTAL_EVENT,
} from './clientPortalStore';

interface ClientPortalWindowProps {
  onClose?: () => void;
  isAdminAuth?: boolean;
}

export const ClientPortalWindow: React.FC<ClientPortalWindowProps> = ({
  onClose,
  isAdminAuth = false,
}) => {
  const [workspaces, setWorkspaces] = useState<ClientWorkspace[]>(getClientWorkspaces);
  const [activeClientId, setLocalActiveId] = useState<string | null>(getActiveClientId);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active workspace state
  const activeClient = useMemo(() => {
    if (!activeClientId) return null;
    return getClientById(activeClientId) || workspaces[0] || null;
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

  // Personal Brand Creation Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newCategory, setNewCategory] = useState('سلامت و پزشکی');
  const [newGoal, setNewGoal] = useState('جذب کلاینت و مراجعین پرمیوم');
  const [newTone, setNewTone] = useState('سینمایی و فاخر (Creativity Juice Style)');
  const [newPlatforms, setNewPlatforms] = useState<string[]>(['اینستاگرام']);
  const [newLogo, setNewLogo] = useState('🌟');
  const [newPin, setNewPin] = useState('');
  const [workspaceFilter, setWorkspaceFilter] = useState<'all' | 'personal' | 'clients'>('all');

  const handleCreatePersonalBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('لطفاً نام یا عنوان پرسونال برند خود را وارد کنید.');
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
      pinCode: newPin.trim() || undefined,
    });

    setWorkspaces(getClientWorkspaces());
    setLocalActiveId(created.id);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewPosition('');
    setNewPin('');
    showToast(`🎉 تبریک! پرسونال برند «${created.brandName}» ساخته شد و پنل شما آماده فعالیت است.`);
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    if (window.confirm(`آیا مایلید فضای پرسونال برند «${name}» حذف گردد؟`)) {
      deleteClientWorkspace(id);
      setWorkspaces(getClientWorkspaces());
      setLocalActiveId(null);
      showToast(`فضای کاربری «${name}» حذف شد.`);
    }
  };

  // Sync with store events
  useEffect(() => {
    const handleSync = () => {
      setWorkspaces(getClientWorkspaces());
      setLocalActiveId(getActiveClientId());
    };
    window.addEventListener(CLIENT_PORTAL_EVENT, handleSync);
    return () => window.removeEventListener(CLIENT_PORTAL_EVENT, handleSync);
  }, []);

  // Handle Login by PIN or Slug
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!pinInput.trim()) {
      setLoginError('لطفاً کد دسترسی یا شناسه برند خود را وارد کنید.');
      return;
    }

    const found = findClientByPinOrSlug(pinInput);
    if (found) {
      setActiveClientId(found.id);
      setLocalActiveId(found.id);
      setPinInput('');
      setLoginError(null);
      showToast(`خوش آمدید! به فضای اختصاصی ${found.brandName} وارد شدید.`);
    } else {
      setLoginError('کد دسترسی نامعتبر است. می‌توانید از دکمه‌های ورود سریع زیر برای تست استفاده کنید.');
    }
  };

  const handleQuickLogin = (client: ClientWorkspace) => {
    setActiveClientId(client.id);
    setLocalActiveId(client.id);
    setLoginError(null);
    showToast(`فضای کار اختصاصی «${client.brandName}» بارگذاری شد.`);
  };

  const handleLogout = () => {
    setActiveClientId(null);
    setLocalActiveId(null);
    setActiveTab('milestones');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
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

      {/* If Not Logged In: Login & Brand Discovery Screen */}
      {!activeClient ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start max-w-5xl mx-auto w-full space-y-6">
          {/* Main Hero Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 text-[11px] font-bold mb-1">
              <span>🌟</span>
              <span>سامانه برندسازی، تولید محتوا و مدیریت سوشال مدیا</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-950 tracking-tight">
              فضای کار پرسونال برند و کارفرمایان استودیو
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              هر فعال و تولیدکننده محتوا در سوشال مدیا می‌تواند بر پایه بریف‌ها و متدولوژی استودیو Creativity Juice، پنل پرسونال برند اختصاصی خود را بسازد و تقویم، سناریوها و هویت برند خود را مدیریت کند.
            </p>
          </div>

          {/* Action CTA Hero Banner: Build Personal Brand Workspace */}
          <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-5 sm:p-6 shadow-md border border-amber-300 text-neutral-950 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-right">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-2xl">✨</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  می‌خواهید در سوشال مدیا پرسونال برند خود را بسازید؟
                </h3>
              </div>
              <p className="text-xs text-neutral-900/85 max-w-xl font-medium leading-relaxed">
                بدون نیاز به قرارداد، در ۱۰ ثانیه پنل اختصاصی خود را بسازید: تقویم انتشار محتوا، اسناد استراتژی، فرمول سناریونویسی ریلز و بریف هویتی بر اساس استانداردهای سینمایی Creativity Juice.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap"
            >
              <span>🚀</span>
              <span>ساخت پرسونال برند من (رایگان و همگانی)</span>
            </button>
          </div>

          {/* Direct PIN & Search Form */}
          <div className="w-full max-w-xl bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <form onSubmit={handleLoginSubmit} className="space-y-2.5">
              <label className="block text-xs font-bold text-neutral-700">
                کد دسترسی (PIN)، نام یا شناسه برند:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="مثال: yousefzadeh ، 1001 ، dr-peiravi یا نام برند شخصی شما"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 bg-neutral-50/50 focus:bg-white"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-xs transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  ورود به فضا
                </button>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}
            </form>

            <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-2 border-t border-neutral-100">
              <span>🔐 دسترسی امن با ذخیره‌سازی ایزوله در سیستم</span>
              <span>پشتیبانی: استودیو Creativity Juice</span>
            </div>
          </div>

          {/* Workspaces Categorized Directory */}
          <div className="w-full space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2.5">
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl">
                <button
                  onClick={() => setWorkspaceFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    workspaceFilter === 'all'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  همه فضاها ({workspaces.length})
                </button>
                <button
                  onClick={() => setWorkspaceFilter('personal')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    workspaceFilter === 'personal'
                      ? 'bg-amber-400 text-neutral-950 font-black shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>🌟</span>
                  <span>پرسونال برندها ({workspaces.filter((w) => w.isPersonalBrand).length})</span>
                </button>
                <button
                  onClick={() => setWorkspaceFilter('clients')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    workspaceFilter === 'clients'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <span>💼</span>
                  <span>کارفرمایان رسمی ({workspaces.filter((w) => !w.isPersonalBrand).length})</span>
                </button>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
              >
                <span>+</span>
                <span>ساخت پرسونال برند جدید</span>
              </button>
            </div>

            {/* Empty state for personal brands filter */}
            {workspaceFilter === 'personal' && workspaces.filter((w) => w.isPersonalBrand).length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-amber-300 space-y-3">
                <span className="text-3xl">🌟</span>
                <h4 className="text-sm font-black text-neutral-900">
                  هنوز پرسونال برندی ایجاد نکرده‌اید
                </h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  شما می‌توانید با کلیک روی دکمه زیر، حوزه فعالیت، اهداف و لحن محتوای خود را تعیین کرده و پنل اختصاصی پرسونال برند خود را بسازید.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>✨</span>
                  <span>ساخت نخستین پرسونال برند</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {workspaces
                  .filter((client) => {
                    if (workspaceFilter === 'personal') return client.isPersonalBrand;
                    if (workspaceFilter === 'clients') return !client.isPersonalBrand;
                    return true;
                  })
                  .map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleQuickLogin(client)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between text-right relative ${
                        client.isPersonalBrand
                          ? 'bg-amber-50/40 border-amber-300/80 hover:border-amber-500 hover:shadow-md'
                          : 'bg-white border-neutral-200 hover:border-amber-400 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{client.logoBadge}</span>
                          <div className="flex items-center gap-1.5">
                            {client.isPersonalBrand && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-bold text-[9px]">
                                پرسونال برند
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono text-[10px] font-bold text-neutral-600">
                              PIN: {client.pinCode}
                            </span>
                            {client.isPersonalBrand && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkspace(client.id, client.brandName);
                                }}
                                className="w-5 h-5 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center text-xs transition-colors cursor-pointer"
                                title="حذف این پرسونال برند"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-neutral-900 group-hover:text-amber-800 transition-colors">
                            {client.brandName}
                          </h4>
                          <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                            {client.category}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                        <span className="text-neutral-600 font-medium truncate max-w-[170px]">
                          {client.isPersonalBrand ? 'پرسونال برند عمومی' : `مدیر: ${client.projectLead}`}
                        </span>
                        <span className="text-amber-600 font-bold group-hover:translate-x-[-2px] transition-transform shrink-0">
                          ورود به پنل ⟵
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Logged In Active Workspace View */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Brand Identity Bar */}
          <div className="px-4 py-3 bg-white border-b border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-900 text-white flex items-center justify-center text-xl shadow-xs">
                {activeClient.logoBadge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-neutral-950">
                    {activeClient.brandName}
                  </h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    activeClient.isPersonalBrand
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-neutral-100 text-neutral-800 border-neutral-300'
                  }`}>
                    {activeClient.isPersonalBrand ? '🌟 پرسونال برند اختصاصی' : '💼 پروژه رسمی استودیو'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                  <span>صاحب فضا: <strong className="text-neutral-700">{activeClient.ownerName}</strong></span>
                  <span>•</span>
                  <span>{activeClient.isPersonalBrand ? 'مشاور برندینگ:' : 'مدیر پروژه:'} <strong className="text-neutral-900 font-bold">{activeClient.projectLead}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
                title="ساخت یک پرسونال برند جدید"
              >
                <span>+</span>
                <span>ساخت پرسونال برند جدید</span>
              </button>

              {activeClient.isPersonalBrand && (
                <button
                  type="button"
                  onClick={() => handleDeleteWorkspace(activeClient.id, activeClient.brandName)}
                  className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  title="حذف این فضای پرسونال برند"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">حذف فضا</span>
                </button>
              )}

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

              {/* Client Switcher for Admins or Testing */}
              <select
                value={activeClient.id}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreateModalOpen(true);
                    return;
                  }
                  const target = workspaces.find((w) => w.id === e.target.value);
                  if (target) handleQuickLogin(target);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-bold outline-none cursor-pointer hover:bg-neutral-100 max-w-[170px] sm:max-w-[210px] truncate"
                title="تغییر سریع برند"
              >
                {workspaces.filter((w) => w.isPersonalBrand).length > 0 && (
                  <optgroup label="🌟 پرسونال برندها">
                    {workspaces
                      .filter((w) => w.isPersonalBrand)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.brandName.slice(0, 22)}...
                        </option>
                      ))}
                  </optgroup>
                )}
                <optgroup label="💼 کارفرمایان استودیو">
                  {workspaces
                    .filter((w) => !w.isPersonalBrand)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.brandName.slice(0, 22)}...
                      </option>
                    ))}
                </optgroup>
                <option value="__new__">+ ساخت پرسونال برند جدید...</option>
              </select>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="خروج از این فضا"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">خروج</span>
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
                <span>🗺️</span>
                <span>فازها و نقشه راه ({activeClient.milestones.length})</span>
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
                <span>مکاتبات و بازخوردها ({activeClient.feedbacks.length})</span>
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
                <span>بریف و قرارداد</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Milestones & Project Roadmap */}
          {activeTab === 'milestones' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-neutral-900">
                    نقشه راه پیشرفت پروژه
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    قرارداد منعقد شده در تاریخ {activeClient.contractDate} • هدف تحویل نهایی: {activeClient.deliveryDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    وضعیت کلی: در جریان پروداکشن
                  </span>
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="space-y-3">
                {activeClient.milestones.map((ms, idx) => {
                  const isDone = ms.status === 'completed';
                  const isProgress = ms.status === 'in-progress';

                  return (
                    <div
                      key={ms.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-white border-neutral-200 shadow-2xs'
                          : isProgress
                          ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                          : 'bg-neutral-100/60 border-neutral-200/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isProgress
                                ? 'bg-amber-500 text-neutral-950 font-black animate-pulse'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-black text-neutral-900">
                                {ms.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isProgress
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-neutral-200 text-neutral-600'
                                }`}
                              >
                                {isDone ? 'تکمیل شد' : isProgress ? 'در حال اجرا' : 'برنامه‌ریزی آینده'}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                              {ms.description}
                            </p>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                          {ms.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeClient.deliverables.map((item) => {
                  const isApproved = item.status === 'approved';
                  const isRevision = item.status === 'revision-requested';
                  const isPending = item.status === 'pending-review';

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail / Preview header */}
                        <div className="relative aspect-video bg-neutral-900 overflow-hidden group">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                          {/* Format badge */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                              {item.format}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white font-mono text-[10px]">
                              {item.fileSize}
                            </span>
                          </div>

                          {/* Version pill */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-mono text-[10px] font-black">
                              {item.version}
                            </span>
                          </div>

                          {/* Play or view overlay icon */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform">
                              {item.type === 'video' || item.type === 'reels' ? '▶' : '👁️'}
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-neutral-900 leading-snug">
                              {item.title}
                            </h4>
                          </div>

                          {/* Status Pill */}
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

                          {/* Client Feedback Note if exists */}
                          {item.clientFeedback && (
                            <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-[11px] text-neutral-700 leading-relaxed">
                              <strong className="text-neutral-900 block mb-0.5">یادداشت ثبت شده:</strong>
                              {item.clientFeedback}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approval Actions Bar */}
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
                    برنامه‌ریزی، زمان‌بندی و کپشن‌های آماده شده توسط تیم استودیو (کاملاً مجزا برای این برند)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-calendar-window'))}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="باز کردن تقویم کامل و پیشرفته دسکتاپ برای این کارفرما"
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
              {/* Message History */}
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

              {/* Message Input Box */}
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

          {/* Tab 5: Brief & Scope */}
          {activeTab === 'brief' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-4">
                <div className="border-b border-neutral-100 pb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      PROJECT DOSSIER // CORE BRIEF
                    </span>
                    <h3 className="text-base font-black text-neutral-900 mt-1">
                      خلاصه توافقات و دامنه خدمات پروژه
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-notes-window'))}
                    className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="مشاهده و ویرایش یادداشت‌ها و بریف‌های تفکیک‌شده این کارفرما در دفترچه یادداشت"
                  >
                    <span>📝</span>
                    <span>باز کردن یادداشت‌های این برند در نوت‌پد</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-neutral-700">
                  <strong className="block text-neutral-900 text-sm">چشم‌انداز و هدف استراتژیک:</strong>
                  <p>{activeClient.scopeSummary}</p>
                </div>

                {activeClient.isPersonalBrand && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">💎</span>
                      <h4 className="text-xs font-black text-amber-950">
                        ستون‌های استراتژی پرسونال برندینگ (متدولوژی Creativity Juice)
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                        <strong className="block text-neutral-800 text-[11px] mb-0.5">هدف محوری در شبکه‌های اجتماعی:</strong>
                        <p className="text-neutral-600">{activeClient.socialGoal || 'مرجعیت و رشد'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/90 border border-amber-200">
                        <strong className="block text-neutral-800 text-[11px] mb-0.5">لحن کلامی و شخصیت بصری:</strong>
                        <p className="text-neutral-600">{activeClient.brandTone || 'سینمایی و فاخر'}</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-amber-900 leading-relaxed font-sans">
                      💡 <strong>توصیه مشاوران استودیو:</strong> برای کسب بهترین نتیجه، هر هفته ۳ ریلز با ساختار قلاب ۳ ثانیه‌ای ضبط کنید و یادداشت‌های استراتژی در نوت‌پد اختصاصی خود را قبل از ضبط مرور نمایید.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">
                      {activeClient.isPersonalBrand ? 'مشاور ارشد برندسازی:' : 'تیم اجرایی تخصیص‌یافته:'}
                    </span>
                    <p className="text-xs font-bold text-neutral-900">{activeClient.projectLead}</p>
                    <p className="text-[11px] text-neutral-500">{activeClient.projectLeadRole}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">زمان‌بندی و دوره‌ها:</span>
                    <p className="text-xs font-bold text-neutral-900">راه‌اندازی: {activeClient.contractDate}</p>
                    <p className="text-[11px] text-neutral-500">وضعیت: {activeClient.deliveryDate}</p>
                  </div>
                </div>
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
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-neutral-950">
                    ساخت فضای کار و پرسونال برند جدید
                  </h3>
                  <p className="text-xs text-neutral-500">
                    بر اساس متدولوژی برندینگ و تقویم اختصاصی استودیو Creativity Juice
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
                  placeholder="مثال: دکتر کیوان راد ، سارا رستمی ، یا نام هنری/کاری شما"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none"
                  required
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    پین کد اختصاصی (جهت ورودهای بعدی):
                  </label>
                  <input
                    type="text"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="مثال: 7777 یا kaveh (اختیاری)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none font-mono"
                    dir="ltr"
                  />
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
                  <span>ایجاد پنل و ورود به فضای پرسونال برند</span>
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
