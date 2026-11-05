import { useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'

export function Nav() {
  const { content } = useContent()
  const { brand, nav } = content
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header
      className="sticky top-0 z-50 border-b border-brand-line bg-brand-black/85 backdrop-blur"
      onKeyDown={(event) => {
        if (event.key === 'Escape') close()
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="#inicio" className="flex items-center gap-2" onClick={close}>
          <MediaImage src={brand.mark} alt="" className="h-8 w-8" />
          <span className="font-display text-lg uppercase tracking-tight">{brand.name}</span>
        </a>

        <nav className="ml-auto hidden items-center gap-5 md:flex">
          {nav.links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-brand-muted transition hover:text-brand-cyan"
            >
              {link.label}
            </a>
          ))}
          <a
            href={nav.cta.href}
            className="rounded-md bg-brand-cyan px-3 py-1.5 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
          >
            {nav.cta.label}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <a
            href={nav.cta.href}
            onClick={close}
            className="rounded-md bg-brand-cyan px-3 py-1.5 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white"
          >
            {nav.cta.label}
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-brand-line text-base leading-none text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-movil"
          className="absolute inset-x-0 top-full border-b border-brand-line bg-brand-black/95 backdrop-blur md:hidden"
        >
          <ul className="mx-auto max-w-7xl px-4 py-1">
            {nav.links.map((link) => (
              <li
                key={link.href + link.label}
                className="border-b border-brand-line/60 last:border-0"
              >
                <a
                  href={link.href}
                  onClick={close}
                  className="block py-3 text-xs font-semibold uppercase tracking-wider text-brand-muted transition hover:text-brand-cyan"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="trama-stripe h-[3px] w-full" />
    </header>
  )
}
