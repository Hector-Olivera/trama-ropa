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
const CATALOG_PREFIX = 'cat-'
const localIdFor = (catalogId: string): string => `${CATALOG_PREFIX}${catalogId}`
const catalogIdFrom = (productId: string): string | null =>
  productId.startsWith(CATALOG_PREFIX) ? productId.slice(CATALOG_PREFIX.length) : null

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
  localProducts: ProductView[]
  /** Diseño guardado que se está editando; se suelta al cambiar de prenda. */
  activeDesignId: string | null
  setActiveDesignId: (designId: string | null) => void
  select: (productId: string) => void
  /** Suma una foto del catálogo como prenda editable y la deja seleccionada. */
  addFromCatalog: (item: CatalogItem) => Promise<ProductView>
  /**
   * Selecciona una prenda por id. Si ya no está en la lista (el tope la
   * descartó, o la versión guardada es vieja), la reconstruye desde el
   * catálogo. Devuelve `false` si ya no existe en ningún lado.
   */
  selectById: (productId: string) => Promise<boolean>
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
  const [activeDesignId, setActiveDesignId] = useState<string | null>(null)

  const products = useMemo(
    () => [...content.editor.products, ...localProducts],
    [content.editor.products, localProducts],
  )

  const select = useCallback(
    (productId: string) => {
      if (productId !== selectedId) setActiveDesignId(null)
      setSelectedId(productId)
    },
    [selectedId],
  )

  const addProduct = useCallback(
    async (item: CatalogItem, clearActive: boolean): Promise<ProductView> => {
      // Leemos lo persistido en vez de cerrar sobre el estado: dos altas encadenadas
      // no se pisan y la lista siempre respeta el tope.
      const stored = listLocalProducts().slice(-MAX_LOCAL_PRODUCTS)
      const existing = stored.find((product) => product.id === localIdFor(item.id))
      if (existing) {
        if (clearActive && existing.id !== selectedId) setActiveDesignId(null)
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
      if (clearActive) setActiveDesignId(null)
      setSelectedId(product.id)
      return product
    },
    [selectedId],
  )

  const addFromCatalog = useCallback(
    (item: CatalogItem) => addProduct(item, true),
    [addProduct],
  )

  const selectById = useCallback(
    async (productId: string): Promise<boolean> => {
      if (products.some((product) => product.id === productId)) {
        setSelectedId(productId)
        return true
      }

      const catalogId = catalogIdFrom(productId)
      const item = catalogId
        ? content.catalog.items.find((candidate) => candidate.id === catalogId)
        : undefined
      if (!item) return false

      try {
        await addProduct(item, false)
        return true
      } catch (error) {
        console.error('No se pudo restaurar la prenda del diseño:', error)
        return false
      }
    },
    [addProduct, content.catalog.items, products],
  )

  const value = useMemo(
    () => ({
      products,
      selectedId,
      localCount: localProducts.length,
      localProducts,
      activeDesignId,
      setActiveDesignId,
      select,
      addFromCatalog,
      selectById,
    }),
    [
      products,
      selectedId,
      localProducts,
      activeDesignId,
      select,
      addFromCatalog,
      selectById,
    ],
  )

  return <EditorProductsContext.Provider value={value}>{children}</EditorProductsContext.Provider>
}

export function useEditorProducts(): EditorProductsContextValue {
  const value = useContext(EditorProductsContext)
  if (!value) throw new Error('useEditorProducts debe usarse dentro de <EditorProductsProvider>.')
  return value
}
