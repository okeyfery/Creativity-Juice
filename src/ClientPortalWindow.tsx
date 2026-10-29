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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-neutral-950 font-black text-2xl flex items-center justify-center shadow-md mx-auto">
              💼
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-950 tracking-tight">
              درگاه امن کارفرمایان و شرکای تجاری
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
              ورود به فضای کار اختصاصی هر برند جهت رصد پیشرفت، پیش‌نمایش خروجی‌های سینمایی، بازبینی و تأیید فایل‌ها.
            </p>
          </div>

          {/* Direct PIN Form */}
          <div className="w-full max-w-md bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-sm space-y-4 mb-8">
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700">
                کد دسترسی اختصاصی کارفرما یا شناسه برند:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="مثال: yousefzadeh یا 1001 یا dr-peiravi"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs sm:text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                  dir="ltr"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 font-black text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  ورود به فضای کار
                </button>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}
            </form>

            <div className="text-[11px] text-neutral-500 flex items-center justify-between pt-3 border-t border-neutral-100">
              <span>🔐 دسترسی امن با توکن ایزوله</span>
              <span>پشتیبانی: Creativity Juice</span>
            </div>
          </div>

          {/* Quick Access Card Grid for Demo & Clients */}
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="text-xs sm:text-sm font-black text-neutral-800 flex items-center gap-1.5">
                <span>⚡</span>
                <span>ورود سریع برای تست (انتخاب برندهای فعال استودیو)</span>
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                {workspaces.length} پرونده کارفرما
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {workspaces.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleQuickLogin(client)}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between text-right"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{client.logoBadge}</span>
                      <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-mono text-[10px] font-bold text-neutral-600">
                        PIN: {client.pinCode}
                      </span>
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
                    <span className="text-neutral-600 font-medium">
                      مدیر پروژه: <strong className="text-neutral-900">{client.projectLead}</strong>
                    </span>
                    <span className="text-amber-600 font-bold group-hover:translate-x-[-2px] transition-transform">
                      ورود ⟵
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    فضای کار اختصاصی
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                  <span>کارفرما: <strong className="text-neutral-700">{activeClient.ownerName}</strong></span>
                  <span>•</span>
                  <span>مدیر پروژه در استودیو: <strong className="text-neutral-900 font-bold">{activeClient.projectLead}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-2">
              {/* Progress Summary Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                <span className="text-neutral-600 font-medium">پیشرفت کلی:</span>
                <span className="font-mono font-black text-neutral-900">{activeClient.progressPercent}%</span>
                <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
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
                  const target = workspaces.find((w) => w.id === e.target.value);
                  if (target) handleQuickLogin(target);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-bold outline-none cursor-pointer hover:bg-neutral-100"
                title="تغییر سریع برند"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    تغییر برند: {w.brandName.slice(0, 22)}...
                  </option>
                ))}
              </select>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="خروج از حساب این کارفرما"
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
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-neutral-900">
                    تقویم انتشار اختصاصی {activeClient.brandName}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    برنامه‌ریزی، زمان‌بندی و کپشن‌های آماده شده توسط تیم استودیو
                  </p>
                </div>
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
                <div className="border-b border-neutral-100 pb-3">
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    PROJECT DOSSIER // CORE BRIEF
                  </span>
                  <h3 className="text-base font-black text-neutral-900 mt-1">
                    خلاصه توافقات و دامنه خدمات پروژه
                  </h3>
                </div>

                <div className="space-y-2 text-xs leading-relaxed text-neutral-700">
                  <strong className="block text-neutral-900 text-sm">چشم‌انداز و هدف استودیو:</strong>
                  <p>{activeClient.scopeSummary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">تیم اجرایی تخصیص‌یافته:</span>
                    <p className="text-xs font-bold text-neutral-900">{activeClient.projectLead}</p>
                    <p className="text-[11px] text-neutral-500">{activeClient.projectLeadRole}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10px] text-neutral-400 font-bold block mb-1">زمان‌بندی و تحویل:</span>
                    <p className="text-xs font-bold text-neutral-900">انعقاد: {activeClient.contractDate}</p>
                    <p className="text-[11px] text-neutral-500">تحویل نهایی: {activeClient.deliveryDate}</p>
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
    </div>
  );
};
export default ClientPortalWindow;
