import { DEFAULT_PRODUCTS } from '../data/products'
import type { MediaRef, SiteContent } from './types'

/**
 * Contenido por defecto: exactamente lo que hoy esta escrito en los
 * componentes. El store lo usa como base y el contenido guardado se mergea
 * encima, asi que un campo faltante o corrupto nunca deja la pagina en blanco.
 */

type GroupSeed = { id: string; label: string; count: number }

const CATALOG_GROUPS: GroupSeed[] = [
  { id: 'calza-oxford', label: 'Calza Oxford', count: 4 },
  { id: 'campera-negra', label: 'Campera Negra', count: 4 },
  { id: 'con-tiras-azulgris', label: 'Con Tiras Azul/Gris', count: 4 },
  { id: 'con-tiras-gris', label: 'Con Tiras Gris', count: 3 },
  { id: 'con-tiras-negra', label: 'Con Tiras Negra', count: 2 },
  { id: 'polar-cierre', label: 'Polar con Cierre', count: 3 },
]

const gallerySrc = (slug: string, index: number): MediaRef =>
  `/gallery/${slug}-${String(index + 1).padStart(2, '0')}.jpg`

const CATALOG_ITEMS = CATALOG_GROUPS.flatMap((group) =>
  Array.from({ length: group.count }, (_, i) => ({
    id: `${group.id}-${String(i + 1).padStart(2, '0')}`,
    group: group.id,
    label: group.label,
    src: gallerySrc(group.id, i),
  })),
)

export const DEFAULT_CONTENT: SiteContent = {
  version: 1,

  brand: {
    name: 'Trama',
    mark: '/brand/logo-mark.png',
  },

  nav: {
    links: [
      { href: '#editor', label: 'Editor' },
      { href: '#catalogo', label: 'Catálogo' },
      { href: '#como-funciona', label: 'Cómo funciona' },
      { href: '#contacto', label: 'Contacto' },
    ],
    cta: { label: 'Personalizar', href: '#editor' },
  },

  hero: {
    eyebrow: 'Ropa deportiva personalizada',
    titleLines: [
      { text: 'Tu Logo' },
      { text: 'Tu Marca', highlight: true },
      { text: 'Tu Ropa Deportiva' },
    ],
    subtitle:
      'Personalizá remeras, polares y ropa deportiva con tu logo. Elegí la prenda, subí tu diseño y descargalo listo para estampar. Sin designing, sin vueltas.',
    primary: { label: 'Probar el editor', href: '#editor' },
    secondary: { label: 'Consultar por mi equipo', href: '#contacto' },
    stats: [
      { value: '5', label: 'unidades mínimo' },
      { value: '-15%', label: 'a mayor cantidad' },
      { value: '24h', label: 'para llevar tu archivo' },
    ],
    images: [
      gallerySrc('calza-oxford', 0),
      gallerySrc('calza-oxford', 1),
      gallerySrc('calza-oxford', 2),
      gallerySrc('calza-oxford', 3),
    ],
  },

  editor: {
    eyebrow: 'Personalizá tu prenda',
    title: { before: 'Poné', highlight: 'tu logo', after: 'acá' },
    subtitle:
      'Elegí la prenda, subí tu diseño y descargalo listo para estampar. Podés agregar varios logos, textos y ajustar el color.',
    products: DEFAULT_PRODUCTS,
  },

  catalog: {
    eyebrow: 'Catálogo',
    title: { before: 'Prendas que', highlight: 'aguantan' },
    groups: CATALOG_GROUPS.map(({ id, label }) => ({ id, label })),
    items: CATALOG_ITEMS,
  },

  howItWorks: {
    eyebrow: 'Cómo funciona',
    title: { before: 'Tres pasos y', highlight: 'listo' },
    steps: [
      {
        title: 'Elegís la prenda',
        body: 'Remera, polar, campera o calza. Ves la prenda sobre la que vas a estampar.',
      },
      {
        title: 'Subís tu logo',
        body: 'PNG, JPG o WEBP. Lo ajustás de tamaño, posición, rotación y color al toque.',
      },
      {
        title: 'Lo descargás',
        body: 'PNG en alta resolución o JPG con fondo blanco. Se lo mandás a quien te estampa.',
      },
    ],
    features: [
      { title: 'Calidad garantizada', body: 'Bordado y sublimación sobre prendas que bancan el lavado.' },
      { title: 'Diseños personalizados', body: 'Tu logo, tu identidad. Sin mínimos de tirada.' },
      { title: 'Envíos a todo el país', body: 'Retiro en persona o te lo mandamos donde estés.' },
    ],
    images: [
      gallerySrc('con-tiras-azulgris', 0),
      gallerySrc('con-tiras-azulgris', 1),
      gallerySrc('con-tiras-azulgris', 2),
      gallerySrc('con-tiras-azulgris', 3),
    ],
  },

  contact: {
    eyebrow: 'Contacto',
    title: {
      before: 'Nos ponemos tu camiseta,',
      highlight: 'hacela con nosotros',
      breakBefore: true,
    },
    body: '¿Tenés un equipo, un gimnasio o un grupo? Contanos qué necesitás y te pasamos precios por volumen.',
    whatsapp: {
      label: 'WhatsApp',
      display: '+54 9 11 1234-5678',
      href: 'https://wa.me/54911123456789',
    },
    email: {
      label: 'Email',
      value: 'hola@tramaropa.com.ar',
      href: 'mailto:hola@tramaropa.com.ar',
    },
    formTitle: 'Pedí tu presupuesto',
    formNote: 'El formulario todavía no envía nada: conectalo a tu backend o a un servicio de mail.',
  },

  footer: {
    tagline: 'Tu Logo · Tu Marca · Tu Ropa Deportiva',
    links: [
      { href: '#inicio', label: 'Inicio' },
      { href: '#editor', label: 'Editor' },
      { href: '#contacto', label: 'Contacto' },
    ],
  },
}
