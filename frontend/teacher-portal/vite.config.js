import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite configuration for teacher-portal
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      "/api":{
        target:'http://localhost:3000',
        changeOrigin:true,
        secure:false
      },
      "/socket.io": {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    }
  }


});
