import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'

export function Footer() {
  const { content } = useContent()
  const { brand, footer } = content

  return (
    <footer className="border-t border-brand-line py-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <MediaImage src={brand.mark} alt="" className="h-7 w-7" />
          <span className="font-display text-base uppercase tracking-tight">{brand.name}</span>
        </div>

        <p className="text-[11px] text-brand-muted">{footer.tagline}</p>

        <div className="flex gap-4">
          {footer.links.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              className="text-[11px] uppercase tracking-wider text-brand-muted transition hover:text-brand-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="trama-stripe mt-8 h-[3px] w-full" />
    </footer>
  )
}
