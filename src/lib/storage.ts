/**
 * Persistencia del lado del cliente.
 *
 * El DOC DE DISENO va a localStorage porque es chico (solo numeros y strings).
 * Los BINARIOS de los logos van a IndexedDB porque un logo en data URL revienta
 * el quota de ~5 MB de localStorage al primer uso.
 *
 * REGLA IMPORTANTE: el campo `src` de una capa de imagen es SIEMPRE una clave
 * persistente (`trama:blob:<id>`), nunca una object URL. Las object URLs mueren
 * al recargar la pagina y un diseño guardado dejaria de abrir. El paso a object
 * URL se hace en el momento de dibujar, con un cache.
 */
import { del, get, keys, set } from 'idb-keyval'
import type { Design, ProductView } from '../types'
import { collectStoredBlobRefs, isBlobRef } from './blobReferences'
import { BLOB_PREFIX, STORAGE_KEYS } from './storage-keys'

const DESIGNS_KEY = STORAGE_KEYS.designs

export { isBlobRef }

function readDesigns(): Design[] {
  try {
    const raw = localStorage.getItem(DESIGNS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Design[]) : []
  } catch {
    return []
  }
}

function writeDesigns(designs: Design[]): void {
  try {
    localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs))
  } catch (error) {
    console.warn('No se pudieron guardar los diseños:', error)
  }
}

export function listDesigns(): Design[] {
  return readDesigns().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function saveDesign(design: Design): void {
  const designs = readDesigns().filter((item) => item.id !== design.id)
  designs.push({ ...design, updatedAt: Date.now() })
  writeDesigns(designs)
}

export function deleteDesign(id: string): void {
  writeDesigns(readDesigns().filter((item) => item.id !== id))
}

/**
 * Prendas que el visitante trajo desde el catálogo para editarlas.
 *
 * Van aparte del contenido porque el contenido es de TODOS: esto vive sólo en
 * el navegador de quien lo pidió. Se persisten igual para que un diseño
 * autoguardado sobre esa prenda no pierda su `productId` al recargar.
 */
export function listLocalProducts(): ProductView[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.localProducts)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ProductView[]) : []
  } catch {
    return []
  }
}

export function saveLocalProducts(products: ProductView[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.localProducts, JSON.stringify(products))
  } catch (error) {
    console.warn('No se pudieron guardar las prendas locales:', error)
  }
}

// --- Binarios ---

export async function putLogoBlob(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await set(id, blob)
  return `${BLOB_PREFIX}${id}`
}

const objectUrlCache = new Map<string, string>()

/** Convierte una clave persistente en una object URL, con cache. */
export async function resolveDrawableSrc(src: string): Promise<string> {
  if (!isBlobRef(src)) return src

  const cached = objectUrlCache.get(src)
  if (cached) return cached

  const blob = await get<Blob>(src.slice(BLOB_PREFIX.length))
  if (!(blob instanceof Blob)) return src

  const url = URL.createObjectURL(blob)
  objectUrlCache.set(src, url)
  return url
}

/** Borra un blob y libera su object URL del cache. */
export async function deleteBlobRef(src: string): Promise<void> {
  if (!isBlobRef(src)) return

  const cached = objectUrlCache.get(src)
  if (cached) {
    URL.revokeObjectURL(cached)
    objectUrlCache.delete(src)
  }
  await del(src.slice(BLOB_PREFIX.length))
}

async function listBlobIds(): Promise<string[]> {
  const all = await keys()
  return all.filter((key): key is string => typeof key === 'string')
}

/**
 * Borra de IndexedDB todo blob que no esté en `referenced`. Devuelve las claves
 * (`trama:blob:<id>`) que se borraron.
 */
export async function pruneOrphanBlobs(referenced: Set<string>): Promise<string[]> {
  const removed: string[] = []
  for (const id of await listBlobIds()) {
    const ref = `${BLOB_PREFIX}${id}`
    if (referenced.has(ref)) continue
    await deleteBlobRef(ref)
    removed.push(ref)
  }
  return removed
}

/**
 * Recolector de basura de imágenes: compara los blobs guardados contra lo que
 * referencian el contenido y los diseños PERSISTIDOS, y borra el resto. Llamar
 * sólo con el estado ya guardado (no con un draft sin guardar en memoria).
 */
export async function cleanupBlobs(): Promise<string[]> {
  return pruneOrphanBlobs(collectStoredBlobRefs())
}
