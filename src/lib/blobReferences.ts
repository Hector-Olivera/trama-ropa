import { BLOB_PREFIX, STORAGE_KEYS } from './storage-keys'

export function isBlobRef(value: string): boolean {
  return value.startsWith(BLOB_PREFIX)
}

/**
 * Recorre cualquier estructura JSON (contenido, diseños) y junta las claves de
 * blob (`trama:blob:<id>`) que aparecen como string. Es la fuente de verdad de
 * "qué imágenes siguen en uso".
 */
export function collectBlobRefs(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    if (isBlobRef(value)) into.add(value)
    return into
  }
  if (Array.isArray(value)) {
    for (const item of value) collectBlobRefs(item, into)
    return into
  }
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) collectBlobRefs(item, into)
  }
  return into
}

function parseStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

/**
 * Blobs referenciados por lo que está PERSISTIDO (contenido guardado + diseños
 * guardados). Debe usarse sólo cuando no hay un draft sin guardar en curso.
 */
export function collectStoredBlobRefs(): Set<string> {
  const refs = collectBlobRefs(parseStored(STORAGE_KEYS.content))
  collectBlobRefs(parseStored(STORAGE_KEYS.designs), refs)
  return refs
}
