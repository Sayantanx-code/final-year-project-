import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-12 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white border-2 border-[#9333EA] text-slate-900 px-4 py-2.5 rounded-md shadow-xl font-mono text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#9333EA] shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
            <span className="font-medium text-slate-800 leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
