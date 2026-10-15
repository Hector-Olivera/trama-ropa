import { useEffect, useRef, useState } from 'react'

/**
 * Devuelve [ref, size]. Es un tuple y no un objeto con `ref` adentro a
 * proposito: asi el linter de react-hooks puede distinguir el ref del valor
 * medido sin adivinar.
 */
export function useElementSize<T extends HTMLElement>(): [
  React.RefObject<T | null>,
  { width: number; height: number },
] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize((current) =>
        Math.abs(current.width - width) < 1 && Math.abs(current.height - height) < 1
          ? current
          : { width, height },
      )
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}