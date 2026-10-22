import { useState } from 'react'
import { useContent } from '../content/ContentProvider'
import { MediaImage } from '../content/MediaImage'
import type { CatalogItem } from '../content/types'
import { scrollToId } from '../lib/scrollToId'
import { RichTitle } from './RichTitle'
import { useEditorProducts } from './EditorProducts'

const ALL = 'todos'

export function Catalog() {
  const { content } = useContent()
  const { catalog } = content
  const { addFromCatalog } = useEditorProducts()
  const [active, setActive] = useState<string>(ALL)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)

  const visible =
    active === ALL ? catalog.items : catalog.items.filter((item) => item.group === active)

  const handleAdd = async (item: CatalogItem) => {
    if (busyId) return
    setBusyId(item.id)
    setErrorId(null)
    try {
      await addFromCatalog(item)
      setOpenId(null)
      scrollToId('editor')
    } catch {
      setErrorId(item.id)
    } finally {
      setBusyId(null)
    }
  }

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
          {visible.map((item) => {
            const open = openId === item.id
            return (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-lg ring-1 ring-brand-line transition hover:ring-brand-cyan"
              >
                <button
                  type="button"
                  onClick={() => {
                    setErrorId(null)
                    setOpenId(open ? null : item.id)
                  }}
                  aria-expanded={open}
                  className="block w-full text-left"
                >
                  <MediaImage
                    src={item.src}
                    alt={item.label}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </button>

                {open && (
                  <>
                    <span className="pointer-events-none absolute inset-0 bg-brand-black/50" />
                    <div className="absolute inset-x-2 bottom-2">
                      <button
                        type="button"
                        onClick={() => void handleAdd(item)}
                        disabled={busyId === item.id}
                        className="w-full rounded-md bg-brand-cyan px-3 py-1.5 text-xs font-bold text-brand-black shadow transition hover:bg-brand-pink hover:text-white disabled:opacity-60"
                      >
                        {busyId === item.id ? 'Agregando...' : 'Llevar al editor'}
                      </button>
                      {errorId === item.id && (
                        <p role="alert" className="mt-1 text-[10px] font-semibold text-brand-pink">
                          No se pudo cargar la prenda. Probá de nuevo.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </li>
            )
          })}
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
