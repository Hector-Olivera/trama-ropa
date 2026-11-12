/**
 * Filtros de imagen para el editor.
 *
 * POR QUE NO USAMOS Konva.Filters: los filtros de Konva exigen node.cache(),
 * y los nodos cacheados se rompen al redimensionar con el Transformer
 * (konvajs/konva#835). Como necesitamos AMBAS cosas a la vez (ajuste de color
 * Y redimensionar/rotar), esta es la salida: pre-renderizamos el logo a un
 * <canvas> con el filtro nativo ctx.filter y le pasamos ese canvas a
 * Konva.Image. Sin cache(), sin conflicto, y la exportacion sale pixel-exacto
 * porque el canvas ya ES la fuente de verdad.
 */
import { DEFAULT_FILTERS, type FilterState } from '../types'

export function isFilterNeutral(filters: FilterState): boolean {
  return (
    filters.brightness === DEFAULT_FILTERS.brightness &&
    filters.contrast === DEFAULT_FILTERS.contrast &&
    filters.saturate === DEFAULT_FILTERS.saturate &&
    filters.grayscale === DEFAULT_FILTERS.grayscale &&
    filters.invert === DEFAULT_FILTERS.invert &&
    filters.sepia === DEFAULT_FILTERS.sepia &&
    filters.hueRotate === DEFAULT_FILTERS.hueRotate
  )
}

export function buildFilterString(filters: FilterState): string {
  const parts: string[] = []

  if (filters.brightness !== 1) parts.push(`brightness(${filters.brightness})`)
  if (filters.contrast !== 1) parts.push(`contrast(${filters.contrast})`)
  if (filters.saturate !== 1) parts.push(`saturate(${filters.saturate})`)
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`)
  if (filters.grayscale !== 0) parts.push(`grayscale(${filters.grayscale})`)
  if (filters.sepia !== 0) parts.push(`sepia(${filters.sepia})`)
  if (filters.invert !== 0) parts.push(`invert(${filters.invert})`)

  return parts.length > 0 ? parts.join(' ') : 'none'
}

/** Identidad estable: sirve como clave de cache y como dependencia de useMemo. */
export function filterKey(filters: FilterState): string {
  return isFilterNeutral(filters) ? 'none' : buildFilterString(filters)
}

/**
 * ctx.filter no existe en navegadores viejos (Safari < 16.4). En ese caso
 * queda 'undefined' y el draw sale sin filtrar, pero sin romperse.
 */
export function isFilterSupported(): boolean {
  const ctx = document.createElement('canvas').getContext('2d')
  return ctx !== null && typeof ctx.filter === 'string'
}

const MAX_CACHE_ENTRIES = 48
const renderCache = new Map<string, HTMLCanvasElement>()

/**
 * Devuelve el canvas ya filtrado y/o espejado, memoizado por
 * (src + filtro + flips). Devolver LA MISMA instancia para la misma clave evita
 * que Konva se redibuje cuando el usuario mueve un slider y vuelve al valor
 * anterior.
 */
export function getRenderedCanvas(
  image: HTMLImageElement,
  src: string,
  filters: FilterState,
  flipX = false,
  flipY = false,
): HTMLCanvasElement {
  if (isFilterNeutral(filters) && !flipX && !flipY) {
    // Sin filtros ni espejado no hay nada que renderizar: Konva usa el <img>.
    throw new Error('getRenderedCanvas no debe llamarse sin filtros ni espejado.')
  }

  const filter = buildFilterString(filters)
  const key = `${src}::${filter}::${flipX ? 'x' : ''}${flipY ? 'y' : ''}`
  const cached = renderCache.get(key)
  if (cached) return cached

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no soporta canvas 2D.')

  if (typeof ctx.filter === 'string') ctx.filter = filter
  if (flipX || flipY) {
    ctx.translate(flipX ? canvas.width : 0, flipY ? canvas.height : 0)
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
  }
  ctx.drawImage(image, 0, 0)
  if (typeof ctx.filter === 'string') ctx.filter = 'none'

  if (renderCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = renderCache.keys().next().value
    if (oldest !== undefined) renderCache.delete(oldest)
  }
  renderCache.set(key, canvas)

  return canvas
}

/** Presets que el panel de propiedades ofrece como atajos. */
export const FILTER_PRESETS: { id: string; label: string; filters: Partial<FilterState> }[] = [
  { id: 'original', label: 'Original', filters: {} },
  { id: 'blanco-negro', label: 'B/N', filters: { grayscale: 1 } },
  {
    id: 'alto-contraste',
    label: 'Alto contraste',
    filters: { contrast: 1.35, saturate: 0.85, brightness: 1.05 },
  },
  { id: 'invertido', label: 'Invertido', filters: { invert: 1 } },
  { id: 'vintage', label: 'Vintage', filters: { sepia: 0.65, contrast: 1.1, saturate: 0.8 } },
]

/** Los presets son absolutos: empiezan de los valores neutros, no del estado actual. */
export function applyPreset(preset: (typeof FILTER_PRESETS)[number]): FilterState {
  return { ...DEFAULT_FILTERS, ...preset.filters }
}