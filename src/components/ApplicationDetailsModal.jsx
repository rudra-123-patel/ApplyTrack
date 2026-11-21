import { useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  FileText 
} from 'lucide-react';
import { statusConfig } from '../data/applications';
import { useTheme } from '../hooks/useTheme';

export default function ApplicationDetailsModal({ 
  isOpen, 
  application, 
  onClose, 
  onEdit, 
  onDelete 
}) {
  const { isDark } = useTheme();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !application) return null;

  const statusStyle = statusConfig[application.status] || statusConfig.Applied;
  const companyInitial = application.company ? application.company.charAt(0).toUpperCase() : '?';

  const formatDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, parseInt(month, 10) - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto ${
        isDark ? 'bg-black/60' : 'bg-slate-900/35'
      }`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden my-6 border transition-colors animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#18191D] border-[#26282E] text-white'
            : 'bg-white border-[#E4E4E7] text-[#18181B] shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-start justify-between px-5 py-4 border-b ${
          isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold shrink-0 border ${
              isDark
                ? 'bg-[#202227] border-[#2B2D34] text-white'
                : 'bg-[#F1F2F6] border-[#E4E4E7] text-[#18181B]'
            }`}>
              {companyInitial}
            </div>
            <div className="min-w-0">
              <h2 className={`text-sm font-semibold tracking-tight truncate ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {application.company}
              </h2>
              <p className={`text-xs truncate ${
                isDark ? 'text-[#8E929B]' : 'text-[#71717A]'
              }`}>
                {application.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span 
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {application.status}
            </span>

            <button
              onClick={onClose}
              className={`p-1 rounded transition cursor-pointer ${
                isDark 
                  ? 'text-[#8E929B] hover:text-white hover:bg-[#22242A]' 
                  : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#F1F2F6]'
              }`}
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className={`grid grid-cols-2 gap-3 p-3 rounded-md border ${
            isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
          }`}>
            <div>
              <span className={`flex items-center gap-1 text-[11px] ${
                isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
              }`}>
                <MapPin className="w-3 h-3" />
                Location
              </span>
              <p className={`font-medium mt-0.5 truncate ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {application.location || 'Remote'}
              </p>
            </div>

            <div>
              <span className={`flex items-center gap-1 text-[11px] ${
                isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
              }`}>
                <Briefcase className="w-3 h-3" />
                Job Type
              </span>
              <p className={`font-medium mt-0.5 truncate ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {application.jobType || 'Full-time'}
              </p>
            </div>

            <div>
              <span className={`flex items-center gap-1 text-[11px] ${
                isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
              }`}>
                <DollarSign className="w-3 h-3" />
                Compensation
              </span>
              <p className={`font-medium mt-0.5 truncate font-mono ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {application.salary || 'Not specified'}
              </p>
            </div>

            <div>
              <span className={`flex items-center gap-1 text-[11px] ${
                isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
              }`}>
                <Calendar className="w-3 h-3" />
                Applied Date
              </span>
              <p className={`font-medium mt-0.5 truncate font-mono ${
                isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
                {formatDate(application.appliedDate)}
              </p>
            </div>
          </div>

          {/* Job Listing Link if available */}
          {application.jobUrl && (
            <div>
              <span className={`block text-[11px] mb-1 ${
                isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
              }`}>Job Listing</span>
              <a 
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#7C3AED] hover:underline font-medium transition break-all"
              >
                <span>{application.jobUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Notes */}
          <div>
            <span className={`flex items-center gap-1 text-[11px] mb-1 ${
              isDark ? 'text-[#5F636E]' : 'text-[#71717A]'
            }`}>
              <FileText className="w-3 h-3" />
              Notes & Next Steps
            </span>
            <div className={`p-3 rounded-md border text-xs leading-relaxed whitespace-pre-wrap min-h-[60px] ${
              isDark 
                ? 'bg-[#141518] border-[#23252A] text-[#EDEDED]' 
                : 'bg-[#F8F9FC] border-[#E4E4E7] text-[#18181B]'
            }`}>
              {application.notes ? application.notes : (
                <span className={isDark ? "text-[#5F636E] italic" : "text-[#A1A1AA] italic"}>
                  No notes added for this position yet.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between ${
          isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
        }`}>
          <button
            type="button"
            onClick={() => {
              onDelete(application.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-medium transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md border text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'border-[#26282E] text-[#8E929B] hover:text-white hover:bg-[#22242A]'
                  : 'border-[#E4E4E7] bg-[#F1F2F6] hover:bg-[#E4E4E7] text-[#18181B]'
              }`}
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit(application);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
