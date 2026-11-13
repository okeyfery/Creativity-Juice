/**
 * Creativity Juice — Client Portal Store
 * Manages active client session, client workspaces, deliverable approvals,
 * revisions, feedback threads, and admin operations.
 */

import {
  ClientWorkspace,
  ClientDeliverable,
  ClientFeedbackMessage,
  ProjectBriefSubmission,
  INITIAL_CLIENT_WORKSPACES,
} from './data/clientPortalData';
import { pushBriefToServer, pushServerSyncPayload } from './serverSync';

const STORAGE_KEY_WORKSPACES = 'cj_client_workspaces_v1';
const STORAGE_KEY_ACTIVE_CLIENT = 'cj_client_portal_active_id';
const STORAGE_KEY_ARCHIVED_BRIEFS = 'cj_studio_archived_briefs_v1';
export const CLIENT_PORTAL_EVENT = 'CJ_CLIENT_PORTAL_CHANGED';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CLIENT_PORTAL_EVENT));
  }
}

function safeFormatFaDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', options).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

function normalizeWorkspace(c: ClientWorkspace, idx = 0): ClientWorkspace {
  const defaultDefaults = INITIAL_CLIENT_WORKSPACES.find((init) => init.id === c.id);
  const pin = c.pinCode || defaultDefaults?.pinCode || String(1001 + idx);
  const trackingCode =
    c.trackingCode ||
    defaultDefaults?.trackingCode ||
    (pin.startsWith('CJ-') ? pin.toUpperCase() : `CJ-${pin}`);
  const username = (c.username || defaultDefaults?.username || c.slug || trackingCode).trim();
  const password = (c.password || defaultDefaults?.password || pin).trim();

  let archivedBriefs: ProjectBriefSubmission[] = Array.isArray(c.archivedBriefs)
    ? c.archivedBriefs.map((b) => ({
        ...b,
        isRead:
          typeof b.isRead === 'boolean'
            ? b.isRead
            : typeof b.id === 'string' && b.id.startsWith('brief-init-')
            ? true
            : b.status !== 'new',
        createdAtMs:
          typeof b.createdAtMs === 'number'
            ? b.createdAtMs
            : typeof b.id === 'string' && b.id.startsWith('brief-init-')
            ? 1000
            : Number((b.id || '').match(/brief-(?:test-)?(\d{10,})/)?.[1] || 2000),
      }))
    : [];

  if (archivedBriefs.length === 0 && c.scopeSummary) {
    archivedBriefs = [
      {
        id: `brief-init-${c.id}`,
        trackingCode,
        clientId: c.id,
        brandName: c.brandName,
        ownerName: c.ownerName,
        contactInfo: `@${username}`,
        submittedAt: c.contractDate || '۱۴۰۵/۰۱/۲۰',
        selectedTrack: c.category || 'معماری هویت برند و تولید محتوا',
        marketTier: 'لوکس و پرمیوم / دارایی‌محور (High-Ticket)',
        problem: c.scopeSummary,
        brandingDeliverables: (c.deliverables || []).map((d) => d.title),
        deadline: c.deliveryDate,
        productionScale: 'پروداکشن استاندارد استودیو (پکیج جامع با تست و نظارت کامل)',
        fullSummaryText: [
          `=== پرونده و بریف آرشیوشده پروژه (${trackingCode}) ===`,
          `• نام برند / پروژه: ${c.brandName}`,
          `• کارفرما: ${c.ownerName}`,
          `• کد رهگیری یکتا: ${trackingCode}`,
          `• نام کاربری پورتال: ${username}`,
          `• مدیر پروژه در استودیو: ${c.projectLead} (${c.projectLeadRole})`,
          `• تاریخ ثبت قرارداد: ${c.contractDate}`,
          `• زمان‌بندی تحویل: ${c.deliveryDate}`,
          `• حوزه و دپارتمان: ${c.category}`,
          ``,
          `[خلاصه بریف و دامنه خدمات پروژه]`,
          c.scopeSummary,
        ].join('\n'),
        status: c.progressPercent >= 80 ? 'in-production' : 'reviewed',
        isRead: true,
        createdAtMs: 1000,
        adminNotes: `پرونده فعال در استودیو به سرپرستی ${c.projectLead}.`,
      },
    ];
  }

  return {
    ...c,
    pinCode: pin,
    trackingCode,
    username,
    password,
    archivedBriefs,
  };
}

export function getClientWorkspaces(): ClientWorkspace[] {
  if (typeof window === 'undefined') return INITIAL_CLIENT_WORKSPACES.map(normalizeWorkspace);
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKSPACES);
    if (!raw) {
      const normalizedInit = INITIAL_CLIENT_WORKSPACES.map(normalizeWorkspace);
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(normalizedInit));
      return normalizedInit;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item, i) => normalizeWorkspace(item, i));
    }
    return INITIAL_CLIENT_WORKSPACES.map(normalizeWorkspace);
  } catch (err) {
    console.error('Failed reading client workspaces:', err);
    return INITIAL_CLIENT_WORKSPACES.map(normalizeWorkspace);
  }
}

export function saveClientWorkspaces(
  workspaces: ClientWorkspace[],
  replaceOnServer = false,
  skipServerSync = false
) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = workspaces.map((w, i) => normalizeWorkspace(w, i));
    localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(normalized));
    notifyChange();
    if (!skipServerSync) {
      void pushServerSyncPayload({
        clientWorkspaces: normalized,
        replaceWorkspaces: replaceOnServer,
      });
    }
  } catch (err) {
    console.error('Failed saving client workspaces:', err);
  }
}

export function getActiveClientId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_CLIENT);
  } catch {
    return null;
  }
}

export function setActiveClientId(id: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_CLIENT, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_CLIENT);
    }
  } catch {
    // ignore storage errors on restricted browsers
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
        (c.trackingCode && c.trackingCode.toLowerCase() === clean) ||
        (c.username && c.username.toLowerCase() === clean) ||
        c.pinCode.toLowerCase() === clean ||
        c.slug.toLowerCase() === clean ||
        c.id.toLowerCase() === clean
    ) || null
  );
}

/**
 * Strict Client Portal Authentication:
 * Requires both unique identifier (trackingCode / username / slug) AND dedicated password.
 */
export function authenticateClient(identifier: string, passwordInput: string): ClientWorkspace | null {
  const list = getClientWorkspaces();
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = passwordInput.trim();
  if (!cleanId || !cleanPass) return null;

  const candidate = list.find(
    (c) =>
      (c.trackingCode && c.trackingCode.toLowerCase() === cleanId) ||
      (c.username && c.username.toLowerCase() === cleanId) ||
      c.slug.toLowerCase() === cleanId ||
      c.pinCode.toLowerCase() === cleanId
  );

  if (!candidate) return null;

  const validPass =
    (candidate.password && candidate.password === cleanPass) ||
    (candidate.password && candidate.password.toLowerCase() === cleanPass.toLowerCase()) ||
    candidate.pinCode === cleanPass;

  return validPass ? candidate : null;
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
    const nowFa = safeFormatFaDate(new Date(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

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
  const nowFa = safeFormatFaDate(new Date(), {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

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
  saveClientWorkspaces(filtered, true);
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
  username?: string;
  password?: string;
  trackingCode?: string;
}

export function createPersonalBrandWorkspace(params: CreatePersonalBrandParams): ClientWorkspace {
  const timestamp = Date.now();
  const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
  const rawSlug = (params.username || params.slug || params.name)
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30) || `creator-${timestamp.toString().slice(-4)}`;

  const pinCode = params.password?.trim() || params.pinCode?.trim() || randomDigits;
  const trackingCode = params.trackingCode?.trim().toUpperCase() || `CJ-${randomDigits}`;
  const username = params.username?.trim() || rawSlug;
  const password = params.password?.trim() || pinCode;

  const now = new Date();
  const dateFa = safeFormatFaDate(now, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const newWorkspace: ClientWorkspace = {
    id: `pb-${timestamp}`,
    slug: rawSlug,
    trackingCode,
    username,
    password,
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
    archivedBriefs: [],
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
  const nowFa = safeFormatFaDate(now, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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

// ============================================================================
// PROJECT BRIEF ARCHIVING & ADMIN CLIENT MANAGEMENT
// ============================================================================

function normalizeBriefItem(b: ProjectBriefSubmission): ProjectBriefSubmission {
  const isSeed = typeof b.id === 'string' && b.id.startsWith('brief-init-');
  const extractedTime = Number((b.id || '').match(/brief-(?:test-)?(\d{10,})/)?.[1] || (isSeed ? 1000 : 2000));
  return {
    ...b,
    isRead:
      typeof b.isRead === 'boolean'
        ? b.isRead
        : isSeed
        ? true
        : b.status !== 'new',
    createdAtMs: typeof b.createdAtMs === 'number' && b.createdAtMs > 0 ? b.createdAtMs : extractedTime,
  };
}

export function getAllArchivedBriefs(): ProjectBriefSubmission[] {
  const workspaces = getClientWorkspaces();
  const map = new Map<string, ProjectBriefSubmission>();

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ARCHIVED_BRIEFS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((b: ProjectBriefSubmission) => {
            if (b && b.id) map.set(b.id, normalizeBriefItem(b));
          });
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  workspaces.forEach((ws) => {
    if (Array.isArray(ws.archivedBriefs)) {
      ws.archivedBriefs.forEach((b) => {
        if (b && b.id && !map.has(b.id)) {
          map.set(b.id, normalizeBriefItem(b));
        }
      });
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const aIsSeed = typeof a.id === 'string' && a.id.startsWith('brief-init-');
    const bIsSeed = typeof b.id === 'string' && b.id.startsWith('brief-init-');
    if (aIsSeed !== bIsSeed) return aIsSeed ? 1 : -1;
    const aTime = a.createdAtMs || 0;
    const bTime = b.createdAtMs || 0;
    if (bTime !== aTime) return bTime - aTime;
    return 0;
  });
}

export function saveGlobalArchivedBriefs(
  briefs: ProjectBriefSubmission[],
  replaceOnServer = false,
  skipServerSync = false
) {
  if (typeof window === 'undefined') return;
  try {
    const normalized = briefs.map(normalizeBriefItem);
    localStorage.setItem(STORAGE_KEY_ARCHIVED_BRIEFS, JSON.stringify(normalized));
    notifyChange();
    if (!skipServerSync) {
      void pushServerSyncPayload({
        archivedBriefs: normalized,
        replaceBriefs: replaceOnServer,
      });
    }
  } catch (err) {
    console.error('Failed saving archived briefs:', err);
  }
}

export interface SubmitBriefPayload {
  clientId?: string;
  existingTrackingCode?: string;
  desiredUsername?: string;
  desiredPassword?: string;
  clientName: string;
  ownerName?: string;
  clientUrl?: string;
  selectedTrack: string;
  marketTier: string;
  problem: string;
  emptySpace?: string;
  enemy?: string;
  persona?: string;
  brandingDeliverables?: string[];
  bottleneck?: string;
  objection?: string;
  competitorCliches?: string;
  marketingMedia?: string[];
  benchmarks?: string;
  dealbreakers?: string;
  deadline?: string;
  productionScale?: string;
  decisionStructure?: string;
  fullSummaryText: string;
}

export function submitAndArchiveProjectBrief(payload: SubmitBriefPayload): {
  workspace: ClientWorkspace;
  brief: ProjectBriefSubmission;
  isNewWorkspace: boolean;
} {
  const now = new Date();
  const nowMs = Date.now();
  const nowFa = safeFormatFaDate(now, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const list = getClientWorkspaces();
  let targetWorkspace: ClientWorkspace | null = null;
  let isNewWorkspace = false;

  if (payload.clientId) {
    targetWorkspace = list.find((w) => w.id === payload.clientId) || null;
  }
  if (!targetWorkspace && payload.existingTrackingCode?.trim()) {
    targetWorkspace = findClientByPinOrSlug(payload.existingTrackingCode.trim());
  }

  const randomCodeNum = Math.floor(1000 + Math.random() * 9000);
  const generatedTrackingCode = targetWorkspace?.trackingCode || `CJ-${randomCodeNum}`;
  const generatedPassword =
    targetWorkspace?.password ||
    payload.desiredPassword?.trim() ||
    `cj${randomCodeNum}`;

  const briefId = `brief-${nowMs}`;
  const briefRecord: ProjectBriefSubmission = {
    id: briefId,
    trackingCode: generatedTrackingCode,
    clientId: targetWorkspace ? targetWorkspace.id : `client-${nowMs}`,
    brandName: payload.clientName?.trim() || targetWorkspace?.brandName || 'پروژه جدید استودیو',
    ownerName: payload.ownerName?.trim() || targetWorkspace?.ownerName || payload.clientName?.trim() || 'کارفرما',
    contactInfo: payload.clientUrl?.trim() || '-',
    submittedAt: nowFa,
    selectedTrack: payload.selectedTrack || 'دپارتمان برندینگ',
    marketTier: payload.marketTier || 'میان‌رده باکیفیت',
    problem: payload.problem || '-',
    emptySpace: payload.emptySpace,
    enemy: payload.enemy,
    persona: payload.persona,
    brandingDeliverables: payload.brandingDeliverables,
    bottleneck: payload.bottleneck,
    objection: payload.objection,
    competitorCliches: payload.competitorCliches,
    marketingMedia: payload.marketingMedia,
    benchmarks: payload.benchmarks,
    dealbreakers: payload.dealbreakers,
    deadline: payload.deadline,
    productionScale: payload.productionScale,
    decisionStructure: payload.decisionStructure,
    fullSummaryText: payload.fullSummaryText,
    status: 'new',
    isRead: false,
    createdAtMs: nowMs,
  };

  if (targetWorkspace) {
    const updatedList = list.map((w) => {
      if (w.id !== targetWorkspace!.id) return w;
      const updatedWorkspace: ClientWorkspace = {
        ...w,
        archivedBriefs: [briefRecord, ...(w.archivedBriefs || [])],
        feedbacks: [
          ...w.feedbacks,
          {
            id: `fb-brief-${nowMs}`,
            author: w.ownerName || w.brandName,
            role: 'client',
            message: `📋 [ثبت و آرشیو بریف جدید در پرونده پروژه] مسیر انتخابی: ${briefRecord.selectedTrack} — صورت‌مسئله: ${briefRecord.problem}`,
            timestamp: nowFa,
          },
        ],
      };
      targetWorkspace = updatedWorkspace;
      return updatedWorkspace;
    });
    saveClientWorkspaces(updatedList, false, true);
  } else {
    isNewWorkspace = true;
    const rawSlug =
      (payload.desiredUsername || payload.clientName || `project-${randomCodeNum}`)
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 28) || `client-${randomCodeNum}`;

    const newWs: ClientWorkspace = {
      id: briefRecord.clientId,
      slug: rawSlug,
      trackingCode: generatedTrackingCode,
      username: payload.desiredUsername?.trim() || rawSlug,
      password: generatedPassword,
      pinCode: generatedPassword,
      brandName: briefRecord.brandName,
      brandNameEn: briefRecord.brandName,
      ownerName: briefRecord.ownerName,
      category: `${briefRecord.selectedTrack} • ${briefRecord.marketTier}`,
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      logoBadge: '💼',
      colorAccent: 'amber',
      progressPercent: 15,
      projectLead: 'مهدی لقمانی',
      projectLeadRole: 'مدیر پروژه و استراتژیست ارشد استودیو',
      contractDate: nowFa,
      deliveryDate: briefRecord.deadline || 'در حال زمان‌بندی در استودیو',
      scopeSummary: `صورت‌مسئله پروژه: ${briefRecord.problem}\nمسیر همکاری: ${briefRecord.selectedTrack} (${briefRecord.marketTier})\nمقیاس پروداکشن: ${briefRecord.productionScale || 'استاندارد استودیو'}`,
      milestones: [
        {
          id: `ms-${nowMs}-1`,
          title: 'ثبت بریف کشف پروژه و تشکیل پرونده اختصاصی',
          description: `بریف اولیه در تاریخ ${nowFa} ثبت و برای مدیریت استودیو ارسال گردید.`,
          status: 'completed',
          date: nowFa,
          badge: 'تکمیل شده',
        },
        {
          id: `ms-${nowMs}-2`,
          title: 'آنالیز بریف توسط سرپرست دپارتمان و جلسه کشف تخصصی',
          description: 'بررسی دقیق نیازمندی‌ها، تدوین نقشه راه و زمان‌بندی فازهای اجرایی.',
          status: 'in-progress',
          date: '۴۸ ساعت کاری آینده',
          badge: 'فاز جاری',
        },
      ],
      deliverables: [],
      calendar: [],
      feedbacks: [
        {
          id: `fb-init-${nowMs}`,
          author: 'مدیریت استودیو Creativity Juice',
          role: 'lead',
          message: `سلام و درود! پرونده اختصاصی برند «${briefRecord.brandName}» با کد رهگیری ${generatedTrackingCode} تشکیل شد. بریف شما در آرشیو پروژه ثبت گردید و پس از بررسی تیم استراتژی، مراحل بعدی در همین پورتال به‌روزرسانی خواهد شد.`,
          timestamp: nowFa,
        },
      ],
      archivedBriefs: [briefRecord],
      isPersonalBrand: false,
    };

    targetWorkspace = newWs;
    saveClientWorkspaces([newWs, ...list], false, true);
  }

  const allBriefs = getAllArchivedBriefs();
  const filteredBriefs = allBriefs.filter((b) => b.id !== briefRecord.id);
  saveGlobalArchivedBriefs([briefRecord, ...filteredBriefs], false, true);

  // Atomically push the new brief & workspace to the central server so Admin immediately receives it from any device
  void pushBriefToServer(briefRecord, targetWorkspace!);

  return {
    workspace: targetWorkspace!,
    brief: briefRecord,
    isNewWorkspace,
  };
}

export function updateBriefStatus(
  briefId: string,
  status: 'new' | 'reviewed' | 'in-production',
  adminNotes?: string
) {
  const isRead = status === 'new' ? false : true;
  const allBriefs = getAllArchivedBriefs().map((b) =>
    b.id === briefId
      ? { ...b, status, isRead, adminNotes: adminNotes ?? b.adminNotes }
      : b
  );
  saveGlobalArchivedBriefs(allBriefs);

  const workspaces = getClientWorkspaces().map((w) => {
    if (!Array.isArray(w.archivedBriefs)) return w;
    return {
      ...w,
      archivedBriefs: w.archivedBriefs.map((b) =>
        b.id === briefId
          ? { ...b, status, isRead, adminNotes: adminNotes ?? b.adminNotes }
          : b
      ),
    };
  });
  saveClientWorkspaces(workspaces);
}

export function toggleBriefReadStatus(briefId: string, explicitRead?: boolean) {
  let targetNextRead = true;
  const allBriefs = getAllArchivedBriefs().map((b) => {
    if (b.id !== briefId) return b;
    targetNextRead = typeof explicitRead === 'boolean' ? explicitRead : !b.isRead;
    const nextStatus =
      targetNextRead && b.status === 'new'
        ? 'reviewed'
        : !targetNextRead && b.status === 'reviewed'
        ? 'new'
        : b.status;
    return {
      ...b,
      isRead: targetNextRead,
      status: nextStatus,
    };
  });
  saveGlobalArchivedBriefs(allBriefs);

  const workspaces = getClientWorkspaces().map((w) => {
    if (!Array.isArray(w.archivedBriefs)) return w;
    return {
      ...w,
      archivedBriefs: w.archivedBriefs.map((b) => {
        if (b.id !== briefId) return b;
        const nextStatus =
          targetNextRead && b.status === 'new'
            ? 'reviewed'
            : !targetNextRead && b.status === 'reviewed'
            ? 'new'
            : b.status;
        return {
          ...b,
          isRead: targetNextRead,
          status: nextStatus,
        };
      }),
    };
  });
  saveClientWorkspaces(workspaces);
}

export function markAllBriefsAsRead() {
  const allBriefs = getAllArchivedBriefs().map((b) => ({
    ...b,
    isRead: true,
    status: b.status === 'new' ? ('reviewed' as const) : b.status,
  }));
  saveGlobalArchivedBriefs(allBriefs);

  const workspaces = getClientWorkspaces().map((w) => {
    if (!Array.isArray(w.archivedBriefs)) return w;
    return {
      ...w,
      archivedBriefs: w.archivedBriefs.map((b) => ({
        ...b,
        isRead: true,
        status: b.status === 'new' ? ('reviewed' as const) : b.status,
      })),
    };
  });
  saveClientWorkspaces(workspaces);
}

export interface AdminClientProfileInput {
  id?: string;
  brandName: string;
  ownerName: string;
  category: string;
  trackingCode: string;
  username: string;
  password: string;
  projectLead?: string;
  projectLeadRole?: string;
  scopeSummary?: string;
  progressPercent?: number;
  logoBadge?: string;
  isPersonalBrand?: boolean;
}

export function saveClientProfileByAdmin(input: AdminClientProfileInput): ClientWorkspace {
  const list = getClientWorkspaces();
  const nowFa = safeFormatFaDate(new Date(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const existing = input.id ? list.find((w) => w.id === input.id) : null;
  const cleanTracking = input.trackingCode.trim().toUpperCase() || `CJ-${Math.floor(1000 + Math.random() * 9000)}`;
  const cleanUsername = input.username.trim() || cleanTracking.toLowerCase();
  const cleanPassword = input.password.trim() || '1234';

  if (existing) {
    const updatedWorkspace: ClientWorkspace = {
      ...existing,
      brandName: input.brandName.trim() || existing.brandName,
      ownerName: input.ownerName.trim() || existing.ownerName,
      category: input.category.trim() || existing.category,
      trackingCode: cleanTracking,
      username: cleanUsername,
      slug: cleanUsername,
      password: cleanPassword,
      pinCode: cleanPassword,
      projectLead: input.projectLead?.trim() || existing.projectLead,
      projectLeadRole: input.projectLeadRole?.trim() || existing.projectLeadRole,
      scopeSummary: input.scopeSummary?.trim() || existing.scopeSummary,
      progressPercent: input.progressPercent ?? existing.progressPercent,
      logoBadge: input.logoBadge || existing.logoBadge,
      isPersonalBrand: input.isPersonalBrand ?? existing.isPersonalBrand,
    };
    saveClientWorkspaces(list.map((w) => (w.id === existing.id ? updatedWorkspace : w)));
    return updatedWorkspace;
  }

  const newWs: ClientWorkspace = {
    id: `client-${Date.now()}`,
    slug: cleanUsername,
    trackingCode: cleanTracking,
    username: cleanUsername,
    password: cleanPassword,
    pinCode: cleanPassword,
    brandName: input.brandName.trim(),
    brandNameEn: input.brandName.trim(),
    ownerName: input.ownerName.trim() || input.brandName.trim(),
    category: input.category.trim() || 'پروژه اختصاصی استودیو',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    logoBadge: input.logoBadge || '💼',
    colorAccent: 'amber',
    progressPercent: input.progressPercent ?? 20,
    projectLead: input.projectLead?.trim() || 'مهدی لقمانی',
    projectLeadRole: input.projectLeadRole?.trim() || 'مدیر پروژه و استراتژیست برند',
    contractDate: nowFa,
    deliveryDate: 'بر اساس زمان‌بندی قرارداد',
    scopeSummary: input.scopeSummary?.trim() || 'پرونده اختصاصی تعریف‌شده توسط مدیریت استودیو.',
    milestones: [
      {
        id: `ms-${Date.now()}-1`,
        title: 'تشکیل پرونده و راه‌اندازی پورتال اختصاصی کارفرما',
        description: 'تعریف کد رهگیری یکتا و رمز عبور اختصاصی توسط مدیریت استودیو',
        status: 'completed',
        date: nowFa,
      },
    ],
    deliverables: [],
    calendar: [],
    feedbacks: [],
    archivedBriefs: [],
    isPersonalBrand: Boolean(input.isPersonalBrand),
  };

  saveClientWorkspaces([newWs, ...list]);
  return newWs;
}

export interface AdminDeliverableInput {
  title: string;
  type: ClientDeliverable['type'];
  format: string;
  fileSize: string;
  version: string;
  thumbnail?: string;
  downloadUrl?: string;
  status?: ClientDeliverable['status'];
}

export function addDeliverableByAdmin(
  clientId: string,
  input: AdminDeliverableInput
): ClientWorkspace | null {
  const list = getClientWorkspaces();
  const nowFa = safeFormatFaDate(new Date(), {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  let updatedClient: ClientWorkspace | null = null;
  const nextList = list.map((ws) => {
    if (ws.id !== clientId) return ws;
    const newDel: ClientDeliverable = {
      id: `del-${Date.now()}`,
      title: input.title.trim(),
      type: input.type || 'branding',
      format: input.format.trim() || 'PDF • Master',
      fileSize: input.fileSize.trim() || '24 MB',
      version: input.version.trim() || 'v1.0',
      thumbnail:
        input.thumbnail?.trim() ||
        ws.coverImage ||
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      downloadUrl: input.downloadUrl?.trim(),
      status: input.status || 'pending-review',
      dateUploaded: nowFa,
    };
    updatedClient = {
      ...ws,
      deliverables: [newDel, ...(ws.deliverables || [])],
    };
    return updatedClient;
  });

  if (updatedClient) {
    saveClientWorkspaces(nextList);
  }
  return updatedClient;
}

export function deleteDeliverableByAdmin(clientId: string, deliverableId: string) {
  const list = getClientWorkspaces();
  const nextList = list.map((ws) => {
    if (ws.id !== clientId) return ws;
    return {
      ...ws,
      deliverables: (ws.deliverables || []).filter((d) => d.id !== deliverableId),
    };
  });
  saveClientWorkspaces(nextList);
}



