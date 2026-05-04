import { createClient } from "@supabase/supabase-js";

// ============================================================================
// KONFIGURASI: SUPABASE
// ============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ============================================================================
// VALIDASI: ENVIRONMENT VARIABLE
// ============================================================================

// Memastikan konfigurasi Supabase tersedia sebelum client dibuat.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase configuration is missing. Please check your environment variables."
  );
}

// ============================================================================
// CLIENT: SUPABASE
// ============================================================================

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);