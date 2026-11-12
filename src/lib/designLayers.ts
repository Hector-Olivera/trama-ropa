import type { Layer } from '../types'
import { ARIAL_FONT_STACK, LEGACY_DISPLAY_FONT_STACK } from './fonts'

export function normalizeLayerStyles(layers: Layer[]): Layer[] {
  return layers.map((layer) => {
    if (layer.type !== 'text') return layer

    const legacyWeight = layer.fontWeight as number
    const fontFamily =
      layer.fontFamily === LEGACY_DISPLAY_FONT_STACK ? ARIAL_FONT_STACK : layer.fontFamily

    if (legacyWeight !== 900 && fontFamily === layer.fontFamily) return layer

    return {
      ...layer,
      fontFamily,
      fontWeight: legacyWeight === 900 ? 700 : layer.fontWeight,
    }
  })
}

export function mergeLoadedLayers(current: Layer[], saved: Layer[]): Layer[] {
  const savedIds = new Set(saved.map((layer) => layer.id))
  const kept = current
    .filter((layer) => !savedIds.has(layer.id))
    .map((layer) => ({ ...layer, visible: false }) as Layer)

  return [...saved, ...kept]
}
