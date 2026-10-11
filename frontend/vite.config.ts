import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // nécessaire dans un conteneur (Dev Container / Docker)
    // En dev, les appels /api sont redirigés vers le backend Spring Boot
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
