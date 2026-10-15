// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { SectionBoundary } from './SectionBoundary'

function Boom(): never {
  throw new Error('exploto')
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('SectionBoundary', () => {
  it('renderiza los hijos normales sin tocarlos', () => {
    render(
      <SectionBoundary id="catalogo">
        <p>seccion sana</p>
      </SectionBoundary>,
    )

    expect(screen.getByText('seccion sana')).toBeTruthy()
    expect(screen.queryByText('Sección no disponible')).toBeNull()
  })

  it('muestra el fallback y conserva el ancla si la sección revienta', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SectionBoundary id="catalogo">
        <Boom />
      </SectionBoundary>,
    )

    const fallback = screen.getByText('Sección no disponible').closest('section')
    expect(fallback?.id).toBe('catalogo')
    expect(screen.getByRole('button', { name: 'Recargar' })).toBeTruthy()
  })

  it('una sección rota no tira abajo a las demás', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <>
        <SectionBoundary>
          <Boom />
        </SectionBoundary>
        <SectionBoundary>
          <p>sección al lado</p>
        </SectionBoundary>
      </>,
    )

    expect(screen.getByText('sección al lado')).toBeTruthy()
    expect(screen.getByText('Sección no disponible')).toBeTruthy()
  })
})
