import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    viewportWidth: 1600,
    viewportHeight: 1000,
    video: false,
  },
});
