export const LOCAL_STORAGE_BACKUP_KEY = 'applytrack_applications_v1';

/**
 * Converts a Supabase PostgreSQL row (snake_case) to frontend application format (camelCase).
 * Preserves all fields required by Dashboard, Kanban, RecentApplications, and Analytics.
 */
export function toFrontendApplication(row) {
  if (!row) return null;
  return {
    id: row.id,
    legacyId: row.legacy_id || null,
    company: row.company || '',
    role: row.role || '',
    location: row.location || 'Remote',
    jobType: row.job_type || 'Full-time',
    salary: row.salary || '',
    appliedDate: row.applied_date || '',
    jobUrl: row.job_url || '',
    status: row.status || 'Applied',
    notes: row.notes || '',
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  };
}

/**
 * Converts a frontend application object (camelCase) into a Supabase PostgreSQL database row (snake_case).
 * Attaches the authenticated user's ID for RLS enforcement.
 */
export function toDatabaseRow(app, userId, includeLegacyId = true) {
  const row = {
    user_id: userId,
    company: (app.company || '').trim(),
    role: (app.role || '').trim(),
    location: app.location ? app.location.trim() : 'Remote',
    job_type: app.jobType || 'Full-time',
    salary: app.salary ? app.salary.trim() : '',
    applied_date: app.appliedDate || new Date().toISOString().split('T')[0],
    job_url: app.jobUrl ? app.jobUrl.trim() : '',
    status: app.status || 'Applied',
    notes: app.notes ? app.notes.trim() : '',
  };

  // If a legacy ID exists (e.g. from LocalStorage import like 'app-01' or timestamp), preserve it
  if (includeLegacyId) {
    const rawId = app.legacyId || app.id;
    if (rawId !== null && rawId !== undefined && String(rawId).trim() !== '') {
      row.legacy_id = String(rawId).trim();
    }
  }

  return row;
}

/**
 * Safely reads the number of applications in the LocalStorage backup without modifying it.
 */
export function getLocalStorageBackupCount() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Safely reads the raw applications from LocalStorage backup without altering storage.
 */
export function getLocalStorageBackupApplications() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
