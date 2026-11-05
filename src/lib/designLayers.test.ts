import { describe, expect, it } from 'vitest'
import type { Layer } from '../types'
import { mergeLoadedLayers } from './designLayers'

const textLayer = (id: string, overrides: Partial<Layer> = {}): Layer =>
  ({
    id,
    type: 'text',
    name: id,
    text: id,
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    fontSize: 10,
    fontFamily: 'Arial',
    fontWeight: 400,
    fontStyle: 'normal',
    fill: '#ffffff',
    align: 'center',
    letterSpacing: 0,
    ...overrides,
  }) as Layer

describe('mergeLoadedLayers', () => {
  it('conserva las capas actuales que no usa el diseño, ocultas', () => {
    const current = ['a', 'b', 'c', 'd', 'e'].map((id) => textLayer(id))
    const saved = [textLayer('a'), textLayer('b')]

    const merged = mergeLoadedLayers(current, saved)

    expect(merged.map((layer) => layer.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(merged.map((layer) => layer.visible)).toEqual([true, true, false, false, false])
  })

  it('usa el estado guardado cuando la capa existe en ambos lados', () => {
    const current = [textLayer('a', { x: 50, y: 60 })]
    const saved = [textLayer('a', { x: 5, y: 6, visible: false })]

    const [merged] = mergeLoadedLayers(current, saved)

    expect(merged.x).toBe(5)
    expect(merged.y).toBe(6)
    expect(merged.visible).toBe(false)
  })

  it('vuelve a agregar una capa del diseño que ya no estaba en el editor', () => {
    const merged = mergeLoadedLayers([textLayer('b')], [textLayer('a'), textLayer('b')])

    expect(merged.map((layer) => layer.id)).toEqual(['a', 'b'])
  })

  it('no duplica capas al cargar el mismo diseño dos veces', () => {
    const saved = [textLayer('a'), textLayer('b')]
    const first = mergeLoadedLayers([textLayer('a')], saved)
    const second = mergeLoadedLayers(first, saved)

    expect(second.map((layer) => layer.id)).toEqual(['a', 'b'])
    expect(second).toHaveLength(2)
  })
})
