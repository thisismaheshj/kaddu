import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const BUCKET = 'intake-files';

/** Admin client: keeps the login session in localStorage under its own key. */
export const adminClient = () =>
  createClient(SUPABASE_URL!, SUPABASE_KEY!, { auth: { storageKey: 'kaddu-admin-auth', persistSession: true, autoRefreshToken: true } });
