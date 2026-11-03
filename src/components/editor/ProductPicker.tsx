import { useEffect, useRef } from 'react'
import { MediaImage } from '../../content/MediaImage'
import type { ProductView } from '../../types'
import { MAX_LOCAL_PRODUCTS } from '../EditorProducts'

type Props = {
  products: ProductView[]
  productId: string
  onChange: (productId: string) => void
  /** Avisa si quedan capas que no calzan con la prenda nueva. */
  layerCount: number
  /** Cuántas fotos del catálogo sumó el visitante (tope MAX_LOCAL_PRODUCTS). */
  localCount: number
  userAddedIds: string[]
}

export function ProductPicker({
  products,
  productId,
  onChange,
  layerCount,
  localCount,
  userAddedIds,
}: Props) {
  const stripRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const node = strip.querySelector<HTMLElement>('[data-user-added="true"]')
    if (!node) return
    const left =
      node.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft
    strip.scrollTo({ left, behavior: 'smooth' })
  }, [userAddedIds, products])

  const card = (product: ProductView) => {
    const active = product.id === productId
    return (
      <button
        type="button"
        onClick={() => onChange(product.id)}
        aria-pressed={active}
        className={`w-full rounded-lg border p-2 text-left transition ${
          active ? 'border-brand-cyan bg-brand-cyan/10' : 'border-brand-line hover:border-brand-muted'
        }`}
      >
        <div className="flex h-20 items-center justify-center overflow-hidden rounded bg-brand-black/60">
          <MediaImage
            src={product.src}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
        <span
          className={`mt-1 block text-[11px] font-semibold leading-tight ${
            active ? 'text-brand-cyan' : 'text-brand-light'
          }`}
        >
          {product.label}
        </span>
      </button>
    )
  }

  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
        Prenda
      </h3>

      <div className="hidden lg:block">
        <div ref={stripRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1">
          {products.map((product) => (
            <div
              key={product.id}
              data-user-added={userAddedIds.includes(product.id) ? 'true' : 'false'}
              className="snap-start shrink-0 w-28"
            >
              {card(product)}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:hidden">
        {products.map((product) => (
          <div key={product.id} className="min-w-0">
            {card(product)}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-[11px] leading-snug text-brand-muted">
          No hay prendas cargadas. Agregalas desde el panel de administración.
        </p>
      )}

      {layerCount > 0 && (
        <p className="mt-2 text-[11px] leading-snug text-brand-muted">
          Al cambiar de prenda los logos quedan ocultos: volvé a mostrarlos desde Capas.
          Recalibrá la posición si hace falta.
        </p>
      )}

      {localCount > 0 && (
        <p className="mt-2 text-[11px] leading-snug text-brand-muted">
          Hasta {MAX_LOCAL_PRODUCTS} fotos del catálogo: al agregar otra se quita la primera.
        </p>
      )}
    </div>
  )
}
