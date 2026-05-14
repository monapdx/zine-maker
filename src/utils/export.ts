import { toPng } from 'html-to-image'
import type { ZineProject } from '../types'

export function exportProjectJson(project: ZineProject): void {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${project.projectName || 'zine-project'}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseImportedProject(jsonText: string): ZineProject {
  const parsed = JSON.parse(jsonText) as ZineProject
  if (!parsed || !Array.isArray(parsed.elements) || typeof parsed.projectName !== 'string') {
    throw new Error('Invalid zine JSON format.')
  }
  if (parsed.customStickers && !Array.isArray(parsed.customStickers)) {
    throw new Error('Invalid custom sticker list.')
  }
  return parsed
}

export async function exportCanvasAsPng(node: HTMLElement, projectName: string): Promise<void> {
  const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 })
  const anchor = document.createElement('a')
  anchor.href = dataUrl
  anchor.download = `${projectName || 'zine-project'}.png`
  anchor.click()
}
