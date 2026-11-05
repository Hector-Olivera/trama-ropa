import { describe, expect, it } from 'vitest'
import { ZOOM_MAX, ZOOM_MIN, clampZoom, computeCanvasMetrics } from './canvasMetrics'

const product = { width: 1024, height: 1024 }
const viewport = { width: 800, height: 640 }

describe('clampZoom', () => {
  it('no deja achicar la prenda por debajo del tamaño original', () => {
    expect(clampZoom(0.5)).toBe(ZOOM_MIN)
    expect(clampZoom(-2)).toBe(ZOOM_MIN)
  })

  it('limita el máximo y sanea valores corruptos', () => {
    expect(clampZoom(4)).toBe(ZOOM_MAX)
    expect(clampZoom(Number.NaN)).toBe(ZOOM_MIN)
  })

  it('deja pasar los valores válidos', () => {
    expect(clampZoom(1.5)).toBe(1.5)
  })
})

describe('computeCanvasMetrics', () => {
  it('sin zoom encaja la prenda en el contenedor', () => {
    const metrics = computeCanvasMetrics(product, viewport, 1)

    expect(metrics.scale).toBe(0.625)
    expect(metrics.stageWidth).toBe(800)
    expect(metrics.stageHeight).toBe(640)
    expect(metrics.offsetX).toBe(80)
    expect(metrics.offsetY).toBe(0)
  })

  it('no arrastra decimales al tamaño del lienzo sin zoom', () => {
    const metrics = computeCanvasMetrics({ width: 3000, height: 2000 }, { width: 999, height: 640 }, 1)

    expect(metrics.stageWidth).toBe(999)
    expect(metrics.stageHeight).toBe(640)
  })

  it('con zoom agranda la escala y el lienzo', () => {
    const metrics = computeCanvasMetrics(product, viewport, 2)

    expect(metrics.scale).toBe(1.25)
    expect(metrics.stageWidth).toBe(1280)
    expect(metrics.stageHeight).toBe(1280)
    expect(metrics.offsetX).toBe(0)
    expect(metrics.offsetY).toBe(0)
  })

  it('mantiene la prenda centrada cuando sobra lienzo', () => {
    const metrics = computeCanvasMetrics({ width: 400, height: 400 }, viewport, 1)

    expect(metrics.scale).toBe(1.6)
    expect(metrics.offsetX).toBe(80)
    expect(metrics.offsetY).toBe(0)
  })

  it('el recorte del export nunca se sale del lienzo con ningún zoom', () => {
    for (const zoom of [ZOOM_MIN, 1.25, 1.5, 2, 2.5, ZOOM_MAX]) {
      const metrics = computeCanvasMetrics(product, viewport, zoom)
      const displayWidth = product.width * metrics.scale
      const displayHeight = product.height * metrics.scale

      expect(displayWidth).toBeLessThanOrEqual(metrics.stageWidth)
      expect(displayHeight).toBeLessThanOrEqual(metrics.stageHeight)
      expect(metrics.offsetX).toBeGreaterThanOrEqual(0)
      expect(metrics.offsetY).toBeGreaterThanOrEqual(0)
    }
  })

  it('sanea un producto sin dimensiones', () => {
    const metrics = computeCanvasMetrics({ width: 0, height: 0 }, viewport, 1)

    expect(metrics.scale).toBe(640)
    expect(metrics.stageWidth).toBe(800)
    expect(metrics.stageHeight).toBe(640)
  })
})
