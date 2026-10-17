import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    pool: 'threads',
    clearMocks: true,
    restoreMocks: true,
    env: {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_ADMIN_EMAIL: '',
      VITE_CONTACT_ACCESS_KEY: '',
    },
  },
})
