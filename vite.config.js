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
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('react-router-dom')) return 'vendor-router'
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          if (id.includes('react-icons')) return 'vendor-icons'
          if (id.includes('jszip') || id.includes('file-saver')) return 'vendor-export'
          if (id.includes('prismjs')) return 'vendor-prism'
        },
      },
    },
    outDir: 'dist',
    // Chunk-Warnung anheben (orbify-core + framer-motion sind groß)
    chunkSizeWarningLimit: 800,
  },
})
