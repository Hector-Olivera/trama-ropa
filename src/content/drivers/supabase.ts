import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentDriver } from '../driver'
import type { MediaRef, SiteContent } from '../types'

/** Tabla de una sola fila (id = 1) con el contenido como jsonb. */
const TABLE = 'site_content'
const ROW_ID = 1
/** Bucket público de imágenes del contenido. */
const BUCKET = 'media'
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`

function extensionFor(blob: Blob): string {
  switch (blob.type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    default:
      return 'png'
  }
}

/**
 * Saca la ruta interna (path dentro del bucket) de una URL pública de Storage.
 * Devuelve `null` si la URL no pertenece a este bucket (ej. un asset de public/).
 */
export function storagePathFromPublicUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_MARKER)
  if (index === -1) return null
  const path = url.slice(index + PUBLIC_MARKER.length)
  return path.length > 0 ? decodeURIComponent(path) : null
}

/** Junta las rutas de Storage referenciadas por una estructura JSON (contenido). */
export function collectStoragePaths(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (typeof value === 'string') {
    const path = storagePathFromPublicUrl(value)
    if (path) into.add(path)
    return into
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStoragePaths(item, into)
    return into
  }
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value)) collectStoragePaths(item, into)
  }
  return into
}

export function createSupabaseDriver(client: SupabaseClient): ContentDriver {
  async function readContent(): Promise<unknown> {
    const { data, error } = await client
      .from(TABLE)
      .select('content')
      .eq('id', ROW_ID)
      .maybeSingle()
    if (error) throw error
    return data ? (data.content as unknown) : null
  }

  return {
    readContent,

    async writeContent(content: SiteContent) {
      const { error } = await client
        .from(TABLE)
        .upsert({ id: ROW_ID, content, updated_at: new Date().toISOString() })
      if (error) throw error
    },

    async clearContent() {
      const { error } = await client.from(TABLE).delete().eq('id', ROW_ID)
      if (error) throw error
    },

    async uploadMedia(file) {
      const path = `${crypto.randomUUID()}.${extensionFor(file)}`
      const { error } = await client.storage.from(BUCKET).upload(path, file, {
        contentType: file.type || 'image/png',
        upsert: false,
      })
      if (error) throw error
      return client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    },

    async removeMedia(ref) {
      const path = storagePathFromPublicUrl(ref)
      if (!path) return
      const { error } = await client.storage.from(BUCKET).remove([path])
      if (error) throw error
    },

    async resolveMediaSrc(ref: MediaRef) {
      return ref
    },

    async cleanupMedia() {
      const { data: objects, error } = await client.storage.from(BUCKET).list('', { limit: 1000 })
      if (error) throw error

      const referenced = collectStoragePaths(await readContent())
      const orphans = (objects ?? [])
        .map((object) => object.name)
        .filter((name) => !referenced.has(name))

      if (orphans.length === 0) return []
      const { error: removeError } = await client.storage.from(BUCKET).remove(orphans)
      if (removeError) throw removeError
      return orphans
    },
  }
}
