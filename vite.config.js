import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        builder: resolve(__dirname, 'builder.html'),
        customizer: resolve(__dirname, 'customizer.html'),
        guide: resolve(__dirname, 'guide.html'),
        hilfe: resolve(__dirname, 'hilfe.html'),
        pro: resolve(__dirname, 'pro.html'),
      },
    },
    outDir: 'dist',
    // Chunk-Warnung anheben (orbify-core + framer-motion sind groß)
    chunkSizeWarningLimit: 800,
  },
})
