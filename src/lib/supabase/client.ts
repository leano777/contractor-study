import { createBrowserClient } from '@supabase/ssr';

// ===========================================
// PHASE 2: INFRASTRUCTURE - Supabase Browser Client
// ===========================================
// Used in Client Components

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
