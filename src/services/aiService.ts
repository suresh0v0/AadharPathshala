/**
 * AI Providers configuration
 */
export const PROVIDERS = {
    GYANU: {
        id: 'gyanu',
        name: 'Gyanu',
        provider: 'Gemini',
        model: 'gemini-2.0-flash',
        color: 'indigo',
        theme: 'from-indigo-500 to-blue-600',
        textColor: 'text-indigo-600'
    },
    MOMO: {
        id: 'momo',
        name: 'Momo',
        provider: 'Cerebras',
        model: 'llama-3.3-70b',
        color: 'rose',
        theme: 'from-rose-500 to-pink-600',
        textColor: 'text-rose-600'
    },
    AACHAR: {
        id: 'aachar',
        name: 'Aachar',
        provider: 'Groq',
        model: 'llama-3.3-70b-versatile',
        color: 'emerald',
        theme: 'from-emerald-500 to-teal-600',
        textColor: 'text-emerald-600'
    },
    MANGO: {
        id: 'mango',
        name: 'Mango',
        provider: 'SambaNova',
        model: 'Meta-Llama-3.3-70B-Instruct',
        color: 'orange',
        theme: 'from-orange-500 to-amber-600',
        textColor: 'text-orange-600'
    }
};

/**
 * Unified response generator via Express Backend
 */
export const getAIResponse = async (tutorId: string, prompt: string, systemInstruction: string) => {
    try {
        const response = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tutorId, prompt, systemInstruction })
        });

        if (!response.ok) {
            let errorMsg = "Server error";
            try {
                const errData = await response.json();
                errorMsg = errData.error || errorMsg;
            } catch {
                const text = await response.text();
                errorMsg = text || errorMsg;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.text;
    } catch (error: any) {
        console.error(`AI Service Error (${tutorId}):`, error);
        throw new Error(error.message || "Failed to communicate with AI server");
    }
};

/**
 * Specifically for JSON responses (used in Quiz/Dictionary)
 */
export const getAIJSONResponse = async (prompt: string, systemInstruction: string) => {
    try {
        const response = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tutorId: 'gyanu', 
                prompt, 
                systemInstruction,
                isJson: true 
            })
        });

        if (!response.ok) {
            let errorMsg = "Server error";
            try {
                const errData = await response.json();
                errorMsg = errData.error || errorMsg;
            } catch {
                const text = await response.text();
                errorMsg = text || errorMsg;
            }
            throw new Error(errorMsg);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error("AI JSON Error:", error);
        throw error;
    }
};
