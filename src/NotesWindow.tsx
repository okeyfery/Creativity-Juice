/**
 * Creativity Juice — Client & Studio Notes & Creative Sparks
 * Interactive notebook for clients and team to jot down ideas, campaign briefs,
 * brand strategies, and creative checklists with real-time localStorage persistence.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { addToTrash, NOTE_RESTORE_EVENT } from './trashStore';

export interface ClientNote {
  id: string;
  title: string;
  content: string;
  category: 'idea' | 'strategy' | 'content' | 'checklist' | 'feedback';
  isPinned: boolean;
  color: 'amber' | 'rose' | 'sky' | 'emerald' | 'neutral';
  createdAt: string;
  updatedAt: string;
  persianDate: string;
  tags: string[];
}

const CATEGORY_MAP: Record<ClientNote['category'], { label: string; icon: string; badge: string }> = {
  idea: { label: 'ایده و طوفان فکری', icon: '💡', badge: 'bg-amber-100 text-amber-900 border-amber-300' },
  strategy: { label: 'استراتژی و هویت برند', icon: '🎯', badge: 'bg-purple-100 text-purple-900 border-purple-300' },
  content: { label: 'سناریو و سوشال مدیا', icon: '🎬', badge: 'bg-sky-100 text-sky-900 border-sky-300' },
  checklist: { label: 'چک‌لیست و اقدامات', icon: '📋', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  feedback: { label: 'نکات جلسه و فیدبک', icon: '💬', badge: 'bg-rose-100 text-rose-900 border-rose-300' },
};

const COLOR_MAP: Record<ClientNote['color'], { bg: string; border: string; bar: string; lightBg: string }> = {
  amber: { bg: 'bg-amber-500', border: 'border-amber-400', bar: 'bg-amber-500', lightBg: 'bg-[#FFFBEB]' },
  rose: { bg: 'bg-rose-500', border: 'border-rose-400', bar: 'bg-rose-500', lightBg: 'bg-[#FFF1F2]' },
  sky: { bg: 'bg-sky-500', border: 'border-sky-400', bar: 'bg-sky-500', lightBg: 'bg-[#F0F9FF]' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-400', bar: 'bg-emerald-500', lightBg: 'bg-[#ECFDF5]' },
  neutral: { bg: 'bg-neutral-600', border: 'border-neutral-300', bar: 'bg-neutral-600', lightBg: 'bg-[#FAFAF9]' },
};

// Convert ISO date to Persian formatted string
function getPersianDateString(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
    return formatted;
  } catch {
    return '۳ آبان ۱۴۰۵ • ۱۸:۳۰';
  }
}

const STORAGE_KEY = 'creativity_juice_notes_v2';

const SEED_NOTES: ClientNote[] = [
  {
    id: 'note-1',
    title: 'ایده ریلز هویت برند: تفاوت لوگو با دی‌ان‌ای کسب‌وکار',
    category: 'content',
    content: `هوک شروع سناریو: اگر لوگوی برندتان را بپوشانید، مخاطب باز هم متوجه می‌شود این محصول متعلق به شماست؟\n\nنکات کلیدی برای فیلم‌برداری:\n• استفاده از پس‌زمینه مینیمال با نور موضعی گرم\n• نمایش ۲ نمونه بسته‌بندی مینیمال بدون نام برای اثبات هویت متریال\n• کال تو اکشن: «در کامنت بنویسید رنگ امضای برند شما چه حسی به مشتری می‌دهد؟»`,
    isPinned: true,
    color: 'amber',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    persianDate: '۱ آبان ۱۴۰۵ • ۱۶:۴۰',
    tags: ['ریلز', 'استراتژی', 'سناریو'],
  },
  {
    id: 'note-2',
    title: 'نکات جلسه کیک‌اف با کارفرما و هماهنگی خطوط قرمز',
    category: 'feedback',
    content: `خلاصه توافقات با کارفرما در جلسه هماهنگی پروژه:\n\n۱. هویت بصری باید کاملاً معاصر و لوکس باشد و از رنگ‌های کلیشه‌ای آبی شرکتی پرهیز شود.\n۲. تمرکز کمپین ماه اول روی پرستیژ و داستان سرآغاز (Origin Story) خواهد بود.\n۳. متریال بسته‌بندی: کاغذ کتان بافت‌دار سوئیسی همراه با فویل‌کوب مات.\n۴. ددلاین تحویل اتودهای مرحله اول: ۱۰ روز کاری آینده.`,
    isPinned: true,
    color: 'rose',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    persianDate: '۲ آبان ۱۴۰۵ • ۱۱:۱۵',
    tags: ['کلاینت', 'جلسه', 'بریف'],
  },
  {
    id: 'note-3',
    title: 'طوفان فکری: شعارها و مانیفست کمپین زمستانه',
    category: 'idea',
    content: `ایده‌های اولیه برای مانیفست جدید استودیو:\n\n• «خلاقیت تصادفی نیست؛ مهندسی حس و پرستیژ است.»\n• «کمتر تزئین کنید، عمیق‌تر حرف بزنید.»\n• «برندهایی که ماندگار می‌شوند، ترندها را دنبال نمی‌کنند؛ آن‌ها را بازتعریف می‌کنند.»\n\nبررسی برای لانچ در بیلبوردهای دیجیتال و بنر اصلی وب‌سایت.`,
    isPinned: false,
    color: 'sky',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    persianDate: '۳ آبان ۱۴۰۵ • ۰۹:۲۰',
    tags: ['مانیفست', 'کپی‌رایتینگ', 'ایده'],
  },
  {
    id: 'note-4',
    title: 'چک‌لیست تحویل بسته جامع برند و پروداکشن',
    category: 'checklist',
    content: `فهرست کنترل نهایی قبل از جلسه خروجی:\n\n[✓] بررسی کنتراست رنگ‌های پالت در چاپ افست و نمایشگرهای OLED\n[✓] فولدر اختصاصی تایپوگرافی با لایسنس کامل وب و دسکتاپ\n[✓] راهنمای جامع پترن‌ها و ابعاد مجاز لوگو در سوشال مدیا\n[ ] اکسپورت تیزر ۴K با اصلاح رنگ سینمایی (DaVinci Resolve)\n[ ] آماده‌سازی فایل ارائه‌ با تم دارک ادیتوریال`,
    isPinned: false,
    color: 'emerald',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    persianDate: '۳ آبان ۱۴۰۵ • ۱۵:۰۰',
    tags: ['چک‌لیست', 'کنترل کیفیت', 'تحویل'],
  },
];

interface NotesWindowProps {
  onClose?: () => void;
  onOpenContact?: () => void;
}

export const NotesWindow: React.FC<NotesWindowProps> = ({ onClose, onOpenContact }) => {
  const [notes, setNotes] = useState<ClientNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading notes from localStorage:', e);
    }
    return SEED_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(() => {
    return notes[0]?.id || '';
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [trashNotification, setTrashNotification] = useState<string | null>(null);

  // Listen for restored notes from Trash Bin
  useEffect(() => {
    const handleRestored = (e: any) => {
      const restoredNote = e.detail as ClientNote;
      if (restoredNote) {
        setNotes((prev) => {
          if (prev.some((n) => n.id === restoredNote.id)) return prev;
          return [restoredNote, ...prev];
        });
        setSelectedNoteId(restoredNote.id);
        setTrashNotification(`«${restoredNote.title || 'یادداشت'}» از سطل زباله بازیابی شد.`);
        setTimeout(() => setTrashNotification(null), 3500);
      }
    };
    window.addEventListener(NOTE_RESTORE_EVENT, handleRestored);
    return () => window.removeEventListener(NOTE_RESTORE_EVENT, handleRestored);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }, [notes]);

  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  // Filter and sort notes (pinned first, then newest updated)
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesCategory = activeCategory === 'all' || note.category === activeCategory;
        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q) ||
          note.tags.some((t) => t.toLowerCase().includes(q));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, activeCategory, searchQuery]);

  // Create new blank note
  const handleCreateNote = () => {
    const now = new Date();
    const newNote: ClientNote = {
      id: `note-${Date.now()}`,
      title: 'یادداشت جدید',
      content: '',
      category: activeCategory !== 'all' ? (activeCategory as ClientNote['category']) : 'idea',
      isPinned: false,
      color: 'amber',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      persianDate: getPersianDateString(now),
      tags: ['ایده جدید'],
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    setMobileView('detail');
  };

  // Update current active note field
  const handleUpdateActiveNote = (updates: Partial<ClientNote>) => {
    if (!activeNote) return;
    const now = new Date();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== activeNote.id) return n;
        return {
          ...n,
          ...updates,
          updatedAt: now.toISOString(),
          persianDate: getPersianDateString(now),
        };
      })
    );
  };

  // Toggle pin
  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  // Delete note -> moves safely to trash bin
  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const noteToTrash = notes.find((n) => n.id === id);
    if (!noteToTrash) return;

    addToTrash({
      originalId: noteToTrash.id,
      title: noteToTrash.title.trim() || 'یادداشت بدون عنوان',
      type: 'note',
      source: 'دفترچه یادداشت',
      summary: noteToTrash.content.trim() ? noteToTrash.content.slice(0, 90) : 'بدون متن',
      data: noteToTrash,
    });

    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id) {
      setSelectedNoteId(remaining[0]?.id || '');
      setMobileView('list');
    }
    setTrashNotification(`«${noteToTrash.title || 'یادداشت'}» به سطل زباله منتقل شد.`);
    setTimeout(() => setTrashNotification(null), 3500);
  };

  // Copy current note or export all
  const handleCopyActiveNote = () => {
    if (!activeNote) return;
    const text = `📌 ${activeNote.title}\n📅 تاریخ: ${activeNote.persianDate}\nدسته‌بندی: ${CATEGORY_MAP[activeNote.category].label}\nبرچسب‌ها: ${activeNote.tags.join('، ')}\n\n${activeNote.content}`;
    navigator.clipboard.writeText(text);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleExportAll = () => {
    const text = notes
      .map(
        (n, idx) =>
          `[${idx + 1}] ${n.title} ${n.isPinned ? '📌' : ''}\nتاریخ: ${n.persianDate} | دسته: ${CATEGORY_MAP[n.category].label}\n-----------------------------------\n${n.content}\n`
      )
      .join('\n\n===================================\n\n');

    navigator.clipboard.writeText(`مجموعه یادداشت‌ها و ایده‌های کارفرما و استودیو Creativity Juice:\n\n${text}`);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[82vh] bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right" dir="rtl">
      {/* Toast Notification */}
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

      {/* Top Header Bar */}
      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-white border-b border-neutral-200/90 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black shadow-xs text-sm sm:text-base">
            📝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm md:text-base font-extrabold text-neutral-900 tracking-tight">
                دفترچه یادداشت، ایده‌ها و طوفان فکری
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                ذخیره لحظه‌ای خودکار
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
              فضای اختصاصی کارفرما و تیم برای ثبت ایده‌ها، سناریوها، فیدبک‌ها و چک‌لیست‌ها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAll}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold transition-all cursor-pointer"
            title="کپی متن تمام یادداشت‌ها در کلیپ‌بورد"
          >
            <span>{copiedStatus ? '✓ کپی شد!' : '📋 خروجی کلی'}</span>
          </button>

          <button
            onClick={handleCreateNote}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            title="ایجاد یادداشت جدید"
          >
            <span className="text-sm leading-none">+</span>
            <span>نوت جدید</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Notes List Column */}
        <div
          className={`w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-l border-neutral-200/90 bg-[#F7F5F0] flex flex-col shrink-0 ${
            mobileView === 'detail' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search and Filters */}
          <div className="p-3 bg-white border-b border-neutral-200/80 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در متن، تیتر و تگ‌ها..."
                className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-neutral-100 border border-neutral-200/80 focus:bg-white focus:border-amber-500 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                همه ({notes.length})
              </button>
              {Object.entries(CATEGORY_MAP).map(([key, cfg]) => {
                const count = notes.filter((n) => n.category === key).length;
                const isSel = activeCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                      isSel
                        ? 'bg-amber-500 text-neutral-950 shadow-2xs font-black'
                        : 'bg-white border border-neutral-200/90 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    <span>{cfg.label.split(' ')[0]}</span>
                    <span className="opacity-70 font-mono text-[9px]">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Scrollable Cards */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y-0">
            {filteredNotes.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-xs space-y-2">
                <span className="text-2xl block">✏️</span>
                <p className="font-bold">هیچ یادداشتی یافت نشد</p>
                <p className="text-[11px] text-neutral-400">با دکمه «نوت جدید» اولین ایده را ثبت کنید.</p>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = activeNote?.id === note.id;
                const colorConfig = COLOR_MAP[note.color] || COLOR_MAP.amber;
                const categoryConfig = CATEGORY_MAP[note.category] || CATEGORY_MAP.idea;

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setMobileView('detail');
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer relative group text-right ${
                      isSelected
                        ? 'bg-white border-amber-400/90 shadow-xs ring-1 ring-amber-400/30'
                        : 'bg-white/80 hover:bg-white border-neutral-200/80 hover:border-neutral-300'
                    }`}
                  >
                    {/* Left Accent Color Indicator Bar */}
                    <div
                      className={`absolute right-1 top-3 bottom-3 w-1 rounded-full ${colorConfig.bar}`}
                    />

                    <div className="pr-2 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {note.isPinned && (
                            <span className="text-[11px] text-amber-600" title="پین شده">
                              📌
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-neutral-900 truncate">
                            {note.title.trim() || 'بدون عنوان'}
                          </h4>
                        </div>
                        <span className="text-[9px] text-neutral-400 font-mono shrink-0">
                          {note.persianDate.split('•')[0]}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-600 line-clamp-2 leading-relaxed">
                        {note.content.trim() || 'متن یادداشت هنوز خالی است...'}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px]">
                        <span
                          className={`px-1.5 py-0.2 rounded-md font-bold text-[9px] border ${categoryConfig.badge}`}
                        >
                          {categoryConfig.icon} {categoryConfig.label}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleTogglePin(note.id, e)}
                            className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-amber-600 text-xs"
                            title={note.isPinned ? 'برداشتن پین' : 'پین کردن به بالا'}
                          >
                            📌
                          </button>
                          <button
                            onClick={(e) => handleDeleteNote(note.id, e)}
                            className="p-1 rounded hover:bg-rose-50 text-neutral-400 hover:text-rose-600 text-xs"
                            title="حذف یادداشت"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Count Bar */}
          <div className="p-2.5 bg-white border-t border-neutral-200/90 text-center text-[10px] text-neutral-500 font-medium">
            <span>{notes.length} یادداشت در حافظه</span>
            <span className="mx-1">•</span>
            <span>{notes.filter((n) => n.isPinned).length} پین شده</span>
          </div>
        </div>

        {/* Note Writing Pad Column */}
        <div
          className={`flex-1 flex flex-col bg-[#FAF8F5] overflow-hidden ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activeNote ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Note Action Bar */}
              <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1"
                  >
                    <span>→</span>
                    <span>لیست نوت‌ها</span>
                  </button>

                  {/* Category Selector */}
                  <select
                    value={activeNote.category}
                    onChange={(e) =>
                      handleUpdateActiveNote({
                        category: e.target.value as ClientNote['category'],
                      })
                    }
                    className="py-1 px-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-800 bg-neutral-50 outline-none cursor-pointer hover:bg-white transition-colors"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.icon} {cfg.label}
                      </option>
                    ))}
                  </select>

                  {/* Color Palette Flags */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xl border border-neutral-200">
                    {(Object.keys(COLOR_MAP) as ClientNote['color'][]).map((clr) => (
                      <button
                        key={clr}
                        onClick={() => handleUpdateActiveNote({ color: clr })}
                        className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                          COLOR_MAP[clr].bg
                        } ${activeNote.color === clr ? 'scale-125 ring-2 ring-neutral-900 shadow-xs' : 'opacity-70 hover:opacity-100'}`}
                        title={`رنگ ${clr}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleTogglePin(activeNote.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      activeNote.isPinned
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                    }`}
                    title="پین یا پین نکردن"
                  >
                    <span>📌</span>
                    <span className="hidden sm:inline mr-1">
                      {activeNote.isPinned ? 'پین شده' : 'پین'}
                    </span>
                  </button>

                  <button
                    onClick={handleCopyActiveNote}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-all cursor-pointer flex items-center gap-1"
                    title="کپی متن یادداشت"
                  >
                    <span>📋</span>
                    <span>{copiedStatus ? 'کپی شد!' : 'کپی'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteNote(activeNote.id)}
                    className="p-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                    title="حذف این یادداشت"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Timestamp & Meta Bar */}
              <div className="px-4 sm:px-6 py-1.5 bg-[#F9F7F2] border-b border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <div className="flex items-center gap-2">
                  <span>آخرین ویرایش: {activeNote.persianDate}</span>
                </div>
                <div>
                  <span>
                    {activeNote.content.trim().length} کاراکتر •{' '}
                    {activeNote.content.trim() ? activeNote.content.trim().split(/\s+/).length : 0} کلمه
                  </span>
                </div>
              </div>

              {/* Title & Body Inputs */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 flex flex-col">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="عنوان یادداشت یا ایده..."
                  className="w-full text-base sm:text-lg md:text-xl font-black text-neutral-900 placeholder:text-neutral-300 bg-transparent border-none outline-none leading-tight"
                />

                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                  placeholder="ایده، سناریو، فیدبک جلسه یا چک‌لیست را اینجا بنویسید... (به صورت خودکار در مرورگر ذخیره می‌شود)"
                  className="w-full flex-1 bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-300 leading-relaxed font-sans min-h-[220px]"
                />

                {/* Tags Management at the bottom */}
                <div className="pt-3 border-t border-neutral-200/70 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-400">برچسب‌ها:</span>
                  {activeNote.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center gap-1"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() =>
                          handleUpdateActiveNote({
                            tags: activeNote.tags.filter((_, i) => i !== idx),
                          })
                        }
                        className="hover:text-rose-500 text-[9px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const tag = window.prompt('نام برچسب جدید:');
                      if (tag && tag.trim()) {
                        handleUpdateActiveNote({
                          tags: [...activeNote.tags, tag.trim()],
                        });
                      }
                    }}
                    className="px-2 py-0.5 rounded-md border border-dashed border-neutral-300 text-neutral-500 hover:text-neutral-800 text-[10px] font-bold cursor-pointer hover:bg-neutral-100"
                  >
                    + برچسب
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400 space-y-3">
              <span className="text-4xl">📝</span>
              <h3 className="text-sm font-bold text-neutral-700">هیچ یادداشتی انتخاب نشده است</h3>
              <p className="text-xs max-w-sm">یک یادداشت را از ستون کناری انتخاب کنید یا با زدن دکمه «نوت جدید»، ایده جدیدی بنویسید.</p>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs shadow-sm hover:bg-amber-600 transition-all cursor-pointer"
              >
                + ثبت اولین یادداشت
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesWindow;
