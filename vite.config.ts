import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages: project sites use /<repo>/; user/org sites use the special <owner>.github.io repo at /.
function resolveBase(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH
  const full = process.env.GITHUB_REPOSITORY
  if (!full?.includes('/')) return '/'
  const [owner, repo] = full.split('/')
  if (
    owner &&
    repo &&
    repo.toLowerCase() === `${owner.toLowerCase()}.github.io`
  ) {
    return '/'
  }
  return `/${repo}/`
}

const base = resolveBase()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
