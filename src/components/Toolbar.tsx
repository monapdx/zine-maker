import { useState } from 'react'
import { StickerPalette } from './StickerPalette'
import type { CustomSticker, StickerKind } from '../types'

interface ToolbarProps {
  onAddText: () => void
  onAddSticker: (kind: StickerKind) => void
  customStickers: CustomSticker[]
  onUploadCustomSticker: (file: File) => void
  onAddCustomStickerToCanvas: (stickerId: string) => void
  onAddEmbed: (url: string) => void
  onAddImage: (file: File) => void
  onAddSoundFile: (file: File) => void
  onAddSoundUrl: (url: string) => void
}

export function Toolbar({
  onAddText,
  onAddSticker,
  customStickers,
  onUploadCustomSticker,
  onAddCustomStickerToCanvas,
  onAddEmbed,
  onAddImage,
  onAddSoundFile,
  onAddSoundUrl,
}: ToolbarProps) {
  const [embedUrl, setEmbedUrl] = useState('')
  const [soundUrl, setSoundUrl] = useState('')

  return (
    <aside className="left-panel panel-skew">
      <h2>Toolbox</h2>
      <button type="button" onClick={onAddText}>
        Add Text Block
      </button>

      <label className="input-label">
        Add Image / GIF
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              onAddImage(file)
              event.currentTarget.value = ''
            }
          }}
        />
      </label>

      <h3>Stickers</h3>
      <StickerPalette
        customStickers={customStickers}
        onAddSticker={onAddSticker}
        onUploadCustomSticker={onUploadCustomSticker}
        onAddCustomStickerToCanvas={onAddCustomStickerToCanvas}
      />

      <h3>Sound Effect</h3>
      <label className="input-label">
        Upload Audio
        <input
          type="file"
          accept="audio/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              onAddSoundFile(file)
              event.currentTarget.value = ''
            }
          }}
        />
      </label>
      <div className="stack-sm">
        <input
          type="url"
          value={soundUrl}
          placeholder="https://...mp3"
          onChange={(event) => setSoundUrl(event.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (soundUrl.trim()) {
              onAddSoundUrl(soundUrl.trim())
              setSoundUrl('')
            }
          }}
        >
          Add Sound URL
        </button>
      </div>

      <h3>Embed Card</h3>
      <div className="stack-sm">
        <input
          type="url"
          value={embedUrl}
          placeholder="https://example.com"
          onChange={(event) => setEmbedUrl(event.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            if (embedUrl.trim()) {
              onAddEmbed(embedUrl.trim())
              setEmbedUrl('')
            }
          }}
        >
          Add URL Card
        </button>
      </div>
    </aside>
  )
}
