import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadImage } from './images'

class FakeImage {
  static instances: FakeImage[] = []

  crossOrigin: string | null = null
  decoding = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  naturalWidth = 10
  naturalHeight = 10
  private currentSrc = ''

  constructor() {
    FakeImage.instances.push(this)
  }

  get src() {
    return this.currentSrc
  }

  set src(value: string) {
    this.currentSrc = value
    queueMicrotask(() => this.onload?.())
  }
}

function stubImage() {
  FakeImage.instances = []
  vi.stubGlobal('Image', FakeImage)
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadImage', () => {
  it('pide CORS para imágenes remotas', async () => {
    stubImage()

    await loadImage('https://cdn.example.com/logo.png?remote')

    expect(FakeImage.instances[0]?.crossOrigin).toBe('anonymous')
  })

  it('no pide CORS para imágenes locales', async () => {
    stubImage()

    await loadImage('/products/remera.png')

    expect(FakeImage.instances[0]?.crossOrigin).toBeNull()
  })

  it('no pide CORS para blobs', async () => {
    stubImage()

    await loadImage('blob:http://localhost/logo')

    expect(FakeImage.instances[0]?.crossOrigin).toBeNull()
  })
})
