import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Settings as SettingsIcon,
  Check,
  RotateCcw,
  Trash2,
  HardDrive,
  Cloud,
  Database,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  LogOut,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import ApplicationChart from './ApplicationChart';
import RecentApplications from './RecentApplications';
import AddApplicationModal from './AddApplicationModal';
import KanbanBoard from './KanbanBoard';
import AnalyticsView from './AnalyticsView';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { testSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';

export default function DashboardApp() {
  const { user, signOut, isAdmin } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const {
    applications,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    addApplication,
    updateApplication,
    deleteApplication,
    resetToDemoData,
    clearAllApplications,
    importFromLocalStorage,
    localStorageCount,
  } = useApplications();

  const [activeNav, setActiveNav] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);

  // LocalStorage import state
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await testSupabaseConnection();
      setSupabaseStatus(res);
      if (res.success) {
        showToast('Supabase connection verified successfully');
      } else {
        showToast(res.message || 'Supabase connection failed');
      }
    } catch {
      setSupabaseStatus({ success: false, message: 'Connection check failed' });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleImportLocalStorage = async () => {
    setIsImporting(true);
    setImportSummary(null);
    try {
      const res = await importFromLocalStorage();
      setImportSummary(res);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(`Import error: ${res.message}`);
      }
    } catch (err) {
      setImportSummary({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to import records.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOpenAddModal = () => {
    setEditingApplication(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApplication(app);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (formData) => {
    try {
      if (editingApplication) {
        await updateApplication(editingApplication.id, formData);
        showToast(`Updated ${formData.company} (${formData.role})`);
      } else {
        await addApplication(formData);
        showToast(`Added ${formData.company} (${formData.role})`);
      }
      setIsModalOpen(false);
      setEditingApplication(null);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : 'Save operation failed'}`);
    }
  };

  const handleDelete = async (id) => {
    const target = applications.find((a) => a.id === id);
    try {
      await deleteApplication(id);
      if (target) {
        showToast(`Deleted ${target.company}`);
      }
    } catch (err) {
      showToast(`Delete failed: ${err instanceof Error ? err.message : 'Could not delete record'}`);
    }
  };

  const handleResetDemo = async () => {
    try {
      await resetToDemoData();
      showToast('Loaded starter demo applications into cloud database');
    } catch (err) {
      showToast(`Reset failed: ${err instanceof Error ? err.message : 'Could not load demo data'}`);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all cloud applications? Your LocalStorage backup will remain untouched.')) {
      try {
        await clearAllApplications();
        showToast('Cleared all cloud application records');
      } catch (err) {
        showToast(`Clear failed: ${err instanceof Error ? err.message : 'Could not clear records'}`);
      }
    }
  };

  return (
    <div className={`min-h-screen flex transition-colors ${isDark ? 'bg-[#0F1012] text-[#EDEDED]' : 'bg-[#F5F6FA] text-[#18181B]'
      }`}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        applicationsCount={stats.total}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onOpenModal={handleOpenAddModal}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2 rounded-md border text-xs font-medium shadow-xl animate-in slide-in-from-bottom-2 duration-150 ${isDark
            ? 'bg-[#18191D] border-[#26282E] text-white'
            : 'bg-white border-[#E4E4E7] text-zinc-900'
            }`}>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 px-4 sm:px-6 py-4 space-y-4 max-w-7xl w-full mx-auto">

          {/* Cloud Loading Banner */}
          {isLoading && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs animate-pulse ${isDark
              ? 'bg-[#18191D] border-[#23252A] text-[#8E929B]'
              : 'bg-white border-[#E4E4E7] text-zinc-600 shadow-xs'
              }`}>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" />
              <span>Synchronizing with Supabase PostgreSQL...</span>
            </div>
          )}

          {/* Active View: Dashboard */}
          {activeNav === 'Dashboard' && (
            <>
              {/* 1. Dynamic Statistics Section */}
              <section aria-label="Pipeline Statistics">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    title="Total Applications"
                    value={stats.total}
                    subtext={stats.total > 0 ? 'All cloud-synced entries' : 'Empty pipeline'}
                  />
                  <StatCard
                    title="Interviews"
                    value={stats.interviews}
                    subtext={stats.total > 0 ? `${stats.interviewPercent}% of pipeline` : '0%'}
                  />
                  <StatCard
                    title="Offers"
                    value={stats.offers}
                    subtext={stats.total > 0 ? `${stats.offerPercent}% offer rate` : '0%'}
                  />
                  <StatCard
                    title="Rejections"
                    value={stats.rejections}
                    subtext={stats.total > 0 ? `${stats.rejectionPercent}% of pipeline` : '0%'}
                  />
                </div>
              </section>

              {/* 2. Dynamic Charts (Donut + Monthly Activity) */}
              <section aria-label="Visual Analytics">
                <ApplicationChart applications={applications} />
              </section>

              {/* 3. Recent Applications Table */}
              <section aria-label="Recent Applications Table">
                <RecentApplications
                  applications={applications}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  onDeleteApplication={handleDelete}
                  onEditApplication={handleOpenEditModal}
                  onAddNew={handleOpenAddModal}
                  onResetDemoData={handleResetDemo}
                  title="Recent Applications"
                />
              </section>
            </>
          )}

          {/* Active View: Applications (Dedicated Table View) */}
          {activeNav === 'Applications' && (
            <div className="space-y-4">
              <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all ${isDark
                ? 'bg-[#18191D] border-[#23252A]'
                : 'bg-white border-[#E4E4E7] shadow-xs'
                }`}>
                <div>
                  <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
                    All Applications Directory
                  </h2>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    Managing {stats.total} positions stored securely in Supabase PostgreSQL.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-medium transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Application</span>
                </button>
              </div>

              <RecentApplications
                applications={applications}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDeleteApplication={handleDelete}
                onEditApplication={handleOpenEditModal}
                onAddNew={handleOpenAddModal}
                onResetDemoData={handleResetDemo}
                title="All Applications"
              />
            </div>
          )}

          {/* Active View: Kanban Board */}
          {activeNav === 'Kanban Board' && (
            <KanbanBoard />
          )}

          {/* Active View: Analytics */}
          {activeNav === 'Analytics' && (
            <AnalyticsView />
          )}

          {/* Active View: Settings & Data Management */}
          {activeNav === 'Settings' && (
            <div className={`p-4 sm:p-6 rounded-xl max-w-lg mx-auto my-4 sm:my-8 border transition-all ${isDark
              ? 'bg-[#18191D] border-[#23252A]'
              : 'bg-white border-[#E4E4E7] shadow-sm'
              }`}>
              <div className={`flex items-center gap-2.5 mb-5 pb-3 border-b ${isDark ? 'border-[#23252A]' : 'border-[#E4E4E7]'
                }`}>
                <div className={`w-8 h-8 rounded-md border flex items-center justify-center text-[#7C3AED] ${isDark ? 'bg-[#141518] border-[#26282E]' : 'bg-purple-50 border-purple-200'
                  }`}>
                  <SettingsIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#18181B]'}`}>
                    {isAdmin ? 'Settings & Data Management' : 'Settings & Preferences'}
                  </h2>
                  <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                    {isAdmin
                      ? 'Manage cloud storage, LocalStorage backup, and account'
                      : 'Manage account preferences and application appearance'}
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Authenticated Account Profile (Visible to All) */}
                <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                  }`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md border flex items-center justify-center text-[#7C3AED] shrink-0 ${isDark ? 'bg-[#22242A] border-[#2B2D34]' : 'bg-white border-zinc-200 shadow-xs'
                      }`}>
                      {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-[#18181B]'}`} title={user?.email || 'Authenticated User'}>
                          {user?.email || 'Authenticated User'}
                        </p>
                        {isAdmin ? (
                          <span className="text-[9px] bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/30 px-1.5 py-0.2 rounded font-mono font-medium">
                            Admin
                          </span>
                        ) : (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono border ${isDark
                            ? 'bg-[#22242A] text-[#8E929B] border-[#2B2D34]'
                            : 'bg-white text-zinc-600 border-zinc-200 shadow-xs'
                            }`}>
                            Member
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                        {isAdmin ? 'System Administrator Access' : 'Standard workspace user'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ml-2 border ${isDark
                      ? 'bg-[#22242A] hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border-[#2B2D34] text-[#EDEDED]'
                      : 'bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border-[#E4E4E7] text-[#18181B] shadow-xs'
                      }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Appearance: Theme Switcher (Visible to All) */}
                <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-md border flex items-center justify-center text-[#7C3AED] ${isDark ? 'bg-[#22242A] border-[#2B2D34]' : 'bg-white border-zinc-200 shadow-xs'
                      }`}>
                      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Appearance</p>
                      <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                        Current theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                      </p>
                    </div>
                  </div>

                  {/* Segmented Light / Dark Toggle */}
                  <div className={`flex items-center p-0.5 rounded-md border ${isDark ? 'bg-[#101114] border-[#23252A]' : 'bg-[#EAEBED] border-[#E4E4E7]'
                    }`}>
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${!isDark
                        ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                        : 'text-[#8E929B] hover:text-white'
                        }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${isDark
                        ? 'bg-[#22242A] text-white shadow-xs border border-[#2B2D34]'
                        : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                {/* Administrative Data Management (Admin Role Only) */}
                {isAdmin && (
                  <div className="pt-2 space-y-3.5">
                    <div className="flex items-center justify-between pb-1 border-b border-[#23252A]/60 dark:border-[#23252A] border-zinc-200">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'
                        }`}>
                        Database & Data Management
                      </span>
                      <span className="text-[9px] bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] border border-[#7C3AED]/30 px-1.5 py-0.2 rounded font-mono font-medium">
                        Admin Only
                      </span>
                    </div>

                    {/* 1. Primary Storage: Supabase Cloud Database */}
                    <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-[#7C3AED]" />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Cloud Database (PostgreSQL)</p>
                          <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                            Supabase source of truth ({stats.total} applications synced)
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Cloud Synced
                      </span>
                    </div>

                    {/* 2. Secondary Storage: LocalStorage Backup */}
                    <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div className="flex items-center gap-2.5">
                        <HardDrive className={`w-4 h-4 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`} />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>LocalStorage Local Backup</p>
                          <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                            Preserved offline copy ({localStorageCount} records in browser)
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${isDark
                        ? 'bg-[#1E2025] text-[#8E929B] border-[#2B2D34]'
                        : 'bg-white text-zinc-600 border-zinc-200 shadow-xs'
                        }`}>
                        Preserved
                      </span>
                    </div>

                    {/* 3. LocalStorage Import to Cloud */}
                    <div className={`p-3 rounded-md border space-y-2.5 transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <UploadCloud className="w-4 h-4 text-[#7C3AED]" />
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Import LocalStorage to Cloud</p>
                            <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                              {localStorageCount > 0
                                ? `Migrate ${localStorageCount} LocalStorage applications to your Supabase account.`
                                : 'No LocalStorage records found in this browser.'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleImportLocalStorage}
                          disabled={isImporting || localStorageCount === 0}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 text-white text-xs font-medium transition cursor-pointer shrink-0"
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Importing...</span>
                            </>
                          ) : (
                            <span>Import to Cloud</span>
                          )}
                        </button>
                      </div>

                      {importSummary && (
                        <div
                          className={`p-2.5 rounded text-[11px] flex items-start gap-2 ${importSummary.success
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            }`}
                        >
                          {importSummary.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{importSummary.message}</p>
                            {importSummary.duplicateCount > 0 && (
                              <p className="text-[10px] opacity-80 mt-0.5">
                                Duplicate protection skipped {importSummary.duplicateCount} records already in your account.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 4. Supabase Connection - Admin Diagnostics */}
                    <div className={`p-3 rounded-md border space-y-2 transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Cloud className="w-4 h-4 text-[#7C3AED]" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Supabase Cloud Connection</p>
                              <span className="text-[9px] bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] px-1.5 py-0.2 rounded font-mono">Admin Only</span>
                            </div>
                            <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>
                              {isSupabaseConfigured
                                ? 'API gateway reachable with publishable key'
                                : 'Missing configuration in .env.local'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleTestSupabase}
                          disabled={isTestingSupabase}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-medium transition cursor-pointer"
                        >
                          {isTestingSupabase ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <span>Test Connection</span>
                          )}
                        </button>
                      </div>

                      {supabaseStatus && (
                        <div className={`p-2 rounded text-[11px] flex items-start gap-2 ${supabaseStatus.success
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}>
                          {supabaseStatus.success ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium">{supabaseStatus.message}</p>
                            {supabaseStatus.error && (
                              <p className="text-[10px] opacity-80 mt-0.5">{supabaseStatus.error}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 5. Reset to Demo Data in Cloud */}
                    <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Restore Demo Dataset</p>
                        <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>Populate your cloud account with 24 sample applications</p>
                      </div>
                      <button
                        onClick={handleResetDemo}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${isDark
                          ? 'bg-[#22242A] hover:bg-[#2B2D34] border-[#2B2D34] text-white'
                          : 'bg-white hover:bg-zinc-100 border-[#E4E4E7] text-[#18181B] shadow-xs'
                          }`}
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`} />
                        <span>Restore</span>
                      </button>
                    </div>

                    {/* 6. Clear All Cloud Data */}
                    <div className={`flex items-center justify-between p-3 rounded-md border transition-colors ${isDark ? 'bg-[#141518] border-[#23252A]' : 'bg-[#F8F9FC] border-[#E4E4E7]'
                      }`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-[#18181B]'}`}>Clear Cloud Applications</p>
                        <p className={`text-[11px] ${isDark ? 'text-[#8E929B]' : 'text-zinc-500'}`}>Permanently remove all applications from your account</p>
                      </div>
                      <button
                        onClick={handleClearAll}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer border ${isDark
                          ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs'
                          }`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Clear All</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => setActiveNav('Dashboard')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer border ${isDark
                      ? 'bg-[#22242A] text-white hover:bg-[#2B2D34] border-[#2B2D34]'
                      : 'bg-white text-[#18181B] hover:bg-zinc-100 border-[#E4E4E7] shadow-xs'
                      }`}
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Add / Edit Application Modal with key for clean re-initialization */}
      <AddApplicationModal
        key={editingApplication ? editingApplication.id : (isModalOpen ? 'open-new' : 'closed')}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApplication(null);
        }}
        onSave={handleSaveModal}
        initialData={editingApplication}
      />
    </div>
  );
}
