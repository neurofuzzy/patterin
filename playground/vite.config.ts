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
    optimizeDeps: {
        include: [
            'monaco-editor/esm/vs/language/json/json.worker',
            'monaco-editor/esm/vs/language/css/css.worker',
            'monaco-editor/esm/vs/language/html/html.worker',
            'monaco-editor/esm/vs/language/typescript/ts.worker',
            'monaco-editor/esm/vs/editor/editor.worker'
        ],
    },
});
