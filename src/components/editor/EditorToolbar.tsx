import { useState } from 'react'
import type { ExportFormat, ExportScale } from '../../types'

type Props = {
  canUndo: boolean
  canRedo: boolean
  hasLayers: boolean
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  onExport: (options: { scale: ExportScale; format: ExportFormat }) => void
  exporting: boolean
}

export function EditorToolbar({
  canUndo,
  canRedo,
  hasLayers,
  onUndo,
  onRedo,
  onClear,
  onExport,
  exporting,
}: Props) {
  const [scale, setScale] = useState<ExportScale>(2)
  const [format, setFormat] = useState<ExportFormat>('png')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        <Button onClick={onUndo} disabled={!canUndo} label="Deshacer (Ctrl+Z)">
          ↶
        </Button>
        <Button onClick={onRedo} disabled={!canRedo} label="Rehacer (Ctrl+Shift+Z)">
          ↷
        </Button>
      </div>

      <Button onClick={onClear} disabled={!hasLayers} danger label="Vaciar diseño">
        Vaciar
      </Button>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-brand-muted">
          Formato
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value as ExportFormat)}
            className="rounded border border-brand-line bg-brand-black px-1.5 py-1 text-[11px] text-brand-light outline-none focus:border-brand-cyan"
          >
            <option value="png">PNG (transparente)</option>
            <option value="jpeg">JPG (fondo blanco)</option>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-[11px] text-brand-muted">
          Calidad
          <select
            value={scale}
            onChange={(event) => setScale(Number(event.target.value) as ExportScale)}
            className="rounded border border-brand-line bg-brand-black px-1.5 py-1 text-[11px] text-brand-light outline-none focus:border-brand-cyan"
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => onExport({ scale, format })}
          disabled={!hasLayers || exporting}
          className="rounded-md bg-brand-cyan px-3.5 py-1.5 text-xs font-bold text-brand-black transition hover:bg-brand-pink hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {exporting ? 'Exportando...' : 'Descargar'}
        </button>
      </div>
    </div>
  )
}

function Button({
  children,
  onClick,
  disabled = false,
  danger = false,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`rounded border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'border-brand-line text-brand-muted hover:border-brand-pink hover:text-brand-pink'
          : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}