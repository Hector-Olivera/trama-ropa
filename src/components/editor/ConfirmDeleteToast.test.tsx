// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ConfirmDeleteToast } from './ConfirmDeleteToast'

afterEach(cleanup)

describe('ConfirmDeleteToast', () => {
  it('muestra el título y la descripción y dispara las acciones', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteToast
        title="¿Eliminar esto?"
        description="Se va a borrar."
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    const dialog = screen.getByRole('alertdialog', { name: '¿Eliminar esto?' })
    expect(dialog.textContent).toContain('Se va a borrar.')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('cancela con Escape', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmDeleteToast
        title="¿Eliminar esto?"
        description="Se va a borrar."
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
