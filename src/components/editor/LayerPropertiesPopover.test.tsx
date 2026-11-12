// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FONT_OPTIONS } from '../../lib/fonts'
import { LayerPropertiesPopover } from './LayerPropertiesPopover'
import type { PopoverAnchorRect } from './LayerPropertiesPopover'
import type { TextLayer } from '../../types'

const layer: TextLayer = {
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

function setup(anchorRect: PopoverAnchorRect = { top: 100, bottom: 120, right: 300 }) {
  const anchor = document.createElement('button')
  document.body.appendChild(anchor)
  const onChange = vi.fn()
  const onClose = vi.fn()
  render(
    <LayerPropertiesPopover
      layer={layer}
      anchor={anchor}
      anchorRect={anchorRect}
      onChange={onChange}
      onClose={onClose}
    />,
  )
  return { onChange, onClose, anchor }
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('LayerPropertiesPopover', () => {
  it('se abre hacia abajo y muestra las propiedades de la capa', () => {
    setup()

    const dialog = screen.getByRole('dialog', { name: 'Propiedades de la capa' })
    expect(dialog.getAttribute('data-placement')).toBe('down')
    expect(dialog.getAttribute('style')).toContain('position: fixed')
    expect(screen.getByText('Opacidad')).toBeTruthy()
    expect(screen.getByText('Rotación')).toBeTruthy()
    expect(screen.getByText('Capa · Texto')).toBeTruthy()
  })

  it('permite cambiar la tipografía del texto', () => {
    const { onChange } = setup()
    const georgia = FONT_OPTIONS.find((font) => font.id === 'georgia')
    expect(georgia).toBeDefined()
    if (!georgia) return

    fireEvent.change(screen.getByLabelText('Tipografía'), {
      target: { value: georgia.stack },
    })

    expect(onChange).toHaveBeenCalledWith({ fontFamily: georgia.stack })
  })

  it('se abre hacia arriba cuando no hay lugar debajo', () => {
    setup({ top: 700, bottom: 730, right: 300 })

    expect(
      screen.getByRole('dialog', { name: 'Propiedades de la capa' }).getAttribute('data-placement'),
    ).toBe('up')
  })

  it('cierra con Escape y con un clic afuera, pero no con un clic adentro', () => {
    const { onClose } = setup()
    const dialog = screen.getByRole('dialog', { name: 'Propiedades de la capa' })

    fireEvent.pointerDown(dialog)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.pointerDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
