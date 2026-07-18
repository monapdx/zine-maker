import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { Canvas } from './components/Canvas'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Toolbar } from './components/Toolbar'
import type { CustomSticker, StickerKind, ZineElement, ZineElementType, ZineProject } from './types'
import { exportCanvasAsHtml, exportCanvasAsPng, exportProjectJson, parseImportedProject } from './utils/export'
import { clearProject, loadProject, saveProject } from './utils/storage'
import './styles.css'

const defaultProjectName = 'My Zine'
const canvasWidth = 900
const canvasHeight = 1200

function createElement(type: ZineElementType, overrides: Partial<ZineElement> = {}): ZineElement {
  const now = Date.now()
  return {
    id: `${type}-${now}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    x: 120,
    y: 120,
    width: type === 'text' ? 240 : 200,
    height: type === 'text' ? 100 : 180,
    rotation: -2 + Math.random() * 4,
    zIndex: now,
    content: type === 'text' ? 'type your loud zine thoughts...' : '',
    styles: {},
    ...overrides,
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function App() {
  const [projectName, setProjectName] = useState(defaultProjectName)
  const [elements, setElements] = useState<ZineElement[]>([])
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [statusMessage, setStatusMessage] = useState('Ready to make chaos.')
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const existing = loadProject()
    if (existing) {
      setProjectName(existing.projectName)
      setElements(existing.elements)
      setCustomStickers(existing.customStickers ?? [])
      setStatusMessage('Loaded saved zine from localStorage.')
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingTarget =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (isTypingTarget || !selectedElementId) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        setElements((current) => current.filter((item) => item.id !== selectedElementId))
        setSelectedElementId(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedElementId])

  const selected = useMemo(
    () => elements.find((element) => element.id === selectedElementId) ?? null,
    [elements, selectedElementId],
  )

  function appendElement(element: ZineElement) {
    setElements((current) => [...current, element])
    setSelectedElementId(element.id)
  }

  async function handleAddImage(file: File) {
    const dataUrl = await fileToDataUrl(file)
    appendElement(
      createElement('image', {
        content: file.name,
        mediaUrl: dataUrl,
        width: 260,
        height: 220,
      }),
    )
  }

  async function handleAddSoundFile(file: File) {
    const dataUrl = await fileToDataUrl(file)
    appendElement(
      createElement('sound', {
        content: file.name,
        mediaUrl: dataUrl,
        width: 180,
        height: 96,
      }),
    )
  }

  async function handleUploadCustomSticker(file: File) {
    const dataUrl = await fileToDataUrl(file)
    const customSticker: CustomSticker = {
      id: `custom-sticker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      dataUrl,
    }
    setCustomStickers((current) => [customSticker, ...current])
    setStatusMessage(`Added custom sticker: ${file.name}`)
  }

  function handleAddCustomStickerToCanvas(stickerId: string) {
    const sticker = customStickers.find((item) => item.id === stickerId)
    if (!sticker) {
      setStatusMessage('Custom sticker not found.')
      return
    }
    appendElement(
      createElement('sticker', {
        content: sticker.name,
        mediaUrl: sticker.dataUrl,
        width: 150,
        height: 150,
      }),
    )
  }

  function updateElement(id: string, patch: Partial<ZineElement>) {
    setElements((current) =>
      current.map((element) => (element.id === id ? { ...element, ...patch, styles: patch.styles ?? element.styles } : element)),
    )
  }

  function duplicateElement(id: string) {
    setElements((current) => {
      const source = current.find((element) => element.id === id)
      if (!source) return current
      const duplicate = {
        ...source,
        id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        x: source.x + 24,
        y: source.y + 24,
        zIndex: Date.now(),
      }
      setSelectedElementId(duplicate.id)
      return [...current, duplicate]
    })
  }

  function bringElementForward(id: string) {
    setElements((current) => {
      const sorted = [...current].sort((a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id))
      const index = sorted.findIndex((element) => element.id === id)
      if (index < 0 || index >= sorted.length - 1) return current

      const active = sorted[index]
      const neighbor = sorted[index + 1]
      return current.map((element) => {
        if (element.id === active.id) {
          return {
            ...element,
            zIndex: neighbor.zIndex === active.zIndex ? neighbor.zIndex + 1 : neighbor.zIndex,
          }
        }
        if (element.id === neighbor.id) {
          return { ...element, zIndex: active.zIndex }
        }
        return element
      })
    })
  }

  function sendElementBackward(id: string) {
    setElements((current) => {
      const sorted = [...current].sort((a, b) => a.zIndex - b.zIndex || a.id.localeCompare(b.id))
      const index = sorted.findIndex((element) => element.id === id)
      if (index <= 0) return current

      const active = sorted[index]
      const neighbor = sorted[index - 1]
      return current.map((element) => {
        if (element.id === active.id) {
          return { ...element, zIndex: neighbor.zIndex }
        }
        if (element.id === neighbor.id) {
          return {
            ...element,
            zIndex: neighbor.zIndex === active.zIndex ? active.zIndex + 1 : active.zIndex,
          }
        }
        return element
      })
    })
  }

  function moveElementStart(id: string, event: ReactPointerEvent<HTMLDivElement>) {
    const source = elements.find((element) => element.id === id)
    if (!source) return
    setSelectedElementId(id)

    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    const elementNode = event.currentTarget
    elementNode.setPointerCapture(pointerId)

    const onPointerMove = (pointerEvent: PointerEvent) => {
      const dx = pointerEvent.clientX - startX
      const dy = pointerEvent.clientY - startY
      setElements((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                x: Math.max(0, Math.min(canvasWidth - item.width, source.x + dx)),
                y: Math.max(0, Math.min(canvasHeight - item.height, source.y + dy)),
              }
            : item,
        ),
      )
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      elementNode.releasePointerCapture(pointerId)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function resizeElementStart(id: string, event: ReactPointerEvent<HTMLButtonElement>) {
    const source = elements.find((element) => element.id === id)
    if (!source) return

    event.preventDefault()
    setSelectedElementId(id)

    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    const handleNode = event.currentTarget
    const rotation = (source.rotation * Math.PI) / 180
    const minimumSizes: Record<ZineElementType, { width: number; height: number }> = {
      text: { width: 100, height: 50 },
      image: { width: 60, height: 60 },
      sticker: { width: 40, height: 40 },
      sound: { width: 100, height: 50 },
      embed: { width: 120, height: 60 },
    }
    const { width: minWidth, height: minHeight } = minimumSizes[source.type]
    handleNode.setPointerCapture(pointerId)

    const onPointerMove = (pointerEvent: PointerEvent) => {
      const dx = pointerEvent.clientX - startX
      const dy = pointerEvent.clientY - startY
      const localDx = dx * Math.cos(rotation) + dy * Math.sin(rotation)
      const localDy = -dx * Math.sin(rotation) + dy * Math.cos(rotation)

      setElements((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                width: Math.max(minWidth, Math.min(canvasWidth - source.x, source.width + localDx)),
                height: Math.max(minHeight, Math.min(canvasHeight - source.y, source.height + localDy)),
              }
            : item,
        ),
      )
    }

    const stopResizing = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', stopResizing)
      window.removeEventListener('pointercancel', stopResizing)
      if (handleNode.hasPointerCapture(pointerId)) {
        handleNode.releasePointerCapture(pointerId)
      }
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', stopResizing)
    window.addEventListener('pointercancel', stopResizing)
  }

  function saveCurrentProject() {
    const project: ZineProject = { projectName, elements, customStickers }
    saveProject(project)
    setStatusMessage('Saved to localStorage.')
  }

  function loadCurrentProject() {
    const project = loadProject()
    if (!project) {
      setStatusMessage('No saved zine found.')
      return
    }
    setProjectName(project.projectName)
    setElements(project.elements)
    setCustomStickers(project.customStickers ?? [])
    setSelectedElementId(null)
    setStatusMessage('Loaded saved zine.')
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="project-name-input"
          aria-label="Project name"
        />
        <div className="top-actions">
          <button type="button" onClick={saveCurrentProject}>
            Save
          </button>
          <button type="button" onClick={loadCurrentProject}>
            Load
          </button>
          <button
            type="button"
            onClick={() => {
              clearProject()
              setElements([])
              setCustomStickers([])
              setSelectedElementId(null)
              setProjectName(defaultProjectName)
              setStatusMessage('New zine. Blank canvas.')
            }}
          >
            New Zine
          </button>
          <button type="button" onClick={() => exportProjectJson({ projectName, elements, customStickers })}>
            Export JSON
          </button>
          <button type="button" onClick={() => setShowImport((value) => !value)}>
            Import JSON
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!canvasRef.current) return
              await exportCanvasAsPng(canvasRef.current, projectName)
              setStatusMessage('Exported PNG.')
            }}
          >
            Export PNG
          </button>
          <button
            type="button"
            onClick={() => {
              if (!canvasRef.current) return
              exportCanvasAsHtml(canvasRef.current, projectName)
              setStatusMessage('Exported HTML.')
            }}
          >
            Export HTML
          </button>
        </div>
      </header>

      {showImport && (
        <section className="import-panel">
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste exported zine JSON here..."
          />
          <button
            type="button"
            onClick={() => {
              try {
                const imported = parseImportedProject(importText)
                setProjectName(imported.projectName)
                setElements(imported.elements)
                setCustomStickers(imported.customStickers ?? [])
                setShowImport(false)
                setImportText('')
                setStatusMessage('Imported zine JSON.')
              } catch {
                setStatusMessage('Import failed: invalid JSON.')
              }
            }}
          >
            Apply Import
          </button>
        </section>
      )}

      <div className="editor-layout">
        <Toolbar
          onAddText={() =>
            appendElement(
              createElement('text', {
                width: 280,
                height: 120,
                styles: { fontSize: 26, backgroundColor: '#ffff7a' },
              }),
            )
          }
          onAddImage={(file) => {
            void handleAddImage(file)
          }}
          customStickers={customStickers}
          onUploadCustomSticker={(file) => {
            void handleUploadCustomSticker(file)
          }}
          onAddCustomStickerToCanvas={handleAddCustomStickerToCanvas}
          onAddSticker={(kind: StickerKind) =>
            appendElement(
              createElement('sticker', {
                stickerKind: kind,
                content: kind === 'label' ? 'LABEL' : kind,
                width: kind === 'tape' ? 220 : 130,
                height: kind === 'tape' ? 56 : 130,
              }),
            )
          }
          onAddEmbed={(url) =>
            appendElement(
              createElement('embed', {
                content: url,
                mediaUrl: url,
                width: 260,
                height: 120,
              }),
            )
          }
          onAddSoundFile={(file) => {
            void handleAddSoundFile(file)
          }}
          onAddSoundUrl={(url) =>
            appendElement(
              createElement('sound', {
                mediaUrl: url,
                content: url,
                width: 180,
                height: 96,
              }),
            )
          }
        />

        <Canvas
          elements={elements}
          selectedElementId={selectedElementId}
          onSelect={setSelectedElementId}
          onMoveStart={moveElementStart}
          onResizeStart={resizeElementStart}
          canvasRef={canvasRef}
        />

        <PropertiesPanel
          selected={selected}
          onUpdate={updateElement}
          onDelete={(id) => {
            setElements((current) => current.filter((element) => element.id !== id))
            setSelectedElementId(null)
          }}
          onDuplicate={duplicateElement}
          onBringForward={bringElementForward}
          onSendBackward={sendElementBackward}
        />
      </div>
      <footer className="status-bar">{statusMessage}</footer>
    </div>
  )
}

export default App
