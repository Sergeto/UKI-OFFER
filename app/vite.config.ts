import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativ, ca aplicația să meargă și pe GitHub Pages (/uki-offer/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
