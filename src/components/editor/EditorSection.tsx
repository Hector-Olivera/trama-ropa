import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type Konva from 'konva'
import { useContent } from '../../content/ContentProvider'
import { ZOOM_MIN, clampZoom, computeCanvasMetrics } from '../../lib/canvasMetrics'
import { renderDesignBlob } from '../../lib/exportImage'
import { isSupabaseConfigured } from '../../lib/env'
import { scrollToId } from '../../lib/scrollToId'
import { mergeLoadedLayers } from '../../lib/designLayers'
import {
  deleteDesign,
  cleanupBlobs,
  listDesigns,
  saveDesign,
  MAX_SAVED_DESIGNS,
} from '../../lib/storage'
import { useEditor, MAX_LAYERS } from '../../lib/useEditor'
import { useElementSize } from '../../lib/useElementSize'
import type { Layer, ProductView } from '../../types'
import { useDesignAttachment } from '../DesignAttachment'
import { useEditorProducts } from '../EditorProducts'
import { EditorCanvas } from './EditorCanvas'
import { EditorToolbar } from './EditorToolbar'
import { LayersPanel } from './LayersPanel'
import { LogoUploader } from './LogoUploader'
import { ProductPicker } from './ProductPicker'
import { SavedDesigns } from './SavedDesigns'
import { ZoomControl } from './ZoomControl'
import { RichTitle } from '../RichTitle'

const CANVAS_HEIGHT = 640

/** Firma del contenido guardable. El estado de guardado se deriva de compararla. */
const signatureOf = (
  productId: string,
  name: string,
  layers: Layer[],
  zoom: number,
): string => JSON.stringify({ productId, name, layers, zoom })

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

export function EditorSection() {
  const { content } = useContent()
  const {
    products,
    selectedId: productId,
    select,
    localCount,
    selectById,
    localProducts,
    activeDesignId,
    setActiveDesignId,
  } = useEditorProducts()
  const attachment = useDesignAttachment()
  const userAddedIds = useMemo(() => localProducts.map((item) => item.id), [localProducts])

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
  const [namedFor, setNamedFor] = useState(() => ({
    productId,
    name: boot?.name ?? 'Mi diseño',
  }))
  const designName = namedFor.productId === productId ? namedFor.name : 'Mi diseño'
  // El zoom pertenece a la prenda que se está viendo: si cambia la prenda,
  // vuelve al tamaño original sin que haya que resetearlo a mano en cada camino
  // (selector, "Llevar al editor" del catálogo o restaurar una versión).
  const [zoomFor, setZoomFor] = useState(() => ({
    productId,
    value: clampZoom(boot?.zoom ?? 1),
  }))
  const zoom = zoomFor.productId === productId ? zoomFor.value : ZOOM_MIN
  const [saved, setSaved] = useState(() => listDesigns())
  const [highlightSaved, setHighlightSaved] = useState(false)
  const [productMissing, setProductMissing] = useState(false)
  const [layerLimitNotice, setLayerLimitNotice] = useState(false)
  const [savingAsNew, setSavingAsNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [designLimitNotice, setDesignLimitNotice] = useState(false)
  const layerCount = editor.layers.length
  const atLayerLimit = layerCount >= MAX_LAYERS
  const versions = useMemo(
    () => saved.filter((design) => design.id !== 'autosave'),
    [saved],
  )
  const savedCount = versions.length
  const canSaveChanges = activeDesignId !== null && !savingAsNew

  const signature = useMemo(
    () => signatureOf(productId, designName, editor.layers, zoom),
    [productId, designName, editor.layers, zoom],
  )
  const [savedSignature, setSavedSignature] = useState(() =>
    boot ? signatureOf(boot.productId, boot.name, boot.layers, clampZoom(boot.zoom ?? 1)) : '',
  )
  // Derivado, no guardado: asi no hace falta setState dentro del effect de autosave.
  const saveState: 'idle' | 'saving' | 'saved' =
    editor.layers.length === 0 ? 'idle' : signature === savedSignature ? 'saved' : 'saving'

  const metrics = useMemo(
    () =>
      computeCanvasMetrics(
        { width: product?.width ?? 1, height: product?.height ?? 1 },
        { width: shellSize.width, height: shellSize.height || CANVAS_HEIGHT },
        zoom,
      ),
    [shellSize.width, shellSize.height, product?.width, product?.height, zoom],
  )

  const handleCommit = useCallback(
    (layerId: string, patch: Partial<Layer>) => editor.updateLayer(layerId, patch),
    [editor],
  )

  const handleSelectLayer = useCallback(
    (layerId: string) => {
      const layer = editor.layers.find((item) => item.id === layerId)
      if (layer && !layer.visible) handleCommit(layerId, { visible: true })
      editor.setSelectedId(layerId)
    },
    [editor, handleCommit],
  )

  const handleZoom = useCallback(
    (value: number) => setZoomFor({ productId, value: clampZoom(value) }),
    [productId],
  )

  // El lienzo crece con el zoom: al cambiarlo centramos la vista en la prenda.
  useEffect(() => {
    const viewport = shellRef.current
    if (!viewport) return
    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) / 2)
    viewport.scrollTop = Math.max(0, (viewport.scrollHeight - viewport.clientHeight) / 2)
  }, [zoom, shellRef])

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
        zoom,
        createdAt: now,
        updatedAt: now,
      })
      setSavedSignature(signature)
      void cleanupBlobs()
    }, 900)

    return () => clearTimeout(timer)
  }, [signature, designName, productId, editor.layers, zoom])

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
        handleCommit(editor.selectedId, { visible: false })
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
  }, [editor, handleCommit])

  const designSnapshot = useMemo(
    () => JSON.stringify({ productId, zoom, layers: editor.layers }),
    [editor.layers, productId, zoom],
  )

  const isCurrentSaved = useMemo(
    () =>
      saved.some(
        (item) =>
          item.id !== 'autosave' &&
          JSON.stringify({
            productId: item.productId,
            zoom: item.zoom ?? 1,
            layers: item.layers,
          }) === designSnapshot,
      ),
    [designSnapshot, saved],
  )

  const isAlreadyAttached = useMemo(
    () => attachment.attachments.some((item) => item.signature === designSnapshot),
    [attachment.attachments, designSnapshot],
  )

  const handleAttach = useCallback(() => {
    const stage = stageRef.current
    if (!stage || !product) return
    void attachment.attach(
      async () => {
        const { blob } = await renderDesignBlob(
          stage,
          {
            displayScale: metrics.scale,
            offsetX: metrics.offsetX,
            offsetY: metrics.offsetY,
          },
          product,
          { scale: 3, format: 'png' },
        )
        return blob
      },
      designSnapshot,
    )
  }, [attachment, designSnapshot, metrics, product])

  const handleSaveJump = useCallback(() => {
    setHighlightSaved(true)
    scrollToId('mis-disenos')
  }, [])

  const handleSaveChanges = useCallback(() => {
    if (!activeDesignId || savingAsNew) return
    const design = saved.find((item) => item.id === activeDesignId)
    if (!design) {
      setActiveDesignId(null)
      return
    }
    saveDesign({
      ...design,
      name: designName,
      productId,
      layers: editor.layers,
      zoom,
    })
    setSaved(listDesigns())
    setDesignLimitNotice(false)
  }, [
    activeDesignId,
    savingAsNew,
    saved,
    designName,
    productId,
    editor.layers,
    zoom,
    setActiveDesignId,
  ])

  const handleSaveAsNew = useCallback(() => {
    if (!savingAsNew) {
      if (versions.length >= MAX_SAVED_DESIGNS) {
        setDesignLimitNotice(true)
        return
      }
      setDesignLimitNotice(false)
      setNewName('')
      setSavingAsNew(true)
      return
    }

    const nextName = newName.trim() || 'Sin nombre'
    const id = crypto.randomUUID()
    saveDesign({
      id,
      name: nextName,
      productId,
      layers: editor.layers,
      zoom,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    setSaved(listDesigns())
    setActiveDesignId(id)
    setNamedFor({ productId, name: nextName })
    setNewName('')
    setSavingAsNew(false)
    setHighlightSaved(false)
    setDesignLimitNotice(false)
  }, [
    savingAsNew,
    versions.length,
    newName,
    productId,
    editor.layers,
    zoom,
    setActiveDesignId,
  ])

  const handleCancelNew = useCallback(() => {
    setSavingAsNew(false)
    setNewName('')
  }, [])

  const handleLoad = (id: string) => {
    const design = saved.find((item) => item.id === id)
    if (!design) return
    setActiveDesignId(id)
    setSavingAsNew(false)
    setNewName('')
    setDesignLimitNotice(false)
    setNamedFor({ productId: design.productId, name: design.name })
    editor.loadLayers(mergeLoadedLayers(editor.layers, design.layers))
    setZoomFor({ productId: design.productId, value: clampZoom(design.zoom ?? 1) })
    setProductMissing(false)
    void selectById(design.productId).then((found) => {
      if (!found) setProductMissing(true)
    })
  }

  const handleSelectProduct = (nextProductId: string) => {
    setProductMissing(false)
    setZoomFor({ productId: nextProductId, value: ZOOM_MIN })
    for (const layer of editor.layers) {
      if (layer.type === 'image' && layer.visible) {
        editor.updateLayer(layer.id, { visible: false })
      }
    }
    select(nextProductId)
  }

  const handleDelete = (id: string) => {
    deleteDesign(id)
    setSaved(listDesigns())
    setDesignLimitNotice(false)
    if (id === activeDesignId) setActiveDesignId(null)
    void cleanupBlobs()
  }

  return (
    <section
      id="editor"
      className="relative scroll-mt-20 border-t border-brand-line py-10 md:py-16 lg:scroll-mt-[var(--nav-height)] lg:pt-0"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="lg:flex lg:h-[calc(100dvh-var(--nav-height))] lg:flex-col">
          <header className="mb-8 lg:mb-4 lg:shrink-0">
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
            <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[250px_minmax(0,1fr)_260px]">
              <div className="trama-scroll min-w-0 space-y-5 rounded-lg border border-brand-line bg-brand-surface p-3 lg:min-h-0 lg:overflow-y-auto">
                <ProductPicker
                  products={products}
                  productId={productId}
                  onChange={handleSelectProduct}
                  layerCount={editor.layers.length}
                  localCount={localCount}
                  userAddedIds={userAddedIds}
                />

                {productMissing && (
                  <p role="status" className="text-[11px] leading-snug text-brand-pink">
                    La foto de este diseño ya no está en el catálogo; quedó la prenda anterior.
                  </p>
                )}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <LogoUploader
                      onAdd={(input) => {
                        setLayerLimitNotice(false)
                        editor.addImageLayer(input)
                      }}
                      remaining={Math.max(0, MAX_LAYERS - layerCount)}
                      onLimitReached={() => setLayerLimitNotice(true)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (atLayerLimit) {
                          setLayerLimitNotice(true)
                          return
                        }
                        setLayerLimitNotice(false)
                        editor.addTextLayer()
                      }}
                      className="rounded-lg border border-brand-line px-3 py-2.5 text-xs font-semibold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
                    >
                      + Agregar texto
                    </button>
                  </div>
                  {atLayerLimit && layerLimitNotice && (
                    <p role="alert" className="text-[11px] leading-snug text-brand-pink">
                      Llegaste al límite de {MAX_LAYERS} capas. Eliminá alguna para poder agregar
                      otra.
                    </p>
                  )}
                  <p className="text-[10px] leading-snug text-brand-muted">
                    Un PNG con fondo transparente da el mejor resultado.
                  </p>
                </div>
              </div>

              <div className="min-w-0 space-y-3 lg:flex lg:min-h-0 lg:flex-col">
                <EditorToolbar
                  canUndo={editor.canUndo}
                  canRedo={editor.canRedo}
                  hasLayers={editor.layers.length > 0}
                  onUndo={editor.undo}
                  onRedo={editor.redo}
                  onClear={editor.clearLayers}
                  canAttach={isSupabaseConfigured()}
                  onAttach={handleAttach}
                  attachState={attachment.status}
                  attachmentCount={attachment.count}
                  isAlreadyAttached={isAlreadyAttached}
                  onSaveJump={handleSaveJump}
                  isSaved={isCurrentSaved}
                />

                <div className="relative lg:min-h-0 lg:flex-1">
                  <div
                    ref={shellRef}
                    className={`trama-scroll h-[640px] overflow-auto lg:h-full ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <EditorCanvas
                      product={product}
                      layers={editor.layers}
                      selectedId={editor.selectedId}
                      metrics={metrics}
                      stageRef={stageRef}
                      viewportRef={shellRef}
                      canPan={zoom > 1}
                      editingId={editingId}
                      onEditingChange={setEditingId}
                      onSelect={editor.setSelectedId}
                      onCommit={handleCommit}
                    />
                  </div>

                  <ZoomControl zoom={zoom} onChange={handleZoom} />
                </div>

                <p className="text-[11px] text-brand-muted">
                  Doble click en un texto para editarlo · Supr para ocultar · Ctrl+Z deshacer ·
                  flechas para mover · Shift+flechas para pasos de 10 px
                  {zoom > 1 && ' · Arrastrá la prenda para mover la vista'}
                </p>
              </div>

              <div className="trama-scroll min-w-0 space-y-4 rounded-lg border border-brand-line bg-brand-surface p-3 lg:min-h-0 lg:overflow-y-auto">
                <div>
                  <h3 className="mb-2 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
                    <span>Capas</span>
                    <span
                      className={`tabular-nums ${
                        atLayerLimit ? 'text-brand-cyan' : 'text-brand-muted'
                      }`}
                    >
                      {layerCount}/{MAX_LAYERS}
                    </span>
                  </h3>
                  <LayersPanel
                    layers={editor.layers}
                    selectedId={editor.selectedId}
                    onSelect={handleSelectLayer}
                    onChange={handleCommit}
                    onToggleVisible={(id) => {
                      const layer = editor.layers.find((item) => item.id === id)
                      if (layer) handleCommit(id, { visible: !layer.visible } as Partial<Layer>)
                    }}
                    onRemove={editor.removeLayer}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {product && (
          <SavedDesigns
            versions={versions}
            name={designName}
            saveState={saveState}
            highlight={highlightSaved}
            activeId={activeDesignId}
            savingAsNew={savingAsNew}
            newName={newName}
            savedCount={savedCount}
            maxSaved={MAX_SAVED_DESIGNS}
            limitNotice={designLimitNotice}
            canSaveChanges={canSaveChanges}
            onNewNameChange={setNewName}
            onSaveChanges={handleSaveChanges}
            onSaveAsNew={handleSaveAsNew}
            onCancelNew={handleCancelNew}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  )
}
