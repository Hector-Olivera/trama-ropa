// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentProvider, useContent } from '../content/ContentProvider'
import { STORAGE_KEYS } from '../lib/storage-keys'
import type { ProductView } from '../types'
import {
  EditorProductsProvider,
  MAX_LOCAL_PRODUCTS,
  useEditorProducts,
} from './EditorProducts'

vi.mock('../lib/images', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/images')>()
  return {
    ...actual,
    loadImage: vi.fn(
      async () => ({ naturalWidth: 800, naturalHeight: 1200 }) as unknown as HTMLImageElement,
    ),
  }
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function Probe() {
  const { content } = useContent()
  const { products, selectedId, localCount, addFromCatalog } = useEditorProducts()
  return (
    <div>
      <span data-testid="ids">{products.map((product) => product.id).join(',')}</span>
      <span data-testid="selected">{selectedId}</span>
      <span data-testid="local-count">{localCount}</span>
      {content.catalog.items.map((item) => (
        <button key={item.id} type="button" onClick={() => void addFromCatalog(item)}>
          Agregar {item.id}
        </button>
      ))}
    </div>
  )
}

function renderProvider() {
  return render(
    <ContentProvider>
      <EditorProductsProvider>
        <Probe />
      </EditorProductsProvider>
    </ContentProvider>,
  )
}

function storedProduct(id: string): ProductView {
  return {
    id,
    slug: id,
    label: id,
    src: `/gallery/${id}.jpg`,
    width: 800,
    height: 1200,
  }
}

async function addItem(id: string) {
  fireEvent.click(screen.getByRole('button', { name: `Agregar ${id}` }))
  await waitFor(() => expect(screen.getByTestId('ids').textContent).toContain(`cat-${id}`))
}

describe('EditorProducts', () => {
  it('no acumula más de 2 fotos del catálogo y descarta la primera', async () => {
    renderProvider()
    await screen.findByRole('button', { name: 'Agregar calza-oxford-01' })

    await addItem('calza-oxford-01')
    await addItem('calza-oxford-02')
    await addItem('calza-oxford-03')

    await waitFor(() =>
      expect(screen.getByTestId('local-count').textContent).toBe(String(MAX_LOCAL_PRODUCTS)),
    )

    const ids = screen.getByTestId('ids').textContent?.split(',') ?? []
    expect(ids.filter((id) => id.startsWith('cat-'))).toHaveLength(MAX_LOCAL_PRODUCTS)
    expect(ids).not.toContain('cat-calza-oxford-01')
    expect(ids).toContain('cat-calza-oxford-02')
    expect(ids).toContain('cat-calza-oxford-03')
    expect(screen.getByTestId('selected').textContent).toBe('cat-calza-oxford-03')
  })

  it('recorta las prendas guardadas que ya se pasaron del tope', async () => {
    localStorage.setItem(
      STORAGE_KEYS.localProducts,
      JSON.stringify([
        storedProduct('cat-vieja-1'),
        storedProduct('cat-vieja-2'),
        storedProduct('cat-vieja-3'),
      ]),
    )

    renderProvider()
    await screen.findByRole('button', { name: 'Agregar calza-oxford-01' })

    const ids = screen.getByTestId('ids').textContent?.split(',') ?? []
    expect(ids.filter((id) => id.startsWith('cat-'))).toHaveLength(MAX_LOCAL_PRODUCTS)
    expect(ids).not.toContain('cat-vieja-1')
    expect(ids).toContain('cat-vieja-2')
    expect(ids).toContain('cat-vieja-3')
  })
})
