import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastData {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastNotificationProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastData; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role="alert"
      className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-400/80 dark:border-emerald-500/60 shadow-2xl shadow-emerald-600/15 dark:shadow-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all transform animate-in slide-in-from-top-3 fade-in duration-200"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/80 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400 shadow-xs">
        <CheckCircle2 className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {toast.title || 'Saved Successfully!'}
          </h4>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

