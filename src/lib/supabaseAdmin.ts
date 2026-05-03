import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy-initialized so the build doesn't crash if env vars aren't available at compile time
let _client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}
