import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Calendar } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { getStatusThemeClasses } from '../utils/statusTheme';

export default function KanbanCard({ app, onClick }) {
  const { isDark } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: app.id,
    data: {
      type: 'Card',
      app,
      columnId: app.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusInfo = getStatusThemeClasses(app.status, isDark);
  const companyInitial = app.company ? app.company.charAt(0).toUpperCase() : '?';

  const formatDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, parseInt(month, 10) - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(app)}
      className={`p-3.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing select-none group ${
        isDragging
          ? 'opacity-30 scale-[0.98] border-dashed border-[#7C3AED] shadow-inner'
          : isDark
            ? 'bg-[#18191D] border-[#23252A] hover:border-[#363840] hover:bg-[#1E1F24] hover:shadow-md hover:shadow-black/25'
            : 'bg-white border-[#E4E4E7] hover:border-zinc-300 hover:shadow-sm hover:shadow-zinc-900/5'
      }`}
    >
      {/* Top row: Company Avatar + Company Name + Status Dot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 border ${
            isDark
              ? 'bg-[#202227] border-[#2B2D34] text-white'
              : 'bg-zinc-100 border-zinc-200 text-zinc-800'
          }`}>
            {companyInitial}
          </div>
          <span className={`text-xs sm:text-[13px] font-semibold truncate transition-colors ${
            isDark
              ? 'text-white group-hover:text-purple-300'
              : 'text-[#18181B] group-hover:text-[#7C3AED]'
          }`}>
            {app.company}
          </span>
        </div>

        {/* Status Indicator Dot */}
        <span 
          className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} 
          title={app.status}
        />
      </div>

      {/* Role */}
      <p className={`text-xs font-normal truncate mt-2 ${
        isDark ? 'text-[#C5C8D0]' : 'text-zinc-600'
      }`}>
        {app.role}
      </p>

      {/* Location */}
      {app.location && (
        <div className={`flex items-center gap-1.5 text-[11px] mt-1.5 ${
          isDark ? 'text-[#8E929B]' : 'text-zinc-500'
        }`}>
          <MapPin className={`w-3 h-3 shrink-0 ${
            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
          }`} />
          <span className="truncate">{app.location}</span>
        </div>
      )}

      {/* Footer Info: Job Type, Salary, Date */}
      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-1.5 text-[10px] ${
        isDark ? 'border-[#23252A]' : 'border-zinc-100'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {app.jobType && (
            <span className={`px-1.5 py-0.5 rounded font-mono truncate border ${
              isDark
                ? 'bg-[#131417] text-[#8E929B] border-[#23252A]'
                : 'bg-zinc-100 text-zinc-600 border-zinc-200'
            }`}>
              {app.jobType}
            </span>
          )}
          {app.salary && (
            <span className={`font-mono truncate hidden sm:inline ${
              isDark ? 'text-[#5F636E]' : 'text-zinc-400'
            }`}>
              {app.salary}
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1 font-mono shrink-0 ${
          isDark ? 'text-[#5F636E]' : 'text-zinc-500'
        }`}>
          <Calendar className={`w-3 h-3 ${
            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
          }`} />
          <span>{formatDate(app.appliedDate)}</span>
        </div>
      </div>
    </div>
  );
}

// Standalone Card Preview for DragOverlay
export function KanbanCardPreview({ app }) {
  const { isDark } = useTheme();
  const statusInfo = getStatusThemeClasses(app.status, isDark);
  const companyInitial = app.company ? app.company.charAt(0).toUpperCase() : '?';

  const formatDate = (dateString) => {
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, parseInt(month, 10) - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`p-3.5 rounded-lg border-2 border-[#7C3AED] rotate-1 scale-[1.02] cursor-grabbing select-none w-72 sm:w-80 shadow-2xl transition-all ${
      isDark 
        ? 'bg-[#18191D] text-white shadow-black/60' 
        : 'bg-white text-[#18181B] shadow-zinc-900/20'
    }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 border ${
            isDark
              ? 'bg-[#202227] border-[#2B2D34] text-white'
              : 'bg-zinc-100 border-zinc-200 text-zinc-800'
          }`}>
            {companyInitial}
          </div>
          <span className="text-xs sm:text-[13px] font-semibold truncate">
            {app.company}
          </span>
        </div>
        <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
      </div>

      <p className={`text-xs font-normal truncate mt-2 ${
        isDark ? 'text-[#C5C8D0]' : 'text-zinc-600'
      }`}>
        {app.role}
      </p>

      {app.location && (
        <div className={`flex items-center gap-1.5 text-[11px] mt-1.5 ${
          isDark ? 'text-[#8E929B]' : 'text-zinc-500'
        }`}>
          <MapPin className={`w-3 h-3 shrink-0 ${
            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
          }`} />
          <span className="truncate">{app.location}</span>
        </div>
      )}

      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] ${
        isDark ? 'border-[#23252A]' : 'border-zinc-100'
      }`}>
        <span className={`px-1.5 py-0.5 rounded font-mono border ${
          isDark
            ? 'bg-[#131417] text-[#8E929B] border-[#23252A]'
            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
        }`}>
          {app.jobType || 'Full-time'}
        </span>
        <span className={`font-mono ${
          isDark ? 'text-[#5F636E]' : 'text-zinc-500'
        }`}>
          {formatDate(app.appliedDate)}
        </span>
      </div>
    </div>
  );
}
