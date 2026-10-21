// @vitest-environment jsdom
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Catalog } from './Catalog'
import { ContentProvider } from '../content/ContentProvider'
import { EditorProductsProvider, useEditorProducts } from './EditorProducts'

vi.mock('../lib/images', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/images')>()
  return {
    ...actual,
    loadImage: vi.fn(async () => ({ naturalWidth: 800, naturalHeight: 1200 }) as unknown as HTMLImageElement),
  }
})

const scrollIntoView = vi.fn()

beforeAll(() => {
  Element.prototype.scrollIntoView = scrollIntoView
})

afterAll(() => {
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
})

afterEach(() => {
  cleanup()
  scrollIntoView.mockClear()
  localStorage.clear()
})

function Probe() {
  const { products, selectedId } = useEditorProducts()
  return (
    <>
      <span data-testid="count">{products.length}</span>
      <span data-testid="selected">{selectedId}</span>
    </>
  )
}

function renderCatalog() {
  return render(
    <ContentProvider>
      <EditorProductsProvider>
        <Catalog />
        <Probe />
        <section id="editor" />
      </EditorProductsProvider>
    </ContentProvider>,
  )
}

function firstCard(container: HTMLElement): HTMLButtonElement {
  const card = container.querySelector<HTMLButtonElement>('button[aria-expanded]')
  if (!card) throw new Error('No hay prendas en el catálogo.')
  return card
}

describe('Catalog', () => {
  it('despliega el botón "Llevar al editor" al elegir una prenda', async () => {
    const { container } = renderCatalog()

    await screen.findByRole('button', { name: 'Todas' })
    expect(screen.queryByRole('button', { name: 'Llevar al editor' })).toBeNull()

    fireEvent.click(firstCard(container))

    expect(await screen.findByRole('button', { name: 'Llevar al editor' })).toBeTruthy()
  })

  it('agrega la prenda al editor, la selecciona y scrollea hasta el editor', async () => {
    const { container } = renderCatalog()

    await screen.findByRole('button', { name: 'Todas' })
    expect(screen.getByTestId('count').textContent).toBe('4')

    fireEvent.click(firstCard(container))
    fireEvent.click(await screen.findByRole('button', { name: 'Llevar al editor' }))

    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('5'))
    expect(screen.getByTestId('selected').textContent).toBe('cat-calza-oxford-01')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(screen.queryByRole('button', { name: 'Llevar al editor' })).toBeNull()
  })

  it('si la prenda ya estaba en el editor, sólo la vuelve a seleccionar', async () => {
    const { container } = renderCatalog()

    await screen.findByRole('button', { name: 'Todas' })
    fireEvent.click(firstCard(container))
    fireEvent.click(await screen.findByRole('button', { name: 'Llevar al editor' }))
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('5'))

    const card = firstCard(container)
    fireEvent.click(card)
    fireEvent.click(await screen.findByRole('button', { name: 'Llevar al editor' }))

    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('count').textContent).toBe('5')
    expect(screen.getByTestId('selected').textContent).toBe('cat-calza-oxford-01')
  })
})
