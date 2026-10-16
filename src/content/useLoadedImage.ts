import { useEffect, useState } from 'react'
import { loadImage } from '../lib/images'
import { useResolvedImage } from './useResolvedImage'
import type { MediaRef } from './types'

/**
 * Carga la imagen de un MediaRef ya resuelto (blob, URL pública o path).
 *
 * Devuelve la imagen solo si corresponde al src resuelto actual; mientras
 * cambia el src devuelve null, así nunca se dibuja una imagen vieja estirada
 * al tamaño nuevo (el bug de la prenda base).
 */
export function useLoadedImage(src: MediaRef): HTMLImageElement | null {
  const resolvedSrc = useResolvedImage(src)
  const [loaded, setLoaded] = useState<{ src: string; image: HTMLImageElement } | null>(null)

  useEffect(() => {
    if (!resolvedSrc) return

    let active = true
    void loadImage(resolvedSrc)
      .then((image) => {
        if (active) setLoaded({ src: resolvedSrc, image })
      })
      .catch(() => {
        if (active) setLoaded(null)
      })

    return () => {
      active = false
    }
  }, [resolvedSrc])

  return loaded && loaded.src === resolvedSrc ? loaded.image : null
}
