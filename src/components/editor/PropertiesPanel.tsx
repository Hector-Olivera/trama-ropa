import { useState } from 'react'
import { FILTER_PRESETS, applyPreset, filterKey } from '../../lib/imageFilters'
import { DEFAULT_FILTERS, type ImageLayer, type Layer, type TextLayer } from '../../types'

type Props = {
  layer: Layer | null
  onChange: (patch: Partial<Layer>) => void
}

export function PropertiesPanel({ layer, onChange }: Props) {
  if (!layer) {
    return (
      <p className="rounded-lg border border-brand-line bg-brand-black/40 p-3 text-[11px] leading-snug text-brand-muted">
        Seleccioná una capa del lienzo para editar sus propiedades.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Capa · {layer.name}
        </h3>
        <p className="text-[11px] text-brand-muted">
          {Math.round(layer.width)} × {Math.round(layer.height)} px · {Math.round(layer.rotation)}°
        </p>
      </div>

      <Slider
        label="Opacidad"
        value={Math.round(layer.opacity * 100)}
        min={0}
        max={100}
        suffix="%"
        onChange={(opacity) => onChange({ opacity: opacity / 100 })}
      />

      <Slider
        label="Rotación"
        value={Math.round(layer.rotation)}
        min={-180}
        max={180}
        suffix="°"
        onChange={(rotation) => onChange({ rotation })}
      />

      {layer.type === 'image' && <ImageControls layer={layer} onChange={onChange} />}
      {layer.type === 'text' && <TextControls layer={layer} onChange={onChange} />}
    </div>
  )
}

function ImageControls({ layer, onChange }: { layer: ImageLayer; onChange: Props['onChange'] }) {
  const [expanded, setExpanded] = useState(false)
  const filters = layer.filters
  const activeKey = filterKey(filters)

  const patchFilters = (patch: Partial<ImageLayer['filters']>) =>
    onChange({ filters: { ...filters, ...patch } } as Partial<Layer>)

  return (
    <div>
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">
        Color
      </h4>

      <div className="flex flex-wrap gap-1.5">
        {FILTER_PRESETS.map((preset) => {
          const presetKey = filterKey({ ...DEFAULT_FILTERS, ...preset.filters })
          const active = presetKey === activeKey
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange({ filters: applyPreset(preset) } as Partial<Layer>)}
              className={`rounded border px-2 py-1 text-[11px] font-semibold transition ${
                active
                  ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
                  : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="mt-2 text-[11px] font-semibold text-brand-cyan hover:underline"
      >
        {expanded ? 'Ocultar ajustes finos' : 'Ajustes finos'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-2.5">
          <Slider
            label="Brillo"
            value={filters.brightness}
            min={0}
            max={2}
            step={0.05}
            onChange={(brightness) => patchFilters({ brightness })}
          />
          <Slider
            label="Contraste"
            value={filters.contrast}
            min={0}
            max={2}
            step={0.05}
            onChange={(contrast) => patchFilters({ contrast })}
          />
          <Slider
            label="Saturación"
            value={filters.saturate}
            min={0}
            max={3}
            step={0.05}
            onChange={(saturate) => patchFilters({ saturate })}
          />
          <Slider
            label="Tono"
            value={filters.hueRotate}
            min={-180}
            max={180}
            suffix="°"
            onChange={(hueRotate) => patchFilters({ hueRotate })}
          />
          <Slider
            label="Blanco y negro"
            value={Math.round(filters.grayscale * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => patchFilters({ grayscale: value / 100 })}
          />
          <Slider
            label="Sepia"
            value={Math.round(filters.sepia * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => patchFilters({ sepia: value / 100 })}
          />
          <Slider
            label="Invertir"
            value={Math.round(filters.invert * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(value) => patchFilters({ invert: value / 100 })}
          />
          <button
            type="button"
            onClick={() => onChange({ filters: { ...DEFAULT_FILTERS } } as Partial<Layer>)}
            className="w-full rounded border border-brand-line py-1.5 text-[11px] font-semibold text-brand-muted transition hover:border-brand-muted hover:text-brand-light"
          >
            Quitar filtros
          </button>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ flipX: !layer.flipX } as Partial<Layer>)}
          className={`flex-1 rounded border py-1.5 text-[11px] font-semibold transition ${
            layer.flipX
              ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
              : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
          }`}
        >
          Voltear ↔
        </button>
        <button
          type="button"
          onClick={() => onChange({ flipY: !layer.flipY } as Partial<Layer>)}
          className={`flex-1 rounded border py-1.5 text-[11px] font-semibold transition ${
            layer.flipY
              ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
              : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
          }`}
        >
          Voltear ↕
        </button>
      </div>
    </div>
  )
}

function TextControls({ layer, onChange }: { layer: TextLayer; onChange: Props['onChange'] }) {
  const patch = (value: Partial<TextLayer>) => onChange(value as Partial<Layer>)

  return (
    <div>
      <h4 className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-muted">Texto</h4>

      <textarea
        value={layer.text}
        onChange={(event) => patch({ text: event.target.value })}
        rows={2}
        aria-label="Contenido del texto"
        className="w-full resize-none rounded border border-brand-line bg-brand-black/60 p-2 text-xs text-brand-light outline-none focus:border-brand-cyan"
      />

      <div className="mt-2">
        <Slider
          label="Tamaño"
          value={layer.fontSize}
          min={8}
          max={160}
          suffix="px"
          onChange={(fontSize) => patch({ fontSize })}
        />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-[11px] text-brand-muted" htmlFor="text-color">
          Color
        </label>
        <input
          id="text-color"
          type="color"
          className="trama-color h-7 w-12"
          value={layer.fill}
          onChange={(event) => patch({ fill: event.target.value })}
        />
        <div className="ml-auto flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => patch({ align })}
              className={`rounded border px-1.5 py-1 text-[10px] font-bold uppercase transition ${
                layer.align === align
                  ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
                  : 'border-brand-line text-brand-muted hover:border-brand-muted'
              }`}
            >
              {align === 'left' ? 'Izq' : align === 'center' ? 'Centro' : 'Der'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-1.5">
        {([400, 700, 900] as const).map((weight) => (
          <button
            key={weight}
            type="button"
            onClick={() => patch({ fontWeight: weight })}
            className={`flex-1 rounded border py-1.5 text-[11px] transition ${
              layer.fontWeight === weight
                ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
                : 'border-brand-line text-brand-muted hover:border-brand-muted'
            }`}
            style={{ fontWeight: weight }}
          >
            {weight === 400 ? 'Normal' : weight === 700 ? 'Bold' : 'Black'}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            patch({ fontStyle: layer.fontStyle === 'italic' ? 'normal' : 'italic' })
          }
          className={`rounded border px-2.5 text-[11px] italic transition ${
            layer.fontStyle === 'italic'
              ? 'border-brand-cyan bg-brand-cyan/15 text-brand-cyan'
              : 'border-brand-line text-brand-muted hover:border-brand-muted'
          }`}
        >
          I
        </button>
      </div>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label htmlFor={id} className="text-[11px] text-brand-muted">
          {label}
        </label>
        <span className="font-mono text-[11px] text-brand-light">
          {Number.isInteger(step) ? Math.round(value) : value.toFixed(2)}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="trama-range w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}