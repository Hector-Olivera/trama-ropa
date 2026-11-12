// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { ProductPicker } from './ProductPicker'
import type { ProductView } from '../../types'

const LOCAL_A: ProductView = {
  id: 'cat-a',
  slug: 'buzo-a',
  label: 'Buzo A',
  src: '/assets/buzo-a.png',
  width: 100,
  height: 100,
}
const LOCAL_B: ProductView = {
  id: 'cat-b',
  slug: 'buzo-b',
  label: 'Buzo B',
  src: '/assets/buzo-b.png',
  width: 100,
  height: 100,
}

const DEFAULTS: ProductView[] = [
  { id: 'p1', slug: 'remera', label: 'Remera', src: '/assets/remera.png', width: 100, height: 100 },
  { id: 'p2', slug: 'polar', label: 'Polar', src: '/assets/polar.png', width: 100, height: 100 },
  { id: 'p3', slug: 'short', label: 'Short', src: '/assets/short.png', width: 100, height: 100 },
]

const PRODUCTS: ProductView[] = [...DEFAULTS, LOCAL_A, LOCAL_B]

type Props = ComponentProps<typeof ProductPicker>

function renderPicker(overrides: Partial<Props> = {}) {
  const props: Props = {
    products: PRODUCTS,
    productId: 'p1',
    onChange: vi.fn(),
    layerCount: 0,
    localCount: 0,
    userAddedIds: ['cat-a', 'cat-b'],
    ...overrides,
  }
  return render(<ProductPicker {...props} />)
}

function stripOf(container: HTMLElement): HTMLElement {
  const strip = container.querySelector<HTMLElement>('.trama-strip')
  if (!strip) throw new Error('No se encontró el carrusel de prendas.')
  return strip
}

function desktopOf(container: HTMLElement): HTMLElement {
  const desktop = stripOf(container).parentElement?.nextElementSibling
  if (!(desktop instanceof HTMLElement)) throw new Error('No se encontró la grilla de prendas.')
  return desktop
}

function labelsOf(root: HTMLElement): (string | null)[] {
  return [...root.querySelectorAll('button')].map((button) => button.textContent)
}

function stubStripMetrics(strip: HTMLElement, values: { client: number; scroll: number; left: number }) {
  Object.defineProperty(strip, 'clientWidth', { configurable: true, value: values.client })
  Object.defineProperty(strip, 'scrollWidth', { configurable: true, value: values.scroll })
  Object.defineProperty(strip, 'scrollLeft', {
    configurable: true,
    value: values.left,
    writable: true,
  })
}

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  Element.prototype.scrollTo = vi.fn()
  Element.prototype.scrollBy = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('ProductPicker', () => {
  it('muestra las agregadas primero (última subida primero) y las default en orden', () => {
    const { container } = renderPicker()

    const expected = ['Buzo B', 'Buzo A', 'Remera', 'Polar', 'Short']
    expect(labelsOf(stripOf(container))).toEqual(expected)
    expect(labelsOf(desktopOf(container))).toEqual(expected)
  })

  it('deja una sola agregada arriba y las default abajo en su orden', () => {
    const { container } = renderPicker({
      products: [...DEFAULTS, LOCAL_A],
      userAddedIds: ['cat-a'],
    })

    const expected = ['Buzo A', 'Remera', 'Polar', 'Short']
    expect(labelsOf(stripOf(container))).toEqual(expected)
    expect(labelsOf(desktopOf(container))).toEqual(expected)
  })

  it('deja el carrusel sólo en mobile y la grilla en desktop', () => {
    const { container } = renderPicker()

    const wrapper = stripOf(container).parentElement
    expect(wrapper?.className.split(' ')).toContain('lg:hidden')
    expect(desktopOf(container).className.split(' ')).toContain('hidden')
    expect(desktopOf(container).className.split(' ')).toContain('lg:block')
  })

  it('da el mismo ancho a todas las tarjetas y trunca el nombre', () => {
    const { container } = renderPicker()

    const cards = [
      ...stripOf(container).querySelectorAll('button'),
      ...desktopOf(container).querySelectorAll('button'),
    ]
    expect(cards).toHaveLength(10)
    for (const card of cards) {
      expect(card.className).toContain('w-full')
      expect(card.getAttribute('title')).toBeTruthy()
    }

    for (const label of stripOf(container).querySelectorAll('button > span')) {
      expect(label.className).toContain('truncate')
    }
  })

  it('lleva el scroll a la primera prenda que sumó el usuario', () => {
    renderPicker()

    expect(Element.prototype.scrollTo).toHaveBeenCalledTimes(1)
    expect(Element.prototype.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' })
  })

  it('no mueve el scroll si el usuario no sumó prendas', () => {
    renderPicker({ userAddedIds: [] })

    expect(Element.prototype.scrollTo).not.toHaveBeenCalled()
  })

  it('muestra la flecha derecha al inicio y cambia los extremos con el scroll', () => {
    const { container } = renderPicker()
    const strip = stripOf(container)
    stubStripMetrics(strip, { client: 300, scroll: 900, left: 0 })

    const left = screen.getByLabelText('Desplazar a la izquierda')
    const right = screen.getByLabelText('Desplazar a la derecha')

    fireEvent.scroll(strip)
    expect(left.className).toContain('opacity-0')
    expect(right.className).not.toContain('opacity-0')

    strip.scrollLeft = 600
    fireEvent.scroll(strip)
    expect(left.className).not.toContain('opacity-0')
    expect(right.className).toContain('opacity-0')
  })

  it('no muestra flechas si todo entra de un vistazo', () => {
    const { container } = renderPicker()
    const strip = stripOf(container)
    stubStripMetrics(strip, { client: 300, scroll: 300, left: 0 })

    fireEvent.scroll(strip)
    expect(screen.getByLabelText('Desplazar a la izquierda').className).toContain('opacity-0')
    expect(screen.getByLabelText('Desplazar a la derecha').className).toContain('opacity-0')
  })

  it('la flecha desplaza el carrusel un paso', () => {
    const { container } = renderPicker()
    const strip = stripOf(container)
    stubStripMetrics(strip, { client: 300, scroll: 900, left: 0 })
    fireEvent.scroll(strip)

    fireEvent.click(screen.getByLabelText('Desplazar a la derecha'))
    expect(Element.prototype.scrollBy).toHaveBeenCalledWith({ left: 120, behavior: 'smooth' })
  })
})
