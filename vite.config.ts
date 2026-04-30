import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Create a mapping to ensure the app works even if the VITE_ prefix is missing on Vercel deployment.
  const cerebrasKey = process.env.VITE_CEREBRAS_API_KEY || env.VITE_CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY || env.CEREBRAS_API_KEY || "";
  const sambanovaKey = process.env.VITE_SAMBANOVA_API_KEY || env.VITE_SAMBANOVA_API_KEY || process.env.SAMBANOVA_API_KEY || env.SAMBANOVA_API_KEY || "";
  const groqKey = process.env.VITE_GROQ_API_KEY || env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || env.GROQ_API_KEY || "";

  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'maskable-icon.svg'],
        manifest: {
          name: 'Aadhar Pathshala',
          short_name: 'AadharDesk',
          description: 'Advanced Learning Management System for SEE 2083',
          theme_color: '#9333EA',
          background_color: '#F8FAFC',
          display: 'standalone',
          icons: [
            {
              src: 'Logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'Logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,jpg}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
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
