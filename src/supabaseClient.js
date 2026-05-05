import { createClient } from "@supabase/supabase-js";

// Supabase Credentials provided by user
const SUPABASE_URL = "https://dnmaphjjjvtlmxvxukyg.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_loXnAxqtQMwAEx7DIqUE7Q_qtz9NXmx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
