/**
 * Acceso al contenido editable.
 *
 * Hoy guarda en localStorage (contenido) e IndexedDB (imagenes via storage.ts),
 * que es local-first: no necesita backend.
 *
 * MIGRACION A SUPABASE: este es el UNICO modulo a reemplazar. `loadContent`,
 * `saveContent`, `uploadMedia` y `removeMedia` mantienen la misma firma; el
 * ContentProvider y el dashboard no se tocan. El contenido pasaria a una tabla
 * `site_content` (una fila, jsonb) y las imagenes al bucket `media`.
 */
import { STORAGE_KEYS } from '../lib/storage-keys'
import { deleteBlobRef, isBlobRef, putLogoBlob, resolveDrawableSrc } from '../lib/storage'
import { DEFAULT_CONTENT } from './defaults'
import type { MediaRef, SiteContent } from './types'

const CONTENT_KEY = STORAGE_KEYS.content

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Mergea el contenido guardado sobre los defaults. Los OBJETOS se combinan
 * campo a campo (asi un contenido viejo igual recibe los campos nuevos) y los
 * ARRAYS se reemplazan enteros (asi borrar una imagen o un item realmente
 * borra, en vez de resucitar el default).
 */
function mergeContent<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T
  }

  const result: Record<string, unknown> = { ...base }
  for (const key of Object.keys(override)) {
    result[key] = mergeContent(base[key], override[key])
  }
  return result as T
}

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY)
    if (!raw) return DEFAULT_CONTENT
    return mergeContent(DEFAULT_CONTENT, JSON.parse(raw))
  } catch (error) {
    console.warn('No se pudo leer el contenido, uso los defaults:', error)
    return DEFAULT_CONTENT
  }
}

export function saveContent(content: SiteContent): void {
  try {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content))
  } catch (error) {
    console.warn('No se pudo guardar el contenido:', error)
    throw new Error('No se pudo guardar. Puede que el almacenamiento esté lleno.', {
      cause: error,
    })
  }
}

export function resetContent(): void {
  localStorage.removeItem(CONTENT_KEY)
}

export async function uploadMedia(file: Blob): Promise<MediaRef> {
  return putLogoBlob(file)
}

export async function removeMedia(ref: MediaRef): Promise<void> {
  await deleteBlobRef(ref)
}

export { isBlobRef, resolveDrawableSrc as resolveMediaSrc }
