import { useRef, useState } from 'react'
import type { AttachmentStatus } from '../DesignAttachment'

type TipKind = 'limit' | 'save-first' | 'limit-save'

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
  isSaved: boolean
  onRequestSave: () => void
}

const TIP_DURATION = 3000

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
  isSaved,
  onRequestSave,
}: Props) {
  const maxAttachments = 2
  const atLimit = attachmentCount >= maxAttachments
  const attaching = attachState === 'rendering' || attachState === 'uploading'

  const [tip, setTip] = useState<TipKind | null>(null)
  const [saveGlow, setSaveGlow] = useState(false)
  const tipTimer = useRef<number | null>(null)
  const glowTimer = useRef<number | null>(null)

  const clearTipTimer = () => {
    if (tipTimer.current !== null) {
      window.clearTimeout(tipTimer.current)
      tipTimer.current = null
    }
  }

  const clearGlowTimer = () => {
    if (glowTimer.current !== null) {
      window.clearTimeout(glowTimer.current)
      glowTimer.current = null
    }
  }

  const showTip = (kind: TipKind) => {
    setTip(kind)
    clearTipTimer()
    tipTimer.current = window.setTimeout(() => {
      setTip(null)
      tipTimer.current = null
    }, TIP_DURATION)
  }

  const holdTip = () => {
    clearTipTimer()
  }

  const hideTip = () => {
    clearTipTimer()
    setTip(null)
  }

  const flashSave = () => {
    setSaveGlow(true)
    clearGlowTimer()
    glowTimer.current = window.setTimeout(() => {
      setSaveGlow(false)
      glowTimer.current = null
    }, TIP_DURATION)
  }

  const limitKind: TipKind = isSaved ? 'limit' : 'limit-save'

  const handleAttachClick = () => {
    if (attaching || !hasLayers) return
    if (atLimit) {
      showTip(limitKind)
      if (!isSaved) {
        onRequestSave()
        flashSave()
      }
      return
    }
    if (!isSaved) {
      showTip('save-first')
      onRequestSave()
      flashSave()
      return
    }
    hideTip()
    onAttach()
  }

  const tipText: Record<TipKind, string> = {
    limit: 'Solo se pueden adjuntar 2 archivos',
    'save-first': 'Debes guardar tu diseño primero',
    'limit-save': 'Solo podés adjuntar 2 archivos, pero podés guardarlo para enviarlo después',
  }

  return (
    <div className="trama-scroll flex flex-nowrap items-center gap-2 overflow-x-auto">
      <div className="flex flex-nowrap gap-1">
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

      <div className="ml-auto flex flex-nowrap items-center gap-2">
        <button
          type="button"
          onClick={onSaveJump}
          className={`shrink-0 rounded-md border border-brand-line bg-brand-surface px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-brand-light transition hover:border-brand-cyan hover:text-brand-cyan ${
            saveGlow ? 'animate-glow-pulse border-brand-cyan' : ''
          }`}
        >
          Guardar
        </button>

        {canAttach && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={attaching || !hasLayers}
              onMouseEnter={() => {
                if (atLimit) {
                  setTip(limitKind)
                  holdTip()
                }
              }}
              onMouseLeave={hideTip}
              className={`rounded-md border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-40 ${
                attachmentCount > 0 && !atLimit
                  ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-black'
                  : 'border-brand-line bg-brand-surface text-brand-light hover:border-brand-cyan hover:text-brand-cyan'
              }`}
            >
              {attaching
                ? 'Preparando...'
                : `Adjuntar al mail (${attachmentCount}/${maxAttachments})`}
            </button>
            {tip && (
              <div
                role="status"
                className="absolute -top-9 right-0 z-50 rounded border border-brand-line bg-brand-black px-2 py-1 text-[10px] whitespace-nowrap text-brand-light shadow-lg"
              >
                {tipText[tip]}
              </div>
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
      className={`shrink-0 rounded border px-2.5 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? 'border-brand-line text-brand-muted hover:border-brand-pink hover:text-brand-pink'
          : 'border-brand-line text-brand-muted hover:border-brand-muted hover:text-brand-light'
      }`}
    >
      {children}
    </button>
  )
}
