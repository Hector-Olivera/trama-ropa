import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_FILTERS, type ImageLayer, type Layer, type TextLayer } from '../types'
import { useHistory } from './useHistory'

const id = () => crypto.randomUUID()

/** Un logo entra al 30% del ancho del producto, que es un tamaño cómodo para empezar. */
const INITIAL_LOGO_WIDTH_RATIO = 0.3

export function useEditor(
  productWidth: number,
  productHeight: number,
  initialLayers: Layer[] = [],
) {
  const { present: layers, commit, undo, redo, reset, canUndo, canRedo } =
    useHistory<Layer[]>(initialLayers)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = useMemo(
    () => layers.find((layer) => layer.id === selectedId) ?? null,
    [layers, selectedId],
  )

  const addImageLayer = useCallback(
    (input: { src: string; naturalWidth: number; naturalHeight: number }) => {
      const maxWidth = productWidth * INITIAL_LOGO_WIDTH_RATIO
      const scale = Math.min(1, maxWidth / input.naturalWidth)
      const width = input.naturalWidth * scale
      const height = input.naturalHeight * scale

      const layer: ImageLayer = {
        id: id(),
        type: 'image',
        name: 'Logo',
        x: (productWidth - width) / 2,
        y: (productHeight - height) / 2,
        width,
        height,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        src: input.src,
        naturalWidth: input.naturalWidth,
        naturalHeight: input.naturalHeight,
        filters: { ...DEFAULT_FILTERS },
        flipX: false,
        flipY: false,
      }

      commit((current) => [...current, layer])
      setSelectedId(layer.id)
    },
    [commit, productWidth, productHeight],
  )

  const addTextLayer = useCallback(() => {
    const fontSize = Math.round(productWidth * 0.07)
    const layer: TextLayer = {
      id: id(),
      type: 'text',
      name: 'Texto',
      text: 'TU MARCA',
      x: productWidth * 0.2,
      y: productHeight * 0.32,
      width: productWidth * 0.6,
      height: fontSize * 1.25,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fontSize,
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontWeight: 900,
      fontStyle: 'normal',
      fill: '#ffffff',
      align: 'center',
      letterSpacing: 1,
    }

    commit((current) => [...current, layer])
    setSelectedId(layer.id)
  }, [commit, productWidth, productHeight])

  const updateLayer = useCallback(
    (layerId: string, patch: Partial<Layer>) => {
      commit((current) =>
        current.map((layer) => (layer.id === layerId ? ({ ...layer, ...patch } as Layer) : layer)),
      )
    },
    [commit],
  )

  const removeLayer = useCallback(
    (layerId: string) => {
      commit((current) => current.filter((layer) => layer.id !== layerId))
      setSelectedId((current) => (current === layerId ? null : current))
    },
    [commit],
  )

  const duplicateLayer = useCallback(
    (layerId: string) => {
      // El id se genera antes del commit para poder seleccionar la copia; si la
      // capa no existiera, `selected` resuelve a null y no queda nada colgado.
      const copyId = id()
      const offset = Math.round(productWidth * 0.03)

      commit((current) => {
        const source = current.find((layer) => layer.id === layerId)
        if (!source) return current
        const copy = {
          ...source,
          id: copyId,
          name: `${source.name} copia`,
          x: source.x + offset,
          y: source.y + offset,
        } as Layer
        return [...current, copy]
      })

      setSelectedId(copyId)
    },
    [commit, productWidth],
  )

  /** amount > 0 sube en el z-order (hacia adelante). */
  const reorderLayer = useCallback(
    (layerId: string, amount: 1 | -1) => {
      commit((current) => {
        const index = current.findIndex((layer) => layer.id === layerId)
        const target = index + amount
        if (index === -1 || target < 0 || target >= current.length) return current

        const next = [...current]
        const [moved] = next.splice(index, 1)
        next.splice(target, 0, moved)
        return next
      })
    },
    [commit],
  )

  const clearLayers = useCallback(() => {
    reset([])
    setSelectedId(null)
  }, [reset])

  /** Reemplaza todo el contenido, sin dejar historial: es una carga, no una edicion. */
  const loadLayers = useCallback(
    (next: Layer[]) => {
      reset(next)
      setSelectedId(null)
    },
    [reset],
  )

  const deleteSelected = useCallback(() => {
    if (selectedId) removeLayer(selectedId)
  }, [removeLayer, selectedId])

  const duplicateSelected = useCallback(() => {
    if (selectedId) duplicateLayer(selectedId)
  }, [duplicateLayer, selectedId])

  const reorderSelected = useCallback(
    (amount: 1 | -1) => {
      if (selectedId) reorderLayer(selectedId, amount)
    },
    [reorderLayer, selectedId],
  )

  return {
    layers,
    selectedId,
    selected,
    setSelectedId,
    addImageLayer,
    addTextLayer,
    updateLayer,
    removeLayer,
    duplicateLayer,
    reorderLayer,
    clearLayers,
    loadLayers,
    deleteSelected,
    duplicateSelected,
    reorderSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  }
}

export type Editor = ReturnType<typeof useEditor>