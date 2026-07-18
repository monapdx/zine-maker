import { useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { StickerKind, ZineElement } from '../types'

interface ZineElementProps {
  element: ZineElement
  isSelected: boolean
  onSelect: (id: string) => void
  onMoveStart: (id: string, event: ReactPointerEvent<HTMLDivElement>) => void
  onResizeStart: (id: string, event: ReactPointerEvent<HTMLButtonElement>) => void
}

function stickerMarkup(kind: StickerKind, content: string): string {
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
      return content || 'LABEL'
    case 'tape':
      return ''
    default:
      return '★'
  }
}

function randomRansomRotate(seed: number): number {
  return ((seed * 13) % 9) - 4
}

function externalLinkUrl(url?: string): string {
  const trimmedUrl = url?.trim() ?? ''
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
}

export function ZineElementView({
  element,
  isSelected,
  onSelect,
  onMoveStart,
  onResizeStart,
}: ZineElementProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const words = useMemo(() => element.content.split(' '), [element.content])
  const isGif =
    element.mediaUrl?.startsWith('data:image/gif') ||
    /\.gif(?:$|[?#])/i.test(element.mediaUrl ?? '') ||
    /\.gif$/i.test(element.content)

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
        <img
          className={`image-element ${isGif ? 'gif-media' : ''}`}
          src={element.mediaUrl}
          alt={element.content || 'User uploaded element'}
        />
      )}

      {element.type === 'sticker' && (
        <div
          className={`sticker-element sticker-${element.stickerKind ?? 'star'} ${isGif ? 'gif-media' : ''}`}
          style={
            element.stickerKind === 'label'
              ? { backgroundColor: element.styles.backgroundColor ?? '#f8f8f8' }
              : undefined
          }
        >
          {element.mediaUrl ? (
            <img className="custom-sticker-image" src={element.mediaUrl} alt={element.content || 'Custom sticker'} />
          ) : (
            stickerMarkup(element.stickerKind ?? 'star', element.content)
          )}
        </div>
      )}

      {element.type === 'embed' && (
        <div className="embed-card">
          <strong>LINK DROP</strong>
          <a
            className="embed-link"
            href={externalLinkUrl(element.mediaUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(event) => {
              event.stopPropagation()
              onSelect(element.id)
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {element.mediaUrl}
          </a>
        </div>
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
          <span>{element.content || 'PLAY SOUND'}</span>
          <audio ref={audioRef} src={element.mediaUrl} />
        </button>
      )}

      {isSelected && (element.type === 'image' || element.type === 'text') && (
        <button
          type="button"
          className="resize-handle"
          aria-label={`Resize ${element.type}`}
          title="Drag to resize"
          onPointerDown={(event) => {
            event.stopPropagation()
            onResizeStart(element.id, event)
          }}
          onClick={(event) => event.stopPropagation()}
        />
      )}
    </div>
  )
}
