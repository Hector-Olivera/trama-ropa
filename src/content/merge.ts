import { newId } from '../lib/id'
import type { SiteContent } from './types'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Mergea el contenido guardado sobre los defaults. Los OBJETOS se combinan
 * campo a campo (asi un contenido viejo igual recibe los campos nuevos) y los
 * ARRAYS se reemplazan enteros (asi borrar una imagen o un item realmente
 * borra, en vez de resucitar el default).
 */
export function mergeContent<T>(base: T, override: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override === undefined ? base : override) as T
  }

  const result: Record<string, unknown> = { ...base }
  for (const key of Object.keys(override)) {
    result[key] = mergeContent(base[key], override[key])
  }
  return result as T
}

/**
 * Asegura que cada item de las listas editables tenga un `id` estable. Es una
 * migracion para contenido guardado antes de que existieran los ids (y para
 * cualquier item que llegue sin ellos): React los usa como key y el backend
 * los usara como PK.
 */
export function withItemIds<T extends { id?: string }>(items: T[]): T[] {
  return items.map((item) => (item.id ? item : { ...item, id: newId() }))
}

export function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    nav: { ...content.nav, links: withItemIds(content.nav.links) },
    hero: {
      ...content.hero,
      titleLines: withItemIds(content.hero.titleLines),
      stats: withItemIds(content.hero.stats),
    },
    howItWorks: {
      ...content.howItWorks,
      steps: withItemIds(content.howItWorks.steps),
      features: withItemIds(content.howItWorks.features),
    },
    footer: { ...content.footer, links: withItemIds(content.footer.links) },
  }
}
