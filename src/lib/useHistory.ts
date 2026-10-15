import { useCallback, useState } from 'react'

/**
 * Undo/redo con UNA entrada por accion terminada, nunca una por movimiento
 * de mouse. Si no, arrastrar una capa llenaria el historial de 500 pasos y
 * un Ctrl+Z no retrocederia nada util.
 */

export type History<T> = {
  past: T[]
  present: T
  future: T[]
}

/**
 * `commit` acepta un updater ademas de un valor. Asi quien llama lee siempre
 * el estado mas reciente desde adentro del setState, sin necesitar un espejo
 * en un ref (que hay que mutar durante render, y React lo prohibe).
 */
export type Next<T> = T | ((current: T) => T)

const LIMIT = 50

export function useHistory<T>(initial: T) {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initial,
    future: [],
  })

  const commit = useCallback((next: Next<T>) => {
    setHistory((current) => {
      const resolved =
        typeof next === 'function' ? (next as (value: T) => T)(current.present) : next
      if (Object.is(current.present, resolved)) return current
      return {
        past: [...current.past, current.present].slice(-LIMIT),
        present: resolved,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((current) => {
      if (current.past.length === 0) return current
      const previous = current.past[current.past.length - 1]
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((current) => {
      if (current.future.length === 0) return current
      const next = current.future[0]
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      }
    })
  }, [])

  const reset = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] })
  }, [])

  return {
    present: history.present,
    commit,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}