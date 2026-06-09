import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dnd_v2: resolve(__dirname, 'dnd_v2.html'),
        shipment_list: resolve(__dirname, 'shipment_list.html'),
        table_extension: resolve(__dirname, 'table_extension.html'),
      },
    },
  },
})
