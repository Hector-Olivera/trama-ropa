// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

vi.mock('../lib/images', () => ({ loadImage: vi.fn() }))
vi.mock('./useResolvedImage', () => ({ useResolvedImage: vi.fn() }))

import { loadImage } from '../lib/images'
import { useResolvedImage } from './useResolvedImage'
import { useLoadedImage } from './useLoadedImage'

const loadImageMock = vi.mocked(loadImage)
const useResolvedImageMock = vi.mocked(useResolvedImage)

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('useLoadedImage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('devuelve null hasta que la imagen carga y despues la imagen', async () => {
    const image = {} as HTMLImageElement
    const pending = deferred<HTMLImageElement>()
    loadImageMock.mockReturnValue(pending.promise)
    useResolvedImageMock.mockReturnValue('/producto.png')

    const { result } = renderHook(() => useLoadedImage('/producto.png'))
    expect(result.current).toBeNull()

    await act(async () => {
      pending.resolve(image)
    })

    expect(result.current).toBe(image)
  })

  it('no devuelve la imagen previa cuando cambia el src', async () => {
    const first = {} as HTMLImageElement
    const second = {} as HTMLImageElement
    const firstPending = deferred<HTMLImageElement>()
    const secondPending = deferred<HTMLImageElement>()
    loadImageMock
      .mockReturnValueOnce(firstPending.promise)
      .mockReturnValueOnce(secondPending.promise)
    useResolvedImageMock.mockReturnValue('/uno.png')

    const { result, rerender } = renderHook(({ src }) => useLoadedImage(src), {
      initialProps: { src: '/uno.png' },
    })

    await act(async () => {
      firstPending.resolve(first)
    })
    expect(result.current).toBe(first)

    useResolvedImageMock.mockReturnValue('/dos.png')
    rerender({ src: '/dos.png' })
    expect(result.current).toBeNull()

    await act(async () => {
      secondPending.resolve(second)
    })
    expect(result.current).toBe(second)
  })

  it('carga el src resuelto y no la clave de blob', async () => {
    const image = {} as HTMLImageElement
    loadImageMock.mockResolvedValue(image)
    useResolvedImageMock.mockReturnValue('https://cdn.example.com/media/a.png')

    const { result } = renderHook(() => useLoadedImage('trama:blob:123'))
    await waitFor(() => expect(result.current).toBe(image))

    expect(loadImageMock).toHaveBeenCalledWith('https://cdn.example.com/media/a.png')
    expect(loadImageMock).not.toHaveBeenCalledWith('trama:blob:123')
  })
})
