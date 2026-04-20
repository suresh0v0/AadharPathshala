import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon public key
const SUPABASE_URL = "https://tmtemlfrtulsflzlbnad.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_xOcbjfXsveR7fcdePdH4Nw_-FVgWMhs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
