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

/**
 * Fetches the user profile from the 'profiles' table.
 */
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Uploads a file to a Supabase storage bucket and returns the public URL.
 */
export const uploadFile = async (bucket, path, file) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
        
    return publicUrl;
};

/**
 * General purpose upload handler for different study materials and MCQs.
 */
export const handleUpload = async (category, payload) => {
    switch (category) {
        case 'Notes':
        case 'Model Question':
        case 'Chapter':
            if (!payload.file) throw new Error(`A valid file is required for ${category} upload`);
            const publicUrl = await uploadFile('notes', `${category}/${Date.now()}_${payload.file.name}`, payload.file);
            return await supabase.from('study_hub').insert([{
                title: payload.title,
                subject: payload.subject,
                category: category,
                file_url: publicUrl,
                description: payload.description
            }]).select();
            
        case 'Video':
            return await supabase.from('study_hub').insert([{
                title: payload.title,
                subject: payload.subject,
                category: 'Video',
                youtube_url: payload.youtube_url,
                description: payload.description
            }]).select();
            
        case 'Book':
            return await supabase.from('study_hub').insert([{
                title: payload.title,
                subject: payload.subject,
                category: 'Book',
                file_url: payload.google_drive_url,
                description: payload.description
            }]).select();

        case 'MCQs':
            return await supabase.from('mcq_bank').insert(payload.questions).select();
            
        default:
            throw new Error("Invalid category for upload");
    }
};

/**
 * Saves a news item to the 'news' table.
 */
export const saveNews = async (payload) => {
    let imageUrl = payload.image_url;
    
    // If there's an actual file, upload it
    if (payload.file) {
        imageUrl = await uploadFile('news_images', `${Date.now()}_${payload.file.name}`, payload.file);
    }
    
    const { data, error } = await supabase
        .from('news')
        .insert([{
            title: payload.title,
            content: payload.content,
            image_url: imageUrl,
            category: payload.category || 'General'
        }])
        .select();
    
    if (error) throw error;
    return data;
};

/**
 * Saves a notice item to the 'notices' table.
 */
export const saveNotice = async (payload) => {
    const { data, error } = await supabase
        .from('notices')
        .insert([{
            title: payload.title,
            content: payload.content,
            category: payload.category || 'General'
        }])
        .select();
    
    if (error) throw error;
    return data;
};

/**
 * Specialized handler for bulk uploading MCQs via JSON.
 */
export const uploadJSON = async (jsonString) => {
    try {
        let data = JSON.parse(jsonString);
        
        // Handle cases where the JSON might be wrapped in an object { "quiz": [...] } or { "questions": [...] }
        if (!Array.isArray(data)) {
            if (data.quiz && Array.isArray(data.quiz)) {
                data = data.quiz;
            } else if (data.questions && Array.isArray(data.questions)) {
                data = data.questions;
            } else if (data.mcqs && Array.isArray(data.mcqs)) {
                data = data.mcqs;
            } else {
                throw new Error("JSON must be an array of questions or contain a 'quiz'/'questions' array.");
            }
        }
        
        const { error } = await supabase.from('mcq_bank').insert(data);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("JSON Upload Error:", err);
        throw new Error(`Failed to upload MCQs: ${err.message}`);
    }
};

/**
 * Specialized handler for saving long text notes (e.g. from a text area).
 */
export const saveChapterNotes = async (title, subject, notesContent) => {
    try {
        const { error } = await supabase.from('study_hub').insert([{
            title,
            subject,
            category: 'Chapter',
            description: notesContent
        }]);
        if (error) throw error;
        return { success: true };
    } catch (err) {
        console.error("Save Notes Error:", err);
        throw new Error(`Failed to save chapter notes: ${err.message}`);
    }
};
