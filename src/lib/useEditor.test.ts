// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MAX_LAYERS, useEditor } from './useEditor'

const imageInput = {
  src: 'trama:blob:x',
  naturalWidth: 100,
  naturalHeight: 100,
}

describe('useEditor', () => {
  it(`permite hasta ${MAX_LAYERS} capas de texto`, () => {
    const { result } = renderHook(() => useEditor(1000, 1000))

    for (let index = 0; index < MAX_LAYERS; index += 1) {
      act(() => {
        expect(result.current.addTextLayer()).toBe(true)
      })
    }
    expect(result.current.layers).toHaveLength(MAX_LAYERS)

    let added = true
    act(() => {
      added = result.current.addTextLayer()
    })
    expect(added).toBe(false)
    expect(result.current.layers).toHaveLength(MAX_LAYERS)
  })

  it(`frena también las capas de imagen en ${MAX_LAYERS}`, () => {
    const { result } = renderHook(() => useEditor(1000, 1000))

    for (let index = 0; index < MAX_LAYERS; index += 1) {
      act(() => {
        expect(result.current.addImageLayer(imageInput)).toBe(true)
      })
    }

    let added = true
    act(() => {
      added = result.current.addImageLayer(imageInput)
    })
    expect(added).toBe(false)
    expect(result.current.layers).toHaveLength(MAX_LAYERS)
  })

  it('nombra la capa de imagen con el archivo y usa "Logo" como fallback', () => {
    const { result } = renderHook(() => useEditor(1000, 1000))

    act(() => {
      result.current.addImageLayer({ ...imageInput, name: 'mi-logo' })
    })
    act(() => {
      result.current.addImageLayer(imageInput)
    })

    expect(result.current.layers.map((layer) => layer.name)).toEqual(['mi-logo', 'Logo'])
  })
})
