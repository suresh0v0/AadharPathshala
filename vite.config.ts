import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Create a mapping to ensure the app works even if the VITE_ prefix is missing on Vercel deployment.
  const cerebrasKey = process.env.VITE_CEREBRAS_API_KEY || env.VITE_CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY || env.CEREBRAS_API_KEY || "";
  const sambanovaKey = process.env.VITE_SAMBANOVA_API_KEY || env.VITE_SAMBANOVA_API_KEY || process.env.SAMBANOVA_API_KEY || env.SAMBANOVA_API_KEY || "";
  const groqKey = process.env.VITE_GROQ_API_KEY || env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || env.GROQ_API_KEY || "";

  return {
    base: './',
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_CEREBRAS_API_KEY': JSON.stringify(cerebrasKey),
      'import.meta.env.VITE_SAMBANOVA_API_KEY': JSON.stringify(sambanovaKey),
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(groqKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
