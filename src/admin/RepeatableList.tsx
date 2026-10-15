import type { ReactNode } from 'react'

type Item = { id: string }

type Props<T extends Item> = {
  items: T[]
  onChange: (items: T[]) => void
  create: () => NoInfer<T>
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode
  label: (item: T, index: number) => string
  addLabel?: string
  emptyLabel?: string
}

/**
 * Editor de listas con agregar / quitar / reordenar. Se usa para stats, pasos,
 * features, grupos, items del catalogo, links y prendas.
 *
 * Los items deben llevar `id` estable: es la key de React (evita que al
 * reordenar se pierda foco o estado de un input) y el identificador que
 * usaremos como PK al migrar a backend.
 */
export function RepeatableList<T extends Item>({
  items,
  onChange,
  create,
  render,
  label,
  addLabel = 'Agregar',
  emptyLabel,
}: Props<T>) {
  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const update = (index: number, patch: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <div className="space-y-2">
      {items.length === 0 && emptyLabel && (
        <p className="text-[11px] text-brand-muted">{emptyLabel}</p>
      )}

      {items.map((item, index) => (
        <div key={item.id} className="rounded border border-brand-line bg-brand-black/40 p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="truncate text-[11px] font-semibold text-brand-muted">
              {label(item, index)}
            </span>
            <div className="ml-auto flex gap-1">
              <IconBtn onClick={() => move(index, -1)} disabled={index === 0} title="Subir">
                ↑
              </IconBtn>
              <IconBtn
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                title="Bajar"
              >
                ↓
              </IconBtn>
              <IconBtn onClick={() => remove(index)} title="Quitar" danger>
                ×
              </IconBtn>
            </div>
          </div>
          <div className="space-y-2">
            {render(item, (patch) => update(index, patch), index)}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="w-full rounded border border-dashed border-brand-line px-3 py-2 text-[11px] font-semibold text-brand-muted transition hover:border-brand-cyan hover:text-brand-cyan"
      >
        + {addLabel}
      </button>
    </div>
  )
}

function IconBtn({
  children,
  onClick,
  disabled = false,
  danger = false,
  title,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  title: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`h-6 w-6 rounded border text-[11px] transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'border-brand-line text-brand-muted hover:border-brand-pink hover:text-brand-pink'
          : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
