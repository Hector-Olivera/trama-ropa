import { useCallback, useState } from 'react'
import { DrawableImage } from './DrawableImage'
import type { Layer } from '../../types'
import { ConfirmDeleteToast } from './ConfirmDeleteToast'
import { LayerPropertiesPopover, type PopoverAnchorRect } from './LayerPropertiesPopover'

type Props = {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, patch: Partial<Layer>) => void
  onToggleVisible: (id: string) => void
  onRemove: (id: string) => void
}

type OpenMenu = {
  id: string
  anchor: HTMLElement
  anchorRect: PopoverAnchorRect
}

export function LayersPanel({
  layers,
  selectedId,
  onSelect,
  onChange,
  onToggleVisible,
  onRemove,
}: Props) {
  const [menu, setMenu] = useState<OpenMenu | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const closeMenu = useCallback(() => setMenu(null), [])

  if (layers.length === 0) {
    return (
      <p className="rounded-lg border border-brand-line bg-brand-black/40 p-3 text-[11px] leading-snug text-brand-muted">
        Todavía no hay capas. Subí tu logo o agregá texto.
      </p>
    )
  }

  const openLayer = menu ? layers.find((layer) => layer.id === menu.id) : undefined
  const pendingDelete = pendingDeleteId
    ? layers.find((layer) => layer.id === pendingDeleteId)
    : undefined

  const openProperties = (layerId: string, button: HTMLButtonElement) => {
    const rect = button.getBoundingClientRect()
    onSelect(layerId)
    setMenu((current) =>
      current?.id === layerId
        ? null
        : {
            id: layerId,
            anchor: button,
            anchorRect: { top: rect.top, bottom: rect.bottom, right: rect.right },
          },
    )
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1 lg:space-y-1 lg:gap-0">
        {/* Se renderiza de arriba hacia abajo en z-order: la ultima capa va primera. */}
        {[...layers].reverse().map((layer) => {
          const active = layer.id === selectedId
          const open = menu?.id === layer.id
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
                    {layer.type === 'image' ? (
                      <DrawableImage
                        src={layer.src}
                        alt={layer.name}
                        className="h-6 w-6 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-brand-muted">TXT</span>
                    )}
                    <span
                      className={`truncate text-[11px] font-semibold ${
                        active ? 'text-brand-cyan' : 'text-brand-light'
                      }`}
                    >
                      {layer.type === 'text' ? layer.text || 'Texto' : layer.name}
                    </span>
                  </span>
                </button>

                <div className="ml-auto flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => openProperties(layer.id, event.currentTarget)}
                    title="Editar propiedades"
                    aria-label="Editar propiedades"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className={`shrink-0 rounded p-0.5 transition ${
                      open
                        ? 'text-brand-cyan'
                        : 'text-brand-muted hover:bg-brand-white/10 hover:text-brand-cyan'
                    }`}
                  >
                    <BrushIcon />
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleVisible(layer.id)}
                    title={layer.visible ? 'Ocultar capa' : 'Agregar capa al diseño'}
                    className={`shrink-0 rounded px-0.5 py-0.5 text-[8px] font-bold uppercase tracking-wide whitespace-nowrap transition lg:px-1 lg:text-[9px] ${
                      layer.visible
                        ? 'text-brand-muted hover:bg-brand-white/10 hover:text-brand-light'
                        : 'text-brand-cyan hover:bg-brand-cyan/10'
                    }`}
                  >
                    {layer.visible ? 'OCULTAR' : 'AGREGAR'}
                  </button>

                  <IconButton
                    label="Eliminar capa"
                    onClick={() => {
                      setMenu(null)
                      setPendingDeleteId(layer.id)
                    }}
                    danger
                  >
                    ×
                  </IconButton>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {openLayer && menu && (
        <LayerPropertiesPopover
          layer={openLayer}
          anchor={menu.anchor}
          anchorRect={menu.anchorRect}
          onChange={(patch) => onChange(openLayer.id, patch)}
          onClose={closeMenu}
        />
      )}

      {pendingDelete && (
        <ConfirmDeleteToast
          title="¿Eliminar esta capa?"
          description="La capa se va a quitar del diseño."
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            onRemove(pendingDelete.id)
            setPendingDeleteId(null)
          }}
        />
      )}
    </>
  )
}

function BrushIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="m14.622 17.897-10.68-2.913" />
      <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
      <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
    </svg>
  )
}

function IconButton({
  children,
  label,
  onClick,
  danger = false,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-4 shrink-0 rounded text-center text-[11px] leading-none transition ${
        danger
          ? 'text-brand-muted hover:bg-brand-pink/20 hover:text-brand-pink'
          : 'text-brand-muted hover:bg-brand-white/10 hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
