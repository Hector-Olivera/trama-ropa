// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Contact } from './Contact'
import { ContentProvider } from '../content/ContentProvider'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderContact() {
  render(
    <ContentProvider>
      <Contact />
    </ContentProvider>,
  )
}

describe('Contact', () => {
  it('envía el formulario a Web3Forms y muestra confirmación', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)

    renderContact()

    fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@test.com' } })
    fireEvent.change(screen.getByLabelText('¿Qué necesitás?'), { target: { value: '20 remeras' } })

    fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.web3forms.com/submit')
    expect(init?.method).toBe('POST')
    expect(init?.body).toContain('20 remeras')

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('¡Gracias!')
  })

  it('muestra un error si el envío falla', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('sin red'))
    vi.stubGlobal('fetch', fetchMock)

    renderContact()

    fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@test.com' } })
    fireEvent.change(screen.getByLabelText('¿Qué necesitás?'), { target: { value: 'Consulta' } })

    fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('No se pudo enviar')
  })
})
