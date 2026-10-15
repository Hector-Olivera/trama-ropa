import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTENT } from './defaults'

const collectMediaRefs = (): string[] => {
  const refs: string[] = [DEFAULT_CONTENT.brand.mark]
  refs.push(...DEFAULT_CONTENT.hero.images)
  refs.push(...DEFAULT_CONTENT.howItWorks.images)
  refs.push(...DEFAULT_CONTENT.editor.products.map((product) => product.src))
  refs.push(...DEFAULT_CONTENT.catalog.items.map((item) => item.src))
  return refs
}

describe('DEFAULT_CONTENT', () => {
  it('referencia solo assets existentes en public/', () => {
    for (const ref of collectMediaRefs()) {
      expect(ref.startsWith('/')).toBe(true)
      expect(existsSync(join(process.cwd(), 'public', ref)), `falta ${ref}`).toBe(true)
    }
  })

  it('cada item del catalogo pertenece a un grupo existente', () => {
    const groupIds = new Set(DEFAULT_CONTENT.catalog.groups.map((group) => group.id))
    for (const item of DEFAULT_CONTENT.catalog.items) {
      expect(groupIds.has(item.group), `grupo inexistente: ${item.group}`).toBe(true)
    }
  })

  it('las prendas del editor tienen datos completos y ids unicos', () => {
    const products = DEFAULT_CONTENT.editor.products
    expect(products.length).toBeGreaterThan(0)

    const ids = new Set<string>()
    for (const product of products) {
      expect(product.id.length).toBeGreaterThan(0)
      expect(product.slug.length).toBeGreaterThan(0)
      expect(product.label.length).toBeGreaterThan(0)
      expect(product.width).toBeGreaterThan(0)
      expect(product.height).toBeGreaterThan(0)
      expect(ids.has(product.id), `id duplicado: ${product.id}`).toBe(false)
      ids.add(product.id)
    }
  })
})
