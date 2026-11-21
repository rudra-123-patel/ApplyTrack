import { useState, useEffect, useMemo, useCallback } from 'react';
import { ApplicationContext } from './ApplicationContextCore';
import { demoApplications, calculateMonthlyActivity } from '../data/applications';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { 
  toFrontendApplication, 
  toDatabaseRow, 
  getLocalStorageBackupApplications,
  getLocalStorageBackupCount 
} from '../utils/applicationAdapters';

export function ApplicationProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [localStorageCount, setLocalStorageCount] = useState(() => getLocalStorageBackupCount());

  // Fetch applications for the authenticated user from Supabase PostgreSQL
  const fetchApplications = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .order('applied_date', { ascending: false });

      if (fetchErr) {
        console.error('[ApplyTrack Cloud] Failed to fetch applications:', fetchErr.message);
        setError(fetchErr.message);
        setApplications([]);
      } else {
        const mapped = (data || []).map(toFrontendApplication);
        setApplications(mapped);
      }
    } catch (err) {
      console.error('[ApplyTrack Cloud] Unexpected fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
      setApplications([]);
    } finally {
      setIsLoading(false);
      setLocalStorageCount(getLocalStorageBackupCount());
    }
  }, []);

  // Wait until AuthContext finishes loading before fetching applications
  useEffect(() => {
    let ignore = false;

    if (authLoading) return;

    if (user?.id) {
      const load = async () => {
        await Promise.resolve();
        if (!ignore) {
          fetchApplications(user.id);
        }
      };
      load();
    } else {
      const clear = async () => {
        await Promise.resolve();
        if (!ignore) {
          setApplications([]);
          setIsLoading(false);
        }
      };
      clear();
    }

    return () => {
      ignore = true;
    };
  }, [authLoading, user?.id, fetchApplications]);

  // Add a new application to Supabase PostgreSQL
  const addApplication = useCallback(
    async (applicationData) => {
      if (!user) {
        throw new Error('Authentication required: You must be signed in to add applications.');
      }

      const dbRow = toDatabaseRow(applicationData, user.id);

      const { data, error: insertErr } = await supabase
        .from('applications')
        .insert(dbRow)
        .select()
        .single();

      if (insertErr) {
        console.error('[ApplyTrack Cloud] Add application error:', insertErr.message);
        throw insertErr;
      }

      const newApp = toFrontendApplication(data);
      setApplications((prev) => [newApp, ...prev]);
      return newApp;
    },
    [user]
  );

  // Edit an existing application with optimistic UI update and error rollback
  const updateApplication = useCallback(
    async (id, updatedData) => {
      if (!user) return;

      const previousApp = applications.find((a) => a.id === id);
      if (!previousApp) return;

      // 1. Optimistic UI update so Kanban drag-and-drop remains 100% responsive
      setApplications((prev) =>
        prev.map((app) => {
          if (app.id === id) {
            return {
              ...app,
              ...updatedData,
              company: updatedData.company ? updatedData.company.trim() : app.company,
              role: updatedData.role ? updatedData.role.trim() : app.role,
              location: updatedData.location !== undefined ? updatedData.location.trim() : app.location,
              jobType: updatedData.jobType || app.jobType,
              salary: updatedData.salary !== undefined ? updatedData.salary.trim() : app.salary,
              appliedDate: updatedData.appliedDate || app.appliedDate,
              jobUrl: updatedData.jobUrl !== undefined ? updatedData.jobUrl.trim() : app.jobUrl,
              status: updatedData.status || app.status,
              notes: updatedData.notes !== undefined ? updatedData.notes.trim() : app.notes,
            };
          }
          return app;
        })
      );

      // 2. Persist update to Supabase
      const dbUpdates = {};
      if (updatedData.company !== undefined) dbUpdates.company = updatedData.company.trim();
      if (updatedData.role !== undefined) dbUpdates.role = updatedData.role.trim();
      if (updatedData.location !== undefined) dbUpdates.location = updatedData.location.trim();
      if (updatedData.jobType !== undefined) dbUpdates.job_type = updatedData.jobType;
      if (updatedData.salary !== undefined) dbUpdates.salary = updatedData.salary.trim();
      if (updatedData.appliedDate !== undefined) dbUpdates.applied_date = updatedData.appliedDate;
      if (updatedData.jobUrl !== undefined) dbUpdates.job_url = updatedData.jobUrl.trim();
      if (updatedData.status !== undefined) dbUpdates.status = updatedData.status;
      if (updatedData.notes !== undefined) dbUpdates.notes = updatedData.notes.trim();
      dbUpdates.updated_at = new Date().toISOString();

      try {
        const { error: updateErr } = await supabase
          .from('applications')
          .update(dbUpdates)
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateErr) {
          console.error('[ApplyTrack Cloud] Update application error:', updateErr.message);
          // Rollback optimistic update
          setApplications((prev) => prev.map((a) => (a.id === id ? previousApp : a)));
          throw updateErr;
        }
      } catch (err) {
        // Rollback optimistic update on network failure
        setApplications((prev) => prev.map((a) => (a.id === id ? previousApp : a)));
        throw err;
      }
    },
    [user, applications]
  );

  // Delete an application with optimistic UI update and error rollback
  const deleteApplication = useCallback(
    async (id) => {
      if (!user) return;

      const target = applications.find((a) => a.id === id);
      if (!target) return;

      // 1. Optimistic remove
      setApplications((prev) => prev.filter((app) => app.id !== id));

      try {
        const { error: deleteErr } = await supabase
          .from('applications')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (deleteErr) {
          console.error('[ApplyTrack Cloud] Delete application error:', deleteErr.message);
          // Rollback optimistic delete
          setApplications((prev) => [target, ...prev]);
          throw deleteErr;
        }
      } catch (err) {
        setApplications((prev) => [target, ...prev]);
        throw err;
      }
    },
    [user, applications]
  );

  // Load starter demo dataset into the user's Supabase database
  const resetToDemoData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const dbRows = demoApplications.map((demo) => toDatabaseRow(demo, user.id, true));

      const { data, error: insertErr } = await supabase
        .from('applications')
        .upsert(dbRows, { onConflict: 'user_id,legacy_id', ignoreDuplicates: true })
        .select();

      if (insertErr) {
        console.error('[ApplyTrack Cloud] Reset demo data error:', insertErr.message);
        throw insertErr;
      }

      const mapped = (data || []).map(toFrontendApplication);
      setApplications(mapped);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Clear all applications for the authenticated user from Supabase (preserves LocalStorage backup)
  const clearAllApplications = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error: deleteErr } = await supabase
        .from('applications')
        .delete()
        .eq('user_id', user.id);

      if (deleteErr) {
        console.error('[ApplyTrack Cloud] Clear all error:', deleteErr.message);
        throw deleteErr;
      }

      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Non-destructively import existing LocalStorage applications into Supabase
  const importFromLocalStorage = useCallback(async () => {
    if (!user) {
      return { success: false, message: 'You must be signed in to import applications.' };
    }

    const localApps = getLocalStorageBackupApplications();
    if (!localApps || localApps.length === 0) {
      return { success: false, message: 'No applications found in LocalStorage to import.' };
    }

    // 1. Fetch existing legacy_ids for this user from Supabase
    const { data: existingRows, error: fetchErr } = await supabase
      .from('applications')
      .select('id, legacy_id')
      .eq('user_id', user.id);

    if (fetchErr) {
      return {
        success: false,
        message: `Failed to check existing cloud records: ${fetchErr.message}`,
      };
    }

    const existingLegacyIds = new Set(
      (existingRows || []).map((r) => r.legacy_id).filter(Boolean)
    );

    // 2. Filter using legacy_id only, tracking in-batch duplicates
    const toInsert = [];
    const seenBatchIds = new Set();

    for (const app of localApps) {
      const rawId = app.legacyId || app.id;
      const legacyIdStr = rawId !== null && rawId !== undefined && String(rawId).trim() !== ''
        ? String(rawId).trim()
        : null;

      if (legacyIdStr) {
        if (existingLegacyIds.has(legacyIdStr) || seenBatchIds.has(legacyIdStr)) {
          continue;
        }
        seenBatchIds.add(legacyIdStr);
      }

      const row = toDatabaseRow(app, user.id, true);
      // Supabase generates a fresh UUID for the primary key
      delete row.id;
      if (legacyIdStr) {
        row.legacy_id = legacyIdStr;
      }
      toInsert.push(row);
    }

    if (toInsert.length === 0) {
      return {
        success: true,
        importedCount: 0,
        totalLocal: localApps.length,
        duplicateCount: localApps.length,
        message: `All ${localApps.length} applications already exist in your cloud account. No duplicates imported.`,
      };
    }

    // 3. Upsert into Supabase with duplicate protection on (user_id, legacy_id)
    const { data: insertedData, error: upsertErr } = await supabase
      .from('applications')
      .upsert(toInsert, { onConflict: 'user_id,legacy_id', ignoreDuplicates: true })
      .select();

    if (upsertErr) {
      console.error('[ApplyTrack Cloud] Import error:', upsertErr.message);
      return {
        success: false,
        message: `Database error during import: ${upsertErr.message}`,
      };
    }

    // 4. Update in-memory state with freshly imported applications
    const newFrontendApps = (insertedData || []).map(toFrontendApplication);
    if (newFrontendApps.length > 0) {
      setApplications((prev) => [...newFrontendApps, ...prev]);
    }

    const actuallyImported = newFrontendApps.length;
    const totalDuplicatesSkipped = localApps.length - actuallyImported;

    return {
      success: true,
      importedCount: actuallyImported,
      totalLocal: localApps.length,
      duplicateCount: totalDuplicatesSkipped,
      message: `Successfully imported ${actuallyImported} application${
        actuallyImported === 1 ? '' : 's'
      } to Supabase (${totalDuplicatesSkipped} duplicate${totalDuplicatesSkipped === 1 ? '' : 's'} skipped).`,
    };
  }, [user]);

  // Automatically calculate dashboard statistics from actual application data
  const stats = useMemo(() => {
    const total = applications.length;
    let interviews = 0;
    let offers = 0;
    let rejections = 0;
    let applied = 0;
    let screening = 0;

    applications.forEach((app) => {
      switch (app.status) {
        case 'Interview':
          interviews += 1;
          break;
        case 'Offer':
          offers += 1;
          break;
        case 'Rejected':
          rejections += 1;
          break;
        case 'Screening':
          screening += 1;
          break;
        case 'Applied':
        default:
          applied += 1;
          break;
      }
    });

    const interviewPercent = total > 0 ? Math.round((interviews / total) * 100) : 0;
    const offerPercent = total > 0 ? Math.round((offers / total) * 100) : 0;
    const rejectionPercent = total > 0 ? Math.round((rejections / total) * 100) : 0;

    return {
      total,
      interviews,
      offers,
      rejections,
      applied,
      screening,
      interviewPercent,
      offerPercent,
      rejectionPercent,
    };
  }, [applications]);

  // Automatically calculate monthly activity directly from actual applications
  const monthlyActivity = useMemo(() => {
    return calculateMonthlyActivity(applications);
  }, [applications]);

  // Filtered applications based on search (company & role) and status
  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((app) => {
      if (statusFilter !== 'All' && app.status !== statusFilter) {
        return false;
      }

      if (query !== '') {
        const matchesCompany = app.company.toLowerCase().includes(query);
        const matchesRole = app.role.toLowerCase().includes(query);
        return matchesCompany || matchesRole;
      }

      return true;
    });
  }, [applications, searchTerm, statusFilter]);

  const refreshApplications = useCallback(() => {
    if (user?.id) {
      return fetchApplications(user.id);
    }
    return Promise.resolve();
  }, [user, fetchApplications]);

  const value = useMemo(
    () => ({
      applications,
      filteredApplications,
      stats,
      monthlyActivity,
      isLoading,
      error,
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      addApplication,
      updateApplication,
      deleteApplication,
      resetToDemoData,
      clearAllApplications,
      importFromLocalStorage,
      localStorageCount,
      refreshApplications,
    }),
    [
      applications,
      filteredApplications,
      stats,
      monthlyActivity,
      isLoading,
      error,
      searchTerm,
      statusFilter,
      addApplication,
      updateApplication,
      deleteApplication,
      resetToDemoData,
      clearAllApplications,
      importFromLocalStorage,
      localStorageCount,
      refreshApplications,
    ]
  );

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}
