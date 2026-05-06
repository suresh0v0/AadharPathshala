import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.post("/api/ai", async (req, res) => {
    const { tutorId, prompt, systemInstruction, isJson } = req.body;

    if (!tutorId || !prompt) {
      res.status(400).json({ error: "Missing tutorId or prompt" });
      return;
    }

    try {
      if (tutorId === 'gyanu') {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error("GEMINI_API_KEY is missing on the server.");
        }
        
        const client = new GoogleGenAI({ apiKey: geminiKey });
        
        const result = await client.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: isJson ? "application/json" : "text/plain",
            systemInstruction: systemInstruction,
          }
        });

        const text = result.text;
        if (!text) throw new Error("AI returned empty response");
        res.json({ text: isJson ? JSON.parse(text) : text });
        return;
      }

      // Groq-compatible providers (Momo, Aachar, Mango)
      const apiKey = 
        tutorId === 'momo' ? (process.env.CEREBRAS_API_KEY || process.env.VITE_CEREBRAS_API_KEY) :
        tutorId === 'aachar' ? (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY) :
        (process.env.SAMBANOVA_API_KEY || process.env.VITE_SAMBANOVA_API_KEY);

      if (!apiKey) {
        throw new Error(`${tutorId.toUpperCase()} API Key is missing on the server.`);
      }

      const baseURL = 
        tutorId === 'momo' ? "https://api.cerebras.ai/v1" :
        tutorId === 'mango' ? "https://api.sambanova.ai/v1" : 
        undefined;

      const model = 
        tutorId === 'momo' ? "llama-3.3-70b" :
        tutorId === 'aachar' ? "llama-3.3-70b-versatile" :
        "Meta-Llama-3.3-70B-Instruct";

      const client = new Groq({ apiKey, baseURL });
      const completion = await client.chat.completions.create({
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        model: model,
        response_format: isJson ? { type: "json_object" } : undefined
      });

      const content = completion.choices[0]?.message?.content || "";
      if (!content) throw new Error("AI returned empty response");
      res.json({ text: isJson ? JSON.parse(content) : content });

    } catch (error: any) {
      console.error(`Server AI Error [${tutorId}]:`, error);
      res.status(500).json({ error: error.message || "Internal AI Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
    console.error("CRITICAL: Server failed to start:", err);
    process.exit(1);
});
