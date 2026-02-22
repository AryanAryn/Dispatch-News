import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On GitHub Pages the site lives at  /<repo-name>/
// Locally (and on custom domains) it lives at /
const base = process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''}/`
    : '/';

export default defineConfig({
    base,
    plugins: [react()],
    server: {
        proxy: {
            '/newsapi': {
                target: 'https://newsapi.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/newsapi/, ''),
            },
            '/sportsdb': {
                target: 'https://www.thesportsdb.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/sportsdb/, ''),
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    nlp: ['compromise'],
                },
            },
        },
    },
});
