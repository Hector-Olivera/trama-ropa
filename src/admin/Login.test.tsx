// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Login } from './Login'

afterEach(() => {
  cleanup()
})

function fillAndSubmit(password: string) {
  const input = screen.getByLabelText('Contraseña') as HTMLInputElement
  fireEvent.change(input, { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
  return input
}

describe('Login', () => {
  it('muestra el error devuelto por el backend y limpia la contraseña', async () => {
    const onSubmit = vi
      .fn()
      .mockResolvedValue({ ok: false, error: 'Email o contraseña incorrectos.' })
    render(<Login onSubmit={onSubmit} hasCustomPassword />)

    const input = fillAndSubmit('mala')

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Email o contraseña incorrectos.')
    expect(input.value).toBe('')
  })

  it('usa un mensaje genérico si el backend no lo provee', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: false })
    render(<Login onSubmit={onSubmit} hasCustomPassword />)

    fillAndSubmit('x')

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('Contraseña incorrecta.')
  })

  it('no muestra error cuando el login es correcto', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true })
    render(<Login onSubmit={onSubmit} hasCustomPassword />)

    fillAndSubmit('trama')

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('trama'))
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
