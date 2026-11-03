// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { LayersPanel } from './LayersPanel'
import { DEFAULT_FILTERS } from '../../types'
import type { ImageLayer, Layer, TextLayer } from '../../types'

vi.mock('../../lib/storage', () => ({
  isBlobRef: (value: string) => value.startsWith('trama:blob:'),
  resolveDrawableSrc: vi.fn(),
}))

import { resolveDrawableSrc } from '../../lib/storage'

afterEach(() => {
  cleanup()
})

function imageLayer(overrides: Partial<ImageLayer> = {}): ImageLayer {
  return {
    id: 'img-1',
    type: 'image',
    name: 'Logo',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    src: 'trama:blob:uno',
    naturalWidth: 100,
    naturalHeight: 100,
    filters: { ...DEFAULT_FILTERS },
    flipX: false,
    flipY: false,
    ...overrides,
  }
}

const textLayer: TextLayer = {
  id: 'txt-1',
  type: 'text',
  name: 'Texto',
  text: 'TU MARCA',
  x: 0,
  y: 0,
  width: 100,
  height: 20,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fontSize: 20,
  fontFamily: 'Arial',
  fontWeight: 700,
  fontStyle: 'normal',
  fill: '#ffffff',
  align: 'left',
  letterSpacing: 1,
}

function renderPanel(layers: Layer[]) {
  return render(
    <LayersPanel
      layers={layers}
      selectedId={null}
      onSelect={vi.fn()}
      onToggleVisible={vi.fn()}
      onRemove={vi.fn()}
    />,
  )
}

describe('LayersPanel', () => {
  it('resuelve la clave del logo a una object URL para la miniatura', async () => {
    vi.mocked(resolveDrawableSrc).mockResolvedValue('blob:https://localhost/abc')
    const { container } = renderPanel([imageLayer()])

    expect(container.querySelector('img')).toBeNull()

    await waitFor(() => {
      expect(container.querySelector('img')?.getAttribute('src')).toBe(
        'blob:https://localhost/abc',
      )
    })
    expect(screen.queryByText('IMG')).toBeNull()
  })

  it('mientras resuelve muestra un placeholder ocupando el mismo lugar', () => {
    vi.mocked(resolveDrawableSrc).mockReturnValue(new Promise<string>(() => {}))
    renderPanel([imageLayer()])

    const placeholder = screen.getByRole('img', { name: 'Logo' })
    expect(placeholder.tagName).toBe('DIV')
    expect(placeholder.getAttribute('aria-busy')).toBe('true')
  })

  it('si el blob ya no existe muestra el placeholder y nunca una imagen rota', async () => {
    vi.mocked(resolveDrawableSrc).mockResolvedValue('trama:blob:uno')
    const { container } = renderPanel([imageLayer()])

    await waitFor(() => expect(resolveDrawableSrc).toHaveBeenCalledWith('trama:blob:uno'))

    expect(container.querySelector('img')).toBeNull()
    const placeholder = screen.getByRole('img', { name: 'Logo' })
    expect(placeholder.tagName).toBe('DIV')
    expect(placeholder.getAttribute('aria-busy')).toBeNull()
  })

  it('muestra el texto de las capas de texto', () => {
    renderPanel([textLayer])

    expect(screen.getByText('TXT')).toBeTruthy()
    expect(screen.getByText('TU MARCA')).toBeTruthy()
  })
})
