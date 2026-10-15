import { useLayoutEffect, useRef, useState } from 'react'
import type { CanvasMetrics } from './EditorCanvas'
import type { TextLayer } from '../../types'

type Props = {
  layer: TextLayer | null
  metrics: CanvasMetrics
  onCommit: (patch: Partial<TextLayer>) => void
  onDone: () => void
}

/**
 * Konva dibuja texto pero no lo editable: hay que superponer un textarea del
 * DOM. Hay que replicar exactamente el font del nodo, porque cualquier
 * diferencia entre lo que se ve tipeando y lo que se ve en el canvas es
 * exactamente lo que se va a estampar mal.
 */
export function TextOverlay({ layer, metrics, onCommit, onDone }: Props) {
  const { scale, offsetX, offsetY } = metrics
  const ref = useRef<HTMLTextAreaElement>(null)
  // EditorCanvas lo monta con `key={layer.id}`, asi que cambiar de capa remonta
  // el componente y el valor inicial sale de la capa: no hace falta un effect
  // para copiar `layer.text` hacia el estado en cada render.
  const [value, setValue] = useState(layer?.text ?? '')

  useLayoutEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  if (!layer) return null

  const commit = () => onCommit({ text: value })
  const cancel = () => {
    setValue(layer.text)
    onDone()
  }

  const fontStyle = layer.fontStyle === 'italic' ? 'italic' : 'normal'
  const fontWeight = layer.fontWeight === 400 ? 400 : 700

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          cancel()
        }
        // Enter sola confirma; Shift+Enter es salto de linea.
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          commit()
          onDone()
        }
      }}
      onBlur={() => {
        commit()
        onDone()
      }}
      spellCheck={false}
      aria-label="Editar texto"
      className="absolute resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
      style={{
        left: offsetX + layer.x * scale,
        top: offsetY + layer.y * scale,
        width: layer.width * scale,
        minHeight: layer.height * scale,
        fontFamily: layer.fontFamily,
        fontSize: layer.fontSize * scale,
        fontWeight,
        fontStyle,
        color: layer.fill,
        textAlign: layer.align,
        letterSpacing: layer.letterSpacing * scale,
        lineHeight: 1.2,
        transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
        transformOrigin: 'left top',
      }}
    />
  )
}