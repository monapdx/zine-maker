import type { ZineProject } from '../types'

const STORAGE_KEY = 'zine-maker-project-v1'

export function saveProject(project: ZineProject): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
}

export function loadProject(): ZineProject | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as ZineProject
  } catch (error) {
    console.error('Failed to parse saved zine project', error)
    return null
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY)
}
