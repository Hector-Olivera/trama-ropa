/**
 * Carga de imagenes con cache, y downscaling de logos sobredimensionados.
 *
 * Un logo de 5000 px de un proveedor de estampado seria ~40 MB en memoria y
 * haria lento cada redibujado. Lo limitamos a MAX_IMAGE_EDGE al subirlo.
 */

export const MAX_IMAGE_EDGE = 1600

const imageCache = new Map<string, HTMLImageElement>()
const inflight = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return Promise.resolve(cached)

  const pending = inflight.get(src)
  if (pending) return pending

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      imageCache.set(src, image)
      inflight.delete(src)
      resolve(image)
    }
    image.onerror = () => {
      inflight.delete(src)
      reject(new Error(`No se pudo cargar la imagen: ${src}`))
    }
    image.src = src
  })

  inflight.set(src, promise)
  return promise
}

export function getLoadedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src)
}

/**
 * Reduce un File a MAX_IMAGE_EDGE y devuelve un Blob PNG.
 * Mantiene el canal alfa: los logos SIEMPRE se normalizan a PNG.
 */
export async function prepareLogoFile(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))

  if (scale === 1 && file.type === 'image/png') {
    // Hay que leer width/height ANTES de close(): despues el bitmap queda
    // liberado y sus dimensiones ya no son validas.
    const width = bitmap.width
    const height = bitmap.height
    bitmap.close()
    return { blob: file, width, height }
  }

  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Tu navegador no soporta canvas 2D.')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('No se pudo procesar la imagen.')

  return { blob, width, height }
}

export function isSupportedImageType(file: File): boolean {
  return file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/webp'
}