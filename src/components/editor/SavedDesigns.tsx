import { useEffect, useRef } from 'react'
import type { Design } from '../../types'

type Props = {
  versions: Design[]
  name: string
  saveState: 'idle' | 'saving' | 'saved'
  highlight: boolean
  activeId: string | null
  savingAsNew: boolean
  newName: string
  savedCount: number
  maxSaved: number
  limitNotice: boolean
  canSaveChanges: boolean
  onNewNameChange: (value: string) => void
  onSaveChanges: () => void
  onSaveAsNew: () => void
  onCancelNew: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export function SavedDesigns({
  versions,
  name,
  saveState,
  highlight,
  activeId,
  savingAsNew,
  newName,
  savedCount,
  maxSaved,
  limitNotice,
  canSaveChanges,
  onNewNameChange,
  onSaveChanges,
  onSaveAsNew,
  onCancelNew,
  onLoad,
  onDelete,
}: Props) {
  const actionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!savingAsNew) return
    inputRef.current?.focus()

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && actionsRef.current?.contains(target)) return
      onCancelNew()
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [savingAsNew, onCancelNew])

  const atLimit = savedCount >= maxSaved

  return (
    <div
      id="mis-disenos"
      className={`mt-8 scroll-mt-20 rounded-lg border p-4 transition ${
        highlight
          ? 'border-brand-cyan bg-brand-cyan/5 ring-2 ring-brand-cyan/70'
          : 'border-brand-line bg-brand-surface'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-muted">
          Mis diseños
        </h3>
        <span
          className={`text-[11px] tabular-nums ${
            atLimit ? 'text-brand-cyan' : 'text-brand-muted'
          }`}
        >
          {savedCount}/{maxSaved}
        </span>
        <span aria-live="polite" className="text-[11px] text-brand-muted">
          {saveState === 'saving' && 'Guardando...'}
          {saveState === 'saved' && '✓ Guardado en este dispositivo'}
        </span>

        <div ref={actionsRef} className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSaveChanges}
            disabled={!canSaveChanges}
            className="rounded border border-brand-line px-3 py-1.5 text-xs font-semibold text-brand-light transition enabled:hover:border-brand-cyan enabled:hover:text-brand-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            Guardar cambios
          </button>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={savingAsNew ? newName : name}
              onChange={(event) => onNewNameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  onCancelNew()
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSaveAsNew()
                }
              }}
              aria-label="Nombre del diseño"
              aria-hidden={!savingAsNew}
              tabIndex={savingAsNew ? 0 : -1}
              readOnly={!savingAsNew}
              placeholder={savingAsNew ? 'Nombre del nuevo diseño' : undefined}
              className={`rounded border bg-brand-black px-2.5 py-1.5 text-xs text-brand-light outline-none transition ${
                savingAsNew
                  ? 'border-brand-cyan ring-2 ring-brand-cyan/70'
                  : 'invisible border-brand-line'
              }`}
            />
            <button
              type="button"
              onClick={onSaveAsNew}
              aria-pressed={savingAsNew}
              className={`rounded border px-3 py-1.5 text-xs font-semibold transition ${
                savingAsNew
                  ? 'border-brand-cyan bg-brand-cyan text-brand-black hover:bg-brand-cyan/90'
                  : 'border-brand-line text-brand-light hover:border-brand-cyan hover:text-brand-cyan'
              }`}
            >
              Guardar como nuevo
            </button>
          </div>
        </div>
      </div>

      {atLimit && limitNotice && (
        <p role="alert" className="mt-2 text-[11px] leading-snug text-brand-pink">
          Llegaste al límite de {maxSaved} diseños guardados. Eliminá alguno para poder guardar
          otro.
        </p>
      )}

      {versions.length === 0 ? (
        <p className="mt-3 text-[11px] text-brand-muted">
          No hay diseños guardados. Tu trabajo actual se guarda solo; usá "Guardar como nuevo"
          para conservar una copia con nombre.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-1.5 lg:grid-cols-4 lg:gap-2">
          {versions.map((design) => {
            const active = design.id === activeId
            return (
              <li
                key={design.id}
                className={`flex items-center gap-1.5 rounded border px-2 py-1.5 transition lg:gap-2 lg:px-2.5 lg:py-2 ${
                  active
                    ? 'border-brand-cyan bg-brand-cyan/10 ring-1 ring-brand-cyan/50'
                    : 'border-brand-line bg-brand-black/40 hover:border-brand-cyan/60 hover:bg-brand-cyan/5'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onLoad(design.id)}
                  aria-current={active ? 'true' : undefined}
                  className="min-w-0 flex-1 text-left"
                >
                  <span
                    className={`block truncate text-[11px] font-semibold lg:text-xs ${
                      active ? 'text-brand-cyan' : 'text-brand-light'
                    }`}
                  >
                    {design.name}
                  </span>
                  <span className="block text-[9px] text-brand-muted lg:text-[10px]">
                    {new Date(design.updatedAt).toLocaleDateString('es-AR')} ·{' '}
                    {design.layers.length} {design.layers.length === 1 ? 'capa' : 'capas'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(design.id)}
                  aria-label={`Borrar ${design.name}`}
                  className="w-5 rounded text-center text-brand-muted transition hover:bg-brand-pink/20 hover:text-brand-pink"
                >
                  ×
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
