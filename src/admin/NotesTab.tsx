import React, { useState, useEffect } from 'react';
import { addToTrash } from '../trashStore';
import {
  StickyNote,
  Plus,
  Trash2,
  Edit3,
  Search,
  Pin,
  Check,
  X,
  Sparkles,
  Tag,
} from 'lucide-react';

export interface ClientNoteItem {
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

const STORAGE_KEY = 'creativity_juice_notes_v2';

const CATEGORY_MAP: Record<ClientNoteItem['category'], { label: string; icon: string }> = {
  idea: { label: 'ایده و طوفان فکری', icon: '💡' },
  strategy: { label: 'استراتژی و هویت برند', icon: '🎯' },
  content: { label: 'سناریو و سوشال مدیا', icon: '🎬' },
  checklist: { label: 'چک‌لیست و اقدامات', icon: '📋' },
  feedback: { label: 'نکات جلسه و فیدبک', icon: '💬' },
};

interface NotesTabProps {
  showToast: (msg: string) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({ showToast }) => {
  const [notes, setNotes] = useState<ClientNoteItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<ClientNoteItem | null>(null);

  const [form, setForm] = useState<Partial<ClientNoteItem>>({
    title: '',
    content: '',
    category: 'idea',
    isPinned: false,
    color: 'amber',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');

  const loadNotes = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          return;
        }
      }
    } catch {}
    setNotes([]);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const saveNotesToStorage = (updatedNotes: ClientNoteItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      window.dispatchEvent(new CustomEvent('creativity_juice_notes_changed'));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingNote(null);
    setForm({
      id: `note-${Date.now()}`,
      title: '',
      content: '',
      category: 'idea',
      isPinned: false,
      color: 'amber',
      tags: ['استودیو'],
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: ClientNoteItem) => {
    setEditingNote(n);
    setForm({ ...n });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleDelete = (note: ClientNoteItem) => {
    addToTrash({
      originalId: note.id,
      title: note.title,
      type: 'note',
      source: 'دفترچه یادداشت و ایده‌ها',
      summary: note.content.slice(0, 100),
      size: `${note.content.length} نویسه`,
      data: note,
    });

    const nextNotes = notes.filter((item) => item.id !== note.id);
    saveNotesToStorage(nextNotes);
    showToast(`یادداشت «${note.title}» به سطل زباله منتقل شد.`);
  };

  const handleTogglePin = (note: ClientNoteItem) => {
    const nextNotes = notes.map((item) =>
      item.id === note.id ? { ...item, isPinned: !item.isPinned } : item
    );
    saveNotesToStorage(nextNotes);
    showToast(note.isPinned ? 'یادداشت از حالت پین خارج شد.' : 'یادداشت در بالا پین شد.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.content?.trim()) {
      showToast('لطفاً عنوان و متن یادداشت را وارد کنید.');
      return;
    }

    const nowStr = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const noteItem: ClientNoteItem = {
      id: editingNote ? editingNote.id : form.id || `note-${Date.now()}`,
      title: form.title,
      content: form.content,
      category: form.category || 'idea',
      isPinned: Boolean(form.isPinned),
      color: form.color || 'amber',
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persianDate: nowStr,
      tags: form.tags && form.tags.length > 0 ? form.tags : ['ایده'],
    };

    let nextNotes: ClientNoteItem[];
    if (editingNote) {
      nextNotes = notes.map((item) => (item.id === noteItem.id ? noteItem : item));
    } else {
      nextNotes = [noteItem, ...notes];
    }

    saveNotesToStorage(nextNotes);
    setIsModalOpen(false);
    showToast(editingNote ? 'یادداشت با موفقیت ذخیره شد.' : 'ایده و یادداشت جدید با موفقیت ثبت شد.');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0E0E10] text-[#E4E4E7]">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-[#27272A] bg-[#141417]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-amber-500" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              یادداشت‌ها و ایده‌های کارفرما (Client Ideas & Notes CMS)
            </h1>
            <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
              {notes.length} یادداشت
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            مشاهده، ثبت و ویرایش ایده‌ها، بازخوردهای کارفرما و نکات استراتژیک پروژه‌ها
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن یادداشت / ایده جدید</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] bg-[#121214] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در عنوان یا متن یادداشت‌ها..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
          {[
            { id: 'all', label: 'همه' },
            { id: 'idea', label: '💡 ایده‌ها' },
            { id: 'strategy', label: '🎯 استراتژی' },
            { id: 'content', label: '🎬 سناریو و سوشال' },
            { id: 'checklist', label: '📋 چک‌لیست' },
            { id: 'feedback', label: '💬 فیدبک جلسه' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 space-y-2">
            <StickyNote className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">هیچ یادداشتی در این بخش ثبت نشده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`bg-[#141417] border rounded-2xl p-5 flex flex-col justify-between transition group relative ${
                  note.isPinned ? 'border-amber-500/60 shadow-lg shadow-amber-500/5' : 'border-[#27272A] hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{CATEGORY_MAP[note.category]?.icon || '📝'}</span>
                      <span>{CATEGORY_MAP[note.category]?.label || 'یادداشت'}</span>
                    </span>

                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1 rounded hover:bg-neutral-800 transition cursor-pointer ${
                        note.isPinned ? 'text-amber-400' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={note.isPinned ? 'حذف پین' : 'پین کردن در بالا'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition mb-2">
                    {note.title}
                  </h3>

                  <p className="text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {note.content}
                  </p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[#27272A]">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{note.persianDate}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded hover:bg-neutral-800 transition cursor-pointer"
                      title="ویرایش یادداشت"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition cursor-pointer"
                      title="حذف به سطل زباله"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {editingNote ? 'ویرایش یادداشت' : 'افزودن ایده یا یادداشت جدید'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان یادداشت یا ایده *</label>
                <input
                  type="text"
                  required
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: ایده کمپین دراپ نوروزی و بسته‌بندی طلاکوب"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">دسته‌بندی</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="idea">💡 ایده و طوفان فکری</option>
                  <option value="strategy">🎯 استراتژی و هویت برند</option>
                  <option value="content">🎬 سناریو و سوشال مدیا</option>
                  <option value="checklist">📋 چک‌لیست و اقدامات</option>
                  <option value="feedback">💬 نکات جلسه و فیدبک</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">متن کامل یادداشت یا توضیحات ایده *</label>
                <textarea
                  rows={5}
                  required
                  value={form.content || ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="جزئیات، رفرنس‌ها و نکات کلیدی..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">برچسب‌ها</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="برچسب جدید و اینتر..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          setForm({
                            ...form,
                            tags: [...(form.tags || []), tagInput.trim()],
                          });
                          setTagInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        setForm({
                          ...form,
                          tags: [...(form.tags || []), tagInput.trim()],
                        });
                        setTagInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition"
                  >
                    افزودن
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(form.tags || []).map((t, idx) => (
                    <span key={idx} className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded flex items-center gap-1">
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            tags: (form.tags || []).filter((_, i) => i !== idx),
                          })
                        }
                        className="text-neutral-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isPinned)}
                    onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                    className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span>پین کردن در بالای دفترچه یادداشت</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingNote ? 'ذخیره تغییرات یادداشت' : 'ثبت یادداشت در استودیو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
