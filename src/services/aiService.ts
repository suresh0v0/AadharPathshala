import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Gemini Setup
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ 
    apiKey: geminiApiKey 
});

/**
 * AI Providers configuration
 */
export const PROVIDERS = {
    MISO: {
        id: 'miso',
        name: 'Miso V1.1',
        provider: 'Groq',
        model: 'llama-3.3-70b-versatile',
        color: 'emerald'
    },
    SPARK: {
        id: 'spark',
        name: 'Spark V2.3',
        provider: 'SambaNova',
        model: 'Meta-Llama-3.3-70B-Instruct',
        baseURL: "https://api.sambanova.ai/v1",
        color: 'orange'
    },
    NOVA: {
        id: 'nova',
        name: 'Nova V3.4',
        provider: 'Cerebras',
        model: 'llama-3.3-70b',
        baseURL: "https://api.cerebras.ai/v1",
        color: 'purple'
    },
    CANNON: {
        id: 'cannon',
        name: 'Cannon V4.1',
        provider: 'Gemini',
        model: 'gemini-3-flash-preview',
        color: 'indigo'
    }
};

/**
 * Unified response generator
 */
export const getAIResponse = async (tutorId: string, prompt: string, systemInstruction: string) => {
    try {
        switch (tutorId) {
            case PROVIDERS.SPARK.id: {
                const apiKey = import.meta.env.VITE_SAMBANOVA_API_KEY || "";
                if (!apiKey) throw new Error("SambaNova API Key missing. Please set VITE_SAMBANOVA_API_KEY in your environment.");
                
                const response = await fetch(`${PROVIDERS.SPARK.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: PROVIDERS.SPARK.model,
                        messages: [
                            { role: "system", content: systemInstruction },
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    throw new Error(`SambaNova Error: ${errorMessage}`);
                }

                const data = await response.json();
                return data.choices[0]?.message?.content || "";
            }

            case PROVIDERS.NOVA.id: {
                const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY || "";
                if (!apiKey) throw new Error("Cerebras API Key missing. Please set VITE_CEREBRAS_API_KEY in your environment.");
                
                const response = await fetch(`${PROVIDERS.NOVA.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: PROVIDERS.NOVA.model,
                        messages: [
                            { role: "system", content: systemInstruction },
                            { role: "user", content: prompt }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || response.statusText;
                    throw new Error(`Cerebras Error: ${errorMessage}`);
                }

                const data = await response.json();
                return data.choices[0]?.message?.content || "";
            }

            case PROVIDERS.CANNON.id: {
                if (!geminiApiKey) throw new Error("Gemini API Key missing. Please set VITE_GEMINI_API_KEY in your environment.");
                const result = await genAI.models.generateContent({
                    model: PROVIDERS.CANNON.model,
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        systemInstruction
                    }
                }).catch(e => {
                    throw new Error(`Gemini (Cannon) Limit Exceeded or Error. Please try another AI!`);
                });
                return result.text;
            }

            case PROVIDERS.MISO.id: {
                const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
                if (!apiKey) throw new Error("Groq API Key missing. Please set VITE_GROQ_API_KEY in your environment.");
                const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
                const res = await client.chat.completions.create({
                    messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
                    model: PROVIDERS.MISO.model
                }).catch(e => {
                    throw new Error(`Groq (Miso) Limit Exceeded or Error. Please try another AI!`);
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
        const apiKey = import.meta.env.VITE_GROQ_API_KEY || "";
        if (!apiKey) throw new Error("Groq API Key missing. Please set VITE_GROQ_API_KEY in your environment.");
        const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });
        const res = await client.chat.completions.create({
            messages: [{ role: "system", content: systemInstruction }, { role: "user", content: prompt }],
            model: PROVIDERS.MISO.model,
            response_format: { type: "json_object" }
        }).catch(e => {
            throw new Error(`Groq (Miso) Limit Exceeded or Error. Please try another AI!`);
        });
        
        return JSON.parse(res.choices[0]?.message?.content || "{}");
    } catch (error: any) {
        console.error("Miso JSON Error:", error);
        throw new Error(error.message || "Failed to generate JSON with Miso");
    }
};
