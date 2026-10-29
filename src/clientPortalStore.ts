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

export function getClientInitialNotes(client: ClientWorkspace) {
  const now = new Date();
  const nowFa = new Intl.DateTimeFormat('fa-IR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

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

