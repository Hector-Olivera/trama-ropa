import { useEffect, useState } from 'react'
import { isBlobRef, resolveMediaSrc } from './store'
import type { MediaRef } from './types'

/**
 * Devuelve un src listo para <img>.
 *
 * Si `src` es un path normal (los defaults de public/) lo devuelve tal cual y
 * no toca el estado. Si es una clave de blob subida por el dashboard
 * ("trama:blob:<id>"), la resuelve a una object URL en un effect (siempre
 * asincrono, nunca setState sincrono dentro del effect).
 */
export function useResolvedImage(src: MediaRef): string {
  const isBlob = isBlobRef(src)
  const [resolved, setResolved] = useState<{ src: MediaRef; url: string } | null>(null)

  useEffect(() => {
    if (!isBlob) return

    let active = true
    void resolveMediaSrc(src)
      .then((url) => {
        if (active) setResolved({ src, url })
      })
      .catch(() => {
        if (active) setResolved({ src, url: '' })
      })

    return () => {
      active = false
    }
  }, [src, isBlob])

  if (!isBlob) return src
  return resolved && resolved.src === src ? resolved.url : ''
}
