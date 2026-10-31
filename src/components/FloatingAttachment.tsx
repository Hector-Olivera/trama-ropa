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

  if (atContact) {
    return (
      <button
        type="button"
        onClick={() => scrollToId('editor')}
        aria-label="Volver al editor"
        className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-4 py-2.5 text-xs font-bold text-brand-light shadow-lg transition hover:border-brand-cyan hover:text-brand-cyan"
      >
        <span aria-hidden="true">↑</span>
        Volver
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => scrollToId('contacto')}
      aria-label="Ir a contacto para enviar el diseño"
      className="animate-glow-pulse-loop fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-brand-cyan px-4 py-2.5 text-xs font-bold text-brand-black shadow-lg transition hover:bg-brand-pink hover:text-white"
    >
      <span aria-hidden="true">↓</span>
      Enviar Diseño
    </button>
  )
}
