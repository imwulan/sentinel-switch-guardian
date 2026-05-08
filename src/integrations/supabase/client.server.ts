import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

type AdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

let _supabaseAdmin: AdminClient | null | undefined = undefined;

function getAdmin(): AdminClient | null {
  if (_supabaseAdmin === undefined) {
    _supabaseAdmin = createSupabaseAdminClient();
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as AdminClient, {
  get(_, prop, receiver) {
    const client = getAdmin();
    if (!client) return undefined;
    return Reflect.get(client, prop, receiver);
  },
});
