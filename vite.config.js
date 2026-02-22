import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    // Custom domain (news.aryanaryn.me) → site always lives at root /
    base: '/',
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
