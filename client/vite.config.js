import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Make Razorpay key available at build time
    'import.meta.env.PUBLIC_RAZORPAY_KEY': JSON.stringify(process.env.PUBLIC_RAZORPAY_KEY || ''),
  },
});
