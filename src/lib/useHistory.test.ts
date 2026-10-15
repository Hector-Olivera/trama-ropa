// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useHistory } from './useHistory'

describe('useHistory', () => {
  it('arranca con el valor inicial y sin undo/redo', () => {
    const { result } = renderHook(() => useHistory(0))

    expect(result.current.present).toBe(0)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('commit acepta un updater y usa el valor mas reciente', () => {
    const { result } = renderHook(() => useHistory(1))

    act(() => result.current.commit((current) => current + 1))
    act(() => result.current.commit((current) => current + 1))

    expect(result.current.present).toBe(3)
    expect(result.current.canUndo).toBe(true)
  })

  it('deshace y rehace en orden', () => {
    const { result } = renderHook(() => useHistory('a'))

    act(() => result.current.commit('b'))
    act(() => result.current.commit('c'))
    expect(result.current.present).toBe('c')

    act(() => result.current.undo())
    expect(result.current.present).toBe('b')

    act(() => result.current.undo())
    expect(result.current.present).toBe('a')
    expect(result.current.canUndo).toBe(false)

    act(() => result.current.redo())
    expect(result.current.present).toBe('b')
    expect(result.current.canRedo).toBe(true)
  })

  it('un commit nuevo limpia el futuro', () => {
    const { result } = renderHook(() => useHistory(0))

    act(() => result.current.commit(1))
    act(() => result.current.undo())
    expect(result.current.canRedo).toBe(true)

    act(() => result.current.commit(2))
    expect(result.current.canRedo).toBe(false)
    expect(result.current.present).toBe(2)
  })

  it('ignora commits con el mismo valor', () => {
    const { result } = renderHook(() => useHistory(5))

    act(() => result.current.commit(5))

    expect(result.current.canUndo).toBe(false)
  })

  it('limita el historial a 50 pasos', () => {
    const { result } = renderHook(() => useHistory(0))

    for (let i = 1; i <= 60; i += 1) {
      act(() => result.current.commit(i))
    }

    let steps = 0
    while (result.current.canUndo) {
      act(() => result.current.undo())
      steps += 1
    }

    expect(steps).toBe(50)
    expect(result.current.present).toBe(10)
  })

  it('reset descarta pasado y futuro', () => {
    const { result } = renderHook(() => useHistory('x'))

    act(() => result.current.commit('y'))
    act(() => result.current.reset('z'))

    expect(result.current.present).toBe('z')
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })
})
