import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Mail,
  MailOpen,
  CheckCheck,
  RefreshCw,
  Eye,
  Download,
  Copy,
  Check,
  Send,
  Sparkles,
  Clock,
  KeyRound,
  Search,
  FileText,
  X,
  PlusCircle,
  ArrowUpRight,
  Radio,
  CloudCheck,
} from 'lucide-react';
import { ProjectBriefSubmission } from '../data/clientPortalData';
import {
  getAllArchivedBriefs,
  toggleBriefReadStatus,
  markAllBriefsAsRead,
  updateBriefStatus,
  submitAndArchiveProjectBrief,
  CLIENT_PORTAL_EVENT,
} from '../clientPortalStore';
import {
  pullStateFromServer,
  buildBriefForwardLinks,
  NEW_BRIEF_NOTIFICATION_EVENT,
} from '../serverSync';
import {
  startBriefRealtimeSyncService,
  reconcileClientBriefsWithServer,
  getBriefSyncTelemetry,
  getSyncedBriefIds,
  getPendingOutbox,
  BRIEF_REALTIME_SYNC_EVENT,
  BriefSyncTelemetry,
} from '../briefSyncService';

interface ReceivedBriefsWidgetProps {
  onOpenBriefInPortalTab?: (brief: ProjectBriefSubmission) => void;
  compact?: boolean;
}

export const ReceivedBriefsWidget: React.FC<ReceivedBriefsWidgetProps> = ({
  onOpenBriefInPortalTab,
  compact = false,
}) => {
  const [briefs, setBriefs] = useState<ProjectBriefSubmission[]>(() => getAllArchivedBriefs());
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read' | 'submitted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrief, setSelectedBrief] = useState<ProjectBriefSubmission | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [syncTelemetry, setSyncTelemetry] = useState<BriefSyncTelemetry>(() =>
    getBriefSyncTelemetry()
  );
  const [syncedIds, setSyncedIds] = useState<Set<string>>(() => getSyncedBriefIds());
  const [pendingIds, setPendingIds] = useState<Set<string>>(
    () => new Set(getPendingOutbox().map((x) => x.brief.id))
  );

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3800);
  };

  const refreshBriefs = () => {
    const latest = getAllArchivedBriefs();
    setBriefs(latest);
    setSyncTelemetry(getBriefSyncTelemetry());
    setSyncedIds(getSyncedBriefIds());
    setPendingIds(new Set(getPendingOutbox().map((x) => x.brief.id)));
    if (selectedBrief) {
      const updatedSelected = latest.find((b) => b.id === selectedBrief.id);
      if (updatedSelected) setSelectedBrief(updatedSelected);
    }
  };

  useEffect(() => {
    startBriefRealtimeSyncService();
    void pullStateFromServer(true).then(() => {
      refreshBriefs();
    });

    const handlePortalUpdate = () => {
      refreshBriefs();
    };

    const handleTelemetryUpdate = () => {
      refreshBriefs();
    };

    window.addEventListener(CLIENT_PORTAL_EVENT, handlePortalUpdate);
    window.addEventListener(NEW_BRIEF_NOTIFICATION_EVENT, handlePortalUpdate);
    window.addEventListener(BRIEF_REALTIME_SYNC_EVENT, handleTelemetryUpdate);
    window.addEventListener('storage', handlePortalUpdate);

    return () => {
      window.removeEventListener(CLIENT_PORTAL_EVENT, handlePortalUpdate);
      window.removeEventListener(NEW_BRIEF_NOTIFICATION_EVENT, handlePortalUpdate);
      window.removeEventListener(BRIEF_REALTIME_SYNC_EVENT, handleTelemetryUpdate);
      window.removeEventListener('storage', handlePortalUpdate);
    };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await reconcileClientBriefsWithServer();
    await pullStateFromServer(true);
    refreshBriefs();
    setIsSyncing(false);

    if (result.ok) {
      showToast(
        result.newlyAddedCount > 0
          ? `همگام‌سازی بلادرنگ انجام شد: ${result.newlyAddedCount} بریف جدید از کلاینت به سرور منتقل گردید.`
          : `همگام‌سازی کامل کلاینت و سرور انجام شد (${result.syncedCount} بریف همگام).`
      );
    } else {
      showToast('بریف‌های دریافتی از حافظه و سرور به‌روزرسانی شدند.');
    }
  };

  const handleToggleRead = (brief: ProjectBriefSubmission, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextRead = !brief.isRead;
    toggleBriefReadStatus(brief.id, nextRead);
    refreshBriefs();
    showToast(
      nextRead
        ? `بریف «${brief.brandName}» به عنوان خوانده‌شده علامت‌گذاری شد.`
        : `بریف «${brief.brandName}» به وضعیت خوانده‌نشده بازگردانده شد.`
    );
  };

  const handleMarkAllRead = () => {
    markAllBriefsAsRead();
    refreshBriefs();
    showToast('تمام بریف‌های دریافتی به عنوان «خوانده‌شده» علامت‌گذاری شدند.');
  };

  const handleOpenDetail = (brief: ProjectBriefSubmission) => {
    if (!brief.isRead) {
      toggleBriefReadStatus(brief.id, true);
    }
    const updated = getAllArchivedBriefs().find((b) => b.id === brief.id) || {
      ...brief,
      isRead: true,
    };
    setSelectedBrief(updated);
    refreshBriefs();
  };

  const handleSimulateNewBrief = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const brandTitle = `برند نمونه کارفرما #${randomNum}`;
    const summary = [
      `=== سند بریف کشف پروژه — CREATIVITY JUICE ===`,
      `• نام برند / پروژه: ${brandTitle}`,
      `• نام کارفرما: کارفرمای جدید سایت`,
      `• راه ارتباطی: 09120000${randomNum}`,
      `• دپارتمان انتخابی: معماری برند و کمپین محتوایی`,
      `• جایگاه بازار: لوکس و پرمیوم`,
      `• صورت‌مسئله: نیاز به ری‌برندینگ جامع، طراحی هویت بصری و تولید محتوای ویدیویی هدفمند برای افزایش فروش.`,
    ].join('\n');

    const res = submitAndArchiveProjectBrief({
      clientName: brandTitle,
      ownerName: 'کارفرمای جدید سایت',
      clientUrl: `09120000${randomNum}`,
      selectedTrack: 'معماری برند و کمپین محتوایی',
      marketTier: 'لوکس و پرمیوم',
      problem:
        'نیاز به ری‌برندینگ جامع، طراحی هویت بصری و تولید محتوای ویدیویی هدفمند برای افزایش فروش.',
      deadline: 'فوری (۱ ماه کاری)',
      productionScale: 'پروداکشن جامع استودیو',
      fullSummaryText: summary,
    });

    setReadFilter('all');
    refreshBriefs();
    showToast(
      `بریف جدید «${res.brief.brandName}» با کد ${res.brief.trackingCode} به صورت بلادرنگ با سرور همگام و در صدر لیست قرار گرفت!`
    );
  };

  const handleCopyBrief = (brief: ProjectBriefSubmission, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(brief.fullSummaryText);
    setCopiedId(brief.id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast(`متن کامل بریف «${brief.brandName}» کپی شد.`);
  };

  const handleDownloadBrief = (brief: ProjectBriefSubmission, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blob = new Blob([brief.fullSummaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brief-${brief.trackingCode}-${brief.brandName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const total = briefs.length;
    const unread = briefs.filter((b) => !b.isRead).length;
    const read = briefs.filter((b) => Boolean(b.isRead)).length;
    const userSubmitted = briefs.filter((b) => !b.id.startsWith('brief-init-')).length;
    return { total, unread, read, userSubmitted };
  }, [briefs]);

  const filteredBriefs = useMemo(() => {
    return briefs.filter((b) => {
      if (readFilter === 'unread' && b.isRead) return false;
      if (readFilter === 'read' && !b.isRead) return false;
      if (readFilter === 'submitted' && b.id.startsWith('brief-init-')) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.brandName.toLowerCase().includes(q) ||
        b.ownerName.toLowerCase().includes(q) ||
        b.trackingCode.toLowerCase().includes(q) ||
        b.problem.toLowerCase().includes(q) ||
        (b.contactInfo || '').toLowerCase().includes(q)
      );
    });
  }, [briefs, readFilter, searchQuery]);

  const displayedBriefs = compact ? filteredBriefs.slice(0, 8) : filteredBriefs;

  return (
    <div
      dir="rtl"
      className="bg-gradient-to-br from-[#121624] via-[#0e111a] to-[#131826] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            {toastMsg}
          </span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-300 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-Time Client-to-Server Sync Status Bar */}
      <div className="mb-4 px-3.5 py-2.5 rounded-xl bg-black/45 border border-emerald-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 border ${
              syncTelemetry.streamConnected
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                syncTelemetry.streamConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
              }`}
            />
            {syncTelemetry.streamConnected
              ? 'جریان بلادرنگ کلاینت ⇄ سرور فعال (Real-Time SSE)'
              : 'همگام‌سازی خودکار کلاینت و سرور'}
          </span>

          <span className="text-slate-400 text-[11px]">
            بریف‌های سینک‌شده روی سرور:{' '}
            <strong className="text-white font-mono">{stats.total}</strong>
          </span>

          {syncTelemetry.pendingOutboxCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-bold">
              {syncTelemetry.pendingOutboxCount} بریف در صف ارسال به سرور
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {syncTelemetry.lastSyncedAt && (
            <span>
              آخرین دریافت بلادرنگ:{' '}
              <strong className="text-emerald-300 font-mono">{syncTelemetry.lastSyncedAt}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 relative">
            <Inbox className="w-5 h-5" />
            {stats.unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-pulse">
                {stats.unread}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-black text-white">ویجت بریف‌های دریافتی استودیو</h3>
              {stats.unread > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  {stats.unread} بریف خوانده‌نشده جدید
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  همه بریف‌ها بررسی و خوانده شده‌اند
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              نمایش بلادرنگ بریف‌های ثبت‌شده در کلاینت و سرور با قابلیت تفکیک «خوانده‌شده / خوانده‌نشده»
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateNewBrief}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-bold transition-all"
            title="ثبت فوری یک بریف نمونه جدید برای تست سینک بلادرنگ و قرارگیری در بالای لیست خوانده‌نشده‌ها"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            تست دریافت بریف جدید
          </button>

          {stats.unread > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              خوانده‌شدن همه ({stats.unread})
            </button>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            همگام‌سازی کلاینت و سرور (Sync)
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 flex-wrap">
          <button
            onClick={() => setReadFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              readFilter === 'all'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            همه ({stats.total})
          </button>
          <button
            onClick={() => setReadFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              readFilter === 'unread'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            خوانده‌نشده ({stats.unread})
          </button>
          <button
            onClick={() => setReadFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              readFilter === 'read'
                ? 'bg-emerald-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MailOpen className="w-3.5 h-3.5" />
            خوانده‌شده ({stats.read})
          </button>
          <button
            onClick={() => setReadFilter('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              readFilter === 'submitted'
                ? 'bg-sky-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ارسالی از فرم سایت ({stats.userSubmitted})
          </button>
        </div>

        <div className="relative flex-1 min-w-[210px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام برند، کد رهگیری یا شماره تماس..."
            className="w-full bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl pr-8 pl-3 py-1.5 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Briefs List */}
      {displayedBriefs.length === 0 ? (
        <div className="bg-black/30 border border-white/5 rounded-xl p-8 text-center">
          <Inbox className="w-9 h-9 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">
            {readFilter === 'unread'
              ? 'هیچ بریف خوانده‌نشده‌ای وجود ندارد.'
              : 'بریفی مطابق با فیلتر انتخابی یافت نشد.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            به محض اینکه کارفرمایی فرم بریف را در سایت ثبت کند، به صورت بلادرنگ در بالای این لیست قرار می‌گیرد.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
          {displayedBriefs.map((brief) => {
            const isUnread = !brief.isRead;
            const isUserSubmitted = !brief.id.startsWith('brief-init-');
            const isPendingSync = pendingIds.has(brief.id);
            const isSynced = !isPendingSync && (syncedIds.has(brief.id) || !isUserSubmitted);
            const forwardLinks = buildBriefForwardLinks({
              brandName: brief.brandName,
              trackingCode: brief.trackingCode,
              selectedTrack: brief.selectedTrack,
              problem: brief.problem,
              fullSummaryText: brief.fullSummaryText,
            });

            return (
              <div
                key={brief.id}
                onClick={() => handleOpenDetail(brief)}
                className={`group cursor-pointer rounded-xl p-3.5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isUnread
                    ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-[#151928] border-amber-400/50 shadow-lg shadow-amber-500/5'
                    : 'bg-black/35 hover:bg-white/[0.04] border-white/10'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Read/Unread Icon Button */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(brief, e)}
                    title={isUnread ? 'علامت‌گذاری به عنوان خوانده‌شده' : 'علامت‌گذاری به عنوان خوانده‌نشده'}
                    className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isUnread
                        ? 'bg-amber-500 text-black border-amber-300 shadow-md'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {isUnread ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm ${
                          isUnread ? 'font-black text-white' : 'font-bold text-slate-200'
                        }`}
                      >
                        {brief.brandName}
                      </span>

                      {/* Read / Unread Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          isUnread
                            ? 'bg-rose-500/25 text-rose-200 border-rose-500/50'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isUnread ? '● خوانده‌نشده' : '✓ خوانده‌شده'}
                      </span>

                      {isUserSubmitted && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          دریافتی از فرم سایت
                        </span>
                      )}

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                          isSynced
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <CloudCheck className="w-2.5 h-2.5" />
                        {isSynced ? 'همگام با سرور' : 'در حال سینک...'}
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/5 text-amber-300 border border-white/10 flex items-center gap-1">
                        <KeyRound className="w-2.5 h-2.5" />
                        {brief.trackingCode}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {brief.submittedAt}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1 line-clamp-1">
                      <span className="text-slate-400">کارفرما: </span>
                      <strong className="text-white">{brief.ownerName}</strong>
                      {brief.contactInfo && brief.contactInfo !== '-' && (
                        <span className="mr-2 text-amber-300/90 font-mono">
                          ({brief.contactInfo})
                        </span>
                      )}
                      <span className="mx-2 text-slate-600">•</span>
                      <span className="text-slate-400">{brief.selectedTrack}</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{brief.problem}</p>
                  </div>
                </div>

                {/* Right-side Quick Actions */}
                <div
                  className="flex items-center gap-1.5 shrink-0 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleRead(brief, e)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                      isUnread
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                    }`}
                  >
                    {isUnread ? (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        علامت خوانده‌شده
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        علامت خوانده‌نشده
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDetail(brief)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    مشاهده کامل
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCopyBrief(brief, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title="کپی متن کامل بریف"
                  >
                    {copiedId === brief.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadBrief(brief, e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    title="دانلود فایل متنی بریف"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={forwardLinks.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30"
                    title="ارسال در واتساپ"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBrief && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedBrief(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111522] border border-amber-500/40 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/40">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    پرونده بریف: {selectedBrief.brandName}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedBrief.trackingCode}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    ثبت‌شده در {selectedBrief.submittedAt} • کارفرما: {selectedBrief.ownerName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRead(selectedBrief)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                    selectedBrief.isRead
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-200 border-rose-500/40'
                  }`}
                >
                  {selectedBrief.isRead ? (
                    <>
                      <MailOpen className="w-3.5 h-3.5" />
                      خوانده‌شده (تغییر به خوانده‌نشده)
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      خوانده‌نشده (علامت خوانده‌شده)
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedBrief(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400">دپارتمان / مسیر</div>
                  <div className="font-bold text-white mt-0.5">{selectedBrief.selectedTrack}</div>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400">جایگاه بازار</div>
                  <div className="font-bold text-amber-300 mt-0.5">{selectedBrief.marketTier}</div>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                  <div className="text-[10px] text-slate-400">اطلاعات تماس کارفرما</div>
                  <div className="font-bold text-emerald-300 font-mono mt-0.5">
                    {selectedBrief.contactInfo || '-'}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5">
                <div className="text-[11px] font-bold text-amber-400 mb-1">
                  صورت‌مسئله و چالش اصلی کارفرما:
                </div>
                <p className="text-slate-200 leading-relaxed">{selectedBrief.problem}</p>
              </div>

              {/* Status Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-3">
                <span className="text-xs font-bold text-slate-300">وضعیت اجرایی پرونده:</span>
                <div className="flex items-center gap-1.5">
                  {(['new', 'reviewed', 'in-production'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateBriefStatus(selectedBrief.id, st);
                        refreshBriefs();
                        showToast('وضعیت اجرایی بریف به‌روزرسانی شد.');
                      }}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        selectedBrief.status === st
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-black/40 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {st === 'new'
                        ? 'جدید (خوانده‌نشده)'
                        : st === 'reviewed'
                        ? 'بررسی‌شده'
                        : 'در حال تولید'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1.5">
                  متن کامل سند بریف آرشیوشده:
                </div>
                <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-slate-200 whitespace-pre-wrap leading-7 font-sans max-h-64 overflow-y-auto">
                  {selectedBrief.fullSummaryText}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyBrief(selectedBrief)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  کپی متن کامل
                </button>
                <button
                  onClick={() => handleDownloadBrief(selectedBrief)}
                  className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  دانلود فایل بریف (.TXT)
                </button>
              </div>

              {onOpenBriefInPortalTab && (
                <button
                  onClick={() => {
                    const target = selectedBrief;
                    setSelectedBrief(null);
                    onOpenBriefInPortalTab(target);
                  }}
                  className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5"
                >
                  باز کردن در آرشیو جامع بریف‌ها
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
