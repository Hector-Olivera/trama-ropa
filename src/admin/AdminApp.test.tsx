// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { AdminApp } from './AdminApp'
import { ContentProvider } from '../content/ContentProvider'
import { STORAGE_KEYS } from '../lib/storage-keys'

/**
 * Monta el panel autenticado una sola vez y navega por el menú, como un
 * usuario real. Montar el panel varias veces en el mismo entorno jsdom cuelga
 * el worker, así que se evita a propósito: todos los casos corren contra el
 * mismo montaje.
 */
function mountAdmin(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <JumpButton />
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

function JumpButton() {
  const navigate = useNavigate()
  return (
    <button type="button" onClick={() => navigate('/admin/panel-fantasma')}>
      Ir a un panel inexistente
    </button>
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
  it('redirige /admin a la primera sección, navega por el menú y responde 404', async () => {
    mountAdmin('/admin')

    expect(await screen.findByText('Panel Trama')).toBeTruthy()
    expect(await screen.findByText('Botón principal')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Inicio' }))
    expect(screen.getByText('Antetítulo')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Catálogo' }))
    expect(screen.getByText('Categorías')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Seguridad' }))
    expect(screen.getByText('Cambiar contraseña')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ir a un panel inexistente' }))
    expect(screen.getByText('404')).toBeTruthy()
    expect(screen.getByText('Ese panel no existe')).toBeTruthy()

    fireEvent.click(screen.getByRole('link', { name: 'Ir al panel' }))
    expect(screen.getByText('Botón principal')).toBeTruthy()
  }, 20000)
})
