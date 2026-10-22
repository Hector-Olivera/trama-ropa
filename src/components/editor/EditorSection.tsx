import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type Konva from 'konva'
import { useContent } from '../../content/ContentProvider'
import { exportDesign, renderDesignBlob } from '../../lib/exportImage'
import { isSupabaseConfigured } from '../../lib/env'
import { scrollToId } from '../../lib/scrollToId'
import { deleteDesign, cleanupBlobs, listDesigns, saveDesign } from '../../lib/storage'
import { useEditor } from '../../lib/useEditor'
import { useElementSize } from '../../lib/useElementSize'
import type { ExportFormat, ExportScale, Layer, ProductView } from '../../types'
import { useDesignAttachment } from '../DesignAttachment'
import { useEditorProducts } from '../EditorProducts'
import { EditorCanvas, type CanvasMetrics } from './EditorCanvas'
import { EditorToolbar } from './EditorToolbar'
import { LayersPanel } from './LayersPanel'
import { LogoUploader } from './LogoUploader'
import { ProductPicker } from './ProductPicker'
import { PropertiesPanel } from './PropertiesPanel'
import { RichTitle } from '../RichTitle'

const CANVAS_HEIGHT = 640

/** Firma del contenido guardable. El estado de guardado se deriva de compararla. */
const signatureOf = (productId: string, name: string, layers: Layer[]): string =>
  JSON.stringify({ productId, name, layers })

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

export function EditorSection() {
  const { content } = useContent()
  const { products, selectedId: productId, select, localCount, selectById } =
    useEditorProducts()
  const attachment = useDesignAttachment()

  // El autosave se lee una sola vez y siembra el estado inicial. Hacerlo en un
  // effect seria un setState en render, que la regla react-hooks v7 marca.
  const [boot] = useState(() => {
    const autosave = listDesigns().find((design) => design.id === 'autosave')
    return autosave && autosave.layers.length > 0 ? autosave : null
  })

  const product: ProductView | undefined = useMemo(
    () => products.find((item) => item.id === productId) ?? products[0],
    [products, productId],
  )
  const editor = useEditor(product?.width ?? 1, product?.height ?? 1, boot?.layers ?? [])

  const stageRef = useRef<Konva.Stage>(null)
  const [shellRef, shellSize] = useElementSize<HTMLDivElement>()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [designName, setDesignName] = useState(boot?.name ?? 'Mi diseño')
  const [saved, setSaved] = useState(() => listDesigns())
  const [highlightSaved, setHighlightSaved] = useState(false)
  const [productMissing, setProductMissing] = useState(false)

  const signature = useMemo(
    () => signatureOf(productId, designName, editor.layers),
    [productId, designName, editor.layers],
  )
  const [savedSignature, setSavedSignature] = useState(() =>
    boot ? signatureOf(boot.productId, boot.name, boot.layers) : '',
  )
  // Derivado, no guardado: asi no hace falta setState dentro del effect de autosave.
  const saveState: 'idle' | 'saving' | 'saved' =
    editor.layers.length === 0 ? 'idle' : signature === savedSignature ? 'saved' : 'saving'

  const metrics: CanvasMetrics = useMemo(() => {
    const width = Math.max(shellSize.width, 1)
    const height = CANVAS_HEIGHT
    const productWidth = product?.width ?? 1
    const productHeight = product?.height ?? 1
    const scale = Math.min(width / productWidth, height / productHeight)
    return {
      stageWidth: width,
      stageHeight: height,
      scale,
      offsetX: (width - productWidth * scale) / 2,
      offsetY: (height - productHeight * scale) / 2,
    }
  }, [shellSize.width, product?.width, product?.height])

  const handleCommit = useCallback(
    (layerId: string, patch: Partial<Layer>) => editor.updateLayer(layerId, patch),
    [editor],
  )

  // --- Autosave: una vez que el usuario deja de tocar, guardamos. ---
  useEffect(() => {
    if (editor.layers.length === 0) return
    const timer = setTimeout(() => {
      const now = Date.now()
      saveDesign({
        id: 'autosave',
        name: designName,
        productId,
        layers: editor.layers,
        createdAt: now,
        updatedAt: now,
      })
      setSavedSignature(signature)
      void cleanupBlobs()
    }, 900)

    return () => clearTimeout(timer)
  }, [signature, designName, productId, editor.layers])

  // --- Atajos de teclado ---
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const mod = event.ctrlKey || event.metaKey

      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) editor.redo()
        else editor.undo()
        return
      }
      if (mod && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        editor.redo()
        return
      }
      if (mod && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        editor.duplicateSelected()
        return
      }
      if (mod) return

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!editor.selectedId) return
        event.preventDefault()
        editor.deleteSelected()
        return
      }

      if (!editor.selectedId) return
      const step = event.shiftKey ? 10 : 1
      const layer = editor.selected
      if (!layer) return

      const delta: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      }
      const move = delta[event.key]
      if (move) {
        event.preventDefault()
        editor.updateLayer(layer.id, {
          x: layer.x + move[0],
          y: layer.y + move[1],
        } as Partial<Layer>)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editor])

  const handleExport = useCallback(
    async ({ scale, format }: { scale: ExportScale; format: ExportFormat }) => {
      const stage = stageRef.current
      if (!stage || !product) return
      setExporting(true)
      try {
        await exportDesign(
          stage,
          {
            displayScale: metrics.scale,
            offsetX: metrics.offsetX,
            offsetY: metrics.offsetY,
          },
          product,
          {
            scale,
            format,
            fileName: designName.replace(/[^\w-]+/g, '-').toLowerCase() || 'trama',
          },
        )
      } catch (error) {
        console.error(error)
        alert('No se pudo exportar. Probá de nuevo o usá otro formato.')
      } finally {
        setExporting(false)
      }
    },
    [designName, metrics, product],
  )

  const handleAttach = useCallback(() => {
    const stage = stageRef.current
    if (!stage || !product) return
    void attachment.attach(async () => {
      const { blob } = await renderDesignBlob(
        stage,
        {
          displayScale: metrics.scale,
          offsetX: metrics.offsetX,
          offsetY: metrics.offsetY,
        },
        product,
        { scale: 1, format: 'png' },
      )
      return blob
    })
  }, [attachment, metrics, product])

  const handleSaveJump = () => {
    setHighlightSaved(true)
    scrollToId('mis-disenos')
  }

  const handleSaveVersion = () => {
    saveDesign({
      id: crypto.randomUUID(),
      name: designName.trim() || 'Sin nombre',
      productId,
      layers: editor.layers,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    setSaved(listDesigns())
    setHighlightSaved(false)
  }

  const handleLoad = (id: string) => {
    const design = saved.find((item) => item.id === id)
    if (!design) return
    setDesignName(design.name)
    editor.loadLayers(design.layers)
    setProductMissing(false)
    void selectById(design.productId).then((found) => {
      if (!found) setProductMissing(true)
    })
  }

  const handleSelectProduct = (nextProductId: string) => {
    setProductMissing(false)
    select(nextProductId)
  }

  const handleDelete = (id: string) => {
    deleteDesign(id)
    setSaved(listDesigns())
    void cleanupBlobs()
  }

  const versions = saved.filter((design) => design.id !== 'autosave')

  return (
    <section id="editor" className="relative scroll-mt-20 border-t border-brand-line py-16">
      <div className="mx-auto max-w-7xl px-4">
        <header className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand-cyan">
            {content.editor.eyebrow}
          </p>
          <h2 className="font-display text-3xl uppercase tracking-tight sm:text-4xl">
            <RichTitle value={content.editor.title} />
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">{content.editor.subtitle}</p>
        </header>

        {!product ? (
          <div className="rounded-lg border border-dashed border-brand-line bg-brand-surface p-8 text-center">
            <p className="text-sm text-brand-muted">
              Todavía no hay prendas cargadas en el editor. Agregalas desde el panel de
              administración.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
              <div className="space-y-5 rounded-lg border border-brand-line bg-brand-surface p-3">
                <ProductPicker
                  products={products}
                  productId={productId}
                  onChange={handleSelectProduct}
                  layerCount={editor.layers.length}
                  localCount={localCount}
                />

                {productMissing && (
                  <p role="status" className="text-[11px] leading-snug text-brand-pink">
                    La foto de este diseño ya no está en el catálogo; quedó la prenda anterior.
                  </p>
                )}
                <LogoUploader onAdd={editor.addImageLayer} />
                <button
                  type="button"
                  onClick={editor.addTextLayer}
                  className="w-full rounded-lg border border-brand-line px-3 py-2 text-xs font-semibold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
                >
                  + Agregar texto
                </button>
              </div>

              <div className="min-w-0 space-y-3">
                <EditorToolbar
                  canUndo={editor.canUndo}
                  canRedo={editor.canRedo}
                  hasLayers={editor.layers.length > 0}
                  onUndo={editor.undo}
                  onRedo={editor.redo}
                  onClear={editor.clearLayers}
                  onExport={handleExport}
                  exporting={exporting}
                  canAttach={isSupabaseConfigured()}
                  onAttach={handleAttach}
                  attachState={attachment.status}
                  onSaveJump={handleSaveJump}
                />

                <div ref={shellRef} className="relative">
                  <EditorCanvas
                    product={product}
                    layers={editor.layers}
                    selectedId={editor.selectedId}
                    metrics={metrics}
                    stageRef={stageRef}
                    editingId={editingId}
                    onEditingChange={setEditingId}
                    onSelect={editor.setSelectedId}
                    onCommit={handleCommit}
                  />
                </div>

                <p className="text-[11px] text-brand-muted">
                  Doble click en un texto para editarlo · Supr para borrar · Ctrl+Z deshacer ·
                  flechas para mover · Shift+flechas para pasos de 10 px
                </p>
              </div>

              <div className="space-y-4 rounded-lg border border-brand-line bg-brand-surface p-3">
                <PropertiesPanel
                  layer={editor.selected}
                  onChange={(patch) => {
                    if (editor.selectedId) handleCommit(editor.selectedId, patch)
                  }}
                />

                <div>
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                    Capas
                  </h3>
                  <LayersPanel
                    layers={editor.layers}
                    selectedId={editor.selectedId}
                    onSelect={editor.setSelectedId}
                    onToggleVisible={(id) => {
                      const layer = editor.layers.find((item) => item.id === id)
                      if (layer) handleCommit(id, { visible: !layer.visible } as Partial<Layer>)
                    }}
                    onToggleLocked={(id) => {
                      const layer = editor.layers.find((item) => item.id === id)
                      if (layer) handleCommit(id, { locked: !layer.locked } as Partial<Layer>)
                    }}
                    onReorder={editor.reorderLayer}
                    onRemove={editor.removeLayer}
                  />
                </div>
              </div>
            </div>

            <SavedDesigns
              versions={versions}
              name={designName}
              saveState={saveState}
              highlight={highlightSaved}
              onNameChange={setDesignName}
              onSave={handleSaveVersion}
              onLoad={handleLoad}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </section>
  )
}

type SavedProps = {
  versions: ReturnType<typeof listDesigns>
  name: string
  saveState: 'idle' | 'saving' | 'saved'
  highlight: boolean
  onNameChange: (value: string) => void
  onSave: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

function SavedDesigns({
  versions,
  name,
  saveState,
  highlight,
  onNameChange,
  onSave,
  onLoad,
  onDelete,
}: SavedProps) {
  return (
    <div
      id="mis-disenos"
      className={`mt-8 scroll-mt-20 rounded-lg border p-4 transition ${
        highlight
          ? 'border-brand-cyan bg-brand-cyan/5 ring-2 ring-brand-cyan/70'
          : 'border-brand-line bg-brand-surface'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Mis diseños
        </h3>
        <span aria-live="polite" className="text-[11px] text-brand-muted">
          {saveState === 'saving' && 'Guardando...'}
          {saveState === 'saved' && '✓ Guardado en este dispositivo'}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            aria-label="Nombre del diseño"
            className="rounded border border-brand-line bg-brand-black px-2.5 py-1.5 text-xs text-brand-light outline-none focus:border-brand-cyan"
          />
          <button
            type="button"
            onClick={onSave}
            className="rounded border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
          >
            Guardar versión
          </button>
        </div>
      </div>

      {versions.length === 0 ? (
        <p className="mt-3 text-[11px] text-brand-muted">
          No hay versiones guardadas. Tu trabajo actual se guarda solo; usá "Guardar versión"
          para conservar una copia con nombre.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {versions.map((design) => (
            <li
              key={design.id}
              className="flex items-center gap-2 rounded border border-brand-line bg-brand-black/40 px-2.5 py-2"
            >
              <button
                type="button"
                onClick={() => onLoad(design.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-xs font-semibold text-brand-light">
                  {design.name}
                </span>
                <span className="block text-[10px] text-brand-muted">
                  {new Date(design.updatedAt).toLocaleDateString('es-AR')} ·{' '}
                  {design.layers.length}{' '}
                  {design.layers.length === 1 ? 'capa' : 'capas'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(design.id)}
                aria-label={`Borrar ${design.name}`}
                className="w-5 rounded text-center text-brand-muted transition hover:bg-brand-pink/20 hover:text-brand-pink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}