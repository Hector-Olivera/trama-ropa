import type { ProductView } from '../types'

/**
 * Prendas base por defecto del editor. Son las 4 remeras optimizadas por
 * scripts/optimize-assets.mjs.
 *
 * El dashboard puede agregar, editar y borrar prendas: esas viven en el
 * contenido (ver src/content/). Esta lista es solo el punto de partida.
 */
export const DEFAULT_PRODUCTS: ProductView[] = [
  {
    id: 'remera-blanca-frente',
    slug: 'remera-blanca-frente',
    label: 'Remera Blanca · Frente',
    src: '/products/remera-blanca-frente.png',
    width: 1024,
    height: 1536,
  },
  {
    id: 'remera-negra-frente',
    slug: 'remera-negra-frente',
    label: 'Remera Negra · Frente',
    src: '/products/remera-negra-frente.png',
    width: 1024,
    height: 1229,
  },
  {
    id: 'remera-blanca-dorso',
    slug: 'remera-blanca-dorso',
    label: 'Remera Blanca · Dorso',
    src: '/products/remera-blanca-dorso.png',
    width: 1024,
    height: 1092,
  },
  {
    id: 'remera-negra-dorso',
    slug: 'remera-negra-dorso',
    label: 'Remera Negra · Dorso',
    src: '/products/remera-negra-dorso.png',
    width: 1024,
    height: 1092,
  },
]
