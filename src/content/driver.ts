import type { MediaRef, SiteContent } from './types'

/**
 * Contrato de persistencia del sitio. Hay dos implementaciones: local-first
 * (`drivers/local.ts`, localStorage + IndexedDB) y Supabase
 * (`drivers/supabase.ts`, tabla + Storage). `store.ts` elige segun el entorno.
 *
 * Las imagenes del editor (diseños del visitante) no pasan por aca: siguen
 * siendo locales, en IndexedDB.
 */
export type ContentDriver = {
  /** Valor crudo guardado, o `null` si todavia no hay nada. */
  readContent(): Promise<unknown>
  writeContent(content: SiteContent): Promise<void>
  clearContent(): Promise<void>
  uploadMedia(file: Blob): Promise<MediaRef>
  removeMedia(ref: MediaRef): Promise<void>
  resolveMediaSrc(ref: MediaRef): Promise<string>
  /** Borra las imagenes sin referencias y devuelve las claves borradas. */
  cleanupMedia(): Promise<string[]>
}
