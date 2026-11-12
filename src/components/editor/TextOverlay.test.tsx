// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import type { CanvasMetrics } from '../../lib/canvasMetrics'
import { ARIAL_FONT_STACK } from '../../lib/fonts'
import type { TextLayer } from '../../types'
import { TextOverlay } from './TextOverlay'

const metrics: CanvasMetrics = {
  stageWidth: 400,
  stageHeight: 500,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
}

const layer: TextLayer = {
  id: 'txt-1',
  type: 'text',
  name: 'Texto',
  text: 'TU MARCA',
  x: 20,
  y: 30,
  width: 200,
  height: 40,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  fontSize: 24,
  fontFamily: ARIAL_FONT_STACK,
  fontWeight: 700,
  fontStyle: 'normal',
  fill: '#ffffff',
  align: 'center',
  letterSpacing: 1,
}

afterEach(cleanup)

describe('TextOverlay', () => {
  it('refleja la familia y el peso reales', () => {
    render(<TextOverlay layer={layer} metrics={metrics} onCommit={vi.fn()} onDone={vi.fn()} />)

    const textarea = screen.getByLabelText('Editar texto')
    expect(textarea.style.fontWeight).toBe('700')
    expect(textarea.style.fontFamily).toBe(ARIAL_FONT_STACK)
  })

  it('refleja Normal', () => {
    render(
      <TextOverlay
        layer={{ ...layer, fontWeight: 400 }}
        metrics={metrics}
        onCommit={vi.fn()}
        onDone={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Editar texto').style.fontWeight).toBe('400')
  })

  it('refleja itálica', () => {
    render(
      <TextOverlay
        layer={{ ...layer, fontStyle: 'italic' }}
        metrics={metrics}
        onCommit={vi.fn()}
        onDone={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Editar texto').style.fontStyle).toBe('italic')
  })
})
