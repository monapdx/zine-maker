import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'
import type { ZineElement } from '../types'
import { ZineElementView } from './ZineElement'

interface CanvasProps {
  elements: ZineElement[]
  selectedElementId: string | null
  onSelect: (id: string | null) => void
  onMoveStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void
  onResizeStart: (id: string, event: ReactPointerEvent<HTMLButtonElement>) => void
  canvasRef: RefObject<HTMLDivElement | null>
}

export function Canvas({
  elements,
  selectedElementId,
  onSelect,
  onMoveStart,
  onResizeStart,
  canvasRef,
}: CanvasProps) {
  const fallbackRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = canvasRef ?? fallbackRef

  return (
    <main className="canvas-shell">
      <div className="canvas-paper" ref={mergedRef} onClick={() => onSelect(null)}>
        {elements
          .slice()
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <ZineElementView
              key={element.id}
              element={element}
              isSelected={selectedElementId === element.id}
              onSelect={onSelect}
              onMoveStart={onMoveStart}
              onResizeStart={onResizeStart}
            />
          ))}
      </div>
    </main>
  )
}
