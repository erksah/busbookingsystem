import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load standard development variables
  const env = loadEnv(mode, process.cwd(), '');
  // Force load production variables as well
  const prodEnv = loadEnv('production', process.cwd(), '');

  // Prefer production API URL if it exists, otherwise fall back to development/localhost
  const finalApiUrl = prodEnv.VITE_API_URL || env.VITE_API_URL || "http://localhost:5000/api";

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(finalApiUrl),
    }
  }
})