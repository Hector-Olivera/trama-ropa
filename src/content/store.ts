/**
 * Acceso al contenido editable: el UNICO modulo que conoce el backend.
 *
 * Elige el driver segun el entorno: Supabase si hay credenciales
 * (`isSupabaseConfigured()`), si no local-first (localStorage + IndexedDB). El
 * ContentProvider y el dashboard no se enteran de cual esta activo.
 *
 * API (mantener estable): `loadContent` / `saveContent` / `resetContent` /
 * `uploadMedia` / `removeMedia` / `resolveMediaSrc` / `cleanupMedia` / `isBlobRef`.
 */
import { isBlobRef } from '../lib/blobReferences'
import { isSupabaseConfigured } from '../lib/env'
import { getSupabaseClient } from '../lib/supabase'
import type { ContentDriver } from './driver'
import { localDriver } from './drivers/local'
import { createSupabaseDriver } from './drivers/supabase'
import { DEFAULT_CONTENT } from './defaults'
import { mergeContent, normalizeContent } from './merge'
import type { MediaRef, SiteContent } from './types'

async function activeDriver(): Promise<ContentDriver> {
  if (isSupabaseConfigured()) {
    const client = await getSupabaseClient()
    if (client) return createSupabaseDriver(client)
  }
  return localDriver
}

export async function loadContent(): Promise<SiteContent> {
  try {
    const raw = await (await activeDriver()).readContent()
    if (raw == null) return DEFAULT_CONTENT
    return normalizeContent(mergeContent(DEFAULT_CONTENT, raw))
  } catch (error) {
    console.warn('No se pudo leer el contenido, uso los defaults:', error)
    return DEFAULT_CONTENT
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  await (await activeDriver()).writeContent(content)
}

export async function resetContent(): Promise<void> {
  await (await activeDriver()).clearContent()
}

export async function uploadMedia(file: Blob): Promise<MediaRef> {
  return (await activeDriver()).uploadMedia(file)
}

export async function removeMedia(ref: MediaRef): Promise<void> {
  await (await activeDriver()).removeMedia(ref)
}

export async function resolveMediaSrc(ref: MediaRef): Promise<string> {
  return (await activeDriver()).resolveMediaSrc(ref)
}

/** Recolector de basura de imagenes: correr sólo con el estado ya guardado. */
export async function cleanupMedia(): Promise<string[]> {
  return (await activeDriver()).cleanupMedia()
}

export { isBlobRef }
