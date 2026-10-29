import React, { useState, useMemo } from 'react';
import { ServiceItem, getServices, saveService, deleteService } from '../adminStore';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  Search,
  Check,
  Star,
  Copy,
  Clock,
  Layers,
  X,
  FileText,
} from 'lucide-react';

interface ServicesTabProps {
  showToast: (msg: string) => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ showToast }) => {
  const [services, setServices] = useState<ServiceItem[]>(() => getServices());
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<ServiceItem>>({
    code: 'SRV-11 // SPECIAL SERVICE',
    deptId: 1,
    deptName: 'معماری و هویت برند',
    deptTrack: 'TRACK 01 // BRAND IDENTITY',
    badge: 'خدمت تخصصی آتلیه',
    title: '',
    titleEn: '',
    fileName: 'SRV-11_سند_تخصصی.pdf',
    fileSize: '15.0 MB',
    fileExt: 'PDF',
    description: '',
    deliverables: [],
    suitableFor: '',
    timeline: '۳ تا ۴ هفته',
    engagementType: 'sprint',
    popular: false,
  });

  const [deliverableInput, setDeliverableInput] = useState('');

  const refreshServices = () => {
    setServices(getServices());
  };

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrack = trackFilter === 'all' || String(s.deptId) === trackFilter;
      return matchesSearch && matchesTrack;
    });
  }, [services, searchQuery, trackFilter]);

  const handleOpenCreate = () => {
    setEditingService(null);
    const nextNum = services.length + 1;
    const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setForm({
      id: `srv-${padded}`,
      code: `SRV-${padded} // SPECIAL FOCUS`,
      deptId: 1,
      deptName: 'معماری و هویت برند',
      deptTrack: 'TRACK 01 // BRAND IDENTITY',
      badge: 'پروژه‌محور • فونداسیون برند',
      title: '',
      titleEn: '',
      fileName: `SRV-${padded}_سند_خدمت_استودیو.pdf`,
      fileSize: '18.5 MB',
      fileExt: 'PDF',
      description: '',
      deliverables: ['سند استراتژی جامع', 'گایدلاین اجرایی'],
      suitableFor: 'برندهای در حال توسعه و پروژه‌های نوآور',
      timeline: '۳ تا ۴ هفته',
      engagementType: 'sprint',
      popular: false,
    });
    setDeliverableInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setForm({ ...srv });
    setDeliverableInput('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    deleteService(id);
    refreshServices();
    showToast(`خدمت «${title}» به سطل زباله منتقل شد.`);
  };

  const handleDuplicate = (srv: ServiceItem) => {
    const nextNum = services.length + 1;
    const padded = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    const duplicated: ServiceItem = {
      ...srv,
      id: `srv-${padded}-${Date.now().toString().slice(-4)}`,
      code: `${srv.code} (کپی)`,
      title: `${srv.title} (نسخه جدید)`,
      titleEn: `${srv.titleEn} (Copy)`,
    };
    saveService(duplicated);
    refreshServices();
    showToast(`نسخه جدیدی از خدمت «${srv.title}» ساخته شد.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      showToast('لطفاً عنوان خدمت را وارد کنید.');
      return;
    }

    const deptMap: Record<number, { name: string; track: string }> = {
      1: { name: 'معماری و هویت برند', track: 'TRACK 01 // BRAND IDENTITY' },
      2: { name: 'سینما، مد و محتوای شاخص', track: 'TRACK 02 // CINEMA & VISUALS' },
      3: { name: 'مارکتینگ فرهنگی و کمپین‌ها', track: 'TRACK 03 // CAMPAIGNS & ACTIVATIONS' },
      4: { name: 'مشاوره ارشد و کنسلیری', track: 'TRACK 04 // STRATEGIC COUNSEL' },
    };

    const targetDeptId = Number(form.deptId) || 1;
    const targetDept = deptMap[targetDeptId] || deptMap[1];

    const finalService: ServiceItem = {
      id: editingService ? editingService.id : form.id || `srv-${Date.now()}`,
      code: form.code || 'SRV // FOCUS',
      deptId: targetDeptId,
      deptName: targetDept.name,
      deptTrack: targetDept.track,
      badge: form.badge || 'خدمت تخصصی استودیو',
      title: form.title,
      titleEn: form.titleEn || form.title,
      fileName: form.fileName || `${form.code}.pdf`,
      fileSize: form.fileSize || '15 MB',
      fileExt: form.fileExt || 'PDF',
      description: form.description || '',
      deliverables:
        form.deliverables && form.deliverables.length > 0
          ? form.deliverables
          : ['سند استراتژی تخصصی', 'خروجی‌های تحویل‌شدنی'],
      suitableFor: form.suitableFor || 'کسب‌وکارها و پروژه‌های پرمیوم',
      timeline: form.timeline || '۳ تا ۵ هفته',
      engagementType: form.engagementType || 'sprint',
      popular: Boolean(form.popular),
    };

    saveService(finalService);
    refreshServices();
    setIsModalOpen(false);
    showToast(editingService ? 'خدمت با موفقیت ویرایش شد.' : 'خدمت جدید به کاتالوگ استودیو اضافه شد.');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0E0E10] text-[#E4E4E7]">
      {/* Tab Header Controls */}
      <div className="p-4 sm:p-6 border-b border-[#27272A] bg-[#141417]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" />
            <h1 className="text-base sm:text-lg font-bold text-white">مدیریت خدمات و دپارتمان‌ها (Services CMS)</h1>
            <span className="text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
              {services.length} خدمت فعال
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            ویرایش، افزودن و کالبدشکافی اقلام تحویل‌شدنی، زمان‌بندی و دسته‌بندی تِرَک‌های استودیو
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن خدمت جدید</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#27272A] bg-[#121214] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در عنوان خدمت، کد، یا اقلام..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Track Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
          {[
            { id: 'all', label: 'همه تِرَک‌ها' },
            { id: '1', label: 'تِرَک ۱: هویت برند' },
            { id: '2', label: 'تِرَک ۲: سینما و محتوا' },
            { id: '3', label: 'تِرَک ۳: مارکتینگ و دراپ' },
            { id: '4', label: 'تِرَک ۴: مشاوره ارشد' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTrackFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                trackFilter === t.id
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 text-neutral-500 space-y-2">
            <Briefcase className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">هیچ خدمتی مطابق با فیلتر یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-[#141417] border border-[#27272A] hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition group relative"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {srv.code}
                      </span>
                      <span className="text-[11px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
                        {srv.deptTrack.split('//')[1]?.trim() || srv.deptName}
                      </span>
                    </div>

                    {srv.popular && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        شاخص
                      </span>
                    )}
                  </div>

                  {/* Title & English */}
                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition">
                    {srv.title}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5" dir="ltr">
                    {srv.titleEn}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-neutral-300 mt-3 line-clamp-3 leading-relaxed">
                    {srv.description}
                  </p>

                  {/* Deliverables Pills */}
                  <div className="mt-4 pt-3 border-t border-[#27272A] space-y-1.5">
                    <span className="text-[11px] text-neutral-400 font-medium block">
                      اقلام تحویل‌شدنی ({srv.deliverables.length} مورد):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {srv.deliverables.slice(0, 3).map((del, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                        >
                          ✓ {del}
                        </span>
                      ))}
                      {srv.deliverables.length > 3 && (
                        <span className="text-[11px] text-amber-500 font-bold self-center">
                          +{srv.deliverables.length - 3} مورد دیگر
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta Specs */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#27272A] text-[11px]">
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{srv.timeline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-400 font-mono" dir="ltr">
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{srv.fileSize}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="mt-5 pt-3 border-t border-[#27272A] flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {srv.engagementType === 'sprint' ? 'پروژه‌محور (Sprint)' : srv.engagementType === 'retainer' ? 'ریتینر ماهانه' : 'مشاوره و کنسلیری'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDuplicate(srv)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                      title="ایجاد نسخه کپی"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                      title="ویرایش خدمت"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id, srv.title)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                      title="انتقال به سطل زباله"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {editingService ? `ویرایش خدمت: ${editingService.title}` : 'افزودن خدمت جدید به استودیو'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">کد خدمت (Code) *</label>
                  <input
                    type="text"
                    required
                    value={form.code || ''}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="مثال: SRV-01 // BRAND DNA"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">دپارتمان و تِرَک اجرایی *</label>
                  <select
                    value={form.deptId}
                    onChange={(e) => setForm({ ...form, deptId: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>تِرَک ۱: معماری و هویت برند</option>
                    <option value={2}>تِرَک ۲: سینما، مد و محتوای شاخص</option>
                    <option value={3}>تِرَک ۳: مارکتینگ فرهنگی و کمپین‌ها</option>
                    <option value={4}>تِرَک ۴: مشاوره ارشد و کنسلیری</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان خدمت (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="مثال: استراتژی و دی‌ان‌ای برند"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان انگلیسی (English Title)</label>
                  <input
                    type="text"
                    value={form.titleEn || ''}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="e.g. Brand Strategy & DNA"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">شرح ارزش محوری و فلسفه خدمت</label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="کالبدشکافی خدمت و نحوه اثرگذاری آن بر هویت یا فروش برند..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نشان یا برچسب خدمت (Badge)</label>
                  <input
                    type="text"
                    value={form.badge || ''}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="مثال: پروژه‌محور • فونداسیون برند"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">زمان‌بندی و دوره اجرا</label>
                  <input
                    type="text"
                    value={form.timeline || ''}
                    onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                    placeholder="مثال: ۳ تا ۴ هفته"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">ایده‌آل و مناسب برای (Target Persona)</label>
                <input
                  type="text"
                  value={form.suitableFor || ''}
                  onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
                  placeholder="مثال: استارتاپ‌ها، پروژه‌های نوآور و برندهای در آستانه جهش"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Deliverables Editor */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">خروجی‌های تحویل‌دادنی (Deliverables)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    placeholder="مورد جدید را بنویسید و اینتر بزنید..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (deliverableInput.trim()) {
                          setForm({
                            ...form,
                            deliverables: [...(form.deliverables || []), deliverableInput.trim()],
                          });
                          setDeliverableInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (deliverableInput.trim()) {
                        setForm({
                          ...form,
                          deliverables: [...(form.deliverables || []), deliverableInput.trim()],
                        });
                        setDeliverableInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition"
                  >
                    افزودن
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(form.deliverables || []).map((del, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    >
                      <span>{del}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            deliverables: (form.deliverables || []).filter((_, i) => i !== idx),
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

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={Boolean(form.popular)}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                    className="rounded border-neutral-700 bg-neutral-800 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span>علامت‌گذاری به عنوان خدمت شاخص / پرتقاضا (Featured)</span>
                </label>
              </div>

              {/* Form Buttons */}
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
                  {editingService ? 'ذخیره تغییرات خدمت' : 'افزودن خدمت به کاتالوگ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
