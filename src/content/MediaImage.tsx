import { useResolvedImage } from './useResolvedImage'
import type { MediaRef } from './types'

type Props = {
  src: MediaRef
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  draggable?: boolean
}

/**
 * <img> que resuelve tanto paths de public/ como blobs subidos por el
 * dashboard. Mientras un blob se resuelve muestra un recuadro neutro con las
 * mismas clases, para que no salte el layout.
 */
export function MediaImage({ src, alt, className, loading, draggable }: Props) {
  const resolved = useResolvedImage(src)

  if (!resolved) {
    return <div role="img" aria-label={alt} className={className} aria-busy="true" />
  }

  return <img src={resolved} alt={alt} className={className} loading={loading} draggable={draggable} />
}
