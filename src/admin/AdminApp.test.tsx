// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AdminApp } from './AdminApp'
import { ContentProvider } from '../content/ContentProvider'
import { STORAGE_KEYS } from '../lib/storage-keys'

/**
 * Monta el panel autenticado una sola vez y navega por el menú, como un
 * usuario real. Montar el panel varias veces en el mismo entorno jsdom cuelga
 * el worker, así que se evita a propósito.
 */
function mountAdmin(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ContentProvider>
              <AdminApp />
            </ContentProvider>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  localStorage.setItem(STORAGE_KEYS.adminSession, '1')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('AdminApp por rutas', () => {
  it('redirige /admin a la primera sección y navega por el menú', () => {
    mountAdmin('/admin')

    expect(screen.getByText('Panel Trama')).toBeTruthy()
    expect(screen.getByText('Botón principal')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Inicio' }))
    expect(screen.getByText('Antetítulo')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Catálogo' }))
    expect(screen.getByText('Categorías')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }))
    expect(screen.getByText('Cambiar contraseña')).toBeTruthy()
  }, 20000)
})
