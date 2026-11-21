import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sanitize helper to trim whitespace and remove wrapping quotes
const sanitize = (val) => {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/^["'`]|["'`]$/g, '').trim();
};

// Clean and normalize configuration values (strip whitespace, wrapping quotes, and trailing slashes)
export const supabaseUrl = sanitize(rawUrl).replace(/\/+$/, '');
export const supabaseAnonKey = sanitize(rawKey);

// Verify environment variables are present without logging raw credentials
export const isSupabaseConfigured = Boolean(
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0
);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  console.warn(
    '[ApplyTrack Supabase] Missing configuration: Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are defined in your .env.local file.'
  );
}

// Initialize Supabase client safely
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Safely tests whether the Supabase instance is reachable and the publishable key is valid.
 * Enforces admin authorization: verifies the active caller holds the 'admin' role in app_metadata.
 * Fully compatible with both newer Supabase opaque keys (sb_publishable_...) and legacy JWT keys (ey...).
 * Never prints or leaks credentials in responses, console logs, or error messages.
 *
 * @returns {Promise<{ success: boolean, message: string, error?: string }>}
 */
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: 'Supabase is not configured',
      error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local',
    };
  }

  // 1. Authorization Guard: Verify the caller holds the admin role in app_metadata
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return {
        success: false,
        message: 'Unauthorized',
        error: 'You must be signed in to run connection diagnostics.',
      };
    }

    const userRole = session.user.app_metadata?.role;
    if (userRole !== 'admin') {
      return {
        success: false,
        message: 'Forbidden',
        error: 'Access denied: Administrator role is required to run Supabase connection tests.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: 'Authorization check failed',
      error: err instanceof Error ? err.message : 'Unable to verify administrator privileges.',
    };
  }

  // 2. Construct request headers.
  // Supabase API Gateway expects the publishable key in the 'apikey' header.
  // Newer Supabase API keys ('sb_publishable_...' / 'sb_secret_...') are opaque keys, NOT JWTs,
  // and must never be sent as Bearer tokens in the 'Authorization' header.
  const headers = {
    apikey: supabaseAnonKey,
  };

  // Only legacy JWT keys (which start with 'ey') can optionally carry the Authorization Bearer header
  if (supabaseAnonKey.startsWith('ey')) {
    headers.Authorization = `Bearer ${supabaseAnonKey}`;
  }

  try {
    // 3. Ping the official Supabase Auth Settings endpoint (/auth/v1/settings)
    let response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(8000),
    });

    // Fallback check: Auth health endpoint (/auth/v1/health)
    if (response.status === 404) {
      response = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(8000),
      });
    }

    if (response.ok || response.status === 200) {
      return {
        success: true,
        message: 'Successfully connected to Supabase backend API.',
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: 'Authentication failed',
        error: 'Invalid API key or insufficient permissions for VITE_SUPABASE_PUBLISHABLE_KEY. Please verify your publishable key in the Supabase Dashboard.',
      };
    }

    return {
      success: false,
      message: `Received HTTP ${response.status}`,
      error: `Supabase returned status code ${response.status}`,
    };
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError');

    return {
      success: false,
      message: 'Network connection failed',
      error: isTimeout
        ? 'Connection timed out. Please verify your Supabase project URL and internet connection.'
        : err instanceof Error
        ? err.message
        : 'Unable to reach Supabase host',
    };
  }
}
