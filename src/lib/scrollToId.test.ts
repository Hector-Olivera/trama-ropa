// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollToId } from './scrollToId'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('scrollToId', () => {
  it('alinea el inicio por defecto y respeta el bloque pedido', () => {
    const target = document.createElement('div')
    target.id = 'destino'
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView
    document.body.append(target)

    scrollToId('destino')
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'start' })

    scrollToId('destino', 'end')
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'end' })
  })

  it('no falla si el id no existe', () => {
    expect(() => scrollToId('inexistente')).not.toThrow()
  })
})
