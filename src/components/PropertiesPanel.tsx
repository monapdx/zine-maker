import type { ZineElement } from '../types'

interface PropertiesPanelProps {
  selected: ZineElement | null
  onUpdate: (id: string, patch: Partial<ZineElement>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onBringForward: (id: string) => void
  onSendBackward: (id: string) => void
}

export function PropertiesPanel({
  selected,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: PropertiesPanelProps) {
  if (!selected) {
    return (
      <aside className="right-panel panel-skew-right">
        <h2>Properties</h2>
        <p>Select an element to edit it.</p>
      </aside>
    )
  }

  return (
    <aside className="right-panel panel-skew-right">
      <h2>Properties</h2>
      <div className="stack-sm">
        <label>
          X
          <input
            type="number"
            value={Math.round(selected.x)}
            onChange={(event) => onUpdate(selected.id, { x: Number(event.target.value) })}
          />
        </label>
        <label>
          Y
          <input
            type="number"
            value={Math.round(selected.y)}
            onChange={(event) => onUpdate(selected.id, { y: Number(event.target.value) })}
          />
        </label>
        <label>
          Width
          <input
            type="number"
            value={Math.round(selected.width)}
            min={40}
            onChange={(event) => onUpdate(selected.id, { width: Number(event.target.value) })}
          />
        </label>
        <label>
          Height
          <input
            type="number"
            value={Math.round(selected.height)}
            min={30}
            onChange={(event) => onUpdate(selected.id, { height: Number(event.target.value) })}
          />
        </label>
        <label>
          Rotation
          <input
            type="number"
            value={Math.round(selected.rotation)}
            onChange={(event) => onUpdate(selected.id, { rotation: Number(event.target.value) })}
          />
        </label>

        {(selected.type === 'text' ||
          selected.type === 'embed' ||
          (selected.type === 'sticker' && selected.stickerKind === 'label')) && (
          <label>
            {selected.type === 'sticker' ? 'Label Text' : 'Content'}
            <textarea
              value={selected.content}
              onChange={(event) => onUpdate(selected.id, { content: event.target.value })}
            />
          </label>
        )}

        {selected.type === 'text' && (
          <>
            <label>
              Font Size
              <input
                type="number"
                value={selected.styles.fontSize ?? 22}
                min={8}
                onChange={(event) =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      fontSize: Number(event.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              Background
              <input
                type="color"
                value={selected.styles.backgroundColor ?? '#ffff7a'}
                onChange={(event) =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      backgroundColor: event.target.value,
                    },
                  })
                }
              />
            </label>
            <label>
              Text Color
              <input
                type="color"
                value={selected.styles.color ?? '#111111'}
                onChange={(event) =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      color: event.target.value,
                    },
                  })
                }
              />
            </label>
            <div className="row-buttons">
              <button
                type="button"
                onClick={() =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      fontWeight: selected.styles.fontWeight === 'bold' ? 'normal' : 'bold',
                    },
                  })
                }
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      fontStyle: selected.styles.fontStyle === 'italic' ? 'normal' : 'italic',
                    },
                  })
                }
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdate(selected.id, {
                    styles: {
                      ...selected.styles,
                      ransomMode: !selected.styles.ransomMode,
                    },
                  })
                }
              >
                Ransom
              </button>
            </div>
          </>
        )}

        <div className="row-buttons">
          <button type="button" onClick={() => onBringForward(selected.id)}>
            Bring Forward
          </button>
          <button type="button" onClick={() => onSendBackward(selected.id)}>
            Send Backward
          </button>
        </div>
        <div className="row-buttons">
          <button type="button" onClick={() => onDuplicate(selected.id)}>
            Duplicate
          </button>
          <button type="button" className="danger" onClick={() => onDelete(selected.id)}>
            Delete
          </button>
        </div>
      </div>
    </aside>
  )
}
