import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function DeleteConfirmModal({ isOpen, application, onConfirm, onCancel }) {
  const { isDark } = useTheme();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !application) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs ${
        isDark ? 'bg-black/60' : 'bg-slate-900/35'
      }`}
      onClick={onCancel}
    >
      <div 
        className={`relative w-full max-w-sm rounded-xl shadow-2xl overflow-hidden p-5 border transition-colors animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#18191D] border-[#26282E] text-white'
            : 'bg-white border-[#E4E4E7] text-[#18181B] shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              Delete Application
            </h3>
            <p className={`text-xs mt-1.5 leading-relaxed ${
              isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
            }`}>
              Are you sure you want to delete the application for{' '}
              <strong className={isDark ? "text-white font-medium" : "text-[#18181B] font-medium"}>
                {application.company}
              </strong>{' '}
              ({application.role})? This action cannot be undone.
            </p>
          </div>

          <button
            onClick={onCancel}
            className={`p-1 rounded transition shrink-0 cursor-pointer ${
              isDark
                ? 'text-[#5F636E] hover:text-white hover:bg-[#22242A]'
                : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F1F2F6]'
            }`}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`mt-5 pt-3 border-t flex items-center justify-end gap-2 ${
          isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition cursor-pointer ${
              isDark
                ? 'border-[#26282E] text-[#8E929B] hover:text-white hover:bg-[#22242A]'
                : 'border-[#E4E4E7] bg-[#F1F2F6] hover:bg-[#E4E4E7] text-[#18181B]'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition cursor-pointer"
          >
            Delete Application
          </button>
        </div>
      </div>
    </div>
  );
}
