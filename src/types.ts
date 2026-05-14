export type ZineElementType = 'text' | 'image' | 'sticker' | 'sound' | 'embed'

export type StickerKind =
  | 'star'
  | 'heart'
  | 'lightning'
  | 'skull'
  | 'flower'
  | 'eye'
  | 'arrow'
  | 'label'
  | 'tape'

export interface CustomSticker {
  id: string
  name: string
  dataUrl: string
}

export interface ZineElementStyles {
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  backgroundColor?: string
  color?: string
  ransomMode?: boolean
}

export interface ZineElement {
  id: string
  type: ZineElementType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  content: string
  mediaUrl?: string
  styles: ZineElementStyles
  stickerKind?: StickerKind
}

export interface ZineProject {
  projectName: string
  elements: ZineElement[]
  customStickers?: CustomSticker[]
}
