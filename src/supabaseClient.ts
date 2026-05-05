import { createClient } from "@supabase/supabase-js";

// --- REPLACE THESE WITH YOUR OWN SUPABASE CREDENTIALS ---
// You can find these in your Supabase Project Settings > API
const SUPABASE_URL = "https://dnmaphjjjvtlmxvxukyg.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_loXnAxqtQMwAEx7DIqUE7Q_qtz9NXmx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
