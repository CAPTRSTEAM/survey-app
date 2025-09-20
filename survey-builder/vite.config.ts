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
                manualChunks: {
                    // Separate Material-UI into its own chunk
                    'mui': ['@mui/material', '@mui/system', '@mui/icons-material'],
                    // Separate React and related libraries
                    'react-vendor': ['react', 'react-dom'],
                    // Separate emotion (MUI's styling engine)
                    'emotion': ['@emotion/react', '@emotion/styled', '@emotion/cache'],
                    // App-specific components
                    'app-components': [
                        './src/components/SurveyBuilder.tsx',
                        './src/components/SurveyWizard.tsx',
                        './src/components/wizard/BasicInfoStep.tsx',
                        './src/components/wizard/QuestionsStep.tsx',
                        './src/components/wizard/ReviewStep.tsx',
                        './src/components/wizard/ThankYouStep.tsx',
                        './src/components/wizard/WelcomeStep.tsx'
                    ]
                }
            }
        }
    },
    server: {
        port: 5173,
        open: '/index.html'
    }
}); 