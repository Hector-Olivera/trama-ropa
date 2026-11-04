// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LogoUploader } from './LogoUploader'

vi.mock('../../lib/images', () => ({
  isSupportedImageType: () => true,
  prepareLogoFile: vi.fn(),
}))

vi.mock('../../lib/storage', () => ({
  putLogoBlob: vi.fn(),
}))

import { prepareLogoFile } from '../../lib/images'
import { putLogoBlob } from '../../lib/storage'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function file(name: string) {
  return new File(['x'], name, { type: 'image/png' })
}

describe('LogoUploader', () => {
  it('sin lugar para más capas no abre el selector y avisa', () => {
    const onAdd = vi.fn()
    const onLimitReached = vi.fn()
    const { container } = render(
      <LogoUploader onAdd={onAdd} remaining={0} onLimitReached={onLimitReached} />,
    )
    const input = container.querySelector<HTMLInputElement>('input[type="file"]')
    const click = vi.spyOn(input as HTMLInputElement, 'click')

    fireEvent.click(screen.getByRole('button', { name: 'Subir logo' }))

    expect(onLimitReached).toHaveBeenCalledTimes(1)
    expect(click).not.toHaveBeenCalled()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('con un lugar libre agrega sólo el primer archivo y avisa del resto', async () => {
    vi.mocked(prepareLogoFile).mockResolvedValue({
      blob: new Blob(['x']),
      width: 100,
      height: 100,
    })
    vi.mocked(putLogoBlob).mockResolvedValue('trama:blob:test')

    const onAdd = vi.fn()
    const onLimitReached = vi.fn()
    render(<LogoUploader onAdd={onAdd} remaining={1} onLimitReached={onLimitReached} />)

    fireEvent.drop(screen.getByRole('button', { name: 'Subir logo' }), {
      dataTransfer: { files: [file('mi-logo.png'), file('otro.png')] },
    })

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1))
    expect(onAdd).toHaveBeenCalledWith({
      src: 'trama:blob:test',
      naturalWidth: 100,
      naturalHeight: 100,
      name: 'mi-logo',
    })
    expect(onLimitReached).toHaveBeenCalledTimes(1)
  })

  it('agrega todos los archivos si entran en el tope', async () => {
    vi.mocked(prepareLogoFile).mockResolvedValue({
      blob: new Blob(['x']),
      width: 100,
      height: 100,
    })
    vi.mocked(putLogoBlob).mockResolvedValue('trama:blob:test')

    const onAdd = vi.fn()
    const onLimitReached = vi.fn()
    render(<LogoUploader onAdd={onAdd} remaining={2} onLimitReached={onLimitReached} />)

    fireEvent.drop(screen.getByRole('button', { name: 'Subir logo' }), {
      dataTransfer: { files: [file('uno.png'), file('dos.png')] },
    })

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(2))
    expect(onLimitReached).not.toHaveBeenCalled()
    expect(onAdd).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'dos' }))
  })
})
