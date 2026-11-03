// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { ProductPicker } from './ProductPicker'
import type { ProductView } from '../../types'

const PRODUCTS: ProductView[] = [
  { id: 'p1', slug: 'remera', label: 'Remera', src: '/assets/remera.png', width: 100, height: 100 },
  { id: 'p2', slug: 'polar', label: 'Polar', src: '/assets/polar.png', width: 100, height: 100 },
  { id: 'p3', slug: 'short', label: 'Short', src: '/assets/short.png', width: 100, height: 100 },
]

type Props = ComponentProps<typeof ProductPicker>

function renderPicker(overrides: Partial<Props> = {}) {
  const props: Props = {
    products: PRODUCTS,
    productId: 'p1',
    onChange: vi.fn(),
    layerCount: 0,
    localCount: 0,
    userAddedIds: ['p2'],
    ...overrides,
  }
  return render(<ProductPicker {...props} />)
}

function stripOf(container: HTMLElement): HTMLElement {
  const strip = container.querySelector<HTMLElement>('.trama-strip')
  if (!strip) throw new Error('No se encontró el carrusel de prendas.')
  return strip
}

function gridOf(container: HTMLElement): HTMLElement {
  const grid = stripOf(container).parentElement?.nextElementSibling
  if (!(grid instanceof HTMLElement)) throw new Error('No se encontró la grilla de prendas.')
  return grid
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
  it('muestra el carrusel en orden inverso y la grilla en orden original', () => {
    const { container } = renderPicker()

    const stripLabels = [...stripOf(container).querySelectorAll('button')].map(
      (button) => button.textContent,
    )
    expect(stripLabels).toEqual(['Short', 'Polar', 'Remera'])

    const gridLabels = [...gridOf(container).querySelectorAll('button')].map(
      (button) => button.textContent,
    )
    expect(gridLabels).toEqual(['Remera', 'Polar', 'Short'])
  })

  it('deja el carrusel sólo en mobile y la grilla en desktop', () => {
    const { container } = renderPicker()

    const wrapper = stripOf(container).parentElement
    expect(wrapper?.className.split(' ')).toContain('lg:hidden')
    expect(gridOf(container).className.split(' ')).toContain('hidden')
    expect(gridOf(container).className.split(' ')).toContain('lg:grid')
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
