import { useEffect, useRef, useState } from 'react'
import type { Design } from '../../types'
import { ConfirmDeleteToast } from './ConfirmDeleteToast'

type NoticeKind = 'changes' | 'new'

type Notice = { kind: NoticeKind; bottom: number; right: number }

const NOTICE_DURATION = 3000

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
  const saveChangesRef = useRef<HTMLButtonElement>(null)
  const saveAsNewRef = useRef<HTMLButtonElement>(null)
  const noticeTimer = useRef<number | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!notice) return
    const dismiss = () => {
      if (noticeTimer.current !== null) {
        window.clearTimeout(noticeTimer.current)
        noticeTimer.current = null
      }
      setNotice(null)
    }
    window.addEventListener('pointerdown', dismiss, true)
    window.addEventListener('scroll', dismiss, true)
    return () => {
      window.removeEventListener('pointerdown', dismiss, true)
      window.removeEventListener('scroll', dismiss, true)
    }
  }, [notice])

  useEffect(
    () => () => {
      if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
    },
    [],
  )

  const showNotice = (kind: NoticeKind, element: HTMLElement | null) => {
    const rect = element?.getBoundingClientRect()
    if (rect) {
      setNotice({
        kind,
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      })
    }
    if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => {
      setNotice(null)
      noticeTimer.current = null
    }, NOTICE_DURATION)
  }

  const handleSaveChanges = () => {
    onSaveChanges()
    showNotice('changes', saveChangesRef.current)
  }

  const handleSaveAsNew = () => {
    const confirming = savingAsNew
    onSaveAsNew()
    if (confirming) showNotice('new', saveAsNewRef.current)
  }

  const atLimit = savedCount >= maxSaved
  const pendingDelete = pendingDeleteId
    ? versions.find((design) => design.id === pendingDeleteId)
    : undefined

  return (
    <div
      id="mis-disenos"
      className={`mt-8 scroll-mt-20 scroll-mb-6 rounded-lg border p-4 transition ${
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

        <div
          ref={actionsRef}
          className="flex w-full flex-nowrap items-center gap-1.5 sm:ml-auto sm:w-auto sm:gap-2"
        >
          <button
            ref={saveChangesRef}
            type="button"
            onClick={handleSaveChanges}
            disabled={!canSaveChanges}
            className={`shrink-0 whitespace-nowrap rounded border px-2 py-1.5 text-[10px] font-semibold transition active:scale-[0.97] active:border-brand-cyan active:bg-brand-cyan/15 active:text-brand-cyan disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:text-xs ${
              notice?.kind === 'changes'
                ? 'border-brand-cyan text-brand-cyan'
                : 'border-brand-line text-brand-light enabled:hover:border-brand-cyan enabled:hover:text-brand-cyan'
            }`}
          >
            Guardar cambios
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none sm:gap-2">
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
                  handleSaveAsNew()
                }
              }}
              aria-label="Nombre del diseño"
              aria-hidden={!savingAsNew}
              tabIndex={savingAsNew ? 0 : -1}
              readOnly={!savingAsNew}
              placeholder={savingAsNew ? 'Nombre del nuevo diseño' : undefined}
              className={`min-w-0 flex-1 rounded border bg-brand-black px-2 py-1.5 text-[10px] text-brand-light outline-none transition sm:flex-none sm:px-2.5 sm:text-xs ${
                savingAsNew
                  ? 'border-brand-cyan ring-2 ring-brand-cyan/70'
                  : 'invisible border-brand-line'
              }`}
            />
            <button
              ref={saveAsNewRef}
              type="button"
              onClick={handleSaveAsNew}
              aria-pressed={savingAsNew}
              className={`shrink-0 whitespace-nowrap rounded border px-2 py-1.5 text-[10px] font-semibold transition active:scale-[0.97] sm:px-3 sm:text-xs ${
                savingAsNew
                  ? 'border-brand-cyan bg-brand-cyan text-brand-black hover:bg-brand-cyan/90'
                  : notice?.kind === 'new'
                    ? 'border-brand-cyan text-brand-cyan'
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
                  onClick={() => setPendingDeleteId(design.id)}
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

      {pendingDelete && (
        <ConfirmDeleteToast
          title="¿Eliminar este diseño?"
          description={`"${pendingDelete.name}" se va a borrar de tus diseños.`}
          onCancel={() => setPendingDeleteId(null)}
          onConfirm={() => {
            onDelete(pendingDelete.id)
            setPendingDeleteId(null)
          }}
        />
      )}

      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{ bottom: notice.bottom, right: notice.right }}
          className="pointer-events-none fixed z-50 max-w-[min(16rem,calc(100vw-1rem))] rounded border border-brand-cyan/70 bg-brand-black px-2 py-1 text-[10px] font-semibold text-brand-cyan shadow-lg"
        >
          {notice.kind === 'changes' ? 'Cambios guardados' : 'Diseño guardado'}
        </div>
      )}
    </div>
  )
}
