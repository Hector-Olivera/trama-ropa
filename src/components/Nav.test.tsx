// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { Nav } from './Nav'
import { ContentProvider } from '../content/ContentProvider'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

function renderNav() {
  return render(
    <ContentProvider>
      <Nav />
    </ContentProvider>,
  )
}

async function openMenu() {
  fireEvent.click(await screen.findByRole('button', { name: 'Abrir menú' }))
  const panel = document.getElementById('menu-movil')
  if (!panel) throw new Error('No se abrió el menú móvil.')
  return panel
}

describe('Nav', () => {
  it('abre el menú móvil con los links del contenido', async () => {
    renderNav()

    const toggle = await screen.findByRole('button', { name: 'Abrir menú' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById('menu-movil')).toBeNull()

    const panel = await openMenu()

    expect(screen.getByRole('button', { name: 'Cerrar menú' }).getAttribute('aria-expanded')).toBe(
      'true',
    )
    expect(within(panel).getByRole('link', { name: 'Catálogo' }).getAttribute('href')).toBe(
      '#catalogo',
    )
    expect(within(panel).getByRole('link', { name: 'Cómo funciona' })).toBeTruthy()
    expect(within(panel).getByRole('link', { name: 'Contacto' })).toBeTruthy()
  })

  it('cierra el menú al navegar y con Escape', async () => {
    renderNav()

    await openMenu()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }))
    const panel = await openMenu()

    fireEvent.click(within(panel).getByRole('link', { name: 'Contacto' }))
    expect(document.getElementById('menu-movil')).toBeNull()

    const reopened = await openMenu()
    fireEvent.keyDown(within(reopened).getByRole('link', { name: 'Catálogo' }), { key: 'Escape' })
    expect(document.getElementById('menu-movil')).toBeNull()
  })
})
