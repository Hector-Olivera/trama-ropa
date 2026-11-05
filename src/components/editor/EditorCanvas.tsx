import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Image as KonvaImage,
  Layer as KonvaLayer,
  Stage as KonvaStage,
  Text as KonvaText,
  Transformer as KonvaTransformer,
} from 'react-konva'
import type Konva from 'konva'
import type { ImageLayer, Layer, ProductView, TextLayer } from '../../types'
import type { CanvasMetrics } from '../../lib/canvasMetrics'
import { getLoadedImage, loadImage } from '../../lib/images'
import { resolveDrawableSrc } from '../../lib/storage'
import { filterKey, getFilteredCanvas, isFilterNeutral } from '../../lib/imageFilters'
import { useLoadedImage } from '../../content/useLoadedImage'
import { TextOverlay } from './TextOverlay'

const PAN_THRESHOLD = 4

type Props = {
  product: ProductView
  layers: Layer[]
  selectedId: string | null
  metrics: CanvasMetrics
  stageRef: React.RefObject<Konva.Stage | null>
  viewportRef: React.RefObject<HTMLDivElement | null>
  canPan: boolean
  onSelect: (id: string | null) => void
  onCommit: (id: string, patch: Partial<Layer>) => void
  onEditingChange: (id: string | null) => void
  editingId: string | null
}

function pointerOf(event: MouseEvent | TouchEvent): { x: number; y: number } | null {
  if ('touches' in event) {
    const touch = event.touches[0]
    return touch ? { x: touch.clientX, y: touch.clientY } : null
  }
  return { x: event.clientX, y: event.clientY }
}

export function EditorCanvas({
  product,
  layers,
  selectedId,
  metrics,
  stageRef,
  viewportRef,
  canPan,
  onSelect,
  onCommit,
  onEditingChange,
  editingId,
}: Props) {
  const { stageWidth, stageHeight, scale, offsetX, offsetY } = metrics
  const transformerRef = useRef<Konva.Transformer>(null)
  const nodeRefs = useRef(new Map<string, Konva.Node>())
  const panCleanupRef = useRef<(() => void) | null>(null)
  const productImage = useLoadedImage(product.src)

  const editingLayer = useMemo(
    () => layers.find((item) => item.id === editingId) ?? null,
    [layers, editingId],
  )

  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return

    const node = selectedId ? nodeRefs.current.get(selectedId) : undefined
    const editable = node ? (node.getAttr('locked') as boolean) !== true : false
    transformer.nodes(node && editable ? [node] : [])
    transformer.getLayer()?.batchDraw()
  }, [selectedId, layers])

  const clearSelection = useCallback(() => {
    onSelect(null)
    onEditingChange(null)
  }, [onEditingChange, onSelect])

  useEffect(() => () => panCleanupRef.current?.(), [])

  const startPan = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const viewport = viewportRef.current
      const start = pointerOf(event.evt)
      if (!viewport || !start || panCleanupRef.current) return

      const origin = {
        x: start.x,
        y: start.y,
        left: viewport.scrollLeft,
        top: viewport.scrollTop,
      }
      let moved = false

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const next = pointerOf(moveEvent)
        if (!next) return
        const dx = next.x - origin.x
        const dy = next.y - origin.y
        if (!moved && Math.abs(dx) + Math.abs(dy) < PAN_THRESHOLD) return
        moved = true
        viewport.scrollLeft = origin.left - dx
        viewport.scrollTop = origin.top - dy
        if ('touches' in moveEvent) moveEvent.preventDefault()
      }

      const finish = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', finish)
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend', finish)
        window.removeEventListener('touchcancel', finish)
        panCleanupRef.current = null
        if (!moved) clearSelection()
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', finish)
      window.addEventListener('touchmove', onMove, { passive: false })
      window.addEventListener('touchend', finish)
      window.addEventListener('touchcancel', finish)
      panCleanupRef.current = finish
    },
    [clearSelection, viewportRef],
  )

  const handleBackgroundDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (event.target !== event.target.getStage()) return
      if (canPan) {
        startPan(event)
        return
      }
      clearSelection()
    },
    [canPan, clearSelection, startPan],
  )

  return (
    <div className="relative" style={{ width: stageWidth, height: stageHeight }}>
      <KonvaStage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        onMouseDown={handleBackgroundDown}
        onTouchStart={handleBackgroundDown}
      >
        <KonvaLayer listening={false}>
          {productImage && (
            <KonvaImage
              image={productImage}
              x={offsetX}
              y={offsetY}
              width={product.width * scale}
              height={product.height * scale}
            />
          )}
        </KonvaLayer>

        <KonvaLayer>
          {layers.map((layer) => (
            <LayerNode
              key={layer.id}
              layer={layer}
              metrics={metrics}
              isEditing={layer.id === editingId}
              registerRef={(node) => {
                if (node) nodeRefs.current.set(layer.id, node)
                else nodeRefs.current.delete(layer.id)
              }}
              onSelect={() => onSelect(layer.id)}
              onCommit={onCommit}
              onStartEditing={() => onEditingChange(layer.id)}
            />
          ))}

          <KonvaTransformer
            ref={transformerRef}
            name="transformer"
            rotateAnchorOffset={26}
            anchorStroke="#00d9ff"
            anchorFill="#00d9ff"
            anchorSize={9}
            anchorCornerRadius={2}
            borderStroke="#00d9ff"
            borderDash={[4, 3]}
            ignoreStroke
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            boundBoxFunc={(oldBox, newBox) =>
              Math.abs(newBox.width) < 24 || Math.abs(newBox.height) < 24 ? oldBox : newBox
            }
          />
        </KonvaLayer>
      </KonvaStage>

      <TextOverlay
        key={editingLayer?.id ?? 'sin-edicion'}
        layer={editingLayer?.type === 'text' ? editingLayer : null}
        metrics={metrics}
        onCommit={(patch) => {
          if (editingId) onCommit(editingId, patch)
        }}
        onDone={() => onEditingChange(null)}
      />
    </div>
  )
}

type NodeProps = {
  layer: Layer
  metrics: CanvasMetrics
  isEditing: boolean
  registerRef: (node: Konva.Node | null) => void
  onSelect: () => void
  onCommit: (id: string, patch: Partial<Layer>) => void
  onStartEditing: () => void
}

/**
 * Convierte coordenadas de pantalla a coordenadas NATIVAS del producto.
 * Guardamos todo en pixeles del producto, no de la pantalla: asi el documento
 * sobrevive a que el usuario cambie de monitor o gire el celular.
 */
function toNative(pos: { x: number; y: number }, metrics: CanvasMetrics) {
  return {
    x: (pos.x - metrics.offsetX) / metrics.scale,
    y: (pos.y - metrics.offsetY) / metrics.scale,
  }
}

function LayerNode({
  layer,
  metrics,
  isEditing,
  registerRef,
  onSelect,
  onCommit,
  onStartEditing,
}: NodeProps) {
  const { scale, offsetX, offsetY } = metrics
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (layer.type !== 'image') return

    let active = true
    void resolveDrawableSrc(layer.src)
      .then((url) => {
        if (!active) return
        const cached = getLoadedImage(url)
        if (cached) {
          setImage(cached)
          return
        }
        return loadImage(url).then((loaded) => {
          if (active) setImage(loaded)
        })
      })
      .catch((error) => {
        console.error('No se pudo cargar la capa:', error)
      })

    return () => {
      active = false
    }
  }, [layer])

  const key = layer.type === 'image' ? filterKey(layer.filters) : 'text'

  const drawable = useMemo<HTMLImageElement | HTMLCanvasElement | null>(() => {
    if (layer.type !== 'image' || !image) return null
    if (isFilterNeutral(layer.filters)) return image
    return getFilteredCanvas(image, layer.src, layer.filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, key])

  const dragBoundFunc = useCallback(
    (pos: { x: number; y: number }) => {
      const native = toNative(pos, metrics)
      return { x: offsetX + native.x * scale, y: offsetY + native.y * scale }
    },
    [metrics, offsetX, offsetY, scale],
  )

  if (layer.type === 'image') {
    const { x, y, width, height, rotation, opacity, visible, locked } = layer as ImageLayer
    return (
      <KonvaImage
        ref={registerRef}
        image={drawable ?? undefined}
        x={offsetX + x * scale}
        y={offsetY + y * scale}
        width={width * scale}
        height={height * scale}
        rotation={rotation}
        opacity={opacity}
        visible={visible && !isEditing}
        locked={locked}
        flipX={layer.flipX}
        flipY={layer.flipY}
        draggable={!locked && !isEditing}
        dragBoundFunc={dragBoundFunc}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(event) => {
          onCommit(layer.id, toNative(event.target.position(), metrics) as Partial<Layer>)
        }}
        onTransformEnd={(event) => {
          const node = event.target
          // El Transformer modifica scale, no width/height. Lo plegamos de vuelta
          // para que el documento siga siendo data plano legible.
          const nextWidth = Math.max(16, node.width() * node.scaleX())
          const nextHeight = Math.max(16, node.height() * node.scaleY())
          node.scaleX(1)
          node.scaleY(1)
          onCommit(layer.id, {
            ...toNative(node.position(), metrics),
            width: nextWidth / scale,
            height: nextHeight / scale,
            rotation: node.rotation(),
          } as Partial<Layer>)
        }}
      />
    )
  }

  const { x, y, width, height, rotation, opacity, visible, locked } = layer as TextLayer
  return (
    <KonvaText
      ref={registerRef}
      text={layer.text}
      x={offsetX + x * scale}
      y={offsetY + y * scale}
      width={width * scale}
      height={height * scale}
      fontSize={layer.fontSize * scale}
      fontFamily={layer.fontFamily}
      fontStyle={layer.fontStyle}
      fontWeight={layer.fontWeight === 400 ? 'normal' : 'bold'}
      fill={layer.fill}
      align={layer.align}
      letterSpacing={layer.letterSpacing * scale}
      lineHeight={1.2}
      rotation={rotation}
      opacity={opacity}
      visible={visible && !isEditing}
      locked={locked}
      draggable={!locked && !isEditing}
      dragBoundFunc={dragBoundFunc}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={onStartEditing}
      onDblTap={onStartEditing}
      onDragEnd={(event) => {
        onCommit(layer.id, toNative(event.target.position(), metrics) as Partial<Layer>)
      }}
      onTransformEnd={(event) => {
        const node = event.target
        const nextWidth = Math.max(20, node.width() * node.scaleX())
        // En texto la escala promedio manda sobre el fontSize, para que al
        // agrandar la caja no se deforme el texto.
        const averageScale = (node.scaleX() + node.scaleY()) / 2
        node.scaleX(1)
        node.scaleY(1)
        onCommit(layer.id, {
          ...toNative(node.position(), metrics),
          width: nextWidth / scale,
          height: Math.max(16, layer.height * averageScale),
          fontSize: Math.max(6, Math.round(layer.fontSize * averageScale)),
          rotation: node.rotation(),
        } as Partial<Layer>)
      }}
    />
  )
}