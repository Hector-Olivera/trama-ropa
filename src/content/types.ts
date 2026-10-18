/**
 * Modelo del contenido editable del sitio.
 *
 * Es DATA PLANO y es la unica fuente de verdad de lo que se ve en la pagina:
 * textos e imagenes de todas las secciones. Los componentes renderizan esto,
 * nunca strings hardcodeados.
 *
 * `MediaRef` es un string que puede ser:
 *  - un path de `public/` (los defaults, ej. "/gallery/calza-oxford-01.jpg"), o
 *  - una clave de blob subido por el dashboard ("trama:blob:<id>"), que se
 *    resuelve a una object URL con useResolvedImage().
 * Cuando migremos a Supabase sera directamente la URL publica del Storage.
 */
import type { ProductView } from '../types'

export type MediaRef = string

/** Titulo de seccion con una parte resaltada en color. */
export type RichTitle = {
  before: string
  highlight: string
  after?: string
  /** Fuerza un salto de linea antes de la parte resaltada. */
  breakBefore?: boolean
}

export type Cta = {
  label: string
  href: string
}

export type SiteContent = {
  version: number

  brand: {
    name: string
    mark: MediaRef
  }

  nav: {
    links: { id: string; href: string; label: string }[]
    cta: Cta
  }

  hero: {
    eyebrow: string
    /** Una entrada por linea del titulo; `highlight` marca la linea en cyan. */
    titleLines: { id: string; text: string; highlight?: boolean }[]
    subtitle: string
    primary: Cta
    secondary: Cta
    stats: { id: string; value: string; label: string }[]
    images: MediaRef[]
  }

  editor: {
    eyebrow: string
    title: RichTitle
    subtitle: string
    products: ProductView[]
  }

  catalog: {
    eyebrow: string
    title: RichTitle
    groups: { id: string; label: string }[]
    /** `group` referencia `catalog.groups[].id`; "todos" queda reservado. */
    items: { id: string; group: string; label: string; src: MediaRef }[]
  }

  howItWorks: {
    eyebrow: string
    title: RichTitle
    steps: { id: string; title: string; body: string }[]
    features: { id: string; title: string; body: string }[]
    images: MediaRef[]
  }

  contact: {
    eyebrow: string
    title: RichTitle
    body: string
    whatsapp: { label: string; display: string; href: string }
    email: { label: string; value: string; href: string }
    formTitle: string
    formNote: string
  }

  footer: {
    tagline: string
    links: { id: string; href: string; label: string }[]
  }
}
