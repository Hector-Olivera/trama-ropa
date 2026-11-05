import type { Layer } from '../types'

export function mergeLoadedLayers(current: Layer[], saved: Layer[]): Layer[] {
  const savedIds = new Set(saved.map((layer) => layer.id))
  const kept = current
    .filter((layer) => !savedIds.has(layer.id))
    .map((layer) => ({ ...layer, visible: false }) as Layer)

  return [...saved, ...kept]
}
