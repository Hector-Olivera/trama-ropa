export type CanvasMetrics = {
  stageWidth: number
  stageHeight: number
  scale: number
  offsetX: number
  offsetY: number
}

export type CanvasSize = {
  width: number
  height: number
}

export const ZOOM_MIN = 1
export const ZOOM_MAX = 3
export const ZOOM_STEP = 0.25

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return ZOOM_MIN
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom))
}

function snapToViewport(stage: number, viewport: number): number {
  return stage - viewport < 1 ? viewport : stage
}

export function computeCanvasMetrics(
  product: CanvasSize,
  viewport: CanvasSize,
  zoom: number,
): CanvasMetrics {
  const productWidth = Math.max(product.width, 1)
  const productHeight = Math.max(product.height, 1)
  const viewportWidth = Math.max(viewport.width, 1)
  const viewportHeight = Math.max(viewport.height, 1)

  const fit = Math.min(viewportWidth / productWidth, viewportHeight / productHeight)
  const scale = fit * clampZoom(zoom)
  const displayWidth = productWidth * scale
  const displayHeight = productHeight * scale
  const stageWidth = snapToViewport(Math.max(viewportWidth, displayWidth), viewportWidth)
  const stageHeight = snapToViewport(Math.max(viewportHeight, displayHeight), viewportHeight)

  return {
    stageWidth,
    stageHeight,
    scale,
    offsetX: (stageWidth - displayWidth) / 2,
    offsetY: (stageHeight - displayHeight) / 2,
  }
}
