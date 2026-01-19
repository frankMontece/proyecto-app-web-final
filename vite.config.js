import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// NOTA: vueDevTools está comentado para producción
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // DESHABILITADO para producción
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // --- CONFIGURACIÓN PARA PRODUCCIÓN EN VERCEL ---
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Mejor organización de archivos en producción
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // Optimización para Vercel
  server: {
    host: true // Importante para entornos de despliegue
  }
})
