import type { AttachmentStatus } from '../DesignAttachment'

type Props = {
  canUndo: boolean
  canRedo: boolean
  hasLayers: boolean
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  exporting: boolean
  canAttach: boolean
  onAttach: () => void
  attachState: AttachmentStatus
  attachmentCount: number
  onSaveJump: () => void
}

export function EditorToolbar({
  canUndo,
  canRedo,
  hasLayers,
  onUndo,
  onRedo,
  onClear,
  canAttach,
  onAttach,
  attachState,
  attachmentCount,
  onSaveJump,
}: Props) {
  const maxAttachments = 2
  const atLimit = attachmentCount >= maxAttachments
  const attaching = attachState === 'rendering' || attachState === 'uploading'
  const canDoAttach = canAttach && hasLayers && !attaching && !atLimit

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
        <button
          type="button"
          onClick={onSaveJump}
          className="rounded-md border border-brand-line bg-brand-surface px-3.5 py-1.5 text-xs font-bold text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan"
        >
          Guardar
        </button>

        {canAttach && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAttach}
              disabled={!canDoAttach}
              className={`rounded-md border px-3.5 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                attachmentCount > 0 && !atLimit
                  ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-black'
                  : 'border-brand-line bg-brand-surface text-brand-light hover:border-brand-cyan hover:text-brand-cyan'
              }`}
            >
              {attaching
                ? 'Preparando...'
                : attachmentCount >= 1 && !atLimit
                  ? `Adjuntar al mail (${attachmentCount}/${maxAttachments})`
                  : `Adjuntar al mail (${attachmentCount}/${maxAttachments})`}
            </button>
            {atLimit && (
              <span className="text-[10px] text-brand-muted">Solo se pueden adjuntar 2 archivos</span>
            )}
          </div>
        )}
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
