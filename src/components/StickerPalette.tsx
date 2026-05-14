import type { CustomSticker, StickerKind } from '../types'

interface StickerPaletteProps {
  customStickers: CustomSticker[]
  onAddSticker: (kind: StickerKind) => void
  onAddCustomStickerToCanvas: (stickerId: string) => void
  onUploadCustomSticker: (file: File) => void
}

const stickers: Array<{ kind: StickerKind; label: string }> = [
  { kind: 'star', label: 'Star' },
  { kind: 'heart', label: 'Heart' },
  { kind: 'lightning', label: 'Lightning' },
  { kind: 'skull', label: 'Skull' },
  { kind: 'flower', label: 'Flower' },
  { kind: 'eye', label: 'Eye' },
  { kind: 'arrow', label: 'Arrow' },
  { kind: 'label', label: 'Label/Tag' },
  { kind: 'tape', label: 'Tape Strip' },
]

export function StickerPalette({
  customStickers,
  onAddSticker,
  onAddCustomStickerToCanvas,
  onUploadCustomSticker,
}: StickerPaletteProps) {
  return (
    <>
      <label className="input-label">
        Upload Custom Sticker
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              onUploadCustomSticker(file)
              event.currentTarget.value = ''
            }
          }}
        />
      </label>

      <div className="sticker-palette">
        {stickers.map((sticker) => (
          <button
            key={sticker.kind}
            type="button"
            className="sticker-palette-item"
            onClick={() => onAddSticker(sticker.kind)}
          >
            {sticker.label}
          </button>
        ))}
      </div>

      {customStickers.length > 0 && (
        <>
          <h4 className="custom-sticker-title">Your Stickers</h4>
          <div className="sticker-palette custom-sticker-palette">
            {customStickers.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                className="sticker-palette-item custom-sticker-item"
                onClick={() => onAddCustomStickerToCanvas(sticker.id)}
                title={sticker.name}
              >
                <img src={sticker.dataUrl} alt={sticker.name} />
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
