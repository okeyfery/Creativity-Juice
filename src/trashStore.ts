/**
 * Creativity Juice — Unified Trash & Recycle Bin Store
 * Manages items moved to the trash bin (Notes, Content Calendar posts, Desktop docs/folders, Clichés).
 * Items stay safely in the Trash Bin until the user explicitly deletes them or empties the bin.
 * Supports restoring items back to their original locations.
 */

export interface TrashedItem {
  id: string;
  originalId: string;
  title: string;
  type: 'note' | 'calendar_post' | 'document' | 'project' | 'cliche' | 'folder';
  source: string; // e.g. 'دفترچه یادداشت', 'تقویم محتوا', 'دسکتاپ استودیو', 'آرشیو پروژه‌ها'
  summary?: string;
  size?: string;
  deletedAt: string;
  persianDate: string;
  data: any; // Full payload for complete restoration
}

const TRASH_STORAGE_KEY = 'creativity_juice_trash_v2';
const TRASH_EVENT = 'creativity_juice_trash_updated';
export const NOTE_RESTORE_EVENT = 'creativity_juice_note_restored';
export const CALENDAR_RESTORE_EVENT = 'creativity_juice_calendar_restored';
export const DESKTOP_RESTORE_EVENT = 'creativity_juice_desktop_restored';

// Initial pre-loaded discarded cliché items
const SEED_CLICHES: TrashedItem[] = [
  {
    id: 'cliche-1',
    originalId: 'c-1',
    title: 'make_the_logo_500percent_bigger.ai',
    type: 'cliche',
    source: 'سطل کلیشه‌های کلاینت',
    summary: '«میشه لوگو کل صفحه رو بگیره تا هیچ‌کس از دستش نده؟»',
    size: '۸۴.۲ مگابایت',
    deletedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    persianDate: 'دیروز، ساعت ۲۳:۴۰',
    data: null,
  },
  {
    id: 'cliche-2',
    originalId: 'c-2',
    title: 'viral_without_strategy_proposal.pptx',
    type: 'cliche',
    source: 'سطل کلیشه‌های کلاینت',
    summary: '«ما زمان برای تحقیق و استراتژی نداریم ولی تا جمعه ۵۰ میلیون بازدید می‌خوایم!»',
    size: '۱۲.۴ مگابایت',
    deletedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    persianDate: '۳ روز پیش',
    data: null,
  },
  {
    id: 'cliche-3',
    originalId: 'c-3',
    title: 'boring_corporate_blue_palette.ase',
    type: 'cliche',
    source: 'سطل کلیشه‌های کلاینت',
    summary: 'طیف‌های خواب‌آور و کلیشه‌ای آبی شرکتی که جای خود را به طراوت ادیتوریال دادند.',
    size: '۱.۲ کیلوبایت',
    deletedAt: new Date(Date.now() - 3600000 * 240).toISOString(),
    persianDate: 'هفته گذشته',
    data: null,
  },
];

export function getPersianTimestamp(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'امروز، چند لحظه پیش';
  }
}

// Read all trash items from localStorage
export function getTrashItems(): TrashedItem[] {
  try {
    const raw = localStorage.getItem(TRASH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading trash items:', e);
  }
  return SEED_CLICHES;
}

// Save all trash items to localStorage and notify listeners
function saveTrashItems(items: TrashedItem[]): void {
  try {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(TRASH_EVENT, { detail: items }));
  } catch (e) {
    console.error('Error saving trash items:', e);
  }
}

// Move an item to the trash bin
export function addToTrash(
  item: Omit<TrashedItem, 'id' | 'deletedAt' | 'persianDate'>
): TrashedItem {
  const current = getTrashItems();
  const now = new Date();
  const newItem: TrashedItem = {
    ...item,
    id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    deletedAt: now.toISOString(),
    persianDate: getPersianTimestamp(now),
  };

  const updated = [newItem, ...current];
  saveTrashItems(updated);
  return newItem;
}

// Restore an item from the trash bin back to its original app
export function restoreTrashItem(trashId: string): TrashedItem | null {
  const current = getTrashItems();
  const item = current.find((i) => i.id === trashId);
  if (!item) return null;

  // Dispatch restore event to the appropriate destination
  if (item.type === 'note' && item.data) {
    // Read and update Notes localStorage
    try {
      const rawNotes = localStorage.getItem('creativity_juice_notes_v2');
      const notes = rawNotes ? JSON.parse(rawNotes) : [];
      // Check if note is not already present
      if (!notes.some((n: any) => n.id === item.data.id)) {
        notes.unshift(item.data);
        localStorage.setItem('creativity_juice_notes_v2', JSON.stringify(notes));
      }
    } catch (e) {
      console.error('Failed to restore note in storage:', e);
    }
    window.dispatchEvent(new CustomEvent(NOTE_RESTORE_EVENT, { detail: item.data }));
  } else if (item.type === 'calendar_post' && item.data) {
    // Read and update Calendar localStorage
    try {
      const rawEvents = localStorage.getItem('cj_content_calendar_events');
      const events = rawEvents ? JSON.parse(rawEvents) : [];
      if (!events.some((ev: any) => ev.id === item.data.id)) {
        events.unshift(item.data);
        localStorage.setItem('cj_content_calendar_events', JSON.stringify(events));
      }
    } catch (e) {
      console.error('Failed to restore calendar event in storage:', e);
    }
    window.dispatchEvent(new CustomEvent(CALENDAR_RESTORE_EVENT, { detail: item.data }));
  } else if (item.type === 'project' || item.type === 'document' || item.type === 'folder') {
    window.dispatchEvent(new CustomEvent(DESKTOP_RESTORE_EVENT, { detail: item }));
  }

  // Remove from trash
  const remaining = current.filter((i) => i.id !== trashId);
  saveTrashItems(remaining);
  return item;
}

// Permanently delete a single item from the trash
export function deleteTrashItemPermanently(trashId: string): void {
  const current = getTrashItems();
  const remaining = current.filter((i) => i.id !== trashId);
  saveTrashItems(remaining);
}

// Empty the entire trash bin permanently
export function emptyTrashPermanently(): void {
  saveTrashItems([]);
}

// Subscribe to trash updates
export function subscribeTrash(callback: (items: TrashedItem[]) => void): () => void {
  const handler = () => {
    callback(getTrashItems());
  };

  window.addEventListener(TRASH_EVENT, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === TRASH_STORAGE_KEY) handler();
  });

  return () => {
    window.removeEventListener(TRASH_EVENT, handler);
  };
}
