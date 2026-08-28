import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

const isVercel = Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.NOW_BUILDER);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: isVercel
    ? vercel({
        webAnalytics: { enabled: true }
      })
    : node({
        mode: 'standalone'
      }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  vite: {
    ssr: {
      noExternal: ['lucide-react']
    }
  }
});
