import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API = 'http://localhost:5000';

// Everything the browser asks the dev server for under these paths is forwarded
// to Express, so the app works unchanged on localhost and on *.devtunnels.ms.
const proxy = {
  '/api': { target: API, changeOrigin: true },
  '/uploads': { target: API, changeOrigin: true },
  '/sitemap.xml': { target: API, changeOrigin: true },
  '/robots.txt': { target: API, changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // listen on all interfaces (required for dev tunnels)
    port: 5173,
    allowedHosts: true, // accept *.devtunnels.ms host headers
    proxy,
  },
  preview: { host: true, port: 5173, allowedHosts: true, proxy },
});
