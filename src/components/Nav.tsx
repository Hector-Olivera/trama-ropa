import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'

export function Nav() {
  const { content } = useContent()
  const { brand, nav } = content

  return (
    <header className="sticky top-0 z-50 border-b border-brand-line bg-brand-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <a href="#inicio" className="flex items-center gap-2">
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

        <a
          href={nav.cta.href}
          className="ml-auto rounded-md bg-brand-cyan px-3 py-1.5 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white md:hidden"
        >
          {nav.cta.label}
        </a>
      </div>
      <div className="trama-stripe h-[3px] w-full" />
    </header>
  )
}
