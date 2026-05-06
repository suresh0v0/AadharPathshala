import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Gemini Setup
const getViteKey = (key: string) => {
    // @ts-ignore
    return import.meta.env[key] || "";
};

const genAI = new GoogleGenAI({ 
    apiKey: getViteKey('VITE_GEMINI_API_KEY') || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "" 
});

/**
 * AI Providers configuration
 */
export const PROVIDERS = {
    GYANU: {
        id: 'gyanu',
        name: 'Gyanu',
        provider: 'Gemini',
        model: 'gemini-3-flash-preview',
        color: 'indigo'
    },
    MOMO: {
        id: 'momo',
        name: 'Momo',
        provider: 'Cerebras',
        model: 'llama-3.3-70b',
        baseURL: "https://api.cerebras.ai/v1",
        color: 'purple'
    },
    AACHAR: {
        id: 'aachar',
        name: 'Aachar',
        provider: 'Groq',
        model: 'llama-3.3-70b-versatile',
        color: 'emerald'
    },
    MANGO: {
        id: 'mango',
        name: 'Mango',
        provider: 'SambaNova',
        model: 'Meta-Llama-3.3-70B-Instruct',
        baseURL: "https://api.sambanova.ai/v1",
        color: 'orange'
    }
};

/**
 * Unified response generator
 */
export const getAIResponse = async (tutorId: string, prompt: string, systemInstruction: string) => {
    try {
        switch (tutorId) {
            case PROVIDERS.GYANU.id: {
                const result = await genAI.models.generateContent({
                    model: PROVIDERS.GYANU.model,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        systemInstruction
                    }
                });
                return result.text;
            }

            case PROVIDERS.MOMO.id: {
                const apiKey = getViteKey('VITE_CEREBRAS_API_KEY');
                if (!apiKey) throw new Error("Cerebras API Key missing");
                const client = new Groq({ apiKey, baseURL: PROVIDERS.MOMO.baseURL, dangerouslyAllowBrowser: true });
                const res = await client.chat.completions.create({
                    messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
                    model: PROVIDERS.MOMO.model
                });
                return res.choices[0]?.message?.content || "";
            }

            case PROVIDERS.AACHAR.id: {
                const apiKey = getViteKey('VITE_GROQ_API_KEY');
                if (!apiKey) throw new Error("Groq API Key missing");
                const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
                const res = await client.chat.completions.create({
                    messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
                    model: PROVIDERS.AACHAR.model
                });
                return res.choices[0]?.message?.content || "";
            }

            case PROVIDERS.MANGO.id: {
                const apiKey = getViteKey('VITE_SAMBANOVA_API_KEY');
                if (!apiKey) throw new Error("SambaNova API Key missing");
                const client = new Groq({ apiKey, baseURL: PROVIDERS.MANGO.baseURL, dangerouslyAllowBrowser: true });
                const res = await client.chat.completions.create({
                    messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
                    model: PROVIDERS.MANGO.model
                });
                return res.choices[0]?.message?.content || "";
            }

            default:
                throw new Error("Unknown provider");
        }
    } catch (error: any) {
        console.error(`AI Error (${tutorId}):`, error);
        throw new Error(error.message || "Failed to get AI response");
    }
};

/**
 * Specifically for JSON responses (used in Quiz/Dictionary)
 */
export const getAIJSONResponse = async (prompt: string, systemInstruction: string) => {
    try {
        const result = await genAI.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction,
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(result.text || "{}");
    } catch (error) {
        console.error("Gemini JSON Error:", error);
        throw error;
    }
};
