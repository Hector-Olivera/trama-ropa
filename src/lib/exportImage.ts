import type { Stage } from 'konva/lib/Stage'
import type { ExportFormat, ExportScale, ProductView } from '../types'

export type ExportOptions = {
  scale: ExportScale
  format: ExportFormat
  fileName: string
}

/** Donde esta parado el producto dentro del stage, en pixeles de pantalla. */
export type CanvasPlacement = {
  /** Multiplicador entre los px del producto y los px que ocupa en pantalla. */
  displayScale: number
  offsetX: number
  offsetY: number
}

/**
 * El stage se dibuja escalado para entrar en la pantalla, asi que para que el
 * archivo salga en la resolucion NATIVA del producto hay que dividir el
 * multiplicador por ese scale de pantalla. Con eso, 2x sobre una remera de
 * 1024 px entrega 2048 px, sin importar cuanto grande era la ventana.
 *
 * Tambien recortamos al rectangulo del producto: el stage es mas alto y ancho
 * que la prenda, y sin ese crop el archivo saldria con el fondo oscuro de
 * alrededor y con las dimensiones del stage en vez de las de la prenda.
 */
export async function exportDesign(
  stage: Stage,
  placement: CanvasPlacement,
  product: ProductView,
  options: ExportOptions,
): Promise<{ width: number; height: number }> {
  // Los handles de seleccion jamas deben llegar al archivo.
  const hidden = stage.find('Transformer')
  const previous = hidden.map((node) => node.isVisible())

  hidden.forEach((node) => node.hide())
  stage.batchDraw()

  const pixelRatio = options.scale / placement.displayScale
  const crop = {
    // Redondeamos a px enteros: el crop se translatea sobre el canvas final y
    // un offset fraccionario deja medio pixel de borde del fondo del stage.
    x: Math.round(placement.offsetX),
    y: Math.round(placement.offsetY),
    width: Math.max(1, Math.round(product.width * placement.displayScale)),
    height: Math.max(1, Math.round(product.height * placement.displayScale)),
  }

  let url: string
  try {
    url = stage.toDataURL({
      pixelRatio,
      mimeType: 'image/png',
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
    })
  } finally {
    hidden.forEach((node, index) => (previous[index] ? node.show() : node.hide()))
    stage.batchDraw()
  }

  const blob =
    options.format === 'png'
      ? await dataUrlToBlob(url)
      : await flattenOnto(url, '#ffffff', 0.92)

  const filename = `${options.fileName}-${product.slug}-${options.scale}x.${options.format}`
  downloadBlob(blob, filename)

  return {
    width: Math.round(crop.width * pixelRatio),
    height: Math.round(crop.height * pixelRatio),
  }
}

function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((response) => response.blob())
}

/**
 * JPEG no tiene canal alfa: el PNG transparente del producto se volveria negro.
 * Lo componemos contra un fondo antes de exportar.
 */
async function flattenOnto(dataUrl: string, background: string, quality: number): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('No se pudo preparar la imagen.'))
    element.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Tu navegador no soporta canvas 2D.')

  ctx.fillStyle = background
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo exportar la imagen.'))),
      'image/jpeg',
      quality,
    )
  })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Damos margen antes de liberar la URL o Safari cancela la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}