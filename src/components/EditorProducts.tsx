import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useContent } from '../content/ContentProvider'
import type { CatalogItem } from '../content/types'
import { loadImage } from '../lib/images'
import {
  listDesigns,
  listLocalProducts,
  resolveDrawableSrc,
  saveLocalProducts,
} from '../lib/storage'
import type { ProductView } from '../types'

/** Prefijo para que una prenda del catálogo nunca pise una prenda del contenido. */
const localIdFor = (catalogId: string): string => `cat-${catalogId}`

/**
 * Cuántas fotos del catálogo puede tener el visitante al mismo tiempo. Más que
 * esto llena el selector y desarma el layout del editor; al pasarse se descarta
 * la primera que agregó.
 */
export const MAX_LOCAL_PRODUCTS = 2

type EditorProductsContextValue = {
  /** Prendas oficiales del editor + las que el visitante trajo desde el catálogo. */
  products: ProductView[]
  /** Prenda activa en el editor. Vacío si todavía no eligió ninguna. */
  selectedId: string
  /** Cuántas prendas del catálogo trajo el visitante (no cuenta las del admin). */
  localCount: number
  select: (productId: string) => void
  /** Suma una foto del catálogo como prenda editable y la deja seleccionada. */
  addFromCatalog: (item: CatalogItem) => Promise<ProductView>
}

const EditorProductsContext = createContext<EditorProductsContextValue | null>(null)

export function EditorProductsProvider({ children }: { children: ReactNode }) {
  const { content } = useContent()
  const [localProducts, setLocalProducts] = useState<ProductView[]>(() =>
    listLocalProducts().slice(-MAX_LOCAL_PRODUCTS),
  )
  const [selectedId, setSelectedId] = useState(() => {
    const autosave = listDesigns().find((design) => design.id === 'autosave')
    return autosave && autosave.layers.length > 0 ? autosave.productId : ''
  })

  const products = useMemo(
    () => [...content.editor.products, ...localProducts],
    [content.editor.products, localProducts],
  )

  const select = useCallback((productId: string) => setSelectedId(productId), [])

  const addFromCatalog = useCallback(
    async (item: CatalogItem): Promise<ProductView> => {
      // Leemos lo persistido en vez de cerrar sobre el estado: dos altas encadenadas
      // no se pisan y la lista siempre respeta el tope.
      const stored = listLocalProducts().slice(-MAX_LOCAL_PRODUCTS)
      const existing = stored.find((product) => product.id === localIdFor(item.id))
      if (existing) {
        setSelectedId(existing.id)
        return existing
      }

      const url = await resolveDrawableSrc(item.src)
      const image = await loadImage(url)
      if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        throw new Error('No se pudieron leer las medidas de la prenda.')
      }

      const product: ProductView = {
        id: localIdFor(item.id),
        slug: item.id,
        label: item.label,
        src: item.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
      }

      const next = [...stored, product].slice(-MAX_LOCAL_PRODUCTS)
      saveLocalProducts(next)
      setLocalProducts(next)
      setSelectedId(product.id)
      return product
    },
    [],
  )

  const value = useMemo(
    () => ({
      products,
      selectedId,
      localCount: localProducts.length,
      select,
      addFromCatalog,
    }),
    [products, selectedId, localProducts.length, select, addFromCatalog],
  )

  return <EditorProductsContext.Provider value={value}>{children}</EditorProductsContext.Provider>
}

export function useEditorProducts(): EditorProductsContextValue {
  const value = useContext(EditorProductsContext)
  if (!value) throw new Error('useEditorProducts debe usarse dentro de <EditorProductsProvider>.')
  return value
}
