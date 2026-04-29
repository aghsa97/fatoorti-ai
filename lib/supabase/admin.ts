import { createClient } from "@supabase/supabase-js";

// Server-side admin client that bypasses RLS
// Only use in API routes, never expose to the client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
