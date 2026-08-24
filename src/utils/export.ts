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

function prepareExportCanvas(node: HTMLElement): HTMLElement {
  const exportedCanvas = node.cloneNode(true) as HTMLElement
  exportedCanvas.querySelectorAll('.resize-handle').forEach((handle) => handle.remove())
  exportedCanvas.querySelectorAll('.selected').forEach((element) => element.classList.remove('selected'))
  return exportedCanvas
}

function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'))
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    }),
  ).then(() => undefined)
}

export async function exportCanvasAsPdf(node: HTMLElement, projectName: string): Promise<void> {
  const exportedCanvas = prepareExportCanvas(node)
  Object.assign(exportedCanvas.style, {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '900px',
    height: '1200px',
    margin: '0',
    transform: 'none',
  })

  const exportHost = document.createElement('div')
  Object.assign(exportHost.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '900px',
    height: '1200px',
    overflow: 'hidden',
    pointerEvents: 'none',
  })
  exportHost.appendChild(exportedCanvas)
  document.body.appendChild(exportHost)

  try {
    await waitForImages(exportedCanvas)
    if (document.fonts?.ready) await document.fonts.ready

    const width = 900
    const height = 1200
    const dataUrl = await toPng(exportedCanvas, {
      cacheBust: true,
      pixelRatio: 2,
      width,
      height,
      canvasWidth: width * 2,
      canvasHeight: height * 2,
      style: {
        margin: '0',
        transform: 'none',
      },
    })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [width, height],
      hotfixes: ['px_scaling'],
      compress: true,
    })
    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
    pdf.save(`${projectName || 'zine-project'}.pdf`)
  } finally {
    exportHost.remove()
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
  const exportedCanvas = prepareExportCanvas(node)
  exportedCanvas.removeAttribute('style')

  const title = escapeHtml(projectName || 'Zine')
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
${collectPageStyles()}
      html {
        min-height: 100%;
        overflow: auto;
      }
      body {
        margin: 0;
        min-height: 100vh;
        box-sizing: border-box;
        padding: 24px;
        background: #ffe4f1;
        overflow: auto;
      }
      .export-page-wrap {
        width: max-content;
        min-width: 100%;
        box-sizing: border-box;
        padding: 0 0 24px;
        display: flex;
        justify-content: center;
      }
      .canvas-paper {
        flex: none;
        width: 900px;
        height: 1200px;
      }
      .zine-element { cursor: default; }
      .sound-element { cursor: pointer; }
      @media (max-width: 947px) {
        body { padding: 12px; }
        .export-page-wrap {
          justify-content: flex-start;
          padding-right: 12px;
          padding-bottom: 12px;
        }
      }
    </style>
  </head>
  <body>
    <main class="export-page-wrap">
      ${exportedCanvas.outerHTML}
    </main>
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
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
