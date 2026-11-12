import { useCallback, useEffect, useRef, useState } from 'react'
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

const STRIP_STEP = 120

export function ProductPicker({
  products,
  productId,
  onChange,
  layerCount,
  localCount,
  userAddedIds,
}: Props) {
  const stripRef = useRef<HTMLDivElement | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const addedProducts = products
    .filter((product) => userAddedIds.includes(product.id))
    .reverse()
  const defaultProducts = products.filter((product) => !userAddedIds.includes(product.id))

  const measure = useCallback(() => {
    const strip = stripRef.current
    if (!strip) return
    const overflow = strip.scrollWidth - strip.clientWidth
    if (overflow <= 1) {
      setCanPrev(false)
      setCanNext(false)
      return
    }
    setCanPrev(strip.scrollLeft > 1)
    setCanNext(strip.scrollLeft < overflow - 1)
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const node = strip.querySelector<HTMLElement>('[data-user-added="true"]')
    if (node) {
      const left =
        node.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft
      strip.scrollTo({ left, behavior: 'smooth' })
    }
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [userAddedIds, products, measure])

  useEffect(() => {
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  const scrollStrip = (direction: -1 | 1) => {
    stripRef.current?.scrollBy({ left: direction * STRIP_STEP, behavior: 'smooth' })
  }

  const card = (product: ProductView) => {
    const active = product.id === productId
    return (
      <button
        type="button"
        onClick={() => onChange(product.id)}
        aria-pressed={active}
        title={product.label}
        className={`group relative flex w-full flex-col gap-1 rounded-lg border p-2 text-left transition ${
          active
            ? 'border-brand-cyan bg-brand-cyan/10'
            : 'border-brand-line hover:border-brand-muted'
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
          className={`block truncate text-[11px] font-semibold leading-tight ${
            active ? 'text-brand-cyan' : 'text-brand-light'
          }`}
        >
          {product.label}
        </span>
      </button>
    )
  }

  const stripArrow = (side: 'left' | 'right') => {
    const isLeft = side === 'left'
    const enabled = isLeft ? canPrev : canNext
    const label = isLeft ? 'Desplazar a la izquierda' : 'Desplazar a la derecha'
    return (
      <button
        type="button"
        onClick={() => scrollStrip(isLeft ? -1 : 1)}
        aria-label={label}
        title={label}
        className={`absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-brand-line bg-brand-black/70 text-brand-light backdrop-blur-sm transition duration-200 ${
          isLeft ? 'left-0' : 'right-0'
        } ${
          enabled
            ? 'opacity-70 hover:border-brand-cyan hover:text-brand-cyan hover:opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d={isLeft ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
        </svg>
      </button>
    )
  }

  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
        Prenda
      </h3>

      <div className="relative lg:hidden">
        <div
          ref={stripRef}
          onScroll={measure}
          className="trama-strip flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1"
        >
          {[...addedProducts, ...defaultProducts].map((product) => (
            <div
              key={product.id}
              data-user-added={userAddedIds.includes(product.id) ? 'true' : 'false'}
              className="snap-start shrink-0 w-28"
            >
              {card(product)}
            </div>
          ))}
        </div>
        {stripArrow('left')}
        {stripArrow('right')}
      </div>

      {products.length > 0 && (
        <div className="hidden space-y-2 lg:block">
          {addedProducts.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {addedProducts.map((product) => (
                <div key={product.id} className="min-w-0">
                  {card(product)}
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {defaultProducts.map((product) => (
              <div key={product.id} className="min-w-0">
                {card(product)}
              </div>
            ))}
          </div>
        </div>
      )}

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
