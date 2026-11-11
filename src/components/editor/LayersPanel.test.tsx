// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ComponentProps } from 'react'
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
  vi.restoreAllMocks()
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

function renderPanel(
  layers: Layer[],
  overrides: Partial<ComponentProps<typeof LayersPanel>> = {},
) {
  const props = {
    layers,
    selectedId: null,
    onSelect: vi.fn(),
    onChange: vi.fn(),
    onToggleVisible: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  }
  return { ...render(<LayersPanel {...props} />), props }
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

  it('muestra el nombre de la capa de imagen junto a la miniatura', async () => {
    vi.mocked(resolveDrawableSrc).mockResolvedValue('blob:https://localhost/abc')

    renderPanel([imageLayer({ name: 'mi-logo' })])

    expect(screen.getByText('mi-logo')).toBeTruthy()
    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'mi-logo' }).tagName).toBe('IMG'),
    )
  })

  it('usa OCULTAR en capas visibles y AGREGAR en capas ocultas', () => {
    renderPanel([
      { ...textLayer, id: 'a', visible: true },
      { ...textLayer, id: 'b', visible: false, text: 'OTRA' },
    ])

    expect(screen.getByRole('button', { name: 'OCULTAR' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'AGREGAR' })).toBeTruthy()
  })

  it('el botón de texto avisa el cambio de visibilidad', () => {
    const { props } = renderPanel([{ ...textLayer, visible: false }])

    fireEvent.click(screen.getByRole('button', { name: 'AGREGAR' }))

    expect(props.onToggleVisible).toHaveBeenCalledWith('txt-1')
  })

  it('la × pide confirmación y sólo borra si se acepta', () => {
    const { props } = renderPanel([textLayer])

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar capa' }))
    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar esta capa?' })
    expect(within(dialog).getByText('La capa se va a quitar del diseño.')).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(props.onRemove).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar capa' }))
    const confirmDialog = screen.getByRole('alertdialog', { name: '¿Eliminar esta capa?' })
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Eliminar' }))
    expect(props.onRemove).toHaveBeenCalledWith('txt-1')
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('el pincel selecciona la capa y abre el desplegable de propiedades', () => {
    const { props } = renderPanel([textLayer])

    fireEvent.click(screen.getByRole('button', { name: 'Editar propiedades' }))

    expect(props.onSelect).toHaveBeenCalledWith('txt-1')
    const dialog = screen.getByRole('dialog', { name: 'Propiedades de la capa' })
    expect(within(dialog).getByText('Opacidad')).toBeTruthy()
    expect(within(dialog).getByText('Rotación')).toBeTruthy()
  })
})
