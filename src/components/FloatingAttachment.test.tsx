// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { FloatingAttachment } from './FloatingAttachment'
import { DesignAttachmentContext } from './DesignAttachment'
import type { DesignAttachmentValue } from './DesignAttachment'

vi.mock('../lib/scrollToId', () => ({ scrollToId: vi.fn() }))

import { scrollToId } from '../lib/scrollToId'

type FakeEntry = { isIntersecting: boolean }
type FakeCallback = (entries: FakeEntry[]) => void

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  private callback: FakeCallback

  constructor(callback: FakeCallback) {
    this.callback = callback
    FakeIntersectionObserver.instances.push(this)
  }

  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }])
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

beforeEach(() => {
  FakeIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  vi.mocked(scrollToId).mockClear()
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

function renderFloating(attachment: DesignAttachmentValue) {
  render(
    <div>
      <div id="editor" />
      <section id="contacto" />
      <DesignAttachmentContext.Provider value={attachment}>
        <FloatingAttachment />
      </DesignAttachmentContext.Provider>
    </div>,
  )
}

describe('FloatingAttachment', () => {
  it('no se muestra sin diseños adjuntados', () => {
    renderFloating(attachmentValue({ attachments: [], count: 0 }))

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('muestra Enviar Diseño y lleva a contacto al clickearlo', () => {
    renderFloating(attachmentValue())

    const button = screen.getByRole('button', { name: 'Ir a contacto para enviar el diseño' })
    expect(button.textContent).toContain('Enviar Diseño')

    fireEvent.click(button)
    expect(scrollToId).toHaveBeenCalledWith('contacto')
  })

  it('cambia a Volver al llegar a contacto y vuelve al editor al clickearlo', async () => {
    renderFloating(attachmentValue())

    FakeIntersectionObserver.instances[0]?.trigger(true)
    await act(async () => {})

    const volver = screen.getByRole('button', { name: 'Volver al editor' })
    expect(volver.textContent).toContain('Volver')

    fireEvent.click(volver)
    expect(scrollToId).toHaveBeenCalledWith('editor')
  })

  it('desaparece cuando se quitan los adjuntos', () => {
    const attachment = attachmentValue()
    const { rerender } = render(
      <DesignAttachmentContext.Provider value={attachment}>
        <FloatingAttachment />
      </DesignAttachmentContext.Provider>,
    )
    expect(screen.getByRole('button')).toBeTruthy()

    rerender(
      <DesignAttachmentContext.Provider
        value={{ ...attachment, attachments: [], count: 0 }}
      >
        <FloatingAttachment />
      </DesignAttachmentContext.Provider>,
    )
    expect(screen.queryByRole('button')).toBeNull()
  })
})
