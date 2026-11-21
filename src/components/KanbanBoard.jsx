import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Search, Plus, X } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import { KanbanCardPreview } from './KanbanCard';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import AddApplicationModal from './AddApplicationModal';
import { useApplications } from '../hooks/useApplications';
import { useTheme } from '../hooks/useTheme';

const COLUMNS = [
  { id: 'Applied', title: 'Applied' },
  { id: 'Screening', title: 'Screening' },
  { id: 'Interview', title: 'Interview' },
  { id: 'Offer', title: 'Offer' },
  { id: 'Rejected', title: 'Rejected' },
];

export default function KanbanBoard() {
  const { isDark } = useTheme();
  const {
    applications,
    updateApplication,
    deleteApplication,
    addApplication,
    searchTerm,
    setSearchTerm,
  } = useApplications();

  const [activeApp, setActiveApp] = useState(null);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [appPendingDelete, setAppPendingDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [presetStatusForAdd, setPresetStatusForAdd] = useState('Applied');

  // Sensors with distance constraint to prevent drag on normal click
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group applications by status and filter by search term (company & role)
  const columnsData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    // Grouping container
    const groups = {
      Applied: [],
      Screening: [],
      Interview: [],
      Offer: [],
      Rejected: [],
    };

    applications.forEach((app) => {
      // Search matching company or role
      if (query !== '') {
        const matchesCompany = app.company.toLowerCase().includes(query);
        const matchesRole = app.role.toLowerCase().includes(query);
        if (!matchesCompany && !matchesRole) {
          return;
        }
      }

      const statusKey = groups[app.status] ? app.status : 'Applied';
      groups[statusKey].push(app);
    });

    return groups;
  }, [applications, searchTerm]);

  // Handle Drag Start
  const handleDragStart = (event) => {
    const { active } = event;
    const found = applications.find((a) => a.id === active.id);
    setActiveApp(found || null);
  };

  // Handle Drag End and Status Update
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveApp(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const dragged = applications.find((a) => a.id === activeId);
    if (!dragged) return;

    // Check if over target is a column directly
    let targetStatus = null;
    const colMatch = COLUMNS.find((col) => col.id === overId);
    if (colMatch) {
      targetStatus = colMatch.id;
    } else {
      // Over target is another card
      const targetCard = applications.find((a) => a.id === overId);
      if (targetCard) {
        targetStatus = targetCard.status;
      }
    }

    if (targetStatus && targetStatus !== dragged.status) {
      updateApplication(dragged.id, { status: targetStatus });
    }
  };

  // Quick Add for a specific column
  const handleQuickAdd = (status) => {
    setPresetStatusForAdd(status);
    setEditingApp(null);
    setIsAddModalOpen(true);
  };

  // Edit action from details modal
  const handleEditFromDetails = (app) => {
    setSelectedAppForDetails(null);
    setEditingApp(app);
    setIsAddModalOpen(true);
  };

  // Delete action from details modal
  const handleDeleteFromDetails = (appId) => {
    const app = applications.find((a) => a.id === appId);
    if (app) {
      setSelectedAppForDetails(null);
      setAppPendingDelete(app);
    }
  };

  const handleConfirmDelete = () => {
    if (appPendingDelete) {
      deleteApplication(appPendingDelete.id);
      setAppPendingDelete(null);
    }
  };

  const handleSaveModal = (formData) => {
    if (editingApp) {
      updateApplication(editingApp.id, formData);
    } else {
      addApplication({
        ...formData,
        status: formData.status || presetStatusForAdd,
      });
    }
    setIsAddModalOpen(false);
    setEditingApp(null);
  };

  return (
    <div className="space-y-4">
      {/* Kanban Board Header & Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border transition-all ${isDark ? 'bg-[#18191D] border-[#23252A]' : 'bg-white border-[#E4E4E7] shadow-xs'
        }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-sm font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#18181B]'
              }`}>
              Kanban Board
            </h2>
            <span className={`text-[11px] font-mono ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'
              }`}>
              ({applications.length} positions)
            </span>
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'
            }`}>
            Drag cards between stages to update status in real time
          </p>
        </div>

        {/* Board Search & Action Bar */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-60">
            <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'
              }`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search board..."
              className={`w-full h-8 pl-8 pr-7 rounded-md text-xs border focus:outline-none focus:border-[#7C3AED] transition ${isDark
                ? 'bg-[#141518] text-white placeholder-[#5F636E] border-[#23252A]'
                : 'bg-[#F4F4F6] text-zinc-900 placeholder-zinc-400 border-[#E4E4E7]'
                }`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 transition cursor-pointer ${isDark ? 'text-[#5F636E] hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
                  }`}
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleQuickAdd('Applied')}
            className="h-8 flex items-center gap-1.5 px-3 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Position</span>
          </button>
        </div>
      </div>

      {/* DndContext & Columns Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin snap-x scroll-smooth">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              applications={columnsData[column.id] || []}
              onCardClick={(app) => setSelectedAppForDetails(app)}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>

        {/* Drag Overlay for active card preview */}
        <DragOverlay>
          {activeApp ? <KanbanCardPreview app={activeApp} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(selectedAppForDetails)}
        application={selectedAppForDetails}
        onClose={() => setSelectedAppForDetails(null)}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      {/* Add / Edit Application Modal */}
      <AddApplicationModal
        key={editingApp ? editingApp.id : (isAddModalOpen ? `kanban-${presetStatusForAdd}` : 'closed')}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingApp(null);
        }}
        onSave={handleSaveModal}
        initialData={editingApp ? editingApp : { status: presetStatusForAdd }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(appPendingDelete)}
        application={appPendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppPendingDelete(null)}
      />
    </div>
  );
}
