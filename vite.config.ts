import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || "";
  const groqKey = process.env.GROQ_API_KEY || env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || env.VITE_GROQ_API_KEY || "";
  const cerebrasKey = process.env.CEREBRAS_API_KEY || env.CEREBRAS_API_KEY || process.env.VITE_CEREBRAS_API_KEY || env.VITE_CEREBRAS_API_KEY || "";
  const sambanovaKey = process.env.SAMBANOVA_API_KEY || env.SAMBANOVA_API_KEY || process.env.VITE_SAMBANOVA_API_KEY || env.VITE_SAMBANOVA_API_KEY || "";
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
      'import.meta.env.VITE_CEREBRAS_API_KEY': JSON.stringify(cerebrasKey),
      'import.meta.env.VITE_SAMBANOVA_API_KEY': JSON.stringify(sambanovaKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
