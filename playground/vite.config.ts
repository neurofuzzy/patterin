import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    resolve: {
        alias: {
            'patterin': resolve(__dirname, '../src/index.ts'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
