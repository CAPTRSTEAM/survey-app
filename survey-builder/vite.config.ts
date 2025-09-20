import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/survey-app/",
    root: ".",
    build: {
        outDir: "dist-designer",
        chunkSizeWarningLimit: 600, // Increase limit slightly for main chunk
        rollupOptions: {
            input: {
                'designer': 'index.html'
            },
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        port: 5173,
        open: '/index.html'
    }
}); 