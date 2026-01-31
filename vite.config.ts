import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  // Drop console logs in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    // Disable source maps for smaller production builds
    sourcemap: false,
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Use esbuild for minification (fast, built-in)
    minify: 'esbuild',
    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core - load first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation libraries
          'vendor-animation': ['framer-motion'],
          // Firebase - defer loading, largest chunk
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // UI libraries - can be deferred
          'vendor-ui': ['@headlessui/react', '@heroicons/react', 'emoji-picker-react'],
          // State management
          'vendor-state': ['zustand'],
        },
      },
    },
    // Increase chunk size warning limit (Firebase is large)
    chunkSizeWarningLimit: 1000,
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'zustand'],
  },
})
