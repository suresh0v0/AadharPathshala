import { createClient } from '@supabase/supabase-js';

// IMPORTANT: You MUST set these environment variables in the AI Studio Settings menu
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// These are placeholders. The app will NOT work correctly until you provide your own credentials.
// You can find your Project URL and Anon Key in Supabase Settings -> API.
const FALLBACK_URL = "https://tmtemlfrtulsflzlbnad.supabase.co"; 
const FALLBACK_KEY = "PLEASE_REPLACE_WITH_YOUR_ACTUAL_ANON_KEY"; 

if (!envUrl || !envKey) {
    console.error("SUPABASE ERROR: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing!");
    console.info("Please go to Settings -> Environment Variables and add them.");
}

let SUPABASE_URL = (envUrl || FALLBACK_URL).trim();
let SUPABASE_PUBLIC_KEY = (envKey || FALLBACK_KEY).trim();

if (SUPABASE_PUBLIC_KEY.includes("PLEASE_REPLACE")) {
    console.warn("WARNING: You are using a placeholder Supabase key! Features will not work.");
}

// Clean up URL to prevent common mistakes
SUPABASE_URL = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').replace(/\/$/, '');

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
