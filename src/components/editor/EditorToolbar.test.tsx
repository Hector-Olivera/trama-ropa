// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { EditorToolbar } from './EditorToolbar'
import type { AttachmentStatus } from '../DesignAttachment'

afterEach(() => {
  cleanup()
})

type Overrides = {
  attachmentCount?: number
  isSaved?: boolean
  isAlreadyAttached?: boolean
  attachState?: AttachmentStatus
  hasLayers?: boolean
}

function renderToolbar(overrides: Overrides = {}) {
  const onAttach = vi.fn()
  render(
    <EditorToolbar
      canUndo
      canRedo
      hasLayers={overrides.hasLayers ?? true}
      onUndo={() => {}}
      onRedo={() => {}}
      onClear={() => {}}
      canAttach
      onAttach={onAttach}
      attachState={overrides.attachState ?? 'idle'}
      attachmentCount={overrides.attachmentCount ?? 0}
      isAlreadyAttached={overrides.isAlreadyAttached ?? false}
      onSaveJump={() => {}}
      isSaved={overrides.isSaved ?? false}
    />,
  )
  return { onAttach }
}

function attachButton() {
  return screen.getByRole('button', { name: /Adjuntar al mail/ })
}

describe('EditorToolbar', () => {
  it('pide guardar antes de adjuntar y destella el botón Guardar', () => {
    const { onAttach } = renderToolbar({ isSaved: false })

    fireEvent.click(attachButton())

    expect(screen.getByRole('status').textContent).toBe('Debes guardar tu diseño primero')
    expect(screen.getByRole('button', { name: 'Guardar' }).className).toContain(
      'animate-glow-pulse',
    )
    expect(onAttach).not.toHaveBeenCalled()
  })

  it('avisa el límite de 2 archivos cuando el diseño está guardado', () => {
    const { onAttach } = renderToolbar({ attachmentCount: 2, isSaved: true })

    fireEvent.click(attachButton())

    expect(screen.getByRole('status').textContent).toBe('Solo se pueden adjuntar 2 archivos')
    expect(onAttach).not.toHaveBeenCalled()
  })

  it('sugiere guardar cuando hay 2 archivos y el diseño no está guardado', () => {
    renderToolbar({ attachmentCount: 2, isSaved: false })

    fireEvent.click(attachButton())

    expect(screen.getByRole('status').textContent).toBe(
      'Solo podés adjuntar 2 archivos, pero podés guardarlo para enviarlo después',
    )
  })

  it('avisa cuando el mismo diseño ya está adjuntado', () => {
    const { onAttach } = renderToolbar({
      attachmentCount: 1,
      isSaved: true,
      isAlreadyAttached: true,
    })

    fireEvent.click(attachButton())

    expect(screen.getByRole('status').textContent).toBe('Este diseño ya está adjuntado')
    expect(onAttach).not.toHaveBeenCalled()
  })

  it('adjunta el diseño cuando está guardado y hay lugar', () => {
    const { onAttach } = renderToolbar({ isSaved: true })

    fireEvent.click(attachButton())

    expect(screen.queryByRole('status')).toBeNull()
    expect(onAttach).toHaveBeenCalledTimes(1)
  })
})
