// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { DEFAULT_CONTENT } from '../../content/defaults'
import type { SiteContent } from '../../content/types'
import { useSection, useSectionField } from './useSection'

function makeStore(initial: SiteContent) {
  let state = initial
  const update = (mutate: (current: SiteContent) => SiteContent) => {
    state = mutate(state)
  }
  return {
    update,
    get: () => state,
  }
}

describe('useSection', () => {
  it('mergea la sección sin perder el resto de sus campos', () => {
    const store = makeStore(DEFAULT_CONTENT)
    const { result } = renderHook(() => useSection(store.update, 'hero'))

    act(() => result.current({ eyebrow: 'Hola' }))

    expect(store.get().hero.eyebrow).toBe('Hola')
    expect(store.get().hero.subtitle).toBe(DEFAULT_CONTENT.hero.subtitle)
    expect(store.get().footer).toEqual(DEFAULT_CONTENT.footer)
  })
})

describe('useSectionField', () => {
  it('mergea un objeto anidado sin tocar sus otros campos', () => {
    const store = makeStore(DEFAULT_CONTENT)
    const { result } = renderHook(() => useSectionField(store.update, 'contact', 'whatsapp'))

    act(() => result.current({ label: 'Wsp Trama' }))

    expect(store.get().contact.whatsapp.label).toBe('Wsp Trama')
    expect(store.get().contact.whatsapp.href).toBe(DEFAULT_CONTENT.contact.whatsapp.href)
    expect(store.get().contact.email).toEqual(DEFAULT_CONTENT.contact.email)
  })
})
