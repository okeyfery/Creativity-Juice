/**
 * Creativity Juice — Interactive Trash Bin Window (سطل زباله هوشمند)
 * Displays all discarded items (Notes, Social Media posts, Dossiers, Clichés).
 * Keeps items safely preserved until the user decides to restore them or delete them permanently.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrashedItem,
  getTrashItems,
  restoreTrashItem,
  deleteTrashItemPermanently,
  emptyTrashPermanently,
  subscribeTrash,
} from './trashStore';

interface TrashBinWindowProps {
  onClose?: () => void;
  onRestoreDesktopItem?: (item: TrashedItem) => void;
}

const TYPE_CONFIG: Record<
  TrashedItem['type'],
  { label: string; icon: string; badge: string; color: string }
> = {
  note: {
    label: 'یادداشت',
    icon: '📝',
    badge: 'bg-amber-100 text-amber-900 border-amber-300',
    color: 'text-amber-700',
  },
  calendar_post: {
    label: 'برنامه محتوا',
    icon: '📅',
    badge: 'bg-sky-100 text-sky-900 border-sky-300',
    color: 'text-sky-700',
  },
  document: {
    label: 'سند استراتژی',
    icon: '📄',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    color: 'text-emerald-700',
  },
  folder: {
    label: 'پوشه دسکتاپ',
    icon: '📁',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    color: 'text-indigo-700',
  },
  project: {
    label: 'پرونده پروژه',
    icon: '💼',
    badge: 'bg-purple-100 text-purple-900 border-purple-300',
    color: 'text-purple-700',
  },
  cliche: {
    label: 'کلیشه رد شده',
    icon: '⚠️',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    color: 'text-rose-700',
  },
};

export const TrashBinWindow: React.FC<TrashBinWindowProps> = ({ onClose, onRestoreDesktopItem }) => {
  const [items, setItems] = useState<TrashedItem[]>(() => getTrashItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [restoredNotification, setRestoredNotification] = useState<string | null>(null);

  // Subscribe to external trash updates
  useEffect(() => {
    return subscribeTrash((updated) => {
      setItems(updated);
    });
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType = selectedType === 'all' || item.type === selectedType;
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.summary && item.summary.toLowerCase().includes(q)) ||
        item.source.toLowerCase().includes(q);
      return matchType && matchQuery;
    });
  }, [items, selectedType, searchQuery]);

  // Restore item handler
  const handleRestore = (id: string) => {
    const restored = restoreTrashItem(id);
    if (restored) {
      if (onRestoreDesktopItem && (restored.type === 'document' || restored.type === 'folder' || restored.type === 'project')) {
        onRestoreDesktopItem(restored);
      }
      setRestoredNotification(`«${restored.title}» با موفقیت به ${restored.source} بازگردانده شد.`);
      setTimeout(() => setRestoredNotification(null), 3500);
    }
  };

  // Permanently delete single item
  const handleDeleteForever = (id: string, title: string) => {
    if (window.confirm(`آیا از حذف قطعی و غیرقابل بازگشت «${title}» از سطل زباله اطمینان دارید؟`)) {
      deleteTrashItemPermanently(id);
    }
  };

  // Empty trash permanently
  const handleEmptyTrash = () => {
    if (items.length === 0) return;
    if (
      window.confirm(
        `آیا مطمئن هستید که می‌خواهید تمام ${items.length} آیتم موجود در سطل زباله را برای همیشه پاک کنید؟ این عملیات قابل بازگشت نیست.`
      )
    ) {
      emptyTrashPermanently();
    }
  };

  return (
    <div
      className="flex flex-col h-full max-h-[85vh] sm:max-h-[82vh] bg-[#FAF8F5] text-neutral-900 font-sans select-none overflow-hidden text-right"
      dir="rtl"
    >
      {/* Notification Toast */}
      {restoredNotification && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between gap-2 shadow-sm animate-fade-in shrink-0">
          <div className="flex items-center gap-1.5">
            <span>✓</span>
            <span>{restoredNotification}</span>
          </div>
          <button
            onClick={() => setRestoredNotification(null)}
            className="text-white/80 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="px-3.5 sm:px-5 py-3 bg-white border-b border-neutral-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center font-black shadow-xs text-base">
            🗑️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 tracking-tight">
                سطل زباله استودیو (Trash & Recycle Bin)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[10px] font-bold border border-neutral-200 font-mono">
                {items.length} مورد
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
              اقلام پاک‌شده تا زمانی که خودتان تصمیم به حذف نهایی بگیرید در اینجا به صورت امن نگهداری می‌شوند.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={handleEmptyTrash}
              className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="پاک کردن همیشگی تمام فایل‌های سطل زباله"
            >
              <span>🗑️</span>
              <span>خالی کردن سطل زباله</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="px-3.5 sm:px-5 py-2.5 bg-[#F5F2EB] border-b border-neutral-200/90 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === 'all'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            همه اقلام ({items.length})
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
            const count = items.filter((i) => i.type === key).length;
            if (count === 0 && selectedType !== key) return null;
            const isSel = selectedType === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? 'bg-amber-500 text-neutral-950 shadow-2xs font-black'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className="font-mono text-[9px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[180px] sm:min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در سطل زباله..."
            className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-white border border-neutral-200/90 focus:border-amber-500 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none"
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
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-5">
        {filteredItems.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-neutral-400">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-3xl">
              🗑️
            </div>
            <h3 className="text-sm font-bold text-neutral-700">
              {searchQuery ? 'هیچ موردی با این جستجو یافت نشد' : 'سطل زباله کاملاً خالی است'}
            </h3>
            <p className="text-xs max-w-sm text-neutral-500">
              هر زمان یادداشت، برنامه محتوایی، سند یا پروژه‌ای را پاک کنید، برای محافظت از حذف ناخواسته ابتدا به اینجا منتقل می‌شود.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.cliche;
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group text-right"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-neutral-200 flex items-center justify-center text-lg shrink-0 mt-0.5">
                      {cfg.icon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md border ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-neutral-900 truncate">
                          {item.title}
                        </h4>
                        {item.size && (
                          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                            {item.size}
                          </span>
                        )}
                      </div>

                      {item.summary && (
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-medium pt-0.5">
                        <span>منبع: <strong className="text-neutral-600">{item.source}</strong></span>
                        <span>•</span>
                        <span>زمان حذف: {item.persianDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                    {item.type !== 'cliche' && (
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                        title="بازگردانی این آیتم به جای اولیه‌اش"
                      >
                        <span>↩️</span>
                        <span>بازیابی</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteForever(item.id, item.title)}
                      className="px-2.5 py-1.5 rounded-xl border border-neutral-200 hover:border-rose-300 hover:bg-rose-50 text-neutral-500 hover:text-rose-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="حذف همیشگی از سطل زباله"
                    >
                      <span>✕</span>
                      <span className="text-[11px]">حذف قطعی</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-white border-t border-neutral-200/90 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
        <span>
          💡 برای بازگرداندن هر فایل یا یادداشت روی دکمه <strong>«بازیابی»</strong> کلیک کنید.
        </span>
        <span className="font-mono">
          {items.length} فایل در سطل
        </span>
      </div>
    </div>
  );
};

export default TrashBinWindow;
