import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

function localDiskStoragePlugin() {
  const handler = (req: any, res: any) => {
    const backupDir = path.resolve(process.cwd(), 'dati_salvati_pc');
    if (!fs.existsSync(backupDir)) {
      try {
        fs.mkdirSync(backupDir, { recursive: true });
      } catch {
        // ignore
      }
    }
    const filePath = path.join(backupDir, 'tournesol_dati_disco.json');

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => { 
        body += chunk; 
        // 5MB limit
        if (body.length > 5 * 1024 * 1024) {
          req.connection.destroy();
        }
      });
      req.on('end', () => {
        try {
          fs.writeFileSync(filePath, body, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, path: filePath, savedAt: new Date().toISOString() }));
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    } else if (req.method === 'GET') {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(content);
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ exists: false }));
        }
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    } else {
      res.writeHead(405);
      res.end();
    }
  };

  return {
    name: 'local-disk-storage',
    configureServer(server: any) {
      server.middlewares.use('/api/disk-backup', handler);
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/disk-backup', handler);
    }
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      localDiskStoragePlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Tournesol - Edu-Hub & Vie Scolaire',
          short_name: 'Tournesol',
          description: 'Portail éducatif modulaire et sans distraction : devoirs, emploi du temps, packs de cours et bridge système.',
          theme_color: '#F59E0B',
          background_color: '#FFFDF0',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
