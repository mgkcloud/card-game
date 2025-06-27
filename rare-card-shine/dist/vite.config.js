import { defineConfig } from 'vite';
import { string } from 'rollup-plugin-string';
export default defineConfig({
    plugins: [string({ include: '**/*.wgsl' })],
    build: {
        target: 'es2022',
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'index.js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]'
            }
        }
    }
});
