// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Contact } from './Contact'
import { ContentProvider } from '../content/ContentProvider'
import { DesignAttachmentContext, DesignAttachmentProvider } from './DesignAttachment'
import type { DesignAttachmentValue } from './DesignAttachment'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function attachmentValue(overrides: Partial<DesignAttachmentValue> = {}): DesignAttachmentValue {
  const attachments = [
    {
      url: 'https://supabase.test/sign/diseno-abc.png?t=firma',
      previewUrl: 'blob:preview',
    },
  ]
  return {
    attachments,
    status: 'ready',
    error: null,
    attach: vi.fn(async () => {}),
    clear: vi.fn(),
    remove: vi.fn(),
    count: attachments.length,
    ...overrides,
  }
}

function renderContact(attachment?: DesignAttachmentValue) {
  render(
    <ContentProvider>
      <DesignAttachmentProvider>
        {attachment ? (
          <DesignAttachmentContext.Provider value={attachment}>
            <Contact />
          </DesignAttachmentContext.Provider>
        ) : (
          <Contact />
        )}
      </DesignAttachmentProvider>
    </ContentProvider>,
  )
}

async function fillForm(message: string) {
  fireEvent.change(await screen.findByLabelText('Nombre'), { target: { value: 'Juan' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'juan@test.com' } })
  fireEvent.change(screen.getByLabelText('¿Qué necesitás?'), { target: { value: message } })
}

describe('Contact', () => {
  it('envía el formulario a Web3Forms y muestra confirmación', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)

    renderContact()

    await fillForm('20 remeras')

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

    await fillForm('Consulta')

    fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('No se pudo enviar')
  })

  it('muestra el diseño adjunto con su enlace y lo puede quitar', async () => {
    const attachment = attachmentValue()
    renderContact(attachment)

    expect(await screen.findByText('Diseño adjunto')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Quitar el diseño adjunto' }))
    expect(attachment.remove).toHaveBeenCalledTimes(1)
  })

  it('agrega el enlace del diseño al cuerpo del mensaje', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)

    renderContact(attachmentValue())

    await fillForm('20 remeras')

    fireEvent.click(screen.getByRole('button', { name: 'Enviar consulta' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string) as { message: string }
    expect(body.message).toContain('20 remeras')
    expect(body.message).toContain('Mi diseño 1: https://supabase.test/sign/diseno-abc.png?t=firma')
  })
})
