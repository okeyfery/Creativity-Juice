/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import CreativityJuiceDesktop from './CreativityJuiceDesktop.jsx';
import JuiceCursorTrail from './JuiceCursorTrail';

interface ErrorBoundaryState {
  hasError: boolean;
  retried: boolean;
}

class StudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, retried: false };
  }

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('Studio ErrorBoundary caught error, attempting self-heal:', error);
    if (!this.state.retried) {
      try {
        const keysToReset = [
          'cj_desktop_widget_positions_v1',
          'cj_desktop_folder_positions_v1',
          'cj_dock_order_v1',
          'cj_studio_documents_v2',
          'cj_studio_documents_v3',
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
            <h2 className="text-lg font-black text-neutral-900">
              در حال بازنشانی نشست مرورگر...
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              حافظه موقت مرورگر شما با نسخه جدید استودیو همگام‌سازی می‌شد. برای ورود مستقیم روی دکمه زیر کلیک کنید:
            </p>
            <button
              type="button"
              onClick={this.handleFullReset}
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-black text-amber-300 font-black text-xs cursor-pointer transition"
            >
              بارگذاری مجدد استودیو
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <StudioErrorBoundary>
      <JuiceCursorTrail />
      <CreativityJuiceDesktop />
    </StudioErrorBoundary>
  );
}
