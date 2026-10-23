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
}

export function ProductPicker({ products, productId, onChange, layerCount, localCount }: Props) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
        Prenda
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {products.map((product) => {
          const active = product.id === productId
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onChange(product.id)}
              aria-pressed={active}
              className={`group relative flex flex-col gap-1 rounded-lg border p-2 text-left transition ${
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
                className={`text-[11px] font-semibold leading-tight ${
                  active ? 'text-brand-cyan' : 'text-brand-light'
                }`}
              >
                {product.label}
              </span>
            </button>
          )
        })}
      </div>

      {products.length === 0 && (
        <p className="text-[11px] leading-snug text-brand-muted">
          No hay prendas cargadas. Agregalas desde el panel de administración.
        </p>
      )}

      {layerCount > 0 && (
        <p className="mt-2 text-[11px] leading-snug text-brand-muted">
          Al cambiar de prenda el diseño se mantiene. Recalibrá la posición si hace falta.
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
