import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP, clampZoom } from '../../lib/canvasMetrics'

type Props = {
  zoom: number
  onChange: (zoom: number) => void
}

const buttonClass =
  'flex h-6 w-6 items-center justify-center rounded-full text-sm leading-none text-brand-light transition hover:bg-white/10 hover:text-brand-cyan disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-brand-light'

export function ZoomControl({ zoom, onChange }: Props) {
  const percent = Math.round(zoom * 100)

  return (
    <div
      role="group"
      aria-label="Zoom de la prenda"
      className="absolute bottom-4 right-4 flex items-center gap-0.5 rounded-full border border-brand-line bg-brand-black/85 p-1 shadow-lg backdrop-blur"
    >
      <button
        type="button"
        aria-label="Alejar"
        disabled={zoom <= ZOOM_MIN}
        onClick={() => onChange(clampZoom(zoom - ZOOM_STEP))}
        className={buttonClass}
      >
        −
      </button>
      <button
        type="button"
        aria-label="Volver al tamaño original"
        title="Volver al tamaño original"
        onClick={() => onChange(ZOOM_MIN)}
        className="min-w-12 rounded-full px-1 text-[11px] font-semibold tabular-nums text-brand-light transition hover:bg-white/10 hover:text-brand-cyan"
      >
        {percent}%
      </button>
      <button
        type="button"
        aria-label="Acercar"
        disabled={zoom >= ZOOM_MAX}
        onClick={() => onChange(clampZoom(zoom + ZOOM_STEP))}
        className={buttonClass}
      >
        +
      </button>
    </div>
  )
}
