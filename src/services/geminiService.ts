import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIResponse = async (prompt: string, systemInstruction?: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
};

export const generateJSONResponse = async (prompt: string, systemInstruction?: string) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json"
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Gemini JSON Error:", error);
        throw error;
    }
};

export const startAIChat = (systemInstruction: string) => {
    return ai.chats.create({
        model: "gemini-3-flash-preview",
        config: { systemInstruction }
    });
};
