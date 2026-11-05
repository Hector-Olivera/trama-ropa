import { useEffect, useState } from 'react'
import { isBlobRef, resolveDrawableSrc } from '../../lib/storage'

type Props = {
  src: string
  alt: string
  className?: string
}

export function DrawableImage({ src, alt, className }: Props) {
  const isBlob = isBlobRef(src)
  const [resolved, setResolved] = useState<{ src: string; url: string } | null>(null)

  useEffect(() => {
    if (!isBlob) return

    let active = true
    void resolveDrawableSrc(src).then(
      (url) => {
        if (active) setResolved({ src, url })
      },
      () => {
        if (active) setResolved({ src, url: '' })
      },
    )

    return () => {
      active = false
    }
  }, [src, isBlob])

  if (!isBlob) return <img src={src} alt={alt} className={className} />

  if (!resolved || resolved.src !== src) {
    return <div role="img" aria-label={alt} className={className} aria-busy="true" />
  }

  if (!resolved.url || isBlobRef(resolved.url)) {
    return <div role="img" aria-label={alt} className={className} />
  }

  return <img src={resolved.url} alt={alt} className={className} />
}
