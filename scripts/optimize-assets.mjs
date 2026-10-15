/**
 * Copia y recomprime los assets de Trama desde el disco externo al proyecto.
 *
 * Los originales NUNCA se modifican: solo se leen. Si borras public/ podés
 * volver a correr `npm run assets` sin perdida.
 *
 *   node scripts/optimize-assets.mjs
 */
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SRC = 'C:/Users/olive/Desktop/escritorio/_Andres/Estampados'
const NEO = `${SRC}/trama-ropa/newood-2026`

/**
 * width: ancho maximo en px (se conserva la proporcion).
 * Los PNG con alfa NUNCA se convierten a JPEG: perderian la transparencia.
 */
const ASSETS = [
  // --- Bases del editor: las 4 remeras, ya aisladas con canal alfa ---
  { src: `${SRC}/remera blanca-Frente.png`, out: 'products/remera-blanca-frente.png', width: 1024 },
  { src: `${SRC}/remera negra-Frente.png`, out: 'products/remera-negra-frente.png', width: 1024 },
  { src: `${SRC}/remera blanca-Dorso.png`, out: 'products/remera-blanca-dorso.png', width: 1024 },
  { src: `${SRC}/remera negra-Dorso.png`, out: 'products/remera-negra-dorso.png', width: 1024 },

  // --- Marca ---
  { src: `${SRC}/trama-ropa/logos/trama-cirulo.png`, out: 'brand/logo-mark.png', width: 512 },
  { src: `${SRC}/trama-ropa/logos/trama-estampa.png`, out: 'brand/logo-estampa.png', width: 512 },
  { src: `${SRC}/trama-ropa/logos/trama sin fondo.png`, out: 'brand/logo-wordmark.png', width: 900 },

  // --- Galeria: 20 fotos lifestyle repartidas entre las 6 prendas ---
  ...[
    ['calza-oxford', 'calza oxfort', ['NEWOD2647', 'NEWOD2648', 'NEWOD2649', 'NEWOD2650']],
    ['campera-negra', 'campera negra', ['1', '2', '3', '4']],
    ['con-tiras-azulgris', 'con tiras azulGris', ['NEWOD2475', 'NEWOD2476', 'NEWOD2477', 'NEWOD2478']],
    ['con-tiras-gris', 'con tiras gris', ['NEWOD2465', 'NEWOD2466', 'NEWOD2467']],
    ['con-tiras-negra', 'con tiras negra', ['New Od-38', 'New Od-39']],
    ['polar-cierre', 'polar con cierre', ['New Od-117', 'New Od-118', 'New Od-119']],
  ].flatMap(([slug, folder, files]) =>
    files.map((name, i) => ({
      src: `${NEO}/${folder}/${name}.jpg`,
      out: `gallery/${slug}-${String(i + 1).padStart(2, '0')}.jpg`,
      width: 1400,
      quality: 82,
    })),
  ),
]

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`

async function run() {
  console.log('Optimizando assets de Trama\n')

  let before = 0
  let after = 0
  const rows = []
  const missing = []

  for (const asset of ASSETS) {
    const srcPath = resolve(asset.src)
    const outPath = join(ROOT, 'public', asset.out)

    let srcStat
    try {
      srcStat = await stat(srcPath)
    } catch {
      missing.push(asset.src)
      continue
    }

    await mkdir(dirname(outPath), { recursive: true })

    const isPng = asset.out.endsWith('.png')
    let pipeline = sharp(srcPath).resize({
      width: asset.width,
      withoutEnlargement: true,
    })

    if (isPng) {
      // compressionLevel 9 + effort 10: maxima compresion, sin perder alfa.
      pipeline = pipeline.png({ compressionLevel: 9, effort: 10 })
    } else {
      pipeline = pipeline.jpeg({ quality: asset.quality ?? 82, mozjpeg: true, progressive: true })
    }

    const info = await pipeline.toFile(outPath)
    before += srcStat.size
    after += info.size

    rows.push({ archivo: asset.out, antes: kb(srcStat.size), despues: kb(info.size) })
  }

  for (const row of rows) {
    console.log(`  ${row.archivo.padEnd(36)} ${row.antes.padStart(9)} -> ${row.despues.padStart(9)}`)
  }

  console.log(`\n  ${rows.length} archivos`)
  console.log(`  Total: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`)

  if (missing.length) {
    console.log(`\n  ${missing.length} archivo(s) no encontrado(s):`)
    for (const path of missing) console.log(`    - ${path}`)
  }

  await writeFile(
    join(ROOT, 'public', 'assets-manifest.json'),
    `${JSON.stringify(rows, null, 2)}\n`,
  )
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})