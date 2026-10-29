/**
 * Creativity Juice — Editorial & Social Media Content Calendar
 * Dual-Synced Solar Hijri (Shamsi / تقویم شمسی) & Gregorian Calendar
 * Mobile-Optimized with compact mobile headers, bottom drawer filters,
 * responsive day-cell dots, and dedicated touch-friendly day schedule
 */

import React, { useState, useEffect, useMemo } from 'react';
import { addToTrash, CALENDAR_RESTORE_EVENT } from './trashStore';

export interface ContentItem {
  id: string;
  title: string;
  theme: string; // Content pillar / topic
  platform: 'instagram' | 'linkedin' | 'youtube' | 'x' | 'website' | 'podcast';
  format: 'reels' | 'carousel' | 'single-post' | 'story' | 'video' | 'article' | 'thread';
  date: string; // YYYY-MM-DD (Gregorian key for universal compatibility)
  time?: string; // HH:mm
  status: 'idea' | 'in_progress' | 'ready' | 'published';
  author: string;
  captionDraft?: string;
  cta?: string;
  notes?: string;
}

const PLATFORM_CONFIG = {
  instagram: {
    name: 'اینستاگرام',
    badge: '📸 Instagram',
    color: 'bg-gradient-to-r from-pink-500 to-amber-500 text-white',
    border: 'border-pink-300',
    lightBg: 'bg-pink-50 text-pink-700',
    dotColor: 'bg-pink-500',
    icon: '📸',
  },
  linkedin: {
    name: 'لینکدین',
    badge: '💼 LinkedIn',
    color: 'bg-blue-600 text-white',
    border: 'border-blue-300',
    lightBg: 'bg-blue-50 text-blue-700',
    dotColor: 'bg-blue-600',
    icon: '💼',
  },
  youtube: {
    name: 'یوتیوب',
    badge: '🎬 YouTube',
    color: 'bg-red-600 text-white',
    border: 'border-red-300',
    lightBg: 'bg-red-50 text-red-700',
    dotColor: 'bg-red-600',
    icon: '🎬',
  },
  x: {
    name: 'توییتر / X',
    badge: '🐦 X / Threads',
    color: 'bg-neutral-900 text-white',
    border: 'border-neutral-400',
    lightBg: 'bg-neutral-100 text-neutral-800',
    dotColor: 'bg-neutral-800',
    icon: '🐦',
  },
  website: {
    name: 'وب‌سایت و بلاگ',
    badge: '🌐 Blog / Journal',
    color: 'bg-amber-600 text-white',
    border: 'border-amber-300',
    lightBg: 'bg-amber-50 text-amber-800',
    dotColor: 'bg-amber-600',
    icon: '🌐',
  },
  podcast: {
    name: 'پادکست',
    badge: '🎙️ Podcast',
    color: 'bg-purple-600 text-white',
    border: 'border-purple-300',
    lightBg: 'bg-purple-50 text-purple-700',
    dotColor: 'bg-purple-600',
    icon: '🎙️',
  },
};

const FORMAT_CONFIG: Record<string, string> = {
  reels: 'ریلز (Reels)',
  carousel: 'کاروسل اسلایدی',
  'single-post': 'تک‌پست تصویری',
  story: 'استوری تعاملی',
  video: 'ویدئوی پروداکشن',
  article: 'مقاله ژورنال',
  thread: 'ترد چندتایی',
};

const STATUS_CONFIG = {
  idea: { label: 'ایده اولیه', color: 'bg-neutral-100 text-neutral-700 border-neutral-300', dot: 'bg-neutral-400' },
  in_progress: { label: 'در حال تولید', color: 'bg-amber-50 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  ready: { label: 'آماده انتشار', color: 'bg-sky-50 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
  published: { label: 'منتشر شده', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
};

// Clean empty calendar ready for user customization
export const SEED_ITEMS: ContentItem[] = [];

/**
 * Helper to get current today date formatted as YYYY-MM-DD
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * High-precision Persian (Solar Hijri / Shamsi) helper based on native Intl
 */
export function getPersianDateInfo(year: number, monthIndex: number, day: number) {
  const d = new Date(year, monthIndex, day);
  try {
    const parts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).formatToParts(d);

    const dayVal = parts.find((p) => p.type === 'day')?.value || String(day);
    const monthVal = parts.find((p) => p.type === 'month')?.value || '';
    const yearVal = parts.find((p) => p.type === 'year')?.value || '';
    const weekdayVal = parts.find((p) => p.type === 'weekday')?.value || '';

    return {
      day: dayVal,
      month: monthVal,
      year: yearVal,
      weekday: weekdayVal,
      full: `${dayVal} ${monthVal} ${yearVal}`,
      fullWithDay: `${weekdayVal}، ${dayVal} ${monthVal} ${yearVal}`,
      isFirstOfMonth: dayVal === '۱' || dayVal === '1',
    };
  } catch {
    return {
      day: String(day),
      month: '',
      year: String(year),
      weekday: '',
      full: `${day}/${monthIndex + 1}/${year}`,
      fullWithDay: `${day}/${monthIndex + 1}/${year}`,
      isFirstOfMonth: day === 1,
    };
  }
}

export function formatSyncedDate(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const persian = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    }).format(date);
    return {
      persian,
      gregorian: dateStr,
    };
  } catch {
    return { persian: dateStr, gregorian: dateStr };
  }
}

interface ContentCalendarWindowProps {
  onClose?: () => void;
}

export const ContentCalendarWindow: React.FC<ContentCalendarWindowProps> = () => {
  const [items, setItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem('cj_content_calendar_events_v2');
      if (saved !== null) {
        return JSON.parse(saved);
      }
      // Clean up any legacy items
      localStorage.removeItem('cj_content_calendar_events');
    } catch {}
    return SEED_ITEMS;
  });

  const todayNow = new Date();
  const todayDateStr = getTodayIsoDate();

  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [calendarMode, setCalendarMode] = useState<'dual' | 'persian' | 'gregorian'>('dual');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile drawer states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Year & Month navigation dynamically defaulted to CURRENT date
  const [currentYear, setCurrentYear] = useState<number>(() => todayNow.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => todayNow.getMonth());

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<ContentItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [trashNotification, setTrashNotification] = useState<string | null>(null);

  // Listen for restored posts from Trash Bin
  useEffect(() => {
    const handleRestored = (e: any) => {
      const restoredPost = e.detail as ContentItem;
      if (restoredPost) {
        setItems((prev) => {
          if (prev.some((p) => p.id === restoredPost.id)) return prev;
          return [restoredPost, ...prev];
        });
        setTrashNotification(`برنامه «${restoredPost.title}» از سطل زباله بازیابی شد.`);
        setTimeout(() => setTrashNotification(null), 3500);
      }
    };
    window.addEventListener(CALENDAR_RESTORE_EVENT, handleRestored);
    return () => window.removeEventListener(CALENDAR_RESTORE_EVENT, handleRestored);
  }, []);

  // New post form state (defaults to today's date)
  const [newTitle, setNewTitle] = useState('');
  const [newTheme, setNewTheme] = useState('معماری و هویت برند');
  const [newPlatform, setNewPlatform] = useState<ContentItem['platform']>('instagram');
  const [newFormat, setNewFormat] = useState<ContentItem['format']>('reels');
  const [newDate, setNewDate] = useState(todayDateStr);
  const [newTime, setNewTime] = useState('18:00');
  const [newStatus, setNewStatus] = useState<ContentItem['status']>('idea');
  const [newAuthor, setNewAuthor] = useState('کارفرما / تیم محتوا');
  const [newCaption, setNewCaption] = useState('');
  const [newCta, setNewCta] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cj_content_calendar_events_v2', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save content items:', e);
    }
  }, [items]);

  // Real-time Shamsi calculation for selected date
  const selectedDateShamsi = useMemo(() => {
    return formatSyncedDate(selectedDate);
  }, [selectedDate]);

  // Real-time Shamsi calculation for new date in form
  const newDateShamsi = useMemo(() => {
    return formatSyncedDate(newDate);
  }, [newDate]);

  // Filter items
  const filteredItems = items.filter((item) => {
    if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        (item.captionDraft && item.captionDraft.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Calendar calculations for currentYear & currentMonth
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    const currentNow = new Date();
    setCurrentYear(currentNow.getFullYear());
    setCurrentMonth(currentNow.getMonth());
    setSelectedDate(getTodayIsoDate());
  };

  const handleClearAll = () => {
    setItems([]);
    localStorage.removeItem('cj_content_calendar_events_v2');
    localStorage.removeItem('cj_content_calendar_events');
    setTrashNotification('تمام برنامه‌ها و تسک‌های تقویم پاکسازی شدند.');
    setTimeout(() => setTrashNotification(null), 3500);
  };

  // Month names
  const startMonthPersian = getPersianDateInfo(currentYear, currentMonth, 1);
  const endMonthPersian = getPersianDateInfo(currentYear, currentMonth, daysInMonth);
  const persianMonthTitle =
    startMonthPersian.month === endMonthPersian.month
      ? `${startMonthPersian.month} ${startMonthPersian.year}`
      : `${startMonthPersian.month} — ${endMonthPersian.month} ${startMonthPersian.year}`;

  const monthNameEn = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(currentYear, currentMonth, 1));

  // Add new item
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ContentItem = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      theme: newTheme.trim() || 'عمومی',
      platform: newPlatform,
      format: newFormat,
      date: newDate,
      time: newTime,
      status: newStatus,
      author: newAuthor.trim() || 'کارفرما',
      captionDraft: newCaption.trim(),
      cta: newCta.trim(),
      notes: newNotes.trim(),
    };

    setItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewCaption('');
    setNewCta('');
    setNewNotes('');
  };

  // Toggle item status
  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const cycle: Record<ContentItem['status'], ContentItem['status']> = {
          idea: 'in_progress',
          in_progress: 'ready',
          ready: 'published',
          published: 'idea',
        };
        return { ...item, status: cycle[item.status] };
      })
    );
  };

  // Delete item -> moves to trash bin
  const handleDeleteItem = (id: string) => {
    const postToTrash = items.find((i) => i.id === id);
    if (!postToTrash) return;

    addToTrash({
      originalId: postToTrash.id,
      title: postToTrash.title,
      type: 'calendar_post',
      source: 'تقویم محتوا',
      summary: `${PLATFORM_CONFIG[postToTrash.platform]?.name || postToTrash.platform} • موضوع: ${postToTrash.theme} • تاریخ: ${postToTrash.date}`,
      data: postToTrash,
    });

    setItems((prev) => prev.filter((i) => i.id !== id));
    if (inspectItem?.id === id) setInspectItem(null);
    setTrashNotification(`برنامه محتوایی «${postToTrash.title}» به سطل زباله منتقل شد.`);
    setTimeout(() => setTrashNotification(null), 3500);
  };

  // Export summary
  const handleCopySummary = () => {
    const text = items
      .map((i, idx) => {
        const shamsi = formatSyncedDate(i.date);
        return `${idx + 1}. [${PLATFORM_CONFIG[i.platform].name} - ${FORMAT_CONFIG[i.format]}] ${i.title}\n   📅 تاریخ شمسی: ${shamsi.persian} (${i.date})\n   وضعیت: ${STATUS_CONFIG[i.status].label} | ستون: ${i.theme}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(`تقویم محتوایی سینک‌شده استودیو CREATIVITY JUICE:\n\n${text}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  // Items for selected date in month view
  const selectedDateItems = items.filter((i) => i.date === selectedDate);

  // Statistics
  const totalCount = items.length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const readyCount = items.filter((i) => i.status === 'ready').length;
  const publishedCount = items.filter((i) => i.status === 'published').length;

  const activeFiltersCount = (selectedPlatform !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);

  const todayPersianDisplay = useMemo(() => {
    const n = new Date();
    const info = getPersianDateInfo(n.getFullYear(), n.getMonth(), n.getDate());
    const enMonth = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(n);
    return `امروز: ${info.fullWithDay} • ${enMonth}`;
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[82vh] bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right" dir="rtl">
      {/* Trash Toast Notification */}
      {trashNotification && (
        <div className="bg-neutral-900 text-amber-300 text-xs font-bold px-4 py-2 flex items-center justify-between gap-2 shadow-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <span>🗑️</span>
            <span>{trashNotification}</span>
          </div>
          <button
            onClick={() => setTrashNotification(null)}
            className="text-neutral-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. MOBILE-ONLY COMPACT TOPBAR (Eliminates header clutter) */}
      {/* ========================================================= */}
      <div className="flex sm:hidden items-center justify-between px-3 py-2 bg-white border-b border-neutral-200 shrink-0 gap-2 shadow-2xs">
        {/* Mobile Month & Nav Navigator */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-700 active:bg-neutral-100 text-xs font-bold"
              title="ماه قبل"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-700 active:bg-neutral-100 text-xs font-bold"
              title="ماه بعد"
            >
              →
            </button>
          </div>

          <div className="truncate">
            <span className="text-xs font-black text-neutral-900 truncate block">
              {persianMonthTitle}
            </span>
            <span className="text-[9px] font-mono text-amber-700 block -mt-0.5">
              {monthNameEn}
            </span>
          </div>

          <button
            onClick={goToToday}
            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800"
          >
            امروز
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tab Switcher on mobile */}
          <div className="bg-neutral-100 p-0.5 rounded-lg flex items-center border border-neutral-200 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`p-1 rounded-md transition-all ${
                activeTab === 'calendar' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="نمای تقویم"
            >
              🗓️
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-1.5 py-1 rounded-md transition-all flex items-center gap-0.5 ${
                activeTab === 'list' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'
              }`}
              title="لیست برنامه‌ها"
            >
              <span>📋</span>
              <span className="text-[9px] font-mono">{filteredItems.length}</span>
            </button>
          </div>

          {/* Filter button that opens bottom sheet */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
              activeFiltersCount > 0
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-neutral-200 text-neutral-700'
            }`}
            title="فیلترها و تنظیمات تقویم"
          >
            <span>⚙️</span>
            {activeFiltersCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            )}
          </button>

          {/* Quick Add Post on mobile */}
          <button
            onClick={() => {
              setNewDate(selectedDate);
              setIsAddModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs flex items-center gap-1 shadow-2xs active:scale-95"
            title="ثبت محتوای جدید"
          >
            <span>+</span>
            <span className="text-[11px]">پست</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DESKTOP-ONLY RICH TOPBAR & FILTER ROW                  */}
      {/* ========================================================= */}
      <div className="hidden sm:flex flex-col shrink-0">
        <div className="p-3.5 sm:p-4 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-sm text-sm">
              📅
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                  تقویم محتوایی و برنامه‌ریزی سوشال مدیا
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  سینک دوگانه: شمسی + میلادی
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                هماهنگی لحظه‌ای تقویم خورشیدی و میلادی برای کمپین‌های اینستاگرام، ویدئو و لینکدین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-neutral-100 p-0.5 rounded-xl flex items-center border border-neutral-200 text-xs font-bold">
              <button
                onClick={() => setCalendarMode('dual')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  calendarMode === 'dual'
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                ⚡ همگام دوگانه
              </button>
              <button
                onClick={() => setCalendarMode('persian')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  calendarMode === 'persian'
                    ? 'bg-white text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                ☀️ شمسی
              </button>
              <button
                onClick={() => setCalendarMode('gregorian')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  calendarMode === 'gregorian'
                    ? 'bg-white text-neutral-950 font-black shadow-2xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                🌐 میلادی
              </button>
            </div>

            <div className="bg-neutral-100 p-0.5 rounded-xl flex items-center border border-neutral-200">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'calendar' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                🗓️ نمای تقویم
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                📋 لیست برنامه‌ها ({filteredItems.length})
              </button>
            </div>

            <button
              onClick={() => {
                setNewDate(selectedDate);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-sm font-black">+</span>
              <span>ثبت محتوای جدید</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <span>{copySuccess ? '✓ کپی شد!' : '📋 خروجی'}</span>
            </button>

            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                title="پاکسازی تمام برنامه‌ها"
              >
                <span>🗑️ پاکسازی همه</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filter and stats row */}
        <div className="px-3.5 sm:px-4 py-2 bg-[#F5F2EB] border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedPlatform === 'all'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              همه پلتفرم‌ها ({totalCount})
            </button>
            {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
              const count = items.filter((i) => i.platform === key).length;
              const isSel = selectedPlatform === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlatform(key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                    isSel ? `${cfg.color} shadow-2xs` : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{cfg.name}</span>
                  <span className="text-[9px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] font-bold">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              در تولید: {inProgressCount}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              آماده: {readyCount}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              منتشر شده: {publishedCount}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE (Calendar Grid & Day Details)           */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {activeTab === 'calendar' ? (
          <>
            {/* Calendar Main View */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-5 flex flex-col">
              {/* Desktop Month Navigator Banner */}
              <div className="hidden sm:flex items-center justify-between mb-3 bg-white p-3 rounded-2xl border border-neutral-200/90 shadow-xs flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight">
                        {persianMonthTitle}
                      </h3>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        {monthNameEn}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 font-medium block mt-0.5">
                      {todayPersianDisplay}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={goToToday}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer"
                  >
                    امروز
                  </button>
                  <button
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                    title="ماه قبل"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                    title="ماه بعد"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Day of Week Headers (Short on mobile, Full on desktop) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 text-center text-[10px] sm:text-xs font-bold text-neutral-500">
                <span className="text-neutral-700"><span className="sm:hidden">ش</span><span className="hidden sm:inline">شنبه</span></span>
                <span><span className="sm:hidden">۱ش</span><span className="hidden sm:inline">۱شنبه</span></span>
                <span><span className="sm:hidden">۲ش</span><span className="hidden sm:inline">۲شنبه</span></span>
                <span><span className="sm:hidden">۳ش</span><span className="hidden sm:inline">۳شنبه</span></span>
                <span><span className="sm:hidden">۴ش</span><span className="hidden sm:inline">۴شنبه</span></span>
                <span><span className="sm:hidden">۵ش</span><span className="hidden sm:inline">۵شنبه</span></span>
                <span className="text-rose-500 font-black"><span className="sm:hidden">ج</span><span className="hidden sm:inline">جمعه</span></span>
              </div>

              {/* Calendar Grid (Optimized cell height for mobile) */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Leading empty days */}
                {Array.from({ length: (firstDayIndex + 1) % 7 }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="h-12 sm:min-h-[85px] rounded-lg sm:rounded-xl bg-neutral-100/40 opacity-20" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayPosts = filteredItems.filter((item) => item.date === dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === getTodayIsoDate();

                  const shamsiInfo = getPersianDateInfo(currentYear, currentMonth, dayNum);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`h-14 sm:min-h-[85px] p-1 sm:p-1.5 rounded-lg sm:rounded-xl border flex flex-col justify-between transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-amber-50/90 border-amber-500 shadow-xs ring-2 ring-amber-400/50'
                          : isToday
                          ? 'bg-white border-neutral-900 shadow-xs ring-1 ring-neutral-900/20'
                          : 'bg-white border-neutral-200/80 hover:border-neutral-300 hover:bg-neutral-50/70'
                      }`}
                    >
                      {/* Top Header of day: Synced Shamsi & Gregorian */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          {/* Shamsi Day (Bold Persian) */}
                          <span
                            className={`text-xs sm:text-sm font-black px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded ${
                              isToday
                                ? 'bg-neutral-900 text-white'
                                : isSelected
                                ? 'bg-amber-500 text-neutral-950'
                                : 'text-neutral-900'
                            }`}
                          >
                            {shamsiInfo.day}
                          </span>

                          {/* Gregorian Day (Subtle) */}
                          <span className="text-[8px] sm:text-[9px] font-mono text-neutral-400">
                            {dayNum}
                          </span>

                          {/* First of Month badge on desktop */}
                          {shamsiInfo.isFirstOfMonth && (
                            <span className="hidden sm:inline-block text-[8px] font-bold text-amber-700 bg-amber-100 px-1 rounded-sm">
                              {shamsiInfo.month}
                            </span>
                          )}
                        </div>

                        {/* Post count badge (Desktop) */}
                        {dayPosts.length > 0 && (
                          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-amber-800 bg-amber-100/90 px-1 rounded-sm">
                            {dayPosts.length}
                          </span>
                        )}
                      </div>

                      {/* MOBILE: Compact colored platform dots (No text overflow) */}
                      <div className="flex sm:hidden items-center justify-center gap-0.5 mt-0.5">
                        {dayPosts.slice(0, 4).map((post) => {
                          const pCfg = PLATFORM_CONFIG[post.platform];
                          return (
                            <span
                              key={post.id}
                              className={`w-1.5 h-1.5 rounded-full ${pCfg.dotColor}`}
                            />
                          );
                        })}
                        {dayPosts.length > 4 && (
                          <span className="text-[7px] font-mono text-neutral-400">+</span>
                        )}
                      </div>

                      {/* DESKTOP: Content pills inside day cell */}
                      <div className="hidden sm:block space-y-1 mt-1 overflow-hidden">
                        {dayPosts.slice(0, 2).map((post) => {
                          const pCfg = PLATFORM_CONFIG[post.platform];
                          return (
                            <div
                              key={post.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectItem(post);
                              }}
                              className={`text-[9px] sm:text-[10px] p-1 rounded-md font-bold truncate flex items-center gap-1 cursor-pointer transition-transform group-hover:translate-x-0.5 ${pCfg.lightBg}`}
                              title={post.title}
                            >
                              <span>{pCfg.icon}</span>
                              <span className="truncate">{post.title}</span>
                            </div>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <div className="text-[8px] font-mono font-bold text-neutral-400 text-center">
                            +{dayPosts.length - 2} دیگر
                          </div>
                        )}
                      </div>

                      {/* Desktop hover quick add */}
                      <div className="hidden sm:block text-left opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-amber-600 font-bold hover:underline">+ ثبت</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* MOBILE INLINE SELECTED DAY PREVIEW DRAWER (Shows right below grid on mobile) */}
              <div className="sm:hidden mt-3 p-3 bg-white rounded-xl border border-neutral-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div>
                    <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {selectedDateShamsi.persian}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 mr-1.5" dir="ltr">
                      {selectedDate}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNewDate(selectedDate);
                      setIsAddModalOpen(true);
                    }}
                    className="px-2 py-1 rounded-md bg-amber-500 text-neutral-950 font-bold text-[10px] flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>پست جدید</span>
                  </button>
                </div>

                {selectedDateItems.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 text-center py-2">
                    برنامه‌ای برای این تاریخ ثبت نشده است.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {selectedDateItems.map((post) => {
                      const pCfg = PLATFORM_CONFIG[post.platform];
                      const sCfg = STATUS_CONFIG[post.status];
                      return (
                        <div
                          key={post.id}
                          onClick={() => setInspectItem(post)}
                          className="p-2 rounded-lg bg-[#FAF9F6] border border-neutral-200 flex items-center justify-between gap-2"
                        >
                          <div className="truncate flex-1">
                            <span className="text-[11px] font-bold text-neutral-900 block truncate">
                              {post.title}
                            </span>
                            <span className="text-[9px] text-neutral-500">
                              {pCfg.icon} {pCfg.name} • {FORMAT_CONFIG[post.format]}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(post.id);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-bold border shrink-0 ${sCfg.color}`}
                          >
                            {sCfg.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* DESKTOP SIDEBAR: Selected Date Details Sidebar */}
            <div className="hidden sm:flex w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-r border-neutral-200 p-4 sm:p-5 flex-col shrink-0 overflow-y-auto">
              <div className="border-b border-neutral-200 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      {selectedDateShamsi.persian}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block mt-1" dir="ltr">
                      {selectedDate} (Gregorian)
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNewDate(selectedDate);
                      setIsAddModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>+ پست جدید</span>
                  </button>
                </div>
                <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-2">
                  برنامه‌های محتوایی این روز ({selectedDateItems.length})
                </h4>
              </div>

              {selectedDateItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400 border border-dashed border-neutral-200 rounded-2xl">
                  <span className="text-3xl mb-2">☕</span>
                  <p className="text-xs font-bold text-neutral-600">برای این تاریخ محتوایی ثبت نشده است.</p>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    می‌توانید با زدن دکمه «+ پست جدید» برای این روز برنامه‌ریزی کنید.
                  </p>
                  <button
                    onClick={() => {
                      setNewDate(selectedDate);
                      setIsAddModalOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    ثبت موضوع محتوایی
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {selectedDateItems.map((post) => {
                    const pCfg = PLATFORM_CONFIG[post.platform];
                    const sCfg = STATUS_CONFIG[post.status];
                    return (
                      <div
                        key={post.id}
                        onClick={() => setInspectItem(post)}
                        className="p-3 rounded-xl border border-neutral-200 hover:border-amber-400 bg-[#FAF9F6] hover:bg-white transition-all shadow-2xs hover:shadow-xs cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pCfg.lightBg}`}>
                            {pCfg.icon} {pCfg.name} • {FORMAT_CONFIG[post.format]}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(post.id);
                            }}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${sCfg.color}`}
                            title="برای تغییر وضعیت کلیک کنید"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                            {sCfg.label}
                          </button>
                        </div>

                        <h5 className="text-xs font-bold text-neutral-900 group-hover:text-amber-900 line-clamp-2 leading-snug">
                          {post.title}
                        </h5>

                        <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60 font-mono">
                          <span>{post.time || '18:00'}</span>
                          <span className="font-sans text-neutral-600 truncate max-w-[140px]">{post.theme}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          /* List / Table View of all filtered items with Synced Shamsi Dates */
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3">
            {/* Search input in list view */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در موضوعات، تیترها و کپشن‌ها..."
                className="flex-1 py-1.5 sm:py-2 px-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-neutral-900 outline-none bg-white shadow-2xs"
              />
              <span className="text-[11px] sm:text-xs font-mono font-bold text-neutral-500 shrink-0">
                {filteredItems.length} مورد
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl">
                  🗓️
                </div>
                <h4 className="text-base font-black text-neutral-900">
                  تقویم محتوایی خالی و آماده شخصی‌سازی است
                </h4>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  هیچ تسک یا برنامه‌ای در این لیست وجود ندارد. می‌توانید برای هر روز و هر پلتفرم (اینستاگرام، لینکدین، یوتیوب، وبلاگ و ...) برنامه‌ریزی اختصاصی خود را ثبت کنید.
                </p>
                <button
                  onClick={() => {
                    setNewDate(selectedDate);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <span>+</span>
                  <span>افزودن اولین برنامه محتوایی</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((post) => {
                  const pCfg = PLATFORM_CONFIG[post.platform];
                  const sCfg = STATUS_CONFIG[post.status];
                  const shamsi = formatSyncedDate(post.date);

                  return (
                    <div
                      key={post.id}
                      onClick={() => setInspectItem(post)}
                      className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 bg-white hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pCfg.lightBg}`}>
                            {pCfg.icon} {pCfg.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${sCfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                            {sCfg.label}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 line-clamp-2 leading-snug">
                          {post.title}
                        </h4>

                        <div className="mt-1.5 text-[11px] text-neutral-600 line-clamp-2 font-medium">
                          {post.captionDraft || 'سناریو و کپشن در دست نگارش است...'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                        <span className="font-bold text-neutral-800">☀️ {shamsi.persian}</span>
                        <span className="font-mono text-neutral-400" dir="ltr">{post.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM FILTER SHEET / DRAWER                    */}
      {/* ========================================================= */}
      {isMobileFilterOpen && (
        <div 
          onClick={() => setIsMobileFilterOpen(false)}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs sm:hidden"
        >
          <div
            className="w-full bg-white rounded-t-3xl border-t border-neutral-200 p-5 space-y-4 max-h-[80vh] overflow-y-auto text-right shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚙️</span>
                <h3 className="text-sm font-black text-neutral-900">
                  تنظیمات و فیلترهای تقویم محتوایی
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Calendar Mode selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                حالت نمایش تاریخ:
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setCalendarMode('dual')}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    calendarMode === 'dual' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  ⚡ همگام دوگانه
                </button>
                <button
                  onClick={() => setCalendarMode('persian')}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    calendarMode === 'persian' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  ☀️ فقط شمسی
                </button>
                <button
                  onClick={() => setCalendarMode('gregorian')}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    calendarMode === 'gregorian' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  🌐 میلادی
                </button>
              </div>
            </div>

            {/* Platform Filters */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                فیلتر بر اساس پلتفرم:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    selectedPlatform === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  همه ({totalCount})
                </button>
                {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => {
                  const count = items.filter((i) => i.platform === key).length;
                  const isSel = selectedPlatform === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPlatform(key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isSel ? `${cfg.color}` : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {cfg.icon} {cfg.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filters */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                فیلتر بر اساس وضعیت انتشار:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border ${
                    selectedStatus === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                  }`}
                >
                  همه وضعیت‌ها
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 ${
                      selectedStatus === key ? `${cfg.color}` : 'bg-neutral-50 border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedPlatform('all');
                  setSelectedStatus('all');
                  setCalendarMode('dual');
                }}
                className="text-xs font-bold text-neutral-500 hover:underline"
              >
                بازنشانی فیلترها
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySummary}
                  className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                >
                  📋 خروجی
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-black shadow-md"
                >
                  مشاهده نتایج ({filteredItems.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODALS (Inspect Post & Add New Post)                    */}
      {/* ========================================================= */}
      {inspectItem && (
        <div 
          onClick={() => setInspectItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden p-4 sm:p-6 space-y-3.5 text-right max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLATFORM_CONFIG[inspectItem.platform].lightBg}`}>
                  {PLATFORM_CONFIG[inspectItem.platform].icon} {PLATFORM_CONFIG[inspectItem.platform].name}
                </span>
                <span className="text-xs text-neutral-500 font-bold">
                  {FORMAT_CONFIG[inspectItem.format]}
                </span>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] font-mono text-amber-600 font-bold block">{inspectItem.theme}</span>
              <h3 className="text-sm sm:text-base font-extrabold text-neutral-900 mt-1 leading-snug">
                {inspectItem.title}
              </h3>
            </div>

            {/* Synced Date Box */}
            <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] font-bold">تاریخ شمسی:</span>
                <span className="font-black text-amber-900 mt-0.5 block">{formatSyncedDate(inspectItem.date).persian}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] font-bold">تاریخ میلادی و ساعت:</span>
                <span className="font-mono font-bold text-neutral-800 mt-0.5 block" dir="ltr">{inspectItem.date} {inspectItem.time && `• ${inspectItem.time}`}</span>
              </div>
            </div>

            {inspectItem.captionDraft && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-neutral-700 block">متن / پیش‌نویس سناریو و کپشن:</span>
                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-xs text-neutral-800 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {inspectItem.captionDraft}
                </div>
              </div>
            )}

            {inspectItem.cta && (
              <div className="text-xs">
                <span className="text-neutral-400 font-bold ml-1">کال تو اکشن (CTA):</span>
                <span className="text-neutral-800 font-medium">{inspectItem.cta}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <button
                onClick={() => handleToggleStatus(inspectItem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${STATUS_CONFIG[inspectItem.status].color}`}
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[inspectItem.status].dot}`} />
                <span>وضعیت: {STATUS_CONFIG[inspectItem.status].label}</span>
              </button>

              <button
                onClick={() => handleDeleteItem(inspectItem.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                حذف برنامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Content Post Modal */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden p-4 sm:p-6 space-y-3.5 text-right max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-xs">
                  +
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-neutral-900">
                  ثبت موضوع و برنامه محتوایی جدید
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  عنوان محتوا / تیتر پست *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: ریلز معرفی کالکشن جدید، ۵ نکته استراتژی برند..."
                  className="w-full py-2 px-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-neutral-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    پلتفرم مقصد
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as ContentItem['platform'])}
                    className="w-full py-2 px-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none bg-white font-medium"
                  >
                    <option value="instagram">اینستاگرام (Instagram)</option>
                    <option value="linkedin">لینکدین (LinkedIn)</option>
                    <option value="youtube">یوتیوب (YouTube)</option>
                    <option value="x">توییتر / X / Threads</option>
                    <option value="website">وب‌سایت / ژورنال</option>
                    <option value="podcast">پادکست (Podcast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    فرمت محتوا
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as ContentItem['format'])}
                    className="w-full py-2 px-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none bg-white font-medium"
                  >
                    <option value="reels">ریلز (Reels)</option>
                    <option value="carousel">کاروسل چند اسلایدی</option>
                    <option value="single-post">تک‌پست تصویری</option>
                    <option value="story">استوری تعاملی</option>
                    <option value="video">ویدئوی پروداکشن</option>
                    <option value="article">مقاله ژورنال</option>
                    <option value="thread">ترد متنی</option>
                  </select>
                </div>
              </div>

              {/* Date Input with Real-time Shamsi Synced Preview */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-700">
                      تاریخ انتشار
                    </label>
                    <span className="text-[10px] text-amber-700 font-bold truncate max-w-[100px]">
                      {newDateShamsi.persian}
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    موضوع / ستون محتوایی
                  </label>
                  <input
                    type="text"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="مثال: لانچ محصول، آموزش"
                    className="w-full py-2 px-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  پیش‌نویس سناریو / کاپشن
                </label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="خلاصه سناریو، پیام کلیدی، هوک اول ویدئو..."
                  className="w-full py-2 px-3 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-neutral-900 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  ثبت در تقویم محتوا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendarWindow;
