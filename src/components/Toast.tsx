import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl shadow-black/20 text-sm font-medium animate-bounce-in max-w-md backdrop-blur-md transition-all duration-300">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${bgStyles[toast.type]} shadow-lg`}>
        {icons[toast.type]}
        <span>{toast.text}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
