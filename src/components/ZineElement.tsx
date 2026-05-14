import { useLayoutEffect, useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { StickerKind, ZineElement } from '../types'

interface ZineElementProps {
  element: ZineElement
  isSelected: boolean
  onSelect: (id: string) => void
  onMoveStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void
  onAutoResizeTextElement: (id: string, nextHeight: number) => void
}

function stickerMarkup(kind: StickerKind): string {
  switch (kind) {
    case 'star':
      return '⭐'
    case 'heart':
      return '💖'
    case 'lightning':
      return '⚡'
    case 'skull':
      return '☠️'
    case 'flower':
      return '🌼'
    case 'eye':
      return '👁️'
    case 'arrow':
      return '➤'
    case 'label':
      return 'LABEL'
    case 'tape':
      return ''
    default:
      return '★'
  }
}

function randomRansomRotate(seed: number): number {
  return ((seed * 13) % 9) - 4
}

export function ZineElementView({
  element,
  isSelected,
  onSelect,
  onMoveStart,
  onAutoResizeTextElement,
}: ZineElementProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const textRef = useRef<HTMLDivElement | null>(null)
  const words = useMemo(() => element.content.split(' '), [element.content])

  useLayoutEffect(() => {
    if (element.type !== 'text' || !textRef.current) return
    const measuredHeight = Math.max(64, Math.ceil(textRef.current.scrollHeight + 4))
    if (Math.abs(measuredHeight - element.height) > 1) {
      onAutoResizeTextElement(element.id, measuredHeight)
    }
  }, [
    element.id,
    element.type,
    element.content,
    element.height,
    element.styles.fontSize,
    element.styles.fontStyle,
    element.styles.fontWeight,
    element.styles.ransomMode,
    onAutoResizeTextElement,
  ])

  return (
    <div
      className={`zine-element ${isSelected ? 'selected' : ''}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onPointerDown={(event) => onMoveStart(element.id, event)}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(element.id)
      }}
    >
      {element.type === 'text' && (
        <div
          ref={textRef}
          className="text-element"
          style={{
            fontSize: element.styles.fontSize ?? 22,
            fontWeight: element.styles.fontWeight ?? 'normal',
            fontStyle: element.styles.fontStyle ?? 'normal',
            backgroundColor: element.styles.backgroundColor ?? '#ffff7a',
            color: element.styles.color ?? '#111',
          }}
        >
          {element.styles.ransomMode
            ? words.map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="ransom-word"
                  style={{
                    transform: `rotate(${randomRansomRotate(index)}deg)`,
                  }}
                >
                  {word}&nbsp;
                </span>
              ))
            : element.content}
        </div>
      )}

      {element.type === 'image' && (
        <img className="image-element" src={element.mediaUrl} alt={element.content || 'User uploaded element'} />
      )}

      {element.type === 'sticker' && (
        <div className={`sticker-element sticker-${element.stickerKind ?? 'star'}`}>
          {element.mediaUrl ? (
            <img className="custom-sticker-image" src={element.mediaUrl} alt={element.content || 'Custom sticker'} />
          ) : (
            stickerMarkup(element.stickerKind ?? 'star')
          )}
        </div>
      )}

      {element.type === 'embed' && (
        <a className="embed-card" href={element.mediaUrl} target="_blank" rel="noreferrer">
          <strong>LINK DROP</strong>
          <span>{element.mediaUrl}</span>
        </a>
      )}

      {element.type === 'sound' && (
        <button
          type="button"
          className="sound-element"
          onClick={(event) => {
            event.stopPropagation()
            if (!audioRef.current) return
            if (audioRef.current.paused) {
              void audioRef.current.play()
            } else {
              audioRef.current.pause()
            }
          }}
        >
          <span>PLAY SOUND</span>
          <audio ref={audioRef} src={element.mediaUrl} />
        </button>
      )}
    </div>
  )
}
