import React, { useState, useRef } from 'react';
import {
  TeamMemberItem,
  ManifestoItem,
  getTeamMembers,
  saveTeamMember,
  deleteTeamMember,
  getManifestoItems,
  saveManifestoItem,
  getProjects,
  ProjectItem,
  MemberProjectRole,
  MediaItem,
} from '../adminStore';
import {
  Users,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Quote,
  Laptop,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';

interface TeamManifestoTabProps {
  mediaItems: MediaItem[];
  showToast: (msg: string) => void;
}

export const TeamManifestoTab: React.FC<TeamManifestoTabProps> = ({
  mediaItems,
  showToast,
}) => {
  const [subTab, setSubTab] = useState<'team' | 'manifesto'>('team');

  // Team State
  const [members, setMembers] = useState<TeamMemberItem[]>(() => getTeamMembers());
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<TeamMemberItem>>({
    name: '',
    nameEn: '',
    role: '',
    roleEn: '',
    department: 'معماری و هویت برند',
    trackCode: 'TRACK 01 // BRAND IDENTITY',
    initials: 'CJ',
    bio: '',
    experience: '',
    philosophy: '',
    specialties: [],
    photo: '',
    projectRoles: [],
  });
  const [specialtyInput, setSpecialtyInput] = useState('');
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Projects list for assigning roles
  const [allProjects, setAllProjects] = useState<ProjectItem[]>(() => getProjects());

  // Sub-state for adding / defining a project role for the member
  const [roleProjectSelect, setRoleProjectSelect] = useState<string>('');
  const [roleProjectTitle, setRoleProjectTitle] = useState<string>('');
  const [roleClient, setRoleClient] = useState<string>('');
  const [roleInProject, setRoleInProject] = useState<string>('');
  const [roleYear, setRoleYear] = useState<string>('۱۴۰۳');
  const [roleDeliverablesInput, setRoleDeliverablesInput] = useState<string>('');
  const [roleImpact, setRoleImpact] = useState<string>('');
  const [roleCoverImage, setRoleCoverImage] = useState<string>('');

  // Manifesto State
  const [manifestoItems, setManifestoItems] = useState<ManifestoItem[]>(() => getManifestoItems());
  const [isManifestoModalOpen, setIsManifestoModalOpen] = useState(false);
  const [editingManifesto, setEditingManifesto] = useState<ManifestoItem | null>(null);
  const [manifestoForm, setManifestoForm] = useState<Partial<ManifestoItem>>({
    code: '01',
    title: '',
    titleEn: '',
    description: '',
    quote: '',
    author: '',
  });

  const refreshTeam = () => {
    setMembers(getTeamMembers());
    setAllProjects(getProjects());
  };

  const refreshManifesto = () => {
    setManifestoItems(getManifestoItems());
  };

  // -------------------------------------------------------------
  // Member Handlers
  // -------------------------------------------------------------
  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setMemberForm({
      id: `member-${Date.now()}`,
      name: '',
      nameEn: '',
      role: '',
      roleEn: '',
      department: 'معماری و هویت برند',
      trackCode: 'TRACK 01 // BRAND IDENTITY',
      initials: 'CJ',
      bio: '',
      experience: '',
      philosophy: '',
      specialties: ['تدوین دی‌ان‌ای برند', 'سیستم هویت بصری'],
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      projectRoles: [],
    });
    setSpecialtyInput('');
    setRoleProjectSelect('');
    setRoleProjectTitle('');
    setRoleClient('');
    setRoleInProject('');
    setRoleYear('۱۴۰۳');
    setRoleDeliverablesInput('');
    setRoleImpact('');
    setRoleCoverImage('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: TeamMemberItem) => {
    setEditingMember(m);
    setMemberForm({
      ...m,
      projectRoles: m.projectRoles ? [...m.projectRoles] : [],
    });
    setSpecialtyInput('');
    setRoleProjectSelect('');
    setRoleProjectTitle('');
    setRoleClient('');
    setRoleInProject('');
    setRoleYear('۱۴۰۳');
    setRoleDeliverablesInput('');
    setRoleImpact('');
    setRoleCoverImage('');
    setIsMemberModalOpen(true);
  };

  const handleSelectProjectForRole = (projectId: string) => {
    setRoleProjectSelect(projectId);
    if (!projectId || projectId === 'custom') {
      setRoleProjectTitle('');
      setRoleClient('');
      setRoleInProject(memberForm.role || '');
      setRoleYear('۱۴۰۳');
      setRoleDeliverablesInput('');
      setRoleImpact('');
      setRoleCoverImage('');
    } else {
      const p = allProjects.find((x) => x.id === projectId);
      if (p) {
        setRoleProjectTitle(p.title);
        setRoleClient(p.client || '');
        setRoleInProject(p.role || memberForm.role || 'طراحی و هدایت هنری');
        setRoleYear(p.year || '۱۴۰۳');
        setRoleDeliverablesInput(p.deliverables ? p.deliverables.slice(0, 3).join('، ') : '');
        setRoleImpact(p.metrics || p.solution || '');
        setRoleCoverImage(p.coverImage || '');
      }
    }
  };

  const handleAddProjectRole = () => {
    if (!roleProjectTitle.trim() || !roleInProject.trim()) {
      showToast('لطفاً عنوان پروژه و نقش اختصاصی همکار در آن را مشخص کنید.');
      return;
    }

    const newRole: MemberProjectRole = {
      projectId:
        roleProjectSelect && roleProjectSelect !== 'custom'
          ? roleProjectSelect
          : `proj-${Date.now()}`,
      projectTitle: roleProjectTitle.trim(),
      client: roleClient.trim() || 'استودیو',
      roleInProject: roleInProject.trim(),
      year: roleYear.trim() || '۱۴۰۳',
      keyDeliverables: roleDeliverablesInput
        ? roleDeliverablesInput.split(/[،,]/).map((s) => s.trim()).filter(Boolean)
        : [],
      impact: roleImpact.trim(),
      coverImage:
        roleCoverImage ||
        allProjects.find((p) => p.id === roleProjectSelect)?.coverImage ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    };

    setMemberForm((prev) => ({
      ...prev,
      projectRoles: [...(prev.projectRoles || []), newRole],
    }));

    // Reset sub-form
    setRoleProjectSelect('');
    setRoleProjectTitle('');
    setRoleClient('');
    setRoleInProject('');
    setRoleDeliverablesInput('');
    setRoleImpact('');
    setRoleCoverImage('');
    showToast(`نقش در پروژه «${newRole.projectTitle}» به لیست اضافه شد.`);
  };

  const handleRemoveProjectRole = (index: number) => {
    setMemberForm((prev) => ({
      ...prev,
      projectRoles: (prev.projectRoles || []).filter((_, i) => i !== index),
    }));
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`آیا از انتقال پروفایل «${name}» به سطل زباله اطمینان دارید؟`)) {
      deleteTeamMember(id);
      refreshTeam();
      showToast(`عضو تیم «${name}» به سطل زباله منتقل شد.`);
    }
  };

  const handlePhotoUploadFromLaptop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('لطفاً یک فایل تصویری انتخاب کنید.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEv) => {
      const dataUrl = loadEv.target?.result as string;
      if (dataUrl) {
        setMemberForm((prev) => ({ ...prev, photo: dataUrl }));
        showToast('تصویر با موفقیت از لپ‌تاپ بارگذاری شد.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name?.trim() || !memberForm.role?.trim()) {
      showToast('لطفاً نام و نقش همکار را مشخص کنید.');
      return;
    }

    const initials =
      memberForm.initials ||
      memberForm.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'CJ';

    const finalMember: TeamMemberItem = {
      id: editingMember ? editingMember.id : memberForm.id || `member-${Date.now()}`,
      name: memberForm.name,
      nameEn: memberForm.nameEn || memberForm.name,
      role: memberForm.role,
      roleEn: memberForm.roleEn || memberForm.role,
      department: memberForm.department || 'استودیو طراحی و سینما',
      trackCode: memberForm.trackCode || 'STUDIO // CORE DOSSIER',
      initials,
      bio: memberForm.bio || '',
      experience: memberForm.experience || '',
      philosophy: memberForm.philosophy || '',
      specialties:
        memberForm.specialties && memberForm.specialties.length > 0
          ? memberForm.specialties
          : ['خلاقیت و کارگردانی'],
      photo:
        memberForm.photo ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
      projectRoles: memberForm.projectRoles || [],
    };

    saveTeamMember(finalMember);
    refreshTeam();
    setIsMemberModalOpen(false);
    showToast(editingMember ? 'پروفایل همکار با موفقیت ویرایش شد.' : 'عضو جدید با موفقیت به تیم اضافه شد.');
  };

  // -------------------------------------------------------------
  // Manifesto Handlers
  // -------------------------------------------------------------
  const handleOpenEditManifesto = (item: ManifestoItem) => {
    setEditingManifesto(item);
    setManifestoForm({ ...item });
    setIsManifestoModalOpen(true);
  };

  const handleSaveManifesto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestoForm.title?.trim()) {
      showToast('لطفاً عنوان اصل مانیفست را وارد کنید.');
      return;
    }

    const updated: ManifestoItem = {
      code: manifestoForm.code || '01',
      title: manifestoForm.title,
      titleEn: manifestoForm.titleEn || manifestoForm.title,
      description: manifestoForm.description || '',
      quote: manifestoForm.quote || '',
      author: manifestoForm.author || 'استودیو کریتیویتی جوس',
    };

    saveManifestoItem(updated);
    refreshManifesto();
    setIsManifestoModalOpen(false);
    showToast(`اصل مانیفست ${updated.code} با موفقیت به‌روزرسانی شد.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0E0E10] text-[#E4E4E7]">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-[#27272A] bg-[#141417]/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              تیم، سرپرستان و مانیفست استودیو (Team & Manifesto CMS)
            </h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            ویرایش مشخصات ۵ سرپرست ارشد دپارتمان‌ها، عکس پرتره و ۳ اصل بنیادین مانیفست ادیتوریال
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-neutral-900 p-1 border border-neutral-800 text-xs">
            <button
              onClick={() => setSubTab('team')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'team'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>اعضای ارشد تیم ({members.length})</span>
            </button>
            <button
              onClick={() => setSubTab('manifesto')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                subTab === 'manifesto'
                  ? 'bg-amber-500 text-neutral-950 shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>اصول مانیفست ({manifestoItems.length})</span>
            </button>
          </div>

          {subTab === 'team' && (
            <button
              onClick={handleOpenCreateMember}
              className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">افزودن عضو جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {subTab === 'team' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-[#141417] border border-[#27272A] hover:border-neutral-700 rounded-2xl p-5 flex flex-col justify-between transition group relative"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-700 shrink-0">
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition truncate">
                          {member.name}
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                          {member.initials}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 truncate" dir="ltr">
                        {member.nameEn}
                      </p>
                      <span className="inline-block text-[11px] text-amber-400 font-semibold mt-1">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed mt-2">
                    {member.bio}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#27272A] space-y-1">
                    <span className="text-[10px] text-neutral-500 block uppercase font-mono">تخصص‌های کلیدی:</span>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Member Project Roles Preview */}
                  {member.projectRoles && member.projectRoles.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#27272A]/80 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-amber-500" />
                          <span>{member.projectRoles.length} نقش در پروژه‌های استودیو:</span>
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {member.projectRoles.slice(0, 3).map((pr, pIdx) => (
                          <div
                            key={pIdx}
                            className="text-[10px] bg-neutral-900/90 border border-neutral-800 p-1.5 rounded flex items-center justify-between gap-1"
                          >
                            <span className="font-bold text-white truncate max-w-[120px]">{pr.projectTitle}</span>
                            <span className="text-amber-400 font-medium truncate max-w-[140px] text-[9.5px]">
                              {pr.roleInProject}
                            </span>
                          </div>
                        ))}
                        {member.projectRoles.length > 3 && (
                          <span className="text-[9px] text-neutral-500 font-mono text-left">
                            + {member.projectRoles.length - 3} پروژه دیگر در پروفایل
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[150px]">
                    {member.department}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditMember(member)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                      title="ویرایش همکار"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                      title="حذف به سطل زباله"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {manifestoItems.map((item) => (
              <div
                key={item.code}
                className="bg-[#141417] border border-[#27272A] rounded-2xl p-6 transition space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-black text-sm flex items-center justify-center">
                      {item.code}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-white">{item.title}</h3>
                      <p className="text-xs font-mono text-neutral-400" dir="ltr">
                        {item.titleEn}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditManifesto(item)}
                    className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-amber-400 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش اصل</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                  {item.description}
                </p>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 border-r-4 border-r-amber-500 text-xs text-neutral-300 space-y-1">
                  <div className="flex items-start gap-2">
                    <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="italic text-neutral-200">{item.quote}</p>
                  </div>
                  <span className="block text-[11px] text-neutral-400 font-medium text-left" dir="rtl">
                    — {item.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Team Member */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  {editingMember ? `ویرایش همکار: ${editingMember.name}` : 'افزودن عضو جدید به تیم'}
                </h2>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نام و نام‌خانوادگی (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.name || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    placeholder="مثال: کامیار آریا"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نام انگلیسی (Full Name En)</label>
                  <input
                    type="text"
                    value={memberForm.nameEn || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, nameEn: e.target.value })}
                    placeholder="e.g. Kamyar Arya"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان نقش و سِمَت (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={memberForm.role || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    placeholder="مثال: بنیان‌گذار و مدیر ارشد خلاقیت"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">نقش انگلیسی (Role En)</label>
                  <input
                    type="text"
                    value={memberForm.roleEn || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, roleEn: e.target.value })}
                    placeholder="e.g. Founder & Executive Creative Director"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Photo Upload with Laptop Support */}
              <div className="space-y-2">
                <label className="block text-xs text-neutral-400 font-medium">تصویر چهره / پرتره همکار (Avatar Photo)</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-700 shrink-0 bg-neutral-900 relative">
                    {memberForm.photo ? (
                      <img src={memberForm.photo} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6 text-neutral-600 m-auto mt-4" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap gap-2">
                      <input
                        ref={photoFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUploadFromLaptop}
                      />
                      <button
                        type="button"
                        onClick={() => photoFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold cursor-pointer transition border border-neutral-700"
                      >
                        <Laptop className="w-4 h-4" />
                        <span>آپلود عکس از لپ‌تاپ</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer transition border border-neutral-700"
                      >
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        <span>انتخاب از کتابخانه تصاویر</span>
                      </button>
                    </div>

                    <input
                      type="url"
                      value={memberForm.photo || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, photo: e.target.value })}
                      placeholder="یا وارد کردن لینک مستقیم تصویر: https://..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">بیوگرافی ادیتوریال</label>
                <textarea
                  rows={3}
                  value={memberForm.bio || ''}
                  onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                  placeholder="روایت و سابقه همکار در هدایت هویت یا تولید محتوا..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">پیشینه و سوابق (Experience)</label>
                  <textarea
                    rows={2}
                    value={memberForm.experience || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, experience: e.target.value })}
                    placeholder="مثال: ۱۰ سال تجربه در اروپا و خاورمیانه..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-medium">فلسفه فردی یا نقل‌قول</label>
                  <textarea
                    rows={2}
                    value={memberForm.philosophy || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, philosophy: e.target.value })}
                    placeholder="«دیدگاه حرفه‌ای نسبت به کار...»"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">تخصص‌ها و حوزه‌های تمرکز</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    placeholder="تخصص جدید را بنویسید و اینتر بزنید..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (specialtyInput.trim()) {
                          setMemberForm({
                            ...memberForm,
                            specialties: [...(memberForm.specialties || []), specialtyInput.trim()],
                          });
                          setSpecialtyInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (specialtyInput.trim()) {
                        setMemberForm({
                          ...memberForm,
                          specialties: [...(memberForm.specialties || []), specialtyInput.trim()],
                        });
                        setSpecialtyInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition"
                  >
                    افزودن
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(memberForm.specialties || []).map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setMemberForm({
                            ...memberForm,
                            specialties: (memberForm.specialties || []).filter((_, i) => i !== idx),
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

              {/* PROJECT ROLES & CREDITS SECTION */}
              <div className="pt-4 border-t border-[#27272A] space-y-4 bg-neutral-900/40 p-4 rounded-xl border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      نقش‌های همکار در پروژه‌های استودیو ({memberForm.projectRoles?.length || 0})
                    </h3>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">PROJECT ROLES & CREDITS</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  تعیین کنید این همکار در کدام پروژه‌های استودیو چه نقشی بر عهده داشته و چه دستاورد و خروجی‌هایی خلق کرده است.
                </p>

                {/* Existing Project Roles List */}
                {memberForm.projectRoles && memberForm.projectRoles.length > 0 ? (
                  <div className="space-y-2.5">
                    {memberForm.projectRoles.map((role, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3 bg-[#18181C] border border-[#27272A] rounded-xl flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {role.coverImage && (
                            <img
                              src={role.coverImage}
                              alt={role.projectTitle}
                              className="w-12 h-12 rounded-lg object-cover border border-neutral-700 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">{role.projectTitle}</h4>
                              {role.year && (
                                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded">
                                  {role.year}
                                </span>
                              )}
                              {role.client && (
                                <span className="text-[10px] text-neutral-400 truncate">({role.client})</span>
                              )}
                            </div>
                            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                              نقش: {role.roleInProject}
                            </p>
                            {role.impact && (
                              <p className="text-[10.5px] text-neutral-400 mt-1 line-clamp-1 italic">
                                دستاورد: {role.impact}
                              </p>
                            )}
                            {role.keyDeliverables && role.keyDeliverables.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {role.keyDeliverables.map((del, dIdx) => (
                                  <span
                                    key={dIdx}
                                    className="text-[9.5px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded"
                                  >
                                    {del}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProjectRole(rIdx)}
                          className="text-neutral-500 hover:text-red-400 p-1 rounded hover:bg-neutral-800 transition cursor-pointer shrink-0"
                          title="حذف نقش از این پروژه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-900/60 rounded-lg border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                    هنوز نقشی در پروژه‌ها ثبت نشده است. از فرم زیر پروژه و نقش مورد نظر را انتخاب و اضافه کنید.
                  </div>
                )}

                {/* Sub-form: Add Project Role */}
                <div className="p-3 bg-neutral-950/70 border border-neutral-800/90 rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن نقش و پروژه جدید برای این همکار</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">انتخاب از پروژه‌های موجود استودیو:</label>
                      <select
                        value={roleProjectSelect}
                        onChange={(e) => handleSelectProjectForRole(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">-- انتخاب پروژه استودیو --</option>
                        {allProjects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.title} ({proj.client || 'استودیو'})
                          </option>
                        ))}
                        <option value="custom">+ پروژه سفارشی خارج از لیست</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">عنوان پروژه *</label>
                      <input
                        type="text"
                        value={roleProjectTitle}
                        onChange={(e) => setRoleProjectTitle(e.target.value)}
                        placeholder="مثال: آتلیه معماری آرکا"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-neutral-400 mb-1">نقش و مسئولیت در این پروژه *</label>
                      <input
                        type="text"
                        value={roleInProject}
                        onChange={(e) => setRoleInProject(e.target.value)}
                        placeholder="مثال: سرپرست تدوین کانسپت و هدایت هویت بصری"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">کارفرما / برند</label>
                      <input
                        type="text"
                        value={roleClient}
                        onChange={(e) => setRoleClient(e.target.value)}
                        placeholder="مثال: گروه آرکا"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">خروجی‌ها و دستاوردهای کلیدی (با کاما جدا کنید)</label>
                      <input
                        type="text"
                        value={roleDeliverablesInput}
                        onChange={(e) => setRoleDeliverablesInput(e.target.value)}
                        placeholder="مثال: دفترچه برند، تایپ‌فیس اختصاصی، پکیجینگ"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">تأثیر و نتیجه ملموس پروژه (Impact)</label>
                      <input
                        type="text"
                        value={roleImpact}
                        onChange={(e) => setRoleImpact(e.target.value)}
                        placeholder="مثال: رشد ۳ برابری تقاضای پروژه‌های ویلایی"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddProjectRole}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت این نقش در پروفایل همکار</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  {editingMember ? 'ذخیره تغییرات همکار' : 'افزودن به تیم استودیو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Manifesto Item */}
      {isManifestoModalOpen && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#141417] border border-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#161619]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-sm sm:text-base text-white">
                  ویرایش اصل {manifestoForm.code} مانیفست
                </h2>
              </div>
              <button
                onClick={() => setIsManifestoModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManifesto} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان فارسی اصل *</label>
                <input
                  type="text"
                  required
                  value={manifestoForm.title || ''}
                  onChange={(e) => setManifestoForm({ ...manifestoForm, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">عنوان انگلیسی (English Title)</label>
                <input
                  type="text"
                  value={manifestoForm.titleEn || ''}
                  onChange={(e) => setManifestoForm({ ...manifestoForm, titleEn: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">شرح و فلسفه اصل</label>
                <textarea
                  rows={4}
                  value={manifestoForm.description || ''}
                  onChange={(e) => setManifestoForm({ ...manifestoForm, description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">نقل‌قول طلایی (Quote)</label>
                <textarea
                  rows={2}
                  value={manifestoForm.quote || ''}
                  onChange={(e) => setManifestoForm({ ...manifestoForm, quote: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1 font-medium">گوینده نقل‌قول (Author)</label>
                <input
                  type="text"
                  value={manifestoForm.author || ''}
                  onChange={(e) => setManifestoForm({ ...manifestoForm, author: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-[#27272A] flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsManifestoModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  ذخیره تغییرات اصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal for selecting team photos */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mediaItems={mediaItems}
        onSelectPhoto={(url) => setMemberForm((prev) => ({ ...prev, photo: url }))}
        title="انتخاب تصویر همکار از کتابخانه استودیو"
      />
    </div>
  );
};
