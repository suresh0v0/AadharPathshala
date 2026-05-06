import { createClient } from "@supabase/supabase-js";

// Supabase Credentials provided by user
const SUPABASE_URL = "https://dnmaphjjjvtlmxvxukyg.supabase.co"; // Provided URL: https://dnmaphjjjvtlmxvxukyg.supabase.co/rest/v1/
const SUPABASE_PUBLIC_KEY = "sb_publishable_loXnAxqtQMwAEx7DIqUE7Q_qtz9NXmx";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export const fetchStudyMaterials = async () => {
    const { data, error } = await supabase
        .from('study_hub')
        .select('*');
    
    if (error) throw error;
    return data;
};

export const saveMindLog = async (title, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('mind_logs')
        .insert([
            { title, content, user_id: user.id }
        ])
        .select();
    
    if (error) throw error;
    return data;
};
