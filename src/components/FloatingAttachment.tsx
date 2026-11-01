import { useEffect, useState } from 'react'
import { useDesignAttachment } from './DesignAttachment'
import { scrollToId } from '../lib/scrollToId'

export function FloatingAttachment() {
  const { count } = useDesignAttachment()
  const [atContact, setAtContact] = useState(false)

  useEffect(() => {
    if (count === 0) return
    const section = document.getElementById('contacto')
    if (!section || typeof window.IntersectionObserver === 'undefined') return
    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) setAtContact(entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-40% 0px -40% 0px' },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [count])

  if (count === 0) return null

  const shape = atContact
    ? 'M2 22 L60 2 L118 22 V54 H2 Z'
    : 'M2 2 H118 V34 L60 54 L2 34 Z'

  const nudge = atContact ? 'pt-2.5' : 'pb-2.5'

  return (
    <button
      type="button"
      onClick={() => scrollToId(atContact ? 'editor' : 'contacto')}
      aria-label={atContact ? 'Volver al editor' : 'Ir a contacto para enviar el diseño'}
      className="group fixed right-4 bottom-4 z-40 flex h-14 w-32 items-center justify-center"
    >
      <svg
        viewBox="0 0 120 56"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${atContact ? '' : 'animate-glow-arc-loop'}`}
      >
        <path
          d={shape}
          vectorEffect="non-scaling-stroke"
          className="fill-brand-black/65 stroke-brand-cyan transition-[fill] duration-200 group-hover:fill-brand-cyan/90 group-hover:stroke-brand-black/20"
          strokeWidth={2}
        />
      </svg>
      <span
        className={`relative flex flex-col items-center text-xs font-bold leading-tight tracking-wide text-brand-light transition-colors duration-200 group-hover:text-brand-black ${nudge}`}
      >
        {atContact ? 'Volver' : 'Enviar Diseño'}
      </span>
    </button>
  )
}
