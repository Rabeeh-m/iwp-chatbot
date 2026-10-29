import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: './src/widget.jsx',
      name: 'IWPChatbot',
      fileName: 'iwp-chatbot',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true,
      }
    },
    cssCodeSplit: false
  }
})
