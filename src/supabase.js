import { createClient } from '@supabase/supabase-js';

// Kalau di Backend pakai process.env, di Vite (Frontend) kita pakai import.meta.env
// Pastikan di file .env Frontend kamu, nama variabelnya diawali dengan VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);