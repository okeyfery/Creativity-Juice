import React, { useState, useMemo } from 'react';
import { MediaItem } from '../adminStore';
import { Image as ImageIcon, Search, Check, X, Filter } from 'lucide-react';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: MediaItem[];
  onSelectPhoto: (url: string) => void;
  title?: string;
  subtitle?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  mediaItems,
  onSelectPhoto,
  title = 'انتخاب تصویر از کتابخانه استودیو',
  subtitle = 'روی هر تصویر کلیک کنید تا بلافاصله اعمال شود',
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [mediaItems, search, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[170] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn" dir="rtl">
      <div className="bg-[#141417] border border-[#27272A] w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">{title}</h2>
              <p className="text-[11px] text-neutral-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#27272A] bg-[#121214] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام تصویر یا برچسب‌ها..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
            {[
              { id: 'all', label: 'همه' },
              { id: 'projects', label: 'پروژه‌ها' },
              { id: 'wallpapers', label: 'والپیپرها' },
              { id: 'cinema', label: 'سینما و مد' },
              { id: 'packaging', label: 'بسته‌بندی' },
              { id: 'brand', label: 'هویت برند' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 space-y-2">
              <ImageIcon className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-medium">هیچ تصویری مطابق با جستجوی شما یافت نشد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredMedia.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    onSelectPhoto(photo.url);
                    onClose();
                  }}
                  className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-amber-500/80 bg-neutral-950 cursor-pointer transition-all hover:scale-[1.02] shadow-sm hover:shadow-amber-500/10 flex flex-col"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="px-2.5 py-1 rounded-md bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-lg">
                        <Check className="w-3.5 h-3.5" />
                        انتخاب
                      </span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#161619] border-t border-neutral-800/80">
                    <p className="text-xs font-semibold text-neutral-200 truncate group-hover:text-amber-400">
                      {photo.title}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 font-mono">
                      <span>{photo.aspectRatio || '16:9'}</span>
                      <span className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400">
                        {photo.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[#27272A] bg-[#161619] flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>مجموع {filteredMedia.length} تصویر در دسترس</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
