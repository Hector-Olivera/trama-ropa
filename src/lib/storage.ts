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
import { del, get, set } from 'idb-keyval'
import type { Design } from '../types'
import { BLOB_PREFIX } from './storage-keys'

const DESIGNS_KEY = 'trama:designs'

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
  const designs = readDesigns()
  const design = designs.find((item) => item.id === id)

  // Los blobs solo se borran si ningun otro diseño los referencia.
  const blobIdsInUse = new Set(
    designs
      .filter((item) => item.id !== id)
      .flatMap((item) =>
        item.layers
          .filter((layer) => layer.type === 'image' && layer.src.startsWith(BLOB_PREFIX))
          .map((layer) => (layer.type === 'image' ? layer.src : '')),
      )
      .filter(Boolean),
  )

  if (design) {
    for (const layer of design.layers) {
      if (layer.type !== 'image' || !layer.src.startsWith(BLOB_PREFIX)) continue
      const blobId = layer.src.slice(BLOB_PREFIX.length)
      if (!blobIdsInUse.has(layer.src)) {
        objectUrlCache.delete(layer.src)
        void del(blobId)
      }
    }
  }

  writeDesigns(designs.filter((item) => item.id !== id))
}

// --- Binarios ---

export function isBlobRef(src: string): boolean {
  return src.startsWith(BLOB_PREFIX)
}

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