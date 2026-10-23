// @vitest-environment jsdom
import { useState } from 'react'
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
  const { products, selectedId, localCount, addFromCatalog, selectById } = useEditorProducts()
  const [result, setResult] = useState('')

  const restore = async (productId: string) => {
    setResult(String(await selectById(productId)))
  }

  return (
    <div>
      <span data-testid="ids">{products.map((product) => product.id).join(',')}</span>
      <span data-testid="selected">{selectedId}</span>
      <span data-testid="local-count">{localCount}</span>
      <span data-testid="result">{result}</span>
      {content.catalog.items.map((item) => (
        <button key={item.id} type="button" onClick={() => void addFromCatalog(item)}>
          Agregar {item.id}
        </button>
      ))}
      {content.catalog.items.map((item) => (
        <button
          key={`restore-${item.id}`}
          type="button"
          onClick={() => void restore(`cat-${item.id}`)}
        >
          Restaurar {item.id}
        </button>
      ))}
      <button
        type="button"
        onClick={() => void restore(content.editor.products[0]?.id ?? '')}
      >
        Restaurar prenda del admin
      </button>
      <button type="button" onClick={() => void restore('cat-no-existe')}>
        Restaurar inexistente
      </button>
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

function catalogIds(): string[] {
  return (screen.getByTestId('ids').textContent?.split(',') ?? []).filter((id) =>
    id.startsWith('cat-'),
  )
}

async function addItem(id: string) {
  fireEvent.click(screen.getByRole('button', { name: `Agregar ${id}` }))
  await waitFor(() => expect(screen.getByTestId('ids').textContent).toContain(`cat-${id}`))
}

async function fillCatalog() {
  await screen.findByRole('button', { name: 'Agregar calza-oxford-01' })
  await addItem('calza-oxford-01')
  await addItem('calza-oxford-02')
  await addItem('calza-oxford-03')
  await waitFor(() =>
    expect(screen.getByTestId('local-count').textContent).toBe(String(MAX_LOCAL_PRODUCTS)),
  )
}

describe('EditorProducts', () => {
  it('no acumula más de 2 fotos del catálogo y descarta la primera', async () => {
    renderProvider()
    await fillCatalog()

    const ids = screen.getByTestId('ids').textContent?.split(',') ?? []
    expect(catalogIds()).toHaveLength(MAX_LOCAL_PRODUCTS)
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

    expect(catalogIds()).toEqual(['cat-vieja-2', 'cat-vieja-3'])
  })

  it('restaura una prenda del catálogo que el tope había descartado', async () => {
    renderProvider()
    await fillCatalog()
    expect(screen.getByTestId('ids').textContent).not.toContain('cat-calza-oxford-01')

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar calza-oxford-01' }))

    await waitFor(() =>
      expect(screen.getByTestId('selected').textContent).toBe('cat-calza-oxford-01'),
    )
    expect(screen.getByTestId('result').textContent).toBe('true')
    expect(catalogIds()).toEqual(['cat-calza-oxford-03', 'cat-calza-oxford-01'])

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEYS.localProducts) ?? '[]') as {
      id: string
    }[]
    expect(persisted.map((product) => product.id)).toEqual([
      'cat-calza-oxford-03',
      'cat-calza-oxford-01',
    ])
  })

  it('selecciona una prenda del admin sin tocar las del catálogo', async () => {
    renderProvider()
    await screen.findByRole('button', { name: 'Agregar calza-oxford-01' })

    const adminId = screen.getByTestId('ids').textContent?.split(',')[0] ?? ''

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar prenda del admin' }))

    await waitFor(() => expect(screen.getByTestId('selected').textContent).toBe(adminId))
    expect(screen.getByTestId('result').textContent).toBe('true')
    expect(screen.getByTestId('local-count').textContent).toBe('0')
  })

  it('devuelve false si la prenda ya no existe en ningún lado', async () => {
    renderProvider()
    await screen.findByRole('button', { name: 'Agregar calza-oxford-01' })

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar inexistente' }))

    await waitFor(() => expect(screen.getByTestId('result').textContent).toBe('false'))
    expect(screen.getByTestId('local-count').textContent).toBe('0')
  })
})
