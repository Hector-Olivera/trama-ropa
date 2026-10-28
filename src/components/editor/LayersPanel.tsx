import type { Layer } from '../../types'

type Props = {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleVisible: (id: string) => void
  onRemove: (id: string) => void
}

export function LayersPanel({
  layers,
  selectedId,
  onSelect,
  onToggleVisible,
  onRemove,
}: Props) {
  if (layers.length === 0) {
    return (
      <p className="rounded-lg border border-brand-line bg-brand-black/40 p-3 text-[11px] leading-snug text-brand-muted">
        Todavía no hay capas. Subí tu logo o agregá texto.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1 lg:space-y-1 lg:gap-0">
      {/* Se renderiza de arriba hacia abajo en z-order: la ultima capa va primera. */}
      {[...layers].reverse().map((layer) => {
        const active = layer.id === selectedId
        return (
          <li key={layer.id} className="lg:w-full">
            <div
              className={`flex items-center gap-1 rounded border px-1.5 py-1.5 transition ${
                active
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-brand-line hover:border-brand-muted'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(layer.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-[10px] text-brand-muted">
                    {layer.type === 'image' ? 'IMG' : 'TXT'}
                  </span>
                  <span
                    className={`truncate text-[11px] font-semibold ${
                      active ? 'text-brand-cyan' : 'text-brand-light'
                    }`}
                  >
                    {layer.type === 'text' ? layer.text || 'Texto' : layer.name}
                  </span>
                </span>
              </button>

              <IconButton
                label={layer.visible ? 'Ocultar' : 'Mostrar'}
                onClick={() => onToggleVisible(layer.id)}
                active={!layer.visible}
              >
                {layer.visible ? '◉' : '○'}
              </IconButton>
              <IconButton label="Borrar" onClick={() => onRemove(layer.id)} danger>
                ×
              </IconButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function IconButton({
  children,
  label,
  onClick,
  active = false,
  danger = false,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-5 shrink-0 rounded text-center text-[11px] leading-none transition ${
        danger
          ? 'text-brand-muted hover:bg-brand-pink/20 hover:text-brand-pink'
          : active
            ? 'text-brand-cyan'
            : 'text-brand-muted hover:bg-brand-white/10 hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
