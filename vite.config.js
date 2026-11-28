import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { getLiveDownloadTotal } from './scripts/lib/gemStats.mjs';

function injectLiveStats() {
  return {
    name: 'inject-live-stats',
    async transformIndexHtml(html) {
      const { total } = await getLiveDownloadTotal();
      return html.replaceAll('{{GEM_DOWNLOADS}}', `${total.toLocaleString()}+`);
    },
  };
}

export default defineConfig({
  plugins: [react(), injectLiveStats()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Libraries change far less often than the site, so they get their own
        // long-cached chunk instead of being re-downloaded with every deploy.
        manualChunks(id) {
          if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react';
          if (/node_modules[\/](framer-motion|motion-dom|motion-utils)[\/]/.test(id)) return 'motion';
        },
      },
    },
  },
});
