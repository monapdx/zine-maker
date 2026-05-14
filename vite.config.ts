import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo>/; Actions sets GITHUB_REPOSITORY=owner/repo.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base =
  process.env.VITE_BASE_PATH ?? (repo ? `/${repo}/` : '/')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
