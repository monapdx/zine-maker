import { toPng } from 'html-to-image'
import type { ZineProject } from '../types'

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

export async function exportCanvasAsPdf(node: HTMLElement, projectName: string): Promise<void> {
  const exportedCanvas = node.cloneNode(true) as HTMLElement
  exportedCanvas.querySelectorAll('.resize-handle').forEach((handle) => handle.remove())
  exportedCanvas.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'))
  Object.assign(exportedCanvas.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '900px',
    height: '1200px',
  })
  document.body.appendChild(exportedCanvas)

  try {
    const { jsPDF } = await import('jspdf')
    const width = exportedCanvas.offsetWidth
    const height = exportedCanvas.offsetHeight
    const dataUrl = await toPng(exportedCanvas, { cacheBust: true, pixelRatio: 2 })
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [width, height],
      hotfixes: ['px_scaling'],
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
    pdf.save(`${projectName || 'zine-project'}.pdf`)
  } finally {
    exportedCanvas.remove()
  }
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  )
}

function collectPageStyles(): string {
  return Array.from(document.styleSheets)
    .map((styleSheet) => {
      try {
        return Array.from(styleSheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n')
      } catch {
        return ''
      }
    })
    .join('\n')
}

export function exportCanvasAsHtml(node: HTMLElement, projectName: string): void {
  const exportedCanvas = node.cloneNode(true) as HTMLElement
  exportedCanvas.querySelectorAll('.resize-handle').forEach((handle) => handle.remove())
  exportedCanvas.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'))

  const title = escapeHtml(projectName || 'Zine')
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
${collectPageStyles()}
      html, body { margin: 0; min-height: 100%; }
      body {
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        min-width: 948px;
        padding: 24px;
        background: #ffe4f1;
      }
      .canvas-paper { flex: none; width: 900px; height: 1200px; }
      .zine-element { cursor: default; }
      .sound-element { cursor: pointer; }
    </style>
  </head>
  <body>
    ${exportedCanvas.outerHTML}
    <script>
      document.querySelectorAll('.sound-element').forEach(function (button) {
        button.addEventListener('click', function () {
          var audio = button.querySelector('audio');
          if (!audio) return;
          if (audio.paused) {
            audio.play();
          } else {
            audio.pause();
          }
        });
      });
    </script>
  </body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${projectName || 'zine-project'}.html`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
