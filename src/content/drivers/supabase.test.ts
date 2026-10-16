import { describe, expect, it } from 'vitest'
import { collectStoragePaths, storagePathFromPublicUrl } from './supabase'

const BASE = 'https://abcd.supabase.co/storage/v1/object/public/media'

describe('storagePathFromPublicUrl', () => {
  it('extrae la ruta interna de una URL publica del bucket', () => {
    expect(storagePathFromPublicUrl(`${BASE}/logo-123.png`)).toBe('logo-123.png')
  })

  it('devuelve null para assets que no son del bucket (ej. public/)', () => {
    expect(storagePathFromPublicUrl('/gallery/calza-oxford-01.jpg')).toBeNull()
    expect(storagePathFromPublicUrl('https://ejemplo.com/foto.png')).toBeNull()
    expect(storagePathFromPublicUrl('trama:blob:viejo')).toBeNull()
  })

  it('decodifica rutas con caracteres escapados', () => {
    expect(storagePathFromPublicUrl(`${BASE}/carpeta/foto%20uno.png`)).toBe(
      'carpeta/foto uno.png',
    )
  })
})

describe('collectStoragePaths', () => {
  it('junta las rutas referenciadas en un contenido anidado', () => {
    const content = {
      brand: { mark: `${BASE}/mark.png` },
      hero: { images: [`${BASE}/a.png`, '/gallery/local.jpg', ''] },
      catalog: { items: [{ src: `${BASE}/b.png` }, { src: '/otra.jpg' }] },
    }

    expect([...collectStoragePaths(content)].sort()).toEqual(['a.png', 'b.png', 'mark.png'])
  })

  it('ignora valores que no son strings ni contenedores', () => {
    expect([...collectStoragePaths({ n: 1, b: true, z: null })].length).toBe(0)
  })
})
