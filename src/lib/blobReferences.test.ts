// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { collectBlobRefs, collectStoredBlobRefs, isBlobRef } from './blobReferences'
import { STORAGE_KEYS } from './storage-keys'

describe('isBlobRef', () => {
  it('distingue claves de blob de paths de public', () => {
    expect(isBlobRef('trama:blob:abc')).toBe(true)
    expect(isBlobRef('/estampados/x.png')).toBe(false)
  })
})

describe('collectBlobRefs', () => {
  it('encuentra refs anidadas en objetos y arrays', () => {
    const content = {
      brand: { mark: 'trama:blob:uno', alt: '/public/a.png' },
      hero: { images: ['trama:blob:dos', 'https://x/y.png'] },
      nested: [{ deep: { src: 'trama:blob:tres' } }],
    }

    expect([...collectBlobRefs(content)].sort()).toEqual([
      'trama:blob:dos',
      'trama:blob:tres',
      'trama:blob:uno',
    ])
  })

  it('ignora strings que no son refs y valores que no son string', () => {
    expect(collectBlobRefs({ a: 1, b: null, c: 'hola', d: ['/x.png'] }).size).toBe(0)
  })
})

describe('collectStoredBlobRefs', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('junta las refs del contenido y de los diseños guardados', () => {
    localStorage.setItem(
      STORAGE_KEYS.content,
      JSON.stringify({ brand: { mark: 'trama:blob:contenido' } }),
    )
    localStorage.setItem(
      STORAGE_KEYS.designs,
      JSON.stringify([{ id: 'a', layers: [{ type: 'image', src: 'trama:blob:diseno' }] }]),
    )

    expect([...collectStoredBlobRefs()].sort()).toEqual(['trama:blob:contenido', 'trama:blob:diseno'])
  })

  it('tolera storage vacío o con JSON roto', () => {
    expect(collectStoredBlobRefs().size).toBe(0)

    localStorage.setItem(STORAGE_KEYS.content, '{no json')
    expect(collectStoredBlobRefs().size).toBe(0)
  })
})
