// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

const REPO = 'deploy'

export default defineConfig({
  base: `/${REPO}/`,
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'),
      "@images": resolve(__dirname, 'images'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // testing: resolve(__dirname, 'testing.html'),
        addCourses: resolve(__dirname, 'manuallyAddCourses.html'),
        addStudentCourse: resolve(__dirname, 'manuallyAddStudentCourse.html'),
        deleteAuth: resolve(__dirname, 'manuallyDeleteAuth.html'),
      },
    },
  },
})
