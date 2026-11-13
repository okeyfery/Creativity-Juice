/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import CreativityJuiceDesktop from './CreativityJuiceDesktop.jsx';
import JuiceCursorTrail from './JuiceCursorTrail';
import { ClientPortalProvider } from './ClientPortalContext';

const CRITICAL_IMAGES = [
  '/assets/aistudio/folder-icon-mac-png-23_a819e89f.png',
  '/mac-folder.png',
];

const CRITICAL_FONTS = [
  '400 16px "Yekan Bakh"',
  '600 16px "Yekan Bakh"',
  '700 16px "Yekan Bakh"',
  '900 16px "Yekan Bakh"',
];

function sanitizeStudioStorage(): void {
  if (typeof window === 'undefined') return;
  const objectKeys = [
    'cj_desktop_widget_positions_v1',
    'cj_desktop_folder_positions_v1',
    'cj_os_project_status_overrides_v2',
  ];
  const arrayKeys = [
    'cj_dock_order_v1',
    'cj_studio_documents_v5',
    'cj_studio_projects_v4',
    'cj_studio_team_v5',
    'cj_studio_services_v5',
    'cj_studio_manifesto_v6',
    'cj_client_workspaces_v1',
    'cj_studio_archived_briefs_v1',
  ];

  objectKeys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  });

  arrayKeys.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  });
}

function preloadImageSafe(src: string, timeoutMs = 900): Promise<void> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const timer = setTimeout(() => resolve(), timeoutMs);
      img.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
      img.src = src;
    } catch {
      resolve();
    }
  });
}

async function preloadFontsSafe(timeoutMs = 800): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;
  const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  const fontLoadPromise = (async () => {
    try {
      await Promise.allSettled(CRITICAL_FONTS.map((f) => document.fonts.load(f)));
      await Promise.race([document.fonts.ready, timeoutPromise]);
    } catch {
      // Ignore font loading errors on restricted browsers
    }
  })();
  await Promise.race([fontLoadPromise, timeoutPromise]);
}

interface ErrorBoundaryState {
  hasError: boolean;
  retried: boolean;
  errorMessage: string;
}

class StudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, retried: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error || ''),
    };
  }

  componentDidCatch(error: unknown) {
    console.warn('Studio ErrorBoundary caught error, attempting self-heal:', error);
    if (!this.state.retried) {
      try {
        sanitizeStudioStorage();
        const keysToReset = [
          'cj_desktop_widget_positions_v1',
          'cj_desktop_folder_positions_v1',
          'cj_dock_order_v1',
          'cj_studio_documents_v2',
          'cj_studio_documents_v3',
          'cj_studio_documents_v5',
          'cj-custom-wallpaper',
        ];
        keysToReset.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        });
      } catch {}
      this.setState({ hasError: false, retried: true });
    }
  }

  handleSafeRetry = () => {
    sanitizeStudioStorage();
    this.setState({ hasError: false, retried: true });
  };

  handleFullReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen w-full bg-[#F5F4F0] text-neutral-900 flex flex-col items-center justify-center p-6 text-center font-sans"
        >
          <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-amber-400 font-mono font-black text-base flex items-center justify-center mx-auto shadow-md">
              CJ
            </div>
            <h2 className="text-lg font-black text-neutral-900">
              راه‌اندازی ایمن محیط استودیو
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              به دلیل محدودیت مرورگر یا تغییر در ساختار حافظه موقت، استودیو آماده بازنشانی به حالت پایدار است.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleSafeRetry}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs cursor-pointer transition"
              >
                ورود در حالت امن
              </button>
              <button
                type="button"
                onClick={this.handleFullReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition"
              >
                پاک‌سازی کش و بارگذاری مجدد
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [bootProgress, setBootProgress] = useState(25);
  const [bootLabel, setBootLabel] = useState('در حال بررسی حافظه و پیش‌بارگذاری فونت‌ها...');

  useEffect(() => {
    let cancelled = false;

    // Hard safety ceiling: never keep the loading overlay longer than 1100ms
    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        setBootProgress(100);
        setIsReady(true);
      }
    }, 1100);

    (async () => {
      try {
        sanitizeStudioStorage();
        if (!cancelled) {
          setBootProgress(55);
          setBootLabel('در حال بارگذاری فونت‌های یکان و آیکون‌های دسکتاپ...');
        }

        await Promise.all([
          preloadFontsSafe(700),
          ...CRITICAL_IMAGES.map((src) => preloadImageSafe(src, 700)),
        ]);

        if (!cancelled) {
          setBootProgress(100);
          setBootLabel('آماده ورود به استودیو...');
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          setIsReady(true);
        }
      } finally {
        clearTimeout(safetyTimer);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <StudioErrorBoundary>
      <ClientPortalProvider>
        {!isReady && (
          <div
            dir="rtl"
            className="fixed inset-0 z-[200000] bg-[#F5F4F0] text-neutral-900 flex flex-col items-center justify-center p-6 select-none font-sans transition-opacity duration-200"
          >
            <div className="max-w-xs w-full flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-amber-400 font-mono font-black text-base flex items-center justify-center shadow-lg">
                CJ
              </div>
              <div className="space-y-1">
                <h1 className="text-base font-black text-neutral-900 tracking-tight" dir="ltr">
                  Creativity Juice Studio
                </h1>
                <p className="text-xs text-neutral-500 font-medium">{bootLabel}</p>
              </div>
              <div className="w-48 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-200"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsReady(true)}
                className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 underline cursor-pointer pt-1"
              >
                ورود مستقیم بدون انتظار
              </button>
            </div>
          </div>
        )}
        <JuiceCursorTrail />
        <CreativityJuiceDesktop />
      </ClientPortalProvider>
    </StudioErrorBoundary>
  );
}

