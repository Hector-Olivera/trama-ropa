import { useRef, useState } from 'react'
import type { AttachmentStatus } from '../DesignAttachment'

type TipKind = 'limit' | 'save-first' | 'limit-save' | 'attached'

type TipPosition = { bottom: number; right: number }

type Props = {
  canUndo: boolean
  canRedo: boolean
  hasLayers: boolean
  onUndo: () => void
  onRedo: () => void
  onClear: () => void
  canAttach: boolean
  onAttach: () => void
  attachState: AttachmentStatus
  attachmentCount: number
  isAlreadyAttached: boolean
  onSaveJump: () => void
  isSaved: boolean
}

const TIP_DURATION = 3000
const MAX_ATTACHMENTS = 2

const TIP_TEXT: Record<TipKind, string> = {
  limit: 'Solo se pueden adjuntar 2 archivos',
  'save-first': 'Debes guardar tu diseño primero',
  'limit-save': 'Solo podés adjuntar 2 archivos, pero podés guardarlo para enviarlo después',
  attached: 'Este diseño ya está adjuntado',
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
  isAlreadyAttached,
  onSaveJump,
  isSaved,
}: Props) {
  const atLimit = attachmentCount >= MAX_ATTACHMENTS
  const attaching = attachState === 'rendering' || attachState === 'uploading'

  const [tip, setTip] = useState<TipKind | null>(null)
  const [tipPosition, setTipPosition] = useState<TipPosition | null>(null)
  const [saveGlow, setSaveGlow] = useState(false)
  const attachRef = useRef<HTMLButtonElement | null>(null)
  const tipTimer = useRef<number | null>(null)
  const glowTimer = useRef<number | null>(null)
  const hovering = useRef(false)

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
    const rect = attachRef.current?.getBoundingClientRect()
    if (rect) {
      setTipPosition({
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      })
    }
    setTip(kind)
    clearTipTimer()
    tipTimer.current = window.setTimeout(() => {
      tipTimer.current = null
      if (hovering.current) return
      setTip(null)
    }, TIP_DURATION)
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
      if (!isSaved) flashSave()
      return
    }
    if (isAlreadyAttached) {
      showTip('attached')
      return
    }
    if (!isSaved) {
      showTip('save-first')
      flashSave()
      return
    }
    hideTip()
    onAttach()
  }

  const handleAttachEnter = () => {
    hovering.current = true
    clearTipTimer()
    if (atLimit) {
      setTip(limitKind)
      const rect = attachRef.current?.getBoundingClientRect()
      if (rect) {
        setTipPosition({
          bottom: window.innerHeight - rect.top + 8,
          right: window.innerWidth - rect.right,
        })
      }
    }
  }

  const handleAttachLeave = () => {
    hovering.current = false
    if (atLimit) hideTip()
  }

  return (
    <div className="flex flex-nowrap items-center gap-2">
      <div className="trama-scroll flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto">
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
            <button
              ref={attachRef}
              type="button"
              onClick={handleAttachClick}
              onMouseEnter={handleAttachEnter}
              onMouseLeave={handleAttachLeave}
              disabled={attaching || !hasLayers}
              className={`shrink-0 rounded-md border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-40 ${
                attachmentCount > 0 && !atLimit
                  ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-black'
                  : 'border-brand-line bg-brand-surface text-brand-light hover:border-brand-cyan hover:text-brand-cyan'
              }`}
            >
              {attaching
                ? 'Preparando...'
                : `Adjuntar al mail (${attachmentCount}/${MAX_ATTACHMENTS})`}
            </button>
          )}
        </div>
      </div>

      {tip && (
        <div
          role="status"
          style={tipPosition ? { bottom: tipPosition.bottom, right: tipPosition.right } : undefined}
          className="pointer-events-none fixed z-50 max-w-[min(20rem,calc(100vw-1rem))] rounded border border-brand-line bg-brand-black px-2 py-1 text-[10px] leading-snug text-brand-light shadow-lg"
        >
          {TIP_TEXT[tip]}
        </div>
      )}
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
