/**
 * El documento de diseño es DATA PLANO. Nunca guardamos nodos de Konva:
 * los nodos son el render, el data plano es la verdad. Gracias a eso el
 * undo/redo, el guardado y la exportacion no dependen del estado interno
 * del canvas.
 */

export type FilterState = {
  /** Multiplicador, igual que CSS. 1 = sin cambio. */
  brightness: number
  contrast: number
  saturate: number
  /** 0..1 */
  grayscale: number
  invert: number
  sepia: number
  /** En grados, -180..180. */
  hueRotate: number
}

export const DEFAULT_FILTERS: FilterState = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  grayscale: 0,
  invert: 0,
  sepia: 0,
  hueRotate: 0,
}

type LayerBase = {
  id: string
  name: string
  /** Coordenadas en pixeles NATIVOS del producto, no de la pantalla. */
  x: number
  y: number
  width: number
  height: number
  rotation: number
  /** 0..1 */
  opacity: number
  visible: boolean
  locked: boolean
}

export type ImageLayer = LayerBase & {
  type: 'image'
  /** Object URL o data URL. El Blob vive en IndexedDB (ver storage.ts). */
  src: string
  naturalWidth: number
  naturalHeight: number
  filters: FilterState
  flipX: boolean
  flipY: boolean
}

export type TextLayer = LayerBase & {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontWeight: 400 | 700 | 900
  fontStyle: 'normal' | 'italic'
  fill: string
  align: 'left' | 'center' | 'right'
  letterSpacing: number
}

export type Layer = ImageLayer | TextLayer

export type ProductView = {
  id: string
  /** Identificador corto para el nombre del archivo exportado. */
  slug: string
  label: string
  src: string
  /** Dimension natural del PNG, en px. El lienzo del editor usa estos numeros. */
  width: number
  height: number
}

export type Design = {
  id: string
  name: string
  productId: string
  layers: Layer[]
  zoom?: number
  createdAt: number
  updatedAt: number
}

export type ExportScale = 1 | 2 | 3
export type ExportFormat = 'png' | 'jpeg'