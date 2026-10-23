import type { Layer } from '../../types'

type Props = {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggleVisible: (id: string) => void
  onToggleLocked: (id: string) => void
  onReorder: (id: string, amount: 1 | -1) => void
  onRemove: (id: string) => void
}

export function LayersPanel({
  layers,
  selectedId,
  onSelect,
  onToggleVisible,
  onToggleLocked,
  onReorder,
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
    <ul className="space-y-1">
      {/* Se renderiza de arriba hacia abajo en z-order: la ultima capa va primera. */}
      {[...layers].reverse().map((layer) => {
        const active = layer.id === selectedId
        return (
          <li key={layer.id}>
            <div
              className={`flex flex-col gap-1.5 rounded border px-1.5 py-1.5 transition lg:flex-row lg:items-center lg:gap-1 ${
                active
                  ? 'border-brand-cyan bg-brand-cyan/10'
                  : 'border-brand-line hover:border-brand-muted'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(layer.id)}
                className="w-full min-w-0 text-left lg:flex-1"
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

              <div className="flex items-center justify-end gap-0.5 self-end lg:self-auto">
                <IconButton
                  label={layer.visible ? 'Ocultar' : 'Mostrar'}
                  onClick={() => onToggleVisible(layer.id)}
                  active={!layer.visible}
                >
                  {layer.visible ? '◉' : '○'}
                </IconButton>
                <IconButton
                  label={layer.locked ? 'Desbloquear' : 'Bloquear'}
                  onClick={() => onToggleLocked(layer.id)}
                  active={layer.locked}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </IconButton>
                <IconButton label="Subir" onClick={() => onReorder(layer.id, 1)}>
                  ↑
                </IconButton>
                <IconButton label="Bajar" onClick={() => onReorder(layer.id, -1)}>
                  ↓
                </IconButton>
                <IconButton label="Borrar" onClick={() => onRemove(layer.id)} danger>
                  ×
                </IconButton>
              </div>
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