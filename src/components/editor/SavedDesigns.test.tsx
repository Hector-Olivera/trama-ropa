// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Design } from '../../types'
import { SavedDesigns } from './SavedDesigns'

const design = (id: string, name: string): Design => ({
  id,
  name,
  productId: 'p1',
  layers: [],
  createdAt: 0,
  updatedAt: 0,
})

const baseProps = {
  versions: [design('a', 'Uno'), design('b', 'Dos')],
  name: 'Mi diseño',
  saveState: 'saved' as const,
  highlight: false,
  activeId: null,
  savingAsNew: false,
  newName: '',
  savedCount: 2,
  maxSaved: 12,
  limitNotice: false,
  canSaveChanges: false,
  onNewNameChange: vi.fn(),
  onSaveChanges: vi.fn(),
  onSaveAsNew: vi.fn(),
  onCancelNew: vi.fn(),
  onLoad: vi.fn(),
  onDelete: vi.fn(),
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('SavedDesigns', () => {
  it('oculta el input de nombre pero conserva su espacio', () => {
    render(<SavedDesigns {...baseProps} />)

    const input = screen.getByLabelText('Nombre del diseño')
    expect(input.className).toContain('invisible')
    expect((input as HTMLInputElement).value).toBe('Mi diseño')
  })

  it('en modo nuevo muestra el input vacío, resaltado y enfocado', () => {
    render(<SavedDesigns {...baseProps} savingAsNew newName="" canSaveChanges={false} />)

    const input = screen.getByLabelText('Nombre del diseño') as HTMLInputElement
    expect(input.className).not.toContain('invisible')
    expect(input.className).toContain('ring-2')
    expect(input.value).toBe('')
    expect(document.activeElement).toBe(input)
  })

  it('bloquea "Guardar cambios" sin diseño activo o en modo nuevo', () => {
    const onSaveChanges = vi.fn()
    const { rerender } = render(
      <SavedDesigns {...baseProps} canSaveChanges={false} onSaveChanges={onSaveChanges} />,
    )
    const button = screen.getByRole('button', { name: 'Guardar cambios' })
    expect((button as HTMLButtonElement).disabled).toBe(true)

    rerender(<SavedDesigns {...baseProps} canSaveChanges onSaveChanges={onSaveChanges} />)
    const enabled = screen.getByRole('button', { name: 'Guardar cambios' })
    expect((enabled as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(enabled)
    expect(onSaveChanges).toHaveBeenCalledTimes(1)
  })

  it('muestra "Guardar como nuevo" resaltado mientras el modo está activo', () => {
    const onSaveAsNew = vi.fn()
    const { rerender } = render(
      <SavedDesigns {...baseProps} onSaveAsNew={onSaveAsNew} />,
    )
    const button = screen.getByRole('button', { name: 'Guardar como nuevo' })
    expect(button.getAttribute('aria-pressed')).toBe('false')

    fireEvent.click(button)
    expect(onSaveAsNew).toHaveBeenCalledTimes(1)

    rerender(<SavedDesigns {...baseProps} onSaveAsNew={onSaveAsNew} savingAsNew />)
    const pressed = screen.getByRole('button', { name: 'Guardar como nuevo' })
    expect(pressed.getAttribute('aria-pressed')).toBe('true')
    expect(pressed.className).toContain('bg-brand-cyan')
  })

  it('cancela con Escape', () => {
    const onCancelNew = vi.fn()
    render(<SavedDesigns {...baseProps} savingAsNew onCancelNew={onCancelNew} />)

    fireEvent.keyDown(screen.getByLabelText('Nombre del diseño'), { key: 'Escape' })

    expect(onCancelNew).toHaveBeenCalledTimes(1)
  })

  it('cancela al hacer click afuera, no dentro de las acciones', () => {
    const onCancelNew = vi.fn()
    render(<SavedDesigns {...baseProps} savingAsNew onCancelNew={onCancelNew} />)

    fireEvent.pointerDown(screen.getByLabelText('Nombre del diseño'))
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Guardar como nuevo' }))
    expect(onCancelNew).not.toHaveBeenCalled()

    fireEvent.pointerDown(document.body)
    expect(onCancelNew).toHaveBeenCalledTimes(1)
  })

  it('resalta el diseño activo y deja hover en el resto', () => {
    render(<SavedDesigns {...baseProps} activeId="a" />)

    const activeButton = screen.getByText('Uno').closest('button')
    const idleButton = screen.getByText('Dos').closest('button')
    expect(activeButton?.getAttribute('aria-current')).toBe('true')
    expect(activeButton?.closest('li')?.className).toContain('border-brand-cyan')
    expect(idleButton?.getAttribute('aria-current')).toBeNull()
    expect(idleButton?.closest('li')?.className).toContain('hover:border-brand-cyan/60')
  })

  it('muestra el contador y el aviso del tope', () => {
    render(
      <SavedDesigns {...baseProps} savedCount={12} limitNotice />,
    )

    expect(screen.getByText('12/12').className).toContain('text-brand-cyan')
    expect(screen.getByRole('alert').textContent).toContain('límite de 12 diseños')
  })

  it('pide confirmación antes de borrar un diseño', () => {
    const onDelete = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<SavedDesigns {...baseProps} onDelete={onDelete} />)

    fireEvent.click(screen.getByRole('button', { name: 'Borrar Uno' }))
    expect(confirm).toHaveBeenCalledWith('¿Eliminar este diseño?')
    expect(onDelete).not.toHaveBeenCalled()

    confirm.mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar Uno' }))
    expect(onDelete).toHaveBeenCalledWith('a')
  })

  it('muestra "Cambios guardados" y se oculta solo', () => {
    vi.useFakeTimers()
    const onSaveChanges = vi.fn()
    render(
      <SavedDesigns {...baseProps} canSaveChanges onSaveChanges={onSaveChanges} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByRole('status').textContent).toBe('Cambios guardados')
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('muestra "Diseño guardado" al confirmar y no al entrar en modo nuevo', () => {
    const onSaveAsNew = vi.fn()
    const { rerender } = render(
      <SavedDesigns {...baseProps} onSaveAsNew={onSaveAsNew} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Guardar como nuevo' }))
    expect(onSaveAsNew).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status')).toBeNull()

    rerender(<SavedDesigns {...baseProps} onSaveAsNew={onSaveAsNew} savingAsNew />)
    fireEvent.click(screen.getByRole('button', { name: 'Guardar como nuevo' }))

    expect(onSaveAsNew).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status').textContent).toBe('Diseño guardado')
  })

  it('da feedback visual al presionar "Guardar cambios"', () => {
    render(<SavedDesigns {...baseProps} canSaveChanges />)

    const button = screen.getByRole('button', { name: 'Guardar cambios' })
    expect(button.className).toContain('active:scale-[0.97]')
    expect(button.className).toContain('active:bg-brand-cyan/15')
  })
})
