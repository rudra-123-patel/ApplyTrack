import { useState, useMemo } from 'react';
import { 
  MapPin, 
  ExternalLink, 
  Trash2, 
  Pencil,
  ArrowUpDown, 
  SearchX, 
  Plus,
  Eye,
  Calendar,
  Search,
  X
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import DeleteConfirmModal from './DeleteConfirmModal';
import ApplicationDetailsModal from './ApplicationDetailsModal';

export default function RecentApplications({ 
  applications, 
  searchTerm = '', 
  onSearchChange,
  onDeleteApplication,
  onEditApplication,
  onAddNew,
  onResetDemoData,
  title
}) {
  const { isDark } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [appPendingDelete, setAppPendingDelete] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);

  const filterOptions = ['All', 'Interview', 'Offer', 'Screening', 'Applied', 'Rejected'];

  // Status badge styling helper for both themes
  const getStatusThemeClasses = (status, isDarkTheme) => {
    if (isDarkTheme) {
      switch (status) {
        case 'Applied':
          return 'bg-blue-500/10 text-blue-300 border-blue-500/25';
        case 'Screening':
          return 'bg-amber-500/10 text-amber-300 border-amber-500/25';
        case 'Interview':
          return 'bg-purple-500/10 text-purple-300 border-purple-500/25';
        case 'Offer':
          return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25';
        case 'Rejected':
        default:
          return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/25';
      }
    } else {
      switch (status) {
        case 'Applied':
          return 'bg-blue-50 text-blue-700 border-blue-200/80';
        case 'Screening':
          return 'bg-amber-50 text-amber-800 border-amber-200/80';
        case 'Interview':
          return 'bg-purple-50 text-purple-700 border-purple-200/80';
        case 'Offer':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
        case 'Rejected':
        default:
          return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      }
    }
  };

  const getStatusDotColor = (status, isDarkTheme) => {
    switch (status) {
      case 'Applied':
        return isDarkTheme ? 'bg-blue-400' : 'bg-blue-500';
      case 'Screening':
        return isDarkTheme ? 'bg-amber-400' : 'bg-amber-500';
      case 'Interview':
        return isDarkTheme ? 'bg-purple-400' : 'bg-[#7C3AED]';
      case 'Offer':
        return isDarkTheme ? 'bg-emerald-400' : 'bg-emerald-500';
      case 'Rejected':
      default:
        return isDarkTheme ? 'bg-zinc-400' : 'bg-zinc-400';
    }
  };

  // Search applications by company and job role, and filter by status
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (selectedStatus !== 'All' && app.status !== selectedStatus) {
          return false;
        }

        // Search by company and job role
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const matchesCompany = app.company.toLowerCase().includes(query);
          const matchesRole = app.role.toLowerCase().includes(query);
          return matchesCompany || matchesRole;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'appliedDate') {
          return sortOrder === 'desc' 
            ? new Date(b.appliedDate) - new Date(a.appliedDate)
            : new Date(a.appliedDate) - new Date(b.appliedDate);
        } else if (sortBy === 'company') {
          return sortOrder === 'desc'
            ? b.company.localeCompare(a.company)
            : a.company.localeCompare(b.company);
        }
        return 0;
      });
  }, [applications, selectedStatus, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

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

  const handleConfirmDelete = () => {
    if (appPendingDelete) {
      onDeleteApplication(appPendingDelete.id);
      setAppPendingDelete(null);
    }
  };

  return (
    <>
      <div className={`rounded-lg border overflow-hidden transition-all ${
        isDark 
          ? 'bg-[#18191D] border-[#23252A]' 
          : 'bg-white border-[#E4E4E7] shadow-xs'
      }`}>
        
        {/* Table Header Controls */}
        <div className={`p-3.5 sm:p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
          isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
        }`}>
          <div className="flex items-center gap-2.5">
            <h2 className={`text-xs sm:text-sm font-semibold tracking-tight ${
              isDark ? 'text-white' : 'text-[#18181B]'
            }`}>
              {title || 'Recent Applications'}
            </h2>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border font-medium ${
              isDark 
                ? 'bg-[#141518] border-[#23252A] text-[#8E929B]' 
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}>
              {filteredApplications.length} of {applications.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick in-table search if onSearchChange is passed */}
            {onSearchChange && (
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                }`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Filter table..."
                  className={`h-7.5 w-36 sm:w-48 pl-8 pr-6 text-xs rounded-md border transition focus:outline-none focus:border-[#7C3AED] ${
                    isDark
                      ? 'bg-[#141518] border-[#23252A] text-white placeholder-[#5F636E]'
                      : 'bg-[#F4F4F6] border-[#E4E4E7] text-zinc-900 placeholder-zinc-400'
                  }`}
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange('')}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 transition cursor-pointer ${
                      isDark ? 'text-[#5F636E] hover:text-white' : 'text-zinc-400 hover:text-zinc-900'
                    }`}
                    title="Clear filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Segmented Filter */}
            <div className={`inline-flex items-center gap-0.5 p-0.5 rounded-md border overflow-x-auto scrollbar-none ${
              isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F4F4F6] border-[#E4E4E7]'
            }`}>
              {filterOptions.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`text-xs px-2.5 py-1 rounded transition cursor-pointer font-medium whitespace-nowrap ${
                      isSelected
                        ? isDark
                          ? 'bg-[#22242A] text-white shadow-xs border border-[#2B2D34]'
                          : 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold'
                        : isDark
                          ? 'text-[#8E929B] hover:text-[#EDEDED]'
                          : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className={`text-[11px] font-semibold uppercase tracking-wider border-b ${
                  isDark 
                    ? 'bg-[#141518] text-[#5F636E] border-[#23252A]' 
                    : 'bg-[#F8F9FC] text-zinc-500 border-[#E4E4E7]'
                }`}>
                  <th 
                    className={`py-3 px-4 font-semibold cursor-pointer transition select-none ${
                      isDark ? 'hover:text-white' : 'hover:text-zinc-900'
                    }`}
                    onClick={() => toggleSort('company')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Company</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Job Role</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th 
                    className={`py-3 px-4 font-semibold cursor-pointer transition select-none ${
                      isDark ? 'hover:text-white' : 'hover:text-zinc-900'
                    }`}
                    onClick={() => toggleSort('appliedDate')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Applied</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${
                isDark ? 'divide-[#23252A]' : 'divide-[#E4E4E7]'
              }`}>
                {filteredApplications.map((app) => {
                  const companyInitial = app.company ? app.company.charAt(0).toUpperCase() : '?';

                  return (
                    <tr 
                      key={app.id} 
                      className={`transition-colors group ${
                        isDark ? 'hover:bg-[#1E1F24]' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      {/* 1. Company (Primary visual weight) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                            isDark
                              ? 'bg-[#202227] border-[#2B2D34] text-white group-hover:border-[#7C3AED]/40'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-800 group-hover:border-[#7C3AED]/40'
                          }`}>
                            {companyInitial}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm transition-colors truncate ${
                              isDark 
                                ? 'text-white group-hover:text-purple-300' 
                                : 'text-[#18181B] group-hover:text-[#7C3AED]'
                            }`}>
                              {app.company}
                            </p>
                            {app.salary ? (
                              <p className={`text-[11px] font-mono tracking-tight mt-0.5 truncate ${
                                isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                              }`}>
                                {app.salary}
                              </p>
                            ) : (
                              <p className={`text-[11px] font-mono tracking-tight mt-0.5 ${
                                isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                              }`}>
                                Salary unlisted
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Job Role (Secondary hierarchy) */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <p className={`text-xs font-normal truncate max-w-xs ${
                            isDark ? 'text-[#C5C8D0]' : 'text-zinc-600'
                          }`}>
                            {app.role}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {app.jobType && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                isDark
                                  ? 'bg-[#141518] border-[#23252A] text-[#8E929B]'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                              }`}>
                                {app.jobType}
                              </span>
                            )}
                            {app.notes && (
                              <span 
                                className={`text-[11px] truncate max-w-[170px] ${
                                  isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                                }`}
                                title={app.notes}
                              >
                                {app.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className={`flex items-center gap-1.5 text-xs ${
                          isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                        }`}>
                          <MapPin className={`w-3.5 h-3.5 shrink-0 ${
                            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                          }`} />
                          <span className="truncate max-w-[150px]">{app.location || 'Remote'}</span>
                        </div>
                      </td>

                      {/* 4. Applied Date */}
                      <td className={`py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-xs ${
                        isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <Calendar className={`w-3.5 h-3.5 shrink-0 ${
                            isDark ? 'text-[#5F636E]' : 'text-zinc-400'
                          }`} />
                          <span>{formatDate(app.appliedDate)}</span>
                        </div>
                      </td>

                      {/* 5. Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${getStatusThemeClasses(app.status, isDark)}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(app.status, isDark)}`} />
                          {app.status}
                        </span>
                      </td>

                      {/* 6. Actions (View, Edit, External Link, Delete) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View details */}
                          <button
                            onClick={() => setViewingApplication(app)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                              isDark 
                                ? 'text-[#5F636E] hover:text-purple-300 hover:bg-purple-500/10' 
                                : 'text-zinc-400 hover:text-[#7C3AED] hover:bg-purple-50'
                            }`}
                            title="View application details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit application */}
                          {onEditApplication && (
                            <button
                              onClick={() => onEditApplication(app)}
                              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                                isDark 
                                ? 'text-[#5F636E] hover:text-[#EDEDED] hover:bg-[#23252A]' 
                                : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                              }`}
                              title="Edit application"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* External listing link */}
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                                isDark 
                                ? 'text-[#5F636E] hover:text-white hover:bg-[#23252A]' 
                                : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                              }`}
                              title="Open job listing"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Delete application */}
                          <button
                            onClick={() => setAppPendingDelete(app)}
                            className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                              isDark 
                                ? 'text-[#5F636E] hover:text-rose-400 hover:bg-rose-500/10' 
                                : 'text-zinc-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Delete application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <SearchX className={`w-6 h-6 mb-2.5 ${isDark ? 'text-[#5F636E]' : 'text-zinc-400'}`} />
            <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
              {applications.length === 0 ? 'No applications recorded yet' : 'No applications match your filter'}
            </h3>
            <p className={`text-xs max-w-sm mb-4 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
              {applications.length === 0 
                ? 'Start tracking your job search by adding your first application or load starter demo data.'
                : 'Try adjusting your company/role search terms or clear the status filter.'}
            </p>
            <div className="flex items-center gap-2">
              {applications.length === 0 ? (
                <>
                  {onAddNew && (
                    <button
                      onClick={onAddNew}
                      className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Application</span>
                    </button>
                  )}
                  {onResetDemoData && (
                    <button
                      onClick={onResetDemoData}
                      className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition cursor-pointer border ${
                        isDark
                          ? 'bg-[#22242A] hover:bg-[#2B2D34] text-white border-[#2B2D34]'
                          : 'bg-white hover:bg-zinc-100 text-[#18181B] border-[#E4E4E7] shadow-xs'
                      }`}
                    >
                      Load Demo Data
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={() => {
                    setSelectedStatus('All');
                    onSearchChange?.('');
                  }}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer border ${
                    isDark
                      ? 'bg-[#22242A] hover:bg-[#2B2D34] text-white border-[#2B2D34]'
                      : 'bg-white hover:bg-zinc-100 text-[#18181B] border-[#E4E4E7] shadow-xs'
                  }`}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Table Footer */}
        <div className={`px-4 py-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs ${
          isDark 
            ? 'bg-[#141518] border-[#23252A] text-[#5F636E]' 
            : 'bg-[#F8F9FC] border-[#E4E4E7] text-zinc-500'
        }`}>
          <span>
            Showing <strong className={`font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{filteredApplications.length}</strong> of{' '}
            <strong className={`font-mono ${isDark ? 'text-white' : 'text-zinc-900'}`}>{applications.length}</strong> recorded positions
          </span>
          <span className="hidden sm:inline">Click column headers to sort by Company or Applied Date</span>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={Boolean(appPendingDelete)}
        application={appPendingDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAppPendingDelete(null)}
      />

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        isOpen={Boolean(viewingApplication)}
        application={viewingApplication}
        onClose={() => setViewingApplication(null)}
        onEdit={(app) => {
          setViewingApplication(null);
          onEditApplication?.(app);
        }}
        onDelete={(appId) => {
          setViewingApplication(null);
          const target = applications.find((a) => a.id === appId);
          if (target) {
            setAppPendingDelete(target);
          }
        }}
      />
    </>
  );
}
