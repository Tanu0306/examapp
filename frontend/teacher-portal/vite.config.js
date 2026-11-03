import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite configuration for teacher-portal
export default defineConfig({
  plugins: [react()],
  // No server proxy needed for local UI testing
});
