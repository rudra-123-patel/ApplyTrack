import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { statusConfig } from '../data/applications';
import { useTheme } from '../hooks/useTheme';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({
  column,
  applications,
  onCardClick,
  onQuickAdd
}) {
  const { isDark } = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      columnId: column.id,
    },
  });

  const statusStyle = statusConfig[column.id] || statusConfig.Applied;
  const cardIds = applications.map((app) => app.id);

  return (
    <div 
      className={`flex flex-col rounded-xl border transition-all w-[270px] sm:w-[280px] shrink-0 xl:flex-1 xl:w-auto min-h-[460px] ${
        isDark
          ? isOver
            ? 'border-[#7C3AED]/70 bg-[#17181D] ring-2 ring-[#7C3AED]/20'
            : 'bg-[#141518] border-[#23252A]'
          : isOver
            ? 'border-[#7C3AED]/70 bg-purple-50/70 ring-2 ring-[#7C3AED]/20'
            : 'bg-[#F8F9FC] border-[#E4E4E7]'
      }`}
    >
      {/* Column Header */}
      <div className={`p-3 border-b flex items-center justify-between ${isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
        }`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
          <h3 className={`text-xs font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
            {column.title}
          </h3>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium ${isDark
            ? 'bg-[#1C1E23] text-[#8E929B] border-[#23252A]'
            : 'bg-white text-zinc-600 border-[#E4E4E7] shadow-xs'
            }`}>
            {applications.length}
          </span>
        </div>

        {/* Quick Add button for this status */}
        {onQuickAdd && (
          <button
            onClick={() => onQuickAdd(column.id)}
            className={`p-1 rounded transition cursor-pointer ${isDark
              ? 'text-[#5F636E] hover:text-white hover:bg-[#1E1F24]'
              : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            title={`Add application to ${column.title}`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Droppable Body with SortableContext */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-250px)]"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              app={app}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>

        {/* Empty Column State */}
        {applications.length === 0 && (
          <div className={`h-32 rounded-md border border-dashed flex flex-col items-center justify-center p-3 text-center ${isDark ? 'border-[#23252A]' : 'border-zinc-300 bg-white/40'
            }`}>
            <p className={`text-[11px] ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`}>
              No applications in {column.title.toLowerCase()}
            </p>
            {onQuickAdd && (
              <button
                onClick={() => onQuickAdd(column.id)}
                className="mt-2 text-[10px] text-[#7C3AED] hover:text-purple-700 font-medium transition cursor-pointer"
              >
                + Add position
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
