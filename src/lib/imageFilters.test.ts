// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS } from '../types'
import { getRenderedCanvas } from './imageFilters'

type FakeContext = {
  filter: string
  translate: ReturnType<typeof vi.fn>
  scale: ReturnType<typeof vi.fn>
  drawImage: ReturnType<typeof vi.fn>
}

function makeCanvas() {
  const ctx: FakeContext = {
    filter: 'none',
    translate: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement
  return { canvas, ctx }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getRenderedCanvas', () => {
  it('dibuja el espejado y memoiza por combinación de flips', () => {
    const created: ReturnType<typeof makeCanvas>[] = []
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation(((tagName: string) => {
      if (tagName === 'canvas') {
        const next = makeCanvas()
        created.push(next)
        return next.canvas
      }
      return createElement(tagName)
    }) as typeof document.createElement)

    const image = { naturalWidth: 120, naturalHeight: 80 } as HTMLImageElement

    const first = getRenderedCanvas(image, 'flip-test', DEFAULT_FILTERS, true, false)
    expect(created).toHaveLength(1)
    expect(first).toBe(created[0].canvas)
    expect(created[0].canvas.width).toBe(120)
    expect(created[0].canvas.height).toBe(80)
    expect(created[0].ctx.translate).toHaveBeenCalledWith(120, 0)
    expect(created[0].ctx.scale).toHaveBeenCalledWith(-1, 1)
    expect(created[0].ctx.drawImage).toHaveBeenCalledWith(image, 0, 0)

    const cached = getRenderedCanvas(image, 'flip-test', DEFAULT_FILTERS, true, false)
    expect(cached).toBe(first)
    expect(created).toHaveLength(1)
    expect(created[0].ctx.drawImage).toHaveBeenCalledTimes(1)

    const flippedY = getRenderedCanvas(image, 'flip-test', DEFAULT_FILTERS, false, true)
    expect(flippedY).not.toBe(first)
    expect(created).toHaveLength(2)
    expect(created[1].ctx.translate).toHaveBeenCalledWith(0, 80)
    expect(created[1].ctx.scale).toHaveBeenCalledWith(1, -1)
  })
})
