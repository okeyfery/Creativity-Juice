/**
 * Creativity Juice — Client Portal Store
 * Manages active client session, client workspaces, deliverable approvals,
 * revisions, feedback threads, and admin operations.
 */

import {
  ClientWorkspace,
  ClientDeliverable,
  ClientFeedbackMessage,
  INITIAL_CLIENT_WORKSPACES,
} from './data/clientPortalData';

const STORAGE_KEY_WORKSPACES = 'cj_client_workspaces_v1';
const STORAGE_KEY_ACTIVE_CLIENT = 'cj_client_portal_active_id';
export const CLIENT_PORTAL_EVENT = 'CJ_CLIENT_PORTAL_CHANGED';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CLIENT_PORTAL_EVENT));
  }
}

export function getClientWorkspaces(): ClientWorkspace[] {
  if (typeof window === 'undefined') return INITIAL_CLIENT_WORKSPACES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(INITIAL_CLIENT_WORKSPACES));
      return INITIAL_CLIENT_WORKSPACES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLIENT_WORKSPACES;
  } catch (err) {
    console.error('Failed reading client workspaces:', err);
    return INITIAL_CLIENT_WORKSPACES;
  }
}

export function saveClientWorkspaces(workspaces: ClientWorkspace[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces));
    notifyChange();
  } catch (err) {
    console.error('Failed saving client workspaces:', err);
  }
}

export function getActiveClientId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_CLIENT);
}

export function setActiveClientId(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CLIENT, id);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_CLIENT);
  }
  notifyChange();
}

export function findClientByPinOrSlug(query: string): ClientWorkspace | null {
  const list = getClientWorkspaces();
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  return (
    list.find(
      (c) =>
        c.pinCode.toLowerCase() === clean ||
        c.slug.toLowerCase() === clean ||
        c.id.toLowerCase() === clean ||
        c.brandName.toLowerCase().includes(clean)
    ) || null
  );
}

export function getClientById(id: string): ClientWorkspace | null {
  const list = getClientWorkspaces();
  return list.find((c) => c.id === id) || null;
}

export function updateDeliverableApproval(
  clientId: string,
  deliverableId: string,
  status: 'approved' | 'revision-requested',
  note?: string
) {
  const list = getClientWorkspaces();
  const updated = list.map((c) => {
    if (c.id !== clientId) return c;
    const nowFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const newDeliverables = c.deliverables.map((d) => {
      if (d.id !== deliverableId) return d;
      return {
        ...d,
        status,
        clientFeedback: note || d.clientFeedback,
        feedbackDate: nowFa,
      };
    });

    let newFeedbacks = [...c.feedbacks];
    if (note) {
      newFeedbacks.push({
        id: `fb-${Date.now()}`,
        author: c.ownerName || c.brandName,
        role: 'client',
        message: status === 'approved' 
          ? `[تایید نسخه] ${note}` 
          : `[درخواست اصلاحیه] ${note}`,
        timestamp: nowFa,
      });
    }

    return {
      ...c,
      deliverables: newDeliverables,
      feedbacks: newFeedbacks,
    };
  });

  saveClientWorkspaces(updated);
}

export function addClientMessage(clientId: string, author: string, message: string, role: 'client' | 'lead' = 'client') {
  const list = getClientWorkspaces();
  const nowFa = new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const updated = list.map((c) => {
    if (c.id !== clientId) return c;
    return {
      ...c,
      feedbacks: [
        ...c.feedbacks,
        {
          id: `fb-${Date.now()}`,
          author,
          role,
          message,
          timestamp: nowFa,
        },
      ],
    };
  });

  saveClientWorkspaces(updated);
}

export function resetWorkspacesToDefault() {
  saveClientWorkspaces(INITIAL_CLIENT_WORKSPACES);
}

export function getActiveClient(): ClientWorkspace | null {
  const id = getActiveClientId();
  if (!id) return null;
  return getClientById(id);
}

export function getScopedCalendarStorageKey(clientId?: string | null): string {
  const id = clientId !== undefined ? clientId : getActiveClientId();
  return id ? `cj_content_calendar_events_v2_${id}` : 'cj_content_calendar_events_v2';
}

export function getScopedNotesStorageKey(clientId?: string | null): string {
  const id = clientId !== undefined ? clientId : getActiveClientId();
  return id ? `creativity_juice_notes_v2_${id}` : 'creativity_juice_notes_v2';
}

export function getClientInitialCalendarItems(client: ClientWorkspace) {
  if (!client.calendar || client.calendar.length === 0) return [];
  return client.calendar.map((post) => {
    let status: 'idea' | 'in_progress' | 'ready' | 'published' = 'ready';
    if (post.status === 'published') {
      status = 'published';
    } else if (post.status === 'in-progress' || post.status === 'review') {
      status = 'in_progress';
    } else {
      status = 'ready';
    }

    return {
      id: `cal-${post.id}`,
      title: post.title,
      theme: client.category,
      platform: (post.platform === 'instagram' || post.platform === 'linkedin' || post.platform === 'youtube' || post.platform === 'website')
        ? post.platform
        : ('instagram' as const),
      format: (post.format === 'reels' || post.format === 'carousel' || post.format === 'story' || post.format === 'video' || post.format === 'article')
        ? post.format
        : ('reels' as const),
      date: post.scheduledDate,
      time: '18:30',
      status,
      author: client.projectLead || 'تیم استودیو',
      captionDraft: post.captionDraft,
      cta: 'ثبت نظر یا مشاوره در دایرکت',
      notes: `محتوای اختصاصی برنامه‌ریزی‌شده برای کارفرما (${client.brandName})`,
    };
  });
}

export function deleteClientWorkspace(id: string) {
  const list = getClientWorkspaces();
  const filtered = list.filter((w) => w.id !== id);
  saveClientWorkspaces(filtered);
  if (getActiveClientId() === id) {
    setActiveClientId(null);
  }
}

export interface CreatePersonalBrandParams {
  name: string;
  position: string;
  category: string;
  goal: string;
  tone: string;
  platforms: string[];
  logoBadge?: string;
  pinCode?: string;
  slug?: string;
}

export function createPersonalBrandWorkspace(params: CreatePersonalBrandParams): ClientWorkspace {
  const timestamp = Date.now();
  const rawSlug = (params.slug || params.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30) || `creator-${timestamp.toString().slice(-4)}`;

  const pinCode = params.pinCode?.trim() || Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date();
  const dateFa = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(now);

  const newWorkspace: ClientWorkspace = {
    id: `pb-${timestamp}`,
    slug: rawSlug,
    pinCode: pinCode,
    brandName: params.name.trim(),
    brandNameEn: `${params.name.trim()} (Personal Brand)`,
    ownerName: params.name.trim(),
    category: `${params.position.trim()} • ${params.category.trim()}`,
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    logoBadge: params.logoBadge || '🌟',
    colorAccent: 'amber',
    progressPercent: 25,
    projectLead: 'مهدی لقمانی / علیرضا شیعه‌زاده',
    projectLeadRole: 'استراتژیست ارشد پرسونال برند و دیزاین سیستم استودیو',
    contractDate: dateFa,
    deliveryDate: 'رشد و توسعه مستمر در سوشال مدیا',
    scopeSummary: `تدوین هویت و سیستم پرسونال برند برای ${params.name.trim()} در حوزه تخصصی ${params.category.trim()}.\nلحن و استایل محتوا: ${params.tone}.\nهدف محوری در سوشال مدیا: ${params.goal}.\nپلتفرم‌های اصلی فعالیت: ${params.platforms.length > 0 ? params.platforms.join('، ') : 'اینستاگرام و لینکدین'}.`,
    isPersonalBrand: true,
    targetNiche: params.category,
    socialGoal: params.goal,
    brandTone: params.tone,
    targetPlatforms: params.platforms,
    milestones: [
      {
        id: `ms-${timestamp}-1`,
        title: 'فاز اول: تدوین دی‌ان‌ای و مانیفست پرسونال برند (Brand DNA)',
        description: `تعیین ارزش پیشنهادی منحصربه‌فرد (UVP)، استعاره محوری، پرسونای مخاطب ایده‌آل در حوزه ${params.category} و لحن محتوایی ${params.tone}.`,
        status: 'in-progress',
        date: dateFa,
        badge: 'فاز جاری',
      },
      {
        id: `ms-${timestamp}-2`,
        title: 'فاز دوم: دیزاین سیستم بصری، کاورهای ریلز و تمپلیت‌های ادیتوریال',
        description: 'طراحی زبان بصری، پالت رنگی هماهنگ، تایپوگرافی اختصاصی و استایل‌های ویدیویی منطبق بر استانداردهای سینمایی Creativity Juice.',
        status: 'pending',
        date: 'هفته آینده',
      },
      {
        id: `ms-${timestamp}-3`,
        title: 'فاز سوم: نگارش سناریوی ۱۰ ویدیوی آغازین با متد قلاب‌های طلایی',
        description: `ایده‌پردازی و سناریونویسی دقیق ویدیوهای ۶۰ ثانیه‌ای با تمرکز بر ${params.goal}.`,
        status: 'pending',
        date: '۲ هفته آینده',
      },
      {
        id: `ms-${timestamp}-4`,
        title: 'فاز چهارم: تصویربرداری حرفه‌ای، ادیت پریمیوم و لانچ تقویم انتشار',
        description: 'تولید محتوا، تدوین با ضرب‌آهنگ استاندارد، و زمان‌بندی منظم در تقویم محتوایی اختصاصی.',
        status: 'pending',
        date: 'ماه آینده',
      },
    ],
    deliverables: [
      {
        id: `del-${timestamp}-1`,
        title: 'کتابچه استراتژی و مانیفست پرسونال برند (Brand Bible & DNA)',
        type: 'branding',
        format: 'PDF',
        fileSize: '16.4 MB',
        thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0 (پیش‌نویس)',
        status: 'pending-review',
        dateUploaded: dateFa,
      },
      {
        id: `del-${timestamp}-2`,
        title: 'کیت قالب‌های کاور ریلز و استوری ادیتوریال اینستاگرام',
        type: 'branding',
        format: 'Figma / PSD',
        fileSize: '42.1 MB',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        version: 'v1.0',
        status: 'pending-review',
        dateUploaded: dateFa,
      },
    ],
    calendar: [
      {
        id: `post-${timestamp}-1`,
        title: `ریلز معرفی و داستان شروع: چه شد که وارد حوزه ${params.category} شدم؟`,
        platform: 'instagram',
        format: 'reels',
        scheduledDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        persianDate: 'فردا ۱۸:۳۰',
        status: 'ready',
        captionDraft: `سلام به همگی! خیلیا پرسیده بودن که نقطه عطف مسیر کاری من چی بود و چرا روی ${params.category} تمرکز کردم. در این ویدیو از پشت صحنه و بزرگ‌ترین درسی که گرفتم گفتم...\n\n👇 شما در کارتون بیشترین الهام رو از چه چیزی می‌گیرید؟`,
      },
      {
        id: `post-${timestamp}-2`,
        title: '۳ اشتباه رایج که اکثر افراد در این حوزه مرتکب می‌شوند (و راه حل آن)',
        platform: 'instagram',
        format: 'reels',
        scheduledDate: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
        persianDate: '۳ روز بعد',
        status: 'in-progress',
        captionDraft: `این ۳ نکته طلایی رو حتماً ذخیره کنید تا موقع اجرا به کمکتون بیاد!\n\n۱. تمرکز بیش‌ازحد روی ترندهای زودگذر به جای ارزش ماندگار\n۲. غفلت از پرسونای واقعی مخاطب هدف\n۳. عدم استمرار و نداشتن تقویم محتوایی مدون`,
      },
      {
        id: `post-${timestamp}-3`,
        title: `تحلیل تخصصی و نقشه راه برای ${params.goal}`,
        platform: 'linkedin',
        format: 'article',
        scheduledDate: new Date(now.getTime() + 86400000 * 5).toISOString().split('T')[0],
        persianDate: '۵ روز بعد',
        status: 'ready',
        captionDraft: `چگونه با دیزاین دقیق ارزش پیشنهادی و برندسازی اصیل می‌توان در بازار پر از نویز امروز متمایز شد؟ در این یادداشت به بررسی گام‌به‌گام این چارچوب پرداخته‌ام.`,
      },
    ],
    feedbacks: [
      {
        id: `fb-${timestamp}-1`,
        author: 'تیم مشاوره Creativity Juice',
        role: 'lead',
        message: `سلام ${params.name} عزیز! به پنل و فضای کار اختصاصی پرسونال برند خود خوش آمدید. ما تقویم انتشار اختصاصی، بریف هویتی و نقشه راه شما را آماده کردیم. می‌توانید تقویم و نوت‌های اختصاصی خود را ادیت کنید و طبق اصول استودیو، برند شخصی خود را در سوشال مدیا رشد دهید.`,
        timestamp: 'هم‌اکنون',
      },
    ],
  };

  const list = getClientWorkspaces();
  saveClientWorkspaces([newWorkspace, ...list]);
  setActiveClientId(newWorkspace.id);

  // Pre-seed scoped calendar and notes
  try {
    const calKey = getScopedCalendarStorageKey(newWorkspace.id);
    const initialCal = getClientInitialCalendarItems(newWorkspace);
    localStorage.setItem(calKey, JSON.stringify(initialCal));

    const notesKey = getScopedNotesStorageKey(newWorkspace.id);
    const initialNotes = getClientInitialNotes(newWorkspace);
    localStorage.setItem(notesKey, JSON.stringify(initialNotes));
  } catch (err) {
    console.error('Failed pre-seeding personal brand data:', err);
  }

  notifyChange();
  return newWorkspace;
}

export function getClientInitialNotes(client: ClientWorkspace) {
  const now = new Date();
  const nowFa = new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  if (client.isPersonalBrand) {
    return [
      {
        id: `note-${client.slug}-1`,
        title: `🌟 مانیفست و هویت بنیادین پرسونال برند (${client.brandName})`,
        category: 'content' as const,
        content: `استراتژی و دی‌ان‌ای پرسونال برند:\n\n• صاحب برند: ${client.ownerName}\n• تخصص و جایگاه: ${client.category}\n• هدف اصلی در سوشال مدیا: ${client.socialGoal || 'مرجعیت و رشد'}\n• لحن کلامی و بصری: ${client.brandTone || 'ادیتوریال و حرفه‌ای'}\n• پلتفرم‌های تمرکز: ${client.targetPlatforms?.join('، ') || 'اینستاگرام'}\n\nمانیفست و شعار پرسونال برند:\n«ما در دنیایی پر از کلیشه و محتواهای تکراری، با تفکر عمیق، انتقال تجربه واقعی و فرم بصری ممتاز، مخاطب هدف را به همسفر وفادار تبدیل می‌کنیم.»`,
        isPinned: true,
        color: 'amber' as const,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        persianDate: nowFa,
        tags: ['پرسونال برند', 'هویت', 'مانیفست'],
      },
      {
        id: `note-${client.slug}-2`,
        title: `🎬 فرمول سناریونویسی ۶۰ ثانیه‌ای ریلز (Hook + Story + CTA)`,
        category: 'script' as const,
        content: `چارچوب استاندارد استودیو برای ریلزهای پربازدید:\n\n۱. ثانیه ۰ تا ۳ (قلاب یا Hook): بیان تضاد، سوال تحریک‌آمیز یا شکستن باور غلط مخاطب.\n۲. ثانیه ۳ تا ۱۵ (داستان / چالش): ارتباط دادن مسئله به تجربه واقعی خود یا مراجعین.\n۳. ثانیه ۱۵ تا ۴۵ (ارزش ناب / آموزش): ارائه ۱ یا ۲ راهکار عملی و بدون حاشیه.\n۴. ثانیه ۴۵ تا ۶۰ (کال تو اکشن CTA): ترغیب به ذخیره، ارسال یا کامنت کلمه کلیدی در دایرکت.`,
        isPinned: false,
        color: 'rose' as const,
        createdAt: new Date(now.getTime() - 86400000).toISOString(),
        updatedAt: now.toISOString(),
        persianDate: nowFa,
        tags: ['سناریو', 'ریلز', 'فرمول قلاب'],
      },
      {
        id: `note-${client.slug}-3`,
        title: `🗓️ چک‌لیست هفتگی پروداکشن و ضبط ویدیو`,
        category: 'meeting' as const,
        content: `روال منظم تولید هفتگی:\n\n[ ] شنبه: مرور تقویم محتوا و انتخاب ۳ سوژه اصلی هفته\n[ ] یکشنبه: نگارش سناریو و بولت‌پوینت‌های جلوی دوربین\n[ ] دوشنبه: آماده‌سازی لوکیشن، تنظیم نورپردازی و زاویه دوربین\n[ ] سه‌شنبه: ضبط ۳ ویدیوی پشت سر هم (Batch Recording)\n[ ] چهارشنبه: بازبینی تدوین، اصلاح رنگ و اضافه کردن زیرنویس پویا\n[ ] پنجشنبه و جمعه: زمان‌بندی انتشار و پاسخ‌گویی به کامنت‌ها در ساعت طلایی`,
        isPinned: false,
        color: 'sky' as const,
        createdAt: new Date(now.getTime() - 172800000).toISOString(),
        updatedAt: now.toISOString(),
        persianDate: nowFa,
        tags: ['چک‌لیست', 'پروداکشن', 'برنامه‌ریزی'],
      },
    ];
  }

  return [
    {
      id: `note-${client.slug}-1`,
      title: `بریف و هویت اختصاصی: ${client.brandName}`,
      category: 'content' as const,
      content: `خلاصه اهداف پروژه و استراتژی محتوا:\n\n• حوزه فعالیت: ${client.category}\n• مدیر پروژه در استودیو: ${client.projectLead} (${client.projectLeadRole})\n• تاریخ انعقاد قرارداد: ${client.contractDate}\n• تارگت تحویل نهایی: ${client.deliveryDate}\n\nچشم‌انداز و پیام محوری:\n${client.scopeSummary}`,
      isPinned: true,
      color: 'amber' as const,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      persianDate: nowFa,
      tags: ['هویت برند', 'استراتژی', client.brandName],
    },
    {
      id: `note-${client.slug}-2`,
      title: `سناریو و چک‌لیست کمپین برای ${client.ownerName}`,
      category: 'script' as const,
      content: `نکات کلیدی برای بازبینی و جلسات هفتگی با تیم استودیو:\n\n۱. بررسی خروجی‌های ویدیویی در میز تحویل پورتال کارفرما.\n۲. بازبینی زمان‌بندی ریلزها و پست‌های اینستاگرام در تقویم محتوا.\n۳. ارسال بازخوردها و درخواست اصلاحات با ذکر تایم‌کد دقیق ویدیو.\n۴. جهت هماهنگی فوری می‌توانید در تب گفتگو پیام بگذارید.`,
      isPinned: false,
      color: 'rose' as const,
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      updatedAt: now.toISOString(),
      persianDate: nowFa,
      tags: ['چک‌لیست', 'جلسات', 'سناریو'],
    },
  ];
}

