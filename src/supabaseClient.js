import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon public key
let SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tmtemlfrtulsflzlbnad.supabase.co";
let SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_xOcbjfXsveR7fcdePdH4Nw_-FVgWMhs";

if (SUPABASE_URL) {
    SUPABASE_URL = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').replace(/\/$/, '');
}
if (SUPABASE_PUBLIC_KEY) {
    SUPABASE_PUBLIC_KEY = SUPABASE_PUBLIC_KEY.trim();
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
