import { useCallback } from 'react'
import type { SiteContent } from '../../content/types'
import type { PanelProps } from './types'

type Update = PanelProps['update']

/**
 * Setter de una sección de nivel superior del contenido (`hero`, `catalog`, …).
 * Evita repetir `update((d) => ({ ...d, seccion: { ...d.seccion, ...patch } }))`
 * en cada panel.
 */
export function useSection<K extends keyof SiteContent>(update: Update, key: K) {
  return useCallback(
    (patch: Partial<SiteContent[K]>) =>
      update((current) => ({ ...current, [key]: { ...(current[key] as object), ...patch } })),
    [update, key],
  )
}

/**
 * Setter de un objeto anidado dentro de una sección (`contact.whatsapp`,
 * `hero.primary`, `nav.cta`, …).
 */
export function useSectionField<K extends keyof SiteContent, F extends keyof SiteContent[K]>(
  update: Update,
  key: K,
  field: F,
) {
  return useCallback(
    (patch: Partial<SiteContent[K][F]>) =>
      update((current) => ({
        ...current,
        [key]: {
          ...(current[key] as object),
          [field]: { ...(current[key][field] as object), ...patch },
        },
      })),
    [update, key, field],
  )
}
