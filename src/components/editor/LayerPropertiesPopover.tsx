import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { Layer } from '../../types'
import { PropertiesPanel } from './PropertiesPanel'

export type PopoverAnchorRect = {
  top: number
  bottom: number
  right: number
}

type Props = {
  layer: Layer
  anchor: HTMLElement
  anchorRect: PopoverAnchorRect
  onChange: (patch: Partial<Layer>) => void
  onClose: () => void
}

const GAP = 8
const MARGIN = 8
const PREFERRED_SPACE = 320
const MAX_HEIGHT_RATIO = 0.7
const MIN_HEIGHT = 160
const MAX_WIDTH = 320

export function LayerPropertiesPopover({
  layer,
  anchor,
  anchorRect,
  onChange,
  onClose,
}: Props) {
  const popRef = useRef<HTMLDivElement | null>(null)

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const width = Math.min(MAX_WIDTH, viewportWidth - MARGIN * 2)
  const left = Math.min(
    Math.max(MARGIN, anchorRect.right - width),
    viewportWidth - width - MARGIN,
  )
  const spaceBelow = viewportHeight - anchorRect.bottom - GAP - MARGIN
  const spaceAbove = anchorRect.top - GAP - MARGIN
  const goDown = spaceBelow >= PREFERRED_SPACE || spaceBelow >= spaceAbove
  const available = Math.max(MIN_HEIGHT, goDown ? spaceBelow : spaceAbove)
  const maxHeight = Math.min(viewportHeight * MAX_HEIGHT_RATIO, available)

  const style: CSSProperties = {
    position: 'fixed',
    left,
    width,
    maxHeight,
    zIndex: 50,
    ...(goDown
      ? { top: anchorRect.bottom + GAP }
      : { bottom: viewportHeight - anchorRect.top + GAP }),
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (popRef.current?.contains(target) || anchor.contains(target)) return
      onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const onScroll = (event: Event) => {
      if (popRef.current?.contains(event.target as Node)) return
      onClose()
    }
    const onResize = () => onClose()

    window.addEventListener('pointerdown', onPointerDown, true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [anchor, onClose])

  return (
    <div
      ref={popRef}
      role="dialog"
      aria-label="Propiedades de la capa"
      data-placement={goDown ? 'down' : 'up'}
      style={style}
      className="trama-scroll overflow-y-auto rounded-lg border border-brand-line bg-brand-surface p-3 shadow-xl"
    >
      <PropertiesPanel layer={layer} onChange={onChange} />
    </div>
  )
}
