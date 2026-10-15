// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT } from './defaults'
import { loadContent, resetContent, saveContent } from './store'

afterEach(() => {
  localStorage.clear()
})

describe('loadContent', () => {
  it('devuelve los defaults cuando no hay nada guardado', () => {
    expect(loadContent()).toEqual(DEFAULT_CONTENT)
  })

  it('mergea objetos campo a campo, sin perder campos nuevos de los defaults', () => {
    localStorage.setItem('trama:content', JSON.stringify({ brand: { name: 'Otra' } }))

    const loaded = loadContent()

    expect(loaded.brand.name).toBe('Otra')
    expect(loaded.brand.mark).toBe(DEFAULT_CONTENT.brand.mark)
    expect(loaded.hero).toEqual(DEFAULT_CONTENT.hero)
  })

  it('reemplaza arrays enteros, para que borrar de verdad borre', () => {
    localStorage.setItem('trama:content', JSON.stringify({ nav: { links: [] } }))

    const loaded = loadContent()

    expect(loaded.nav.links).toEqual([])
    expect(loaded.nav.cta).toEqual(DEFAULT_CONTENT.nav.cta)
  })

  it('cae a los defaults si el JSON guardado esta corrupto', () => {
    localStorage.setItem('trama:content', '{no es json')

    expect(loadContent()).toEqual(DEFAULT_CONTENT)
  })
})

describe('saveContent', () => {
  it('persiste y loadContent lo devuelve igual', () => {
    const next = {
      ...DEFAULT_CONTENT,
      brand: { ...DEFAULT_CONTENT.brand, name: 'Trama Test' },
    }

    saveContent(next)

    expect(loadContent()).toEqual(next)
  })
})

describe('resetContent', () => {
  it('borra lo guardado y vuelve a los defaults', () => {
    saveContent({ ...DEFAULT_CONTENT, brand: { ...DEFAULT_CONTENT.brand, name: 'X' } })

    resetContent()

    expect(loadContent()).toEqual(DEFAULT_CONTENT)
  })
})
