import { useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'
import { RichTitle } from './RichTitle'

const ALL = 'todos'

export function Catalog() {
  const { content } = useContent()
  const { catalog } = content
  const [active, setActive] = useState<string>(ALL)

  const visible =
    active === ALL ? catalog.items : catalog.items.filter((item) => item.group === active)

  return (
    <section id="catalogo" className="scroll-mt-20 border-t border-brand-line py-16">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
            {catalog.eyebrow}
          </p>
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            <RichTitle value={catalog.title} />
          </h2>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          <FilterChip active={active === ALL} onClick={() => setActive(ALL)}>
            Todas
          </FilterChip>
          {catalog.groups.map((group) => (
            <FilterChip
              key={group.id}
              active={active === group.id}
              onClick={() => setActive(group.id)}
            >
              {group.label}
            </FilterChip>
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-lg ring-1 ring-brand-line transition hover:ring-brand-cyan"
            >
              <MediaImage
                src={item.src}
                alt={item.label}
                loading="lazy"
                className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </li>
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="text-sm text-brand-muted">No hay prendas en esta categoría.</p>
        )}
      </div>
    </section>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
          : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
